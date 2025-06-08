// Delivery System Module Contract
// Advanced content delivery engine for multi-platform distribution

export interface DeliverySystemContract {
  name: "delivery-system";
  version: "1.0.0";
  description: "Advanced content delivery engine that distributes generated videos across multiple platforms with scheduling, analytics, and optimization";

  input: {
    required: {
      // Video content from video-composer module
      videoContent: {
        mainVideo: {
          file: string; // Path to main video file
          format: string; // mp4, mov, webm, avi
          resolution: {
            width: number;
            height: number;
            aspectRatio: string; // "16:9", "9:16", "1:1", "4:3"
          };
          duration: number; // seconds
          fileSize: number; // bytes
          codec: string; // h264, h265, vp9, av1
          bitrate: string; // "5M", "2M", etc.
        };
        variants?: Array<{
          name: string; // "youtube", "tiktok", "instagram"
          platform: string;
          file: string;
          resolution: { width: number; height: number };
          duration: number;
          fileSize: number;
          optimizedFor: string[]; // ["web", "mobile"]
        }>;
        assets: {
          thumbnails: Array<{
            timestamp: number;
            file: string;
            resolution: { width: number; height: number };
          }>;
          preview?: {
            gif: string;
            mp4: string;
            duration: number;
          };
          frames?: Array<{
            timestamp: number;
            file: string;
            description: string;
          }>;
        };
        metadata: {
          title?: string;
          description?: string;
          tags?: string[];
          category?: string;
          language?: string;
          generatedAt: string;
          processingTime: number;
          totalCost: number;
        };
      };

      // Delivery configuration
      deliveryConfig: {
        platforms: Array<PlatformConfig>;
        scheduling?: {
          enabled: boolean;
          publishAt?: string; // ISO date string
          timezone?: string; // "UTC", "America/New_York", etc.
          recurring?: {
            enabled: boolean;
            frequency: "daily" | "weekly" | "monthly";
            interval: number; // every N days/weeks/months
            endDate?: string;
          };
        };
        optimization: {
          autoResize: boolean; // Automatically resize for each platform
          autoCompress: boolean; // Compress for platform requirements
          autoThumbnail: boolean; // Generate platform-specific thumbnails
          autoTags: boolean; // Generate platform-specific tags
          autoDescription: boolean; // Optimize description for each platform
        };
      };
    };

    optional: {
      // Content metadata
      contentMetadata?: {
        title?: string;
        description?: string;
        tags?: string[];
        category?: string;
        language?: string;
        visibility?: "public" | "unlisted" | "private";
        monetization?: boolean;
        ageRestriction?: boolean;
        location?: {
          latitude: number;
          longitude: number;
          name: string;
        };
        collaborators?: Array<{
          name: string;
          role: string;
          email?: string;
        }>;
      };

      // Advanced delivery options
      deliveryOptions?: {
        retryPolicy?: {
          maxRetries: number;
          retryDelay: number; // milliseconds
          backoffMultiplier: number;
          maxDelay: number;
        };
        notifications?: {
          email?: {
            enabled: boolean;
            recipients: string[];
            onSuccess: boolean;
            onFailure: boolean;
            onScheduled: boolean;
          };
          webhook?: {
            enabled: boolean;
            url: string;
            secret?: string;
            events: string[]; // ["success", "failure", "scheduled", "started"]
          };
          telegram?: {
            enabled: boolean;
            botToken: string;
            chatId: string;
            onSuccess: boolean;
            onFailure: boolean;
          };
          discord?: {
            enabled: boolean;
            webhookUrl: string;
            onSuccess: boolean;
            onFailure: boolean;
          };
        };
        analytics?: {
          enabled: boolean;
          trackViews: boolean;
          trackEngagement: boolean;
          trackRevenue: boolean;
          customEvents: string[];
        };
        backup?: {
          enabled: boolean;
          destinations: Array<{
            type: "s3" | "drive" | "dropbox" | "ftp";
            config: Record<string, any>;
          }>;
          retention: number; // days
        };
      };

      // Platform-specific configurations
      platformConfigs?: {
        youtube?: {
          channelId?: string;
          playlist?: string;
          category?: string;
          language?: string;
          defaultAudioLanguage?: string;
          license?: "youtube" | "creativeCommon";
          embeddable?: boolean;
          publicStatsViewable?: boolean;
          madeForKids?: boolean;
          selfDeclaredMadeForKids?: boolean;
        };
        tiktok?: {
          privacy?: "public" | "friends" | "private";
          allowComments?: boolean;
          allowDuet?: boolean;
          allowStitch?: boolean;
          brandedContent?: boolean;
          disableAds?: boolean;
        };
        instagram?: {
          type?: "feed" | "story" | "reel" | "igtv";
          location?: string;
          userTags?: string[];
          productTags?: string[];
          altText?: string;
        };
        twitter?: {
          threadMode?: boolean;
          replySettings?: "everyone" | "following" | "mentioned";
          sensitiveContent?: boolean;
          boostEligible?: boolean;
        };
        linkedin?: {
          visibility?: "public" | "connections";
          targetAudience?: {
            industries?: string[];
            jobTitles?: string[];
            locations?: string[];
          };
        };
        telegram?: {
          channelId?: string;
          silent?: boolean;
          protectContent?: boolean;
          replyToMessageId?: number;
        };
        discord?: {
          channelId?: string;
          embed?: boolean;
          tts?: boolean;
        };
      };

      // Quality control
      qualityControl?: {
        preDeliveryChecks?: {
          enabled: boolean;
          videoIntegrity: boolean;
          audioSync: boolean;
          fileSize: boolean;
          duration: boolean;
          resolution: boolean;
          platformCompliance: boolean;
        };
        postDeliveryVerification?: {
          enabled: boolean;
          verifyUpload: boolean;
          checkProcessing: boolean;
          validateMetadata: boolean;
          monitorInitialMetrics: boolean;
        };
        rollbackPolicy?: {
          enabled: boolean;
          conditions: string[]; // ["upload_failed", "processing_failed", "low_quality"]
          actions: string[]; // ["retry", "notify", "abort"]
        };
      };

      // Performance settings
      performanceSettings?: {
        concurrentUploads?: number; // Max simultaneous uploads
        chunkSize?: number; // Upload chunk size in bytes
        timeout?: number; // Upload timeout in milliseconds
        compression?: {
          enabled: boolean;
          quality: number; // 1-100
          maxFileSize: number; // bytes
        };
        caching?: {
          enabled: boolean;
          duration: number; // seconds
          strategy: "memory" | "disk" | "redis";
        };
      };
    };
  };

