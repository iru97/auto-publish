// Delivery System Module - Advanced Multi-Platform Content Distribution
// Distributes generated videos across multiple platforms with scheduling, analytics, and optimization

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs-extra");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const winston = require("winston");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const moment = require("moment-timezone");
const retry = require("retry");
const pLimit = require("p-limit");
const ProgressBar = require("progress");
const mime = require("mime-types");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

// Configure logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: "logs/delivery-error.log",
      level: "error",
    }),
    new winston.transports.File({ filename: "logs/delivery-combined.log" }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Custom error class
class DeliverySystemError extends Error {
  constructor(message, code, platform = null, details = null) {
    super(message);
    this.name = "DeliverySystemError";
    this.code = code;
    this.platform = platform;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Local delivery handler (default)
const localHandler = {
  async upload(content, config, platformConfig) {
    const outputDir =
      config.outputDirectory ||
      path.join(process.cwd(), "output", "deliveries");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const deliveryDir = path.join(outputDir, `delivery-${timestamp}`);

    await fs.ensureDir(deliveryDir);

    // Copy main video
    const videoFileName = path.basename(content.mainVideo.file);
    const localVideoPath = path.join(deliveryDir, videoFileName);
    await fs.copy(content.mainVideo.file, localVideoPath);

    // Copy thumbnails if available
    const thumbnailPaths = [];
    if (content.assets?.thumbnails) {
      for (const [index, thumbnail] of content.assets.thumbnails.entries()) {
        const thumbnailFileName = `thumbnail-${index}${path.extname(
          thumbnail.file
        )}`;
        const localThumbnailPath = path.join(deliveryDir, thumbnailFileName);
        await fs.copy(thumbnail.file, localThumbnailPath);
        thumbnailPaths.push(localThumbnailPath);
      }
    }

    // Create metadata file
    const metadata = {
      deliveredAt: new Date().toISOString(),
      originalVideo: content.mainVideo,
      localPaths: {
        video: localVideoPath,
        thumbnails: thumbnailPaths,
        directory: deliveryDir,
      },
      contentMetadata: content.metadata || {},
      deliveryConfig: config,
    };

    const metadataPath = path.join(deliveryDir, "delivery-metadata.json");
    await fs.writeJson(metadataPath, metadata, { spaces: 2 });

    // Create simple HTML preview
    const htmlPreview = `
<!DOCTYPE html>
<html>
<head>
    <title>Local Delivery - ${content.metadata?.title || "Video"}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .video-container { text-align: center; margin: 20px 0; }
        video { max-width: 100%; height: auto; }
        .metadata { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .thumbnails { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
        .thumbnail { max-width: 150px; height: auto; border: 1px solid #ddd; }
    </style>
</head>
<body>
    <h1>Local Delivery Preview</h1>
    <div class="video-container">
        <video controls>
            <source src="${videoFileName}" type="video/mp4">
            Your browser does not support the video tag.
        </video>
    </div>
    <div class="metadata">
        <h3>Video Information</h3>
        <p><strong>Title:</strong> ${content.metadata?.title || "N/A"}</p>
        <p><strong>Duration:</strong> ${
          content.mainVideo.duration || "N/A"
        }s</p>
        <p><strong>Resolution:</strong> ${
          content.mainVideo.resolution?.width || "N/A"
        }x${content.mainVideo.resolution?.height || "N/A"}</p>
        <p><strong>File Size:</strong> ${Math.round(
          (content.mainVideo.fileSize || 0) / 1024 / 1024
        )}MB</p>
        <p><strong>Delivered At:</strong> ${new Date().toLocaleString()}</p>
    </div>
    ${
      thumbnailPaths.length > 0
        ? `
    <div class="thumbnails">
        <h3>Thumbnails</h3>
        ${thumbnailPaths
          .map(
            (thumb, i) =>
              `<img src="${path.basename(thumb)}" alt="Thumbnail ${
                i + 1
              }" class="thumbnail">`
          )
          .join("")}
    </div>
    `
        : ""
    }
</body>
</html>`;

    const htmlPath = path.join(deliveryDir, "preview.html");
    await fs.writeFile(htmlPath, htmlPreview);

    return {
      uploadId: `local-${timestamp}`,
      url: `file://${localVideoPath}`,
      thumbnailUrl: thumbnailPaths[0] ? `file://${thumbnailPaths[0]}` : null,
      embedCode: null,
      shareUrl: `file://${htmlPath}`,
      metadata: {
        localDirectory: deliveryDir,
        videoPath: localVideoPath,
        thumbnailPaths,
        metadataPath,
        previewPath: htmlPath,
        totalFiles: 2 + thumbnailPaths.length, // video + metadata + thumbnails
        totalSize: content.mainVideo.fileSize || 0,
      },
    };
  },
};

// Platform handlers
const platformHandlers = {
  local: localHandler, // Default local handler
  youtube: require("./platforms/youtube"),
  tiktok: require("./platforms/tiktok"),
  instagram: require("./platforms/instagram"),
  twitter: require("./platforms/twitter"),
  linkedin: require("./platforms/linkedin"),
  telegram: require("./platforms/telegram"),
  discord: require("./platforms/discord"),
  s3: require("./platforms/s3"),
  drive: require("./platforms/drive"),
  dropbox: require("./platforms/dropbox"),
  ftp: require("./platforms/ftp"),
  email: require("./platforms/email"),
};

// Main delivery system class
class DeliverySystem {
  constructor() {
    this.deliveryId = uuidv4();
    this.startTime = Date.now();
    this.concurrencyLimit = pLimit(5);
    this.deliveryResults = [];
    this.notifications = {
      emailsSent: 0,
      webhooksCalled: 0,
      telegramMessagesSent: 0,
      discordMessagesSent: 0,
      notificationLog: [],
    };
    this.scheduledJobs = new Map();
    this.systemMetrics = {
      memoryUsage: "",
      cpuUsage: 0,
      networkUsage: 0,
      diskUsage: 0,
      concurrentConnections: 0,
    };
  }

  // Main delivery function
  async deliver(input) {
    try {
      logger.info(`Starting delivery process ${this.deliveryId}`);

      // Validate input
      await this.validateInput(input);

      // Initialize metrics tracking
      this.startMetricsTracking();

      // Pre-delivery checks
      if (input.qualityControl?.preDeliveryChecks?.enabled) {
        await this.performPreDeliveryChecks(input);
      }

      // Process platforms
      const platformResults = await this.processAllPlatforms(input);

      // Post-delivery verification
      if (input.qualityControl?.postDeliveryVerification?.enabled) {
        await this.performPostDeliveryVerification(platformResults);
      }

      // Generate analytics
      const analytics = await this.generateAnalytics(platformResults, input);

      // Create assets and reports
      const assets = await this.generateAssets(platformResults, input);

      // Send notifications
      await this.sendNotifications(platformResults, input);

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        platformResults,
        analytics
      );

      // Calculate final metrics
      const metadata = this.generateMetadata(input, platformResults);

      const result = {
        delivery: this.summarizeDelivery(platformResults),
        analytics,
        assets,
        scheduling: this.getSchedulingInfo(),
        notifications: this.notifications,
        metadata,
        recommendations,
      };

      logger.info(`Delivery process ${this.deliveryId} completed successfully`);
      return result;
    } catch (error) {
      logger.error(`Delivery process ${this.deliveryId} failed:`, error);
      throw new DeliverySystemError(
        `Delivery failed: ${error.message}`,
        "DELIVERY_FAILED",
        null,
        { originalError: error.message, deliveryId: this.deliveryId }
      );
    }
  }

  // Validate input according to contract
  async validateInput(input) {
    const required = ["videoContent", "deliveryConfig"];
    for (const field of required) {
      if (!input[field]) {
        throw new DeliverySystemError(
          `Missing required field: ${field}`,
          "VALIDATION_ERROR"
        );
      }
    }

    // Validate video file exists
    if (!(await fs.pathExists(input.videoContent.mainVideo.file))) {
      throw new DeliverySystemError(
        `Video file not found: ${input.videoContent.mainVideo.file}`,
        "FILE_NOT_FOUND"
      );
    }

    // Validate platforms configuration
    if (
      !input.deliveryConfig.platforms ||
      input.deliveryConfig.platforms.length === 0
    ) {
      throw new DeliverySystemError(
        "No platforms configured for delivery",
        "NO_PLATFORMS_CONFIGURED"
      );
    }
  }

  // Process all platforms concurrently
  async processAllPlatforms(input) {
    const enabledPlatforms = input.deliveryConfig.platforms.filter(
      (p) => p.enabled
    );
    const sortedPlatforms = enabledPlatforms.sort(
      (a, b) => b.priority - a.priority
    );

    logger.info(`Processing ${sortedPlatforms.length} platforms`);

    const platformPromises = sortedPlatforms.map((platformConfig) =>
      this.concurrencyLimit(() => this.processPlatform(platformConfig, input))
    );

    const results = await Promise.allSettled(platformPromises);

    return results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        logger.error(
          `Platform ${sortedPlatforms[index].name} failed:`,
          result.reason
        );
        return {
          platform: sortedPlatforms[index].name,
          status: "failed",
          uploadDetails: {
            startTime: new Date().toISOString(),
            duration: 0,
            fileSize: 0,
            retryCount: 0,
            errorMessage: result.reason.message,
          },
        };
      }
    });
  }

  // Process individual platform
  async processPlatform(platformConfig, input) {
    const startTime = Date.now();
    const platformName = platformConfig.name;

    logger.info(`Processing platform: ${platformName}`);

    try {
      // Check if platform handler exists
      if (!platformHandlers[platformName]) {
        throw new DeliverySystemError(
          `Platform handler not found: ${platformName}`,
          "PLATFORM_NOT_SUPPORTED",
          platformName
        );
      }

      // Optimize content for platform if needed
      const optimizedContent = await this.optimizeForPlatform(
        input.videoContent,
        platformConfig,
        input.deliveryConfig.optimization
      );

      // Handle scheduling
      if (
        input.deliveryConfig.scheduling?.enabled &&
        input.deliveryConfig.scheduling.publishAt
      ) {
        return await this.scheduleDelivery(
          platformConfig,
          optimizedContent,
          input
        );
      }

      // Immediate delivery
      const handler = platformHandlers[platformName];
      const result = await this.executeWithRetry(
        () =>
          handler.upload(
            optimizedContent,
            platformConfig.config,
            input.platformConfigs?.[platformName]
          ),
        input.deliveryOptions?.retryPolicy
      );

      const endTime = Date.now();

      return {
        platform: platformName,
        status: "success",
        uploadId: result.uploadId,
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
        embedCode: result.embedCode,
        shareUrl: result.shareUrl,
        uploadDetails: {
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          duration: endTime - startTime,
          fileSize: optimizedContent.mainVideo.fileSize,
          uploadSpeed:
            optimizedContent.mainVideo.fileSize /
            ((endTime - startTime) / 1000),
          retryCount: 0,
        },
        platformMetadata: result.metadata || {},
        qualityMetrics: await this.calculateQualityMetrics(
          result,
          optimizedContent
        ),
      };
    } catch (error) {
      const endTime = Date.now();
      logger.error(`Platform ${platformName} failed:`, error);

      return {
        platform: platformName,
        status: "failed",
        uploadDetails: {
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          duration: endTime - startTime,
          fileSize: input.videoContent.mainVideo.fileSize,
          retryCount: error.retryCount || 0,
          errorMessage: error.message,
        },
      };
    }
  }

  // Optimize content for specific platform
  async optimizeForPlatform(
    videoContent,
    platformConfig,
    optimizationSettings
  ) {
    const platformName = platformConfig.name;
    const optimized = JSON.parse(JSON.stringify(videoContent)); // Deep clone

    if (
      !optimizationSettings.autoResize &&
      !optimizationSettings.autoCompress
    ) {
      return optimized;
    }

    logger.info(`Optimizing content for ${platformName}`);

    // Platform-specific optimizations
    const platformSpecs = this.getPlatformSpecs(platformName);

    if (optimizationSettings.autoResize) {
      optimized.mainVideo = await this.resizeVideo(
        optimized.mainVideo,
        platformSpecs.preferredResolution
      );
    }

    if (optimizationSettings.autoCompress) {
      optimized.mainVideo = await this.compressVideo(
        optimized.mainVideo,
        platformSpecs.maxFileSize
      );
    }

    if (optimizationSettings.autoThumbnail) {
      optimized.assets.thumbnails = await this.generatePlatformThumbnails(
        optimized.mainVideo.file,
        platformSpecs.thumbnailSpecs
      );
    }

    return optimized;
  }

  // Execute with retry logic
  async executeWithRetry(operation, retryPolicy) {
    const policy = retryPolicy || {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
      maxDelay: 10000,
    };

    const retryOperation = retry.operation({
      retries: policy.maxRetries,
      factor: policy.backoffMultiplier,
      minTimeout: policy.retryDelay,
      maxTimeout: policy.maxDelay,
    });

    return new Promise((resolve, reject) => {
      retryOperation.attempt(async (currentAttempt) => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          error.retryCount = currentAttempt - 1;

          if (retryOperation.retry(error)) {
            logger.warn(
              `Retry attempt ${currentAttempt} failed:`,
              error.message
            );
            return;
          }

          reject(error);
        }
      });
    });
  }

  // Schedule delivery for later
  async scheduleDelivery(platformConfig, content, input) {
    const scheduledTime = moment.tz(
      input.deliveryConfig.scheduling.publishAt,
      input.deliveryConfig.scheduling.timezone || "UTC"
    );

    const jobId = uuidv4();
    const cronExpression = this.convertToCronExpression(scheduledTime);

    const job = cron.schedule(
      cronExpression,
      async () => {
        try {
          logger.info(
            `Executing scheduled delivery for ${platformConfig.name}`
          );
          const handler = platformHandlers[platformConfig.name];
          await handler.upload(
            content,
            platformConfig.config,
            input.platformConfigs?.[platformConfig.name]
          );

          // Update job status
          this.scheduledJobs.set(jobId, {
            ...this.scheduledJobs.get(jobId),
            status: "completed",
            completedAt: new Date().toISOString(),
          });
        } catch (error) {
          logger.error(
            `Scheduled delivery failed for ${platformConfig.name}:`,
            error
          );
          this.scheduledJobs.set(jobId, {
            ...this.scheduledJobs.get(jobId),
            status: "failed",
            errorMessage: error.message,
          });
        }
      },
      {
        scheduled: false,
        timezone: input.deliveryConfig.scheduling.timezone || "UTC",
      }
    );

    // Store job info
    this.scheduledJobs.set(jobId, {
      id: jobId,
      platform: platformConfig.name,
      scheduledTime: scheduledTime.toISOString(),
      status: "pending",
      jobDetails: {
        platformConfig,
        content,
        createdAt: new Date().toISOString(),
      },
    });

    job.start();

    return {
      platform: platformConfig.name,
      status: "scheduled",
      uploadDetails: {
        startTime: new Date().toISOString(),
        duration: 0,
        fileSize: content.mainVideo.fileSize,
        retryCount: 0,
      },
      schedulingInfo: {
        jobId,
        scheduledTime: scheduledTime.toISOString(),
      },
    };
  }

  // Generate comprehensive analytics
  async generateAnalytics(platformResults, input) {
    const successfulDeliveries = platformResults.filter(
      (r) => r.status === "success"
    );
    const failedDeliveries = platformResults.filter(
      (r) => r.status === "failed"
    );
    const scheduledDeliveries = platformResults.filter(
      (r) => r.status === "scheduled"
    );

    const totalDeliveryTime = platformResults.reduce(
      (sum, r) => sum + (r.uploadDetails.duration || 0),
      0
    );
    const totalDataTransferred = platformResults.reduce(
      (sum, r) => sum + (r.uploadDetails.fileSize || 0),
      0
    );
    const totalUploadTime = successfulDeliveries.reduce(
      (sum, r) => sum + r.uploadDetails.duration,
      0
    );

    const deliveryMetrics = {
      totalDeliveryTime,
      averageUploadSpeed: totalDataTransferred / (totalUploadTime / 1000) || 0,
      totalDataTransferred,
      successRate: (successfulDeliveries.length / platformResults.length) * 100,
      errorRate: (failedDeliveries.length / platformResults.length) * 100,
      retryRate:
        platformResults.reduce(
          (sum, r) => sum + (r.uploadDetails.retryCount || 0),
          0
        ) / platformResults.length,
    };

    const platformMetrics = platformResults.map((result) => ({
      platform: result.platform,
      uploadTime: result.uploadDetails.duration || 0,
      fileSize: result.uploadDetails.fileSize || 0,
      compressionRatio: result.qualityMetrics?.compressionRatio || 1,
      qualityScore: result.qualityMetrics?.uploadQuality || 0,
      userEngagement: result.platformMetadata || {},
    }));

    const performanceAnalysis = {
      bottlenecks: this.identifyBottlenecks(platformResults),
      recommendations: this.generatePerformanceRecommendations(platformResults),
      costAnalysis: await this.calculateCostAnalysis(platformResults, input),
      reliabilityScore: this.calculateReliabilityScore(platformResults),
    };

    return {
      deliveryMetrics,
      platformMetrics,
      performanceAnalysis,
    };
  }

  // Generate delivery assets and reports
  async generateAssets(platformResults, input) {
    const timestamp = new Date().toISOString();
    const reportDir = path.join("output", this.deliveryId);

    await fs.ensureDir(reportDir);
    await fs.ensureDir("logs");

    // Generate delivery report
    const deliveryReport = {
      deliveryId: this.deliveryId,
      timestamp,
      input: input,
      results: platformResults,
      summary: this.summarizeDelivery(platformResults),
    };

    const reportFile = path.join(reportDir, "delivery-report.json");
    await fs.writeJson(reportFile, deliveryReport, { spaces: 2 });

    // Generate HTML report
    const htmlReport = await this.generateHTMLReport(deliveryReport);
    const htmlFile = path.join(reportDir, "delivery-report.html");
    await fs.writeFile(htmlFile, htmlReport);

    // Create backups if enabled
    const backups = [];
    if (input.deliveryOptions?.backup?.enabled) {
      for (const destination of input.deliveryOptions.backup.destinations) {
        const backup = await this.createBackup(
          input.videoContent.mainVideo.file,
          destination
        );
        backups.push(backup);
      }
    }

    // Take screenshots of successful uploads
    const screenshots = [];
    for (const result of platformResults.filter(
      (r) => r.status === "success" && r.url
    )) {
      try {
        const screenshot = await this.takeScreenshot(
          result.url,
          result.platform,
          reportDir
        );
        screenshots.push(screenshot);
      } catch (error) {
        logger.warn(
          `Failed to take screenshot for ${result.platform}:`,
          error.message
        );
      }
    }

    return {
      deliveryReport: {
        file: reportFile,
        format: "json",
        timestamp,
      },
      backups,
      logs: {
        deliveryLog: path.join("logs", "delivery-combined.log"),
        errorLog: path.join("logs", "delivery-error.log"),
        performanceLog: path.join("logs", "performance.log"),
      },
      screenshots,
    };
  }

  // Send notifications based on configuration
  async sendNotifications(platformResults, input) {
    const notificationConfig = input.deliveryOptions?.notifications;
    if (!notificationConfig) return;

    const successfulDeliveries = platformResults.filter(
      (r) => r.status === "success"
    );
    const failedDeliveries = platformResults.filter(
      (r) => r.status === "failed"
    );
    const hasSuccess = successfulDeliveries.length > 0;
    const hasFailures = failedDeliveries.length > 0;

    // Email notifications
    if (notificationConfig.email?.enabled) {
      if (
        (hasSuccess && notificationConfig.email.onSuccess) ||
        (hasFailures && notificationConfig.email.onFailure)
      ) {
        await this.sendEmailNotification(
          platformResults,
          notificationConfig.email
        );
      }
    }

    // Webhook notifications
    if (notificationConfig.webhook?.enabled) {
      await this.sendWebhookNotification(
        platformResults,
        notificationConfig.webhook
      );
    }

    // Telegram notifications
    if (notificationConfig.telegram?.enabled) {
      if (
        (hasSuccess && notificationConfig.telegram.onSuccess) ||
        (hasFailures && notificationConfig.telegram.onFailure)
      ) {
        await this.sendTelegramNotification(
          platformResults,
          notificationConfig.telegram
        );
      }
    }

    // Discord notifications
    if (notificationConfig.discord?.enabled) {
      if (
        (hasSuccess && notificationConfig.discord.onSuccess) ||
        (hasFailures && notificationConfig.discord.onFailure)
      ) {
        await this.sendDiscordNotification(
          platformResults,
          notificationConfig.discord
        );
      }
    }
  }

  // Generate recommendations for optimization
  generateRecommendations(platformResults, analytics) {
    const platformOptimizations = [];
    const performanceImprovements = [];
    const costOptimizations = [];
    const qualityEnhancements = [];
    const nextSteps = [];
    const automationOpportunities = [];

    // Analyze each platform
    for (const result of platformResults) {
      if (result.status === "failed") {
        platformOptimizations.push({
          platform: result.platform,
          suggestions: [
            "Check API credentials and permissions",
            "Verify file format compatibility",
            "Review platform-specific requirements",
          ],
          estimatedImprovement: "Reduce failure rate by 80%",
        });
      } else if (result.qualityMetrics?.uploadQuality < 7) {
        qualityEnhancements.push(
          `Improve ${result.platform} upload quality by optimizing video encoding settings`
        );
      }
    }

    // Performance analysis
    if (analytics.deliveryMetrics.averageUploadSpeed < 1000000) {
      // < 1MB/s
      performanceImprovements.push(
        "Consider upgrading internet connection for faster uploads"
      );
    }

    if (analytics.deliveryMetrics.errorRate > 10) {
      performanceImprovements.push(
        "Implement more robust error handling and retry mechanisms"
      );
    }

    // Cost optimization
    if (analytics.performanceAnalysis.costAnalysis.totalCost > 1) {
      costOptimizations.push(
        "Consider bulk upload discounts or alternative providers"
      );
    }

    // Automation opportunities
    if (platformResults.length > 3) {
      automationOpportunities.push({
        description: "Implement batch processing for multiple platforms",
        estimatedTimeSaving: "30-50% reduction in processing time",
        implementationComplexity: "medium",
      });
    }

    // Next steps
    nextSteps.push(
      "Monitor delivery success rates and optimize failing platforms"
    );
    nextSteps.push("Implement A/B testing for different content optimizations");
    nextSteps.push("Set up automated performance monitoring and alerting");

    return {
      platformOptimizations,
      performanceImprovements,
      costOptimizations,
      qualityEnhancements,
      nextSteps,
      automationOpportunities,
    };
  }

  // Helper methods
  summarizeDelivery(platformResults) {
    const successful = platformResults.filter(
      (r) => r.status === "success"
    ).length;
    const failed = platformResults.filter((r) => r.status === "failed").length;
    const scheduled = platformResults.filter(
      (r) => r.status === "scheduled"
    ).length;

    let status = "success";
    if (failed > 0 && successful === 0) status = "failed";
    else if (failed > 0) status = "partial";

    return {
      status,
      totalPlatforms: platformResults.length,
      successfulDeliveries: successful,
      failedDeliveries: failed,
      scheduledDeliveries: scheduled,
      platformResults,
    };
  }

  generateMetadata(input, platformResults) {
    const endTime = Date.now();
    const processingTime = endTime - this.startTime;

    return {
      generatedAt: new Date().toISOString(),
      processingTime,
      totalCost: this.calculateTotalCost(platformResults),
      deliveryDetails: {
        inputVideoFile: input.videoContent.mainVideo.file,
        totalPlatforms: platformResults.length,
        totalVariants: input.videoContent.variants?.length || 0,
        totalAssets: input.videoContent.assets.thumbnails.length,
        compressionApplied: input.deliveryConfig.optimization.autoCompress,
        optimizationApplied: input.deliveryConfig.optimization.autoResize,
      },
      processingSteps: this.getProcessingSteps(),
      systemMetrics: this.systemMetrics,
    };
  }

  // Additional helper methods would continue here...
  // (Implementation continues with remaining methods)
}

// Export the main function
async function deliverContent(input) {
  const deliverySystem = new DeliverySystem();
  return await deliverySystem.deliver(input);
}

module.exports = {
  deliverContent,
  DeliverySystem,
  DeliverySystemError,
};