  output: {
    // Delivery results
    delivery: {
      status: "success" | "partial" | "failed";
      totalPlatforms: number;
      successfulDeliveries: number;
      failedDeliveries: number;
      scheduledDeliveries: number;

      // Platform-specific results
      platformResults: Array<{
        platform: string;
        status: "success" | "failed" | "scheduled" | "processing";
        uploadId?: string; // Platform-specific upload ID
        url?: string; // Public URL if available
        thumbnailUrl?: string;
        embedCode?: string;
        shareUrl?: string;

        // Upload details
        uploadDetails: {
          startTime: string;
          endTime?: string;
          duration: number; // milliseconds
          fileSize: number;
          uploadSpeed?: number; // bytes/second
          retryCount: number;
          errorMessage?: string;
        };

        // Platform-specific metadata
        platformMetadata?: {
          videoId?: string;
          channelId?: string;
          playlistId?: string;
          viewCount?: number;
          likeCount?: number;
          commentCount?: number;
          shareCount?: number;
        };

        // Quality metrics
        qualityMetrics?: {
          uploadQuality: number; // 1-10 scale
          processingTime: number;
          compressionRatio: number;
          finalFileSize: number;
          finalResolution: { width: number; height: number };
          platformCompliance: boolean;
        };
      }>;
    };

    // Analytics and tracking
    analytics: {
      deliveryMetrics: {
        totalDeliveryTime: number; // milliseconds
        averageUploadSpeed: number; // bytes/second
        totalDataTransferred: number; // bytes
        successRate: number; // percentage
        errorRate: number; // percentage
        retryRate: number; // percentage
      };

      platformMetrics: Array<{
        platform: string;
        uploadTime: number;
        fileSize: number;
        compressionRatio: number;
        qualityScore: number; // 1-10
        userEngagement?: {
          views: number;
          likes: number;
          comments: number;
          shares: number;
          clickThroughRate: number;
        };
      }>;

      performanceAnalysis: {
        bottlenecks: string[]; // Identified performance issues
        recommendations: string[]; // Optimization suggestions
        costAnalysis: {
          totalCost: number;
          costPerPlatform: Record<string, number>;
          costPerMB: number;
          estimatedMonthlyCost: number;
        };
        reliabilityScore: number; // 1-10 scale
      };
    };

    // Generated assets and backups
    assets: {
      deliveryReport: {
        file: string; // Path to detailed delivery report
        format: "json" | "pdf" | "html";
        timestamp: string;
      };

      backups?: Array<{
        destination: string;
        file: string;
        timestamp: string;
        size: number;
        checksum: string;
      }>;

      logs: {
        deliveryLog: string; // Path to delivery log file
        errorLog: string; // Path to error log file
        performanceLog: string; // Path to performance metrics log
      };

      screenshots?: Array<{
        platform: string;
        url: string;
        file: string;
        timestamp: string;
      }>;
    };

    // Scheduling and automation
    scheduling?: {
      scheduledJobs: Array<{
        id: string;
        platform: string;
        scheduledTime: string;
        status: "pending" | "completed" | "failed" | "cancelled";
        jobDetails: Record<string, any>;
      }>;

      recurringSchedules?: Array<{
        id: string;
        frequency: string;
        nextExecution: string;
        lastExecution?: string;
        status: "active" | "paused" | "completed";
      }>;
    };

    // Notifications sent
    notifications: {
      emailsSent: number;
      webhooksCalled: number;
      telegramMessagesSent: number;
      discordMessagesSent: number;

      notificationLog: Array<{
        type: "email" | "webhook" | "telegram" | "discord";
        recipient: string;
        timestamp: string;
        status: "sent" | "failed";
        message?: string;
        errorMessage?: string;
      }>;
    };

    // Processing metadata
    metadata: {
      generatedAt: string;
      processingTime: number; // milliseconds
      totalCost: number; // USD

      deliveryDetails: {
        inputVideoFile: string;
        totalPlatforms: number;
        totalVariants: number;
        totalAssets: number;
        compressionApplied: boolean;
        optimizationApplied: boolean;
      };

      processingSteps: Array<{
        step: string;
        duration: number;
        status: "success" | "failed" | "skipped";
        details?: string;
        errorMessage?: string;
      }>;

      systemMetrics: {
        memoryUsage: string;
        cpuUsage: number;
        networkUsage: number; // bytes
        diskUsage: number; // bytes
        concurrentConnections: number;
      };
    };

    // Recommendations for future deliveries
    recommendations: {
      platformOptimizations: Array<{
        platform: string;
        suggestions: string[];
        estimatedImprovement: string;
      }>;

      performanceImprovements: string[];
      costOptimizations: string[];
      qualityEnhancements: string[];

      nextSteps: string[];

      automationOpportunities: Array<{
        description: string;
        estimatedTimeSaving: string;
        implementationComplexity: "low" | "medium" | "high";
      }>;
    };
  };

  dependencies: [
    "axios", // HTTP client for API calls
    "form-data", // Multipart form data for uploads
    "googleapis", // Google APIs (YouTube, Drive)
    "instagram-basic-display-api", // Instagram API
    "twitter-api-v2", // Twitter API v2
    "linkedin-api", // LinkedIn API
    "telegraf", // Telegram Bot API
    "discord.js", // Discord API
    "aws-sdk", // AWS S3 and other services
    "dropbox", // Dropbox API
    "node-cron", // Scheduling
    "nodemailer", // Email notifications
    "sharp", // Image processing for thumbnails
    "ffmpeg-static", // Video processing
    "fluent-ffmpeg", // FFmpeg wrapper
    "crypto", // Checksums and encryption
    "fs-extra", // Enhanced file system operations
    "path", // Path utilities
    "uuid", // Unique identifiers
    "dotenv", // Environment variables
    "winston", // Logging
    "joi", // Input validation
    "moment-timezone", // Date/time handling with timezones
    "retry", // Retry logic
    "p-limit", // Concurrency control
    "progress", // Progress tracking
    "mime-types", // MIME type detection
    "cheerio", // HTML parsing for verification
    "puppeteer" // Browser automation for screenshots
  ];

  metadata: {
    estimatedDuration: "30s-5min per platform"; // Depends on file size and platform
    estimatedCost: "$0.01-$0.50 per delivery"; // Varies by platform and file size
    reliability: "96%"; // Success rate under normal conditions

    supportedPlatforms: [
      "local", // Default local delivery
      "youtube",
      "tiktok",
      "instagram",
      "twitter",
      "linkedin",
      "telegram",
      "discord",
      "s3",
      "drive",
      "dropbox",
      "ftp",
      "email"
    ];

    supportedFormats: ["mp4", "mov", "webm", "avi", "mkv"];

    maxFileSize: "8GB"; // Platform dependent
    maxConcurrentUploads: 5;

    features: [
      "multi-platform-delivery",
      "scheduled-publishing",
      "automatic-optimization",
      "retry-mechanisms",
      "analytics-tracking",
      "notification-system",
      "backup-creation",
      "quality-control",
      "performance-monitoring",
      "cost-tracking",
      "batch-processing",
      "webhook-integration",
      "api-rate-limiting",
      "error-recovery",
      "progress-tracking"
    ];

    defaultConfiguration: {
      platforms: [
        {
          name: "local";
          enabled: true;
          priority: 10;
          config: {
            outputDirectory: "./output/deliveries";
            createPreview: true;
            includeMetadata: true;
          };
        }
      ];
      optimization: {
        autoResize: false;
        autoCompress: false;
        autoThumbnail: true;
        autoTags: false;
        autoDescription: false;
      };
    };
  };
}

export interface PlatformConfig {
  name:
    | "local" // Default local delivery (NEW)
    | "youtube"
    | "tiktok"
    | "instagram"
    | "twitter"
    | "linkedin"
    | "telegram"
    | "discord"
    | "s3"
    | "drive"
    | "dropbox"
    | "ftp"
    | "email";
  enabled: boolean;
  priority: number; // 1-10, higher = processed first
  config: {
    // Local delivery config
    outputDirectory?: string;
    createPreview?: boolean;
    includeMetadata?: boolean;

    // Platform-specific configs
    channelId?: string; // For YouTube
    playlist?: string;
    privacy?: "public" | "private" | "unlisted";
    category?: string;
    language?: string;

    // Storage configs
    bucket?: string;
    region?: string;
    accessKey?: string;
    secretKey?: string;

    // Communication configs
    telegramChatId?: string; // For Telegram
    discordChannelId?: string; // For Discord
    webhookUrl?: string;

    // Email configs
    recipients?: string[];
    subject?: string;
    template?: string;
  };
}
