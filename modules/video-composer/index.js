/**
 * Video Composer Module - Advanced Video Composition Engine
 * Combines audio with AI-generated visuals, animations, and effects
 * Version: 1.0.0
 */

const fs = require("fs").promises;
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const { createCanvas, loadImage, registerFont } = require("canvas");
const { fabric } = require("fabric");
const sharp = require("sharp");
const Jimp = require("jimp");
const axios = require("axios");
const crypto = require("crypto");
const os = require("os");

// Configure FFmpeg and FFprobe paths
try {
  const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
  const ffprobePath = require("@ffprobe-installer/ffprobe").path;

  ffmpeg.setFfmpegPath(ffmpegPath);
  ffmpeg.setFfprobePath(ffprobePath);

  console.log(
    "✅ FFmpeg and FFprobe configured successfully for video-composer"
  );
} catch (error) {
  console.warn(
    "⚠️ Warning: Could not configure FFmpeg/FFprobe paths:",
    error.message
  );
  // Fallback to ffmpeg-static
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

/**
 * Custom error class for video composition errors
 */
class VideoComposerError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = "VideoComposerError";
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Advanced Video Composer Class
 * Handles all video composition operations with AI integration
 */
class VideoComposer {
  constructor(config = {}) {
    this.config = {
      // Default configuration
      tempDir: config.tempDir || path.join(os.tmpdir(), "video-composer"),
      outputDir: config.outputDir || "./output/videos",
      maxConcurrentJobs: config.maxConcurrentJobs || 3,
      qualityThreshold: config.qualityThreshold || 7,
      enableGPU: config.enableGPU !== false,
      enableAI: config.enableAI === true, // Cambiado: IA deshabilitada por defecto

      // AI Provider configurations (solo se usan si enableAI es true)
      providers: {
        runway: {
          apiKey: process.env.RUNWAY_API_KEY,
          baseUrl: "https://api.runwayml.com",
          timeout: 300000, // 5 minutes
        },
        pika: {
          apiKey: process.env.PIKA_API_KEY,
          baseUrl: "https://api.pika.art",
          timeout: 180000, // 3 minutes
        },
        kling: {
          apiKey: process.env.KLING_API_KEY,
          baseUrl: "https://api.kling.ai",
          timeout: 600000, // 10 minutes
        },
        luma: {
          apiKey: process.env.LUMA_API_KEY,
          baseUrl: "https://api.lumalabs.ai",
          timeout: 240000, // 4 minutes
        },
      },

      // Default visual styles
      templates: {
        podcast: {
          backgroundColor: "#1a1a1a",
          primaryColor: "#ffffff",
          accentColor: "#ff6b35",
          layout: "centered",
        },
        educational: {
          backgroundColor: "#f8f9fa",
          primaryColor: "#2c3e50",
          accentColor: "#3498db",
          layout: "split",
        },
        corporate: {
          backgroundColor: "#ffffff",
          primaryColor: "#2c3e50",
          accentColor: "#34495e",
          layout: "sidebar",
        },
        creative: {
          backgroundColor: "#000000",
          primaryColor: "#ffffff",
          accentColor: "#e74c3c",
          layout: "overlay",
        },
        minimal: {
          backgroundColor: "#ffffff",
          primaryColor: "#333333",
          accentColor: "#666666",
          layout: "centered",
        },
        dynamic: {
          backgroundColor: "#0f0f0f",
          primaryColor: "#ffffff",
          accentColor: "#00ff88",
          layout: "fullscreen",
        },
      },

      ...config,
    };

    this.processingQueue = [];
    this.activeJobs = new Map();
    this.stats = {
      videosGenerated: 0,
      totalProcessingTime: 0,
      totalCost: 0,
      aiScenesGenerated: 0,
      errors: 0,
    };

    this.initializeDirectories();
  }

  /**
   * Initialize required directories
   */
  async initializeDirectories() {
    try {
      await fs.mkdir(this.config.tempDir, { recursive: true });
      await fs.mkdir(this.config.outputDir, { recursive: true });
      await fs.mkdir(path.join(this.config.tempDir, "frames"), {
        recursive: true,
      });
      await fs.mkdir(path.join(this.config.tempDir, "assets"), {
        recursive: true,
      });
      await fs.mkdir(path.join(this.config.tempDir, "ai-scenes"), {
        recursive: true,
      });
    } catch (error) {
      throw new VideoComposerError(
        "Failed to initialize directories",
        "INITIALIZATION_ERROR",
        { error: error.message }
      );
    }
  }

  /**
   * Main composition method - orchestrates the entire video creation process
   */
  async compose(input) {
    const startTime = Date.now();
    const jobId = this.generateJobId();

    try {
      // Validate input
      this.validateInput(input);

      // Initialize job tracking
      const job = {
        id: jobId,
        startTime,
        status: "initializing",
        steps: [],
        tempFiles: [],
        costs: { total: 0, breakdown: {} },
      };

      this.activeJobs.set(jobId, job);

      // Step 1: Prepare workspace and analyze audio
      await this.updateJobStatus(
        jobId,
        "analyzing-audio",
        "Analyzing audio input and preparing workspace"
      );
      const audioAnalysis = await this.analyzeAudioInput(input.audioData);

      // Step 2: Generate visual scenes (AI or template-based)
      await this.updateJobStatus(
        jobId,
        "generating-visuals",
        "Generating visual content and scenes"
      );
      const visualScenes = await this.generateVisualScenes(
        input,
        audioAnalysis,
        jobId
      );

      // Step 3: Create background and base composition
      await this.updateJobStatus(
        jobId,
        "creating-background",
        "Creating background and base composition"
      );
      const backgroundAssets = await this.createBackground(
        input.visualStyle,
        input.background,
        jobId
      );

      // Step 4: Generate and style subtitles
      await this.updateJobStatus(
        jobId,
        "processing-subtitles",
        "Processing and styling subtitles"
      );
      const subtitleAssets = await this.processSubtitles(
        input.audioData.transcript,
        input.subtitles,
        jobId
      );

      // Step 5: Create visual effects and animations
      await this.updateJobStatus(
        jobId,
        "creating-effects",
        "Creating visual effects and animations"
      );
      const effectsAssets = await this.createVisualEffects(
        input.effects,
        audioAnalysis,
        jobId
      );

      // Step 6: Compose main video
      await this.updateJobStatus(
        jobId,
        "composing-video",
        "Composing main video with all elements"
      );
      const mainVideo = await this.composeMainVideo(
        {
          audioData: input.audioData,
          videoConfig: input.videoConfig,
          visualScenes,
          backgroundAssets,
          subtitleAssets,
          effectsAssets,
          branding: input.branding,
        },
        jobId
      );

      // Step 7: Generate platform variants
      await this.updateJobStatus(
        jobId,
        "generating-variants",
        "Generating platform-specific variants"
      );
      const variants = await this.generatePlatformVariants(
        mainVideo,
        input.outputVariants,
        jobId
      );

      // Step 8: Create additional assets
      await this.updateJobStatus(
        jobId,
        "creating-assets",
        "Creating thumbnails and preview assets"
      );
      const additionalAssets = await this.createAdditionalAssets(
        mainVideo,
        jobId
      );

      // Step 9: Analyze video quality
      await this.updateJobStatus(
        jobId,
        "analyzing-quality",
        "Analyzing video quality and compliance"
      );
      const analysis = await this.analyzeVideoQuality(
        mainVideo,
        input.videoConfig,
        jobId
      );

      // Step 10: Generate final output
      await this.updateJobStatus(
        jobId,
        "finalizing",
        "Finalizing output and cleaning up"
      );
      const result = await this.generateFinalOutput({
        mainVideo,
        variants,
        additionalAssets,
        analysis,
        job,
        input,
      });

      // Update statistics
      const processingTime = Date.now() - startTime;
      this.updateStats(processingTime, job.costs.total);

      // Cleanup
      await this.cleanup(jobId);

      return result;
    } catch (error) {
      this.stats.errors++;
      await this.cleanup(jobId);

      if (error instanceof VideoComposerError) {
        throw error;
      }

      throw new VideoComposerError(
        `Video composition failed: ${error.message}`,
        "COMPOSITION_FAILED",
        { originalError: error.message, jobId }
      );
    }
  }

  /**
   * Validate input parameters
   */
  validateInput(input) {
    if (!input || typeof input !== "object") {
      throw new VideoComposerError(
        "Invalid input: must be an object",
        "INVALID_INPUT"
      );
    }

    // Validate required fields
    const required = ["audioData", "videoConfig", "visualStyle"];
    for (const field of required) {
      if (!input[field]) {
        throw new VideoComposerError(
          `Missing required field: ${field}`,
          "MISSING_REQUIRED_FIELD"
        );
      }
    }

    // Validate audio data
    if (!input.audioData.mainFile || !input.audioData.transcript) {
      throw new VideoComposerError(
        "Invalid audio data: missing mainFile or transcript",
        "INVALID_AUDIO_DATA"
      );
    }

    // Validate video config
    const validFormats = ["mp4", "mov", "webm", "avi"];
    if (!validFormats.includes(input.videoConfig.format)) {
      throw new VideoComposerError(
        `Invalid video format: ${input.videoConfig.format}`,
        "INVALID_VIDEO_FORMAT"
      );
    }

    // Validate resolution
    const resolution = input.videoConfig.resolution;
    if (!resolution || !resolution.width || !resolution.height) {
      throw new VideoComposerError(
        "Invalid resolution configuration",
        "INVALID_RESOLUTION"
      );
    }

    // Validate visual style
    const validTemplates = [
      "podcast",
      "educational",
      "corporate",
      "creative",
      "minimal",
      "dynamic",
    ];
    if (!validTemplates.includes(input.visualStyle.template)) {
      throw new VideoComposerError(
        `Invalid visual template: ${input.visualStyle.template}`,
        "INVALID_TEMPLATE"
      );
    }
  }

  /**
   * Generate unique job ID
   */
  generateJobId() {
    return `video_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  }

  /**
   * Update job status and log progress
   */
  async updateJobStatus(jobId, status, details) {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.status = status;
      job.steps.push({
        step: status,
        timestamp: new Date().toISOString(),
        details,
        duration: Date.now() - job.startTime,
      });

      console.log(`[${jobId}] ${status}: ${details}`);
    }
  }

  /**
   * Update processing statistics
   */
  updateStats(processingTime, cost) {
    this.stats.videosGenerated++;
    this.stats.totalProcessingTime += processingTime;
    this.stats.totalCost += cost;
  }

  /**
   * Analyze audio input to extract timing and characteristics
   */
  async analyzeAudioInput(audioData) {
    try {
      const audioPath = audioData.mainFile;

      // Verify audio file exists
      await fs.access(audioPath);

      // Extract audio characteristics using FFmpeg
      const audioInfo = await this.getAudioInfo(audioPath);

      // Analyze transcript segments for visual cues
      const visualCues = this.extractVisualCues(audioData.transcript);

      // Calculate optimal scene timing
      const sceneTiming = this.calculateSceneTiming(
        audioData.transcript.segments
      );

      return {
        duration: audioInfo.duration, // Use audioInfo instead of audioData.metadata
        sampleRate: audioInfo.sampleRate, // Use audioInfo instead of audioData.metadata
        channels: audioInfo.channels, // Use audioInfo instead of audioData.metadata
        format: audioInfo.codec, // Use audioInfo instead of audioData.metadata
        audioInfo,
        visualCues,
        sceneTiming,
        segments: audioData.segments || audioData.transcript.segments, // Fallback to transcript segments
        transcript: audioData.transcript,
      };
    } catch (error) {
      throw new VideoComposerError(
        `Failed to analyze audio input: ${error.message}`,
        "AUDIO_ANALYSIS_FAILED",
        { error: error.message }
      );
    }
  }

  /**
   * Get detailed audio information using FFmpeg
   */
  async getAudioInfo(audioPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(audioPath, (err, metadata) => {
        if (err) {
          reject(new Error(`FFprobe failed: ${err.message}`));
          return;
        }

        const audioStream = metadata.streams.find(
          (stream) => stream.codec_type === "audio"
        );
        if (!audioStream) {
          reject(new Error("No audio stream found"));
          return;
        }

        resolve({
          duration: parseFloat(metadata.format.duration),
          bitrate: parseInt(metadata.format.bit_rate),
          codec: audioStream.codec_name,
          sampleRate: parseInt(audioStream.sample_rate),
          channels: audioStream.channels,
          channelLayout: audioStream.channel_layout,
        });
      });
    });
  }

  /**
   * Extract visual cues from transcript text
   */
  extractVisualCues(transcript) {
    const visualKeywords = {
      action: ["show", "demonstrate", "example", "look at", "see", "watch"],
      emotion: ["exciting", "amazing", "shocking", "surprising", "incredible"],
      emphasis: ["important", "key", "crucial", "essential", "remember"],
      transition: ["however", "but", "meanwhile", "next", "then", "finally"],
    };

    const cues = [];

    transcript.segments.forEach((segment, index) => {
      const text = segment.text.toLowerCase();
      const startTime = segment.start || segment.startTime || 0;
      const endTime = segment.end || segment.endTime || startTime + 3;

      const cue = {
        timestamp: startTime,
        duration: endTime - startTime,
        text: segment.text,
        types: [],
      };

      // Check for visual keywords
      Object.entries(visualKeywords).forEach(([type, keywords]) => {
        if (keywords.some((keyword) => text.includes(keyword))) {
          cue.types.push(type);
        }
      });

      // Analyze text length for pacing
      if (segment.text.length > 100) {
        cue.types.push("detailed");
      } else if (segment.text.length < 30) {
        cue.types.push("brief");
      }

      cues.push(cue);
    });

    return cues;
  }

  /**
   * Calculate optimal scene timing based on transcript
   */
  calculateSceneTiming(segments) {
    const scenes = [];
    let currentScene = null;
    const minSceneDuration = 3; // Minimum 3 seconds per scene
    const maxSceneDuration = 15; // Maximum 15 seconds per scene

    segments.forEach((segment, index) => {
      const startTime = segment.start || segment.startTime || 0;
      const endTime = segment.end || segment.endTime || startTime + 3;

      if (!currentScene) {
        currentScene = {
          startTime: startTime,
          endTime: endTime,
          segments: [segment],
          duration: endTime - startTime,
        };
      } else {
        const potentialDuration = endTime - currentScene.startTime;

        if (potentialDuration <= maxSceneDuration) {
          currentScene.endTime = endTime;
          currentScene.segments.push(segment);
          currentScene.duration = potentialDuration;
        } else {
          // Finalize current scene
          if (currentScene.duration >= minSceneDuration) {
            scenes.push(currentScene);
          }

          // Start new scene
          currentScene = {
            startTime: startTime,
            endTime: endTime,
            segments: [segment],
            duration: endTime - startTime,
          };
        }
      }
    });

    // Add final scene
    if (currentScene && currentScene.duration >= minSceneDuration) {
      scenes.push(currentScene);
    }

    return scenes;
  }

  /**
   * Generate visual scenes using AI or template-based approach
   */
  async generateVisualScenes(input, audioAnalysis, jobId) {
    try {
      const scenes = [];
      const job = this.activeJobs.get(jobId);

      if (input.aiVisuals && input.aiVisuals.enabled && this.config.enableAI) {
        // AI-powered visual generation
        scenes.push(
          ...(await this.generateAIVisualScenes(
            input.aiVisuals,
            audioAnalysis,
            jobId
          ))
        );
      } else {
        // Template-based visual generation
        scenes.push(
          ...(await this.generateTemplateVisualScenes(
            input.visualStyle,
            audioAnalysis,
            jobId
          ))
        );
      }

      return scenes;
    } catch (error) {
      throw new VideoComposerError(
        `Failed to generate visual scenes: ${error.message}`,
        "VISUAL_GENERATION_FAILED",
        { error: error.message }
      );
    }
  }

  /**
   * Generate AI-powered visual scenes
   */
  async generateAIVisualScenes(aiConfig, audioAnalysis, jobId) {
    const scenes = [];
    const job = this.activeJobs.get(jobId);

    try {
      // Use provided scenes or generate from transcript
      const scenePrompts =
        aiConfig.scenes.length > 0
          ? aiConfig.scenes
          : this.generateScenePromptsFromTranscript(
              audioAnalysis.transcript,
              aiConfig.style
            );

      // Prioritize DALL-E 3 if OpenAI is available and enabled
      if (
        this.openai &&
        (aiConfig.provider === "dalle3" || aiConfig.provider === "openai")
      ) {
        console.log("🎨 Using DALL-E 3 for visual generation...");
        return await this.generateDALLE3Scenes(
          scenePrompts,
          audioAnalysis,
          jobId
        );
      }

      // Fallback to video generation providers
      console.log(
        `🎥 Using video generation provider: ${aiConfig.provider || "kling"}...`
      );

      // Process scenes with rate limiting
      const batchSize = 2; // Process 2 scenes at a time to avoid rate limits
      for (let i = 0; i < scenePrompts.length; i += batchSize) {
        const batch = scenePrompts.slice(i, i + batchSize);
        const batchPromises = batch.map((scene) =>
          this.generateSingleAIScene(scene, aiConfig, jobId)
        );

        const batchResults = await Promise.allSettled(batchPromises);

        batchResults.forEach((result, index) => {
          if (result.status === "fulfilled") {
            scenes.push(result.value);
            this.stats.aiScenesGenerated++;
          } else {
            console.warn(
              `Failed to generate AI scene ${i + index}:`,
              result.reason
            );
            // Fallback to template-based scene
            scenes.push(this.createFallbackScene(batch[index], audioAnalysis));
          }
        });

        // Rate limiting delay
        if (i + batchSize < scenePrompts.length) {
          await this.delay(2000); // 2 second delay between batches
        }
      }

      return scenes;
    } catch (error) {
      console.warn(
        "AI scene generation failed, falling back to templates:",
        error.message
      );
      return this.generateTemplateVisualScenes(
        { template: "podcast" },
        audioAnalysis,
        jobId
      );
    }
  }

  /**
   * Generate scene prompts from transcript
   */
  generateScenePromptsFromTranscript(transcript, style) {
    const scenes = [];
    const sceneTiming = this.calculateSceneTiming(transcript.segments);

    sceneTiming.forEach((scene, index) => {
      const combinedText = scene.segments.map((s) => s.text).join(" ");
      const prompt = this.createVisualPromptFromText(
        combinedText,
        style,
        index
      );

      scenes.push({
        timestamp: scene.startTime,
        duration: scene.duration,
        prompt,
        style,
        motion: this.determineMotionFromText(combinedText),
      });
    });

    return scenes;
  }

  /**
   * Create visual prompt from text content
   */
  createVisualPromptFromText(text, style, sceneIndex) {
    const basePrompts = {
      realistic: "Professional, high-quality, realistic",
      animated: "Smooth animation, modern style, clean",
      abstract: "Abstract, artistic, flowing shapes",
      minimalist: "Clean, simple, minimal design",
      cinematic: "Cinematic lighting, dramatic, professional",
    };

    const base = basePrompts[style] || basePrompts.realistic;

    // Extract key concepts from text
    const concepts = this.extractKeyConceptsFromText(text);
    const conceptsText =
      concepts.length > 0 ? `, featuring ${concepts.join(", ")}` : "";

    // Add variety based on scene index
    const variations = [
      "with soft lighting and gentle movement",
      "with dynamic composition and vibrant colors",
      "with elegant transitions and smooth flow",
      "with professional presentation style",
      "with modern aesthetic and clean lines",
    ];

    const variation = variations[sceneIndex % variations.length];

    return `${base}${conceptsText}, ${variation}. High quality, professional video content suitable for podcast or educational content.`;
  }

  /**
   * Extract key concepts from text for visual generation
   */
  extractKeyConceptsFromText(text) {
    const concepts = [];
    const words = text.toLowerCase().split(/\s+/);

    // Technology concepts
    const techWords = [
      "technology",
      "ai",
      "artificial intelligence",
      "machine learning",
      "data",
      "digital",
      "computer",
      "software",
      "internet",
    ];
    if (techWords.some((word) => words.includes(word))) {
      concepts.push("technology and innovation");
    }

    // Business concepts
    const businessWords = [
      "business",
      "market",
      "company",
      "strategy",
      "growth",
      "success",
      "profit",
      "investment",
    ];
    if (businessWords.some((word) => words.includes(word))) {
      concepts.push("business and growth");
    }

    // Education concepts
    const educationWords = [
      "learn",
      "education",
      "study",
      "knowledge",
      "skill",
      "training",
      "development",
    ];
    if (educationWords.some((word) => words.includes(word))) {
      concepts.push("learning and development");
    }

    // Health concepts
    const healthWords = [
      "health",
      "fitness",
      "wellness",
      "medical",
      "exercise",
      "nutrition",
    ];
    if (healthWords.some((word) => words.includes(word))) {
      concepts.push("health and wellness");
    }

    return concepts.slice(0, 2); // Limit to 2 concepts to avoid overly complex prompts
  }

  /**
   * Determine motion type from text content
   */
  determineMotionFromText(text) {
    const motionKeywords = {
      fast: ["quick", "rapid", "fast", "speed", "rush", "urgent"],
      slow: ["slow", "gentle", "calm", "peaceful", "steady", "gradual"],
      medium: ["move", "change", "develop", "grow", "progress"],
    };

    const words = text.toLowerCase().split(/\s+/);

    for (const [motion, keywords] of Object.entries(motionKeywords)) {
      if (keywords.some((keyword) => words.includes(keyword))) {
        return motion;
      }
    }

    return "medium"; // Default motion
  }

  /**
   * Generate a single AI scene
   */
  async generateSingleAIScene(sceneConfig, aiConfig, jobId) {
    const provider = aiConfig.provider || "kling"; // Default to Kling AI
    const job = this.activeJobs.get(jobId);

    try {
      let sceneFile;
      let cost = 0;

      switch (provider) {
        case "runway":
          ({ file: sceneFile, cost } =
            await this.generateRunwayScene(sceneConfig));
          break;
        case "pika":
          ({ file: sceneFile, cost } =
            await this.generatePikaScene(sceneConfig));
          break;
        case "kling":
          ({ file: sceneFile, cost } =
            await this.generateKlingScene(sceneConfig));
          break;
        case "luma":
          ({ file: sceneFile, cost } =
            await this.generateLumaScene(sceneConfig));
          break;
        default:
          throw new Error(`Unsupported AI provider: ${provider}`);
      }

      // Update job costs
      job.costs.total += cost;
      job.costs.breakdown[provider] =
        (job.costs.breakdown[provider] || 0) + cost;
      job.tempFiles.push(sceneFile);

      return {
        id: `ai_scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        file: sceneFile,
        timestamp: sceneConfig.timestamp,
        duration: sceneConfig.duration,
        prompt: sceneConfig.prompt,
        provider,
        cost,
        type: "ai-generated",
      };
    } catch (error) {
      throw new VideoComposerError(
        `Failed to generate AI scene with ${provider}: ${error.message}`,
        "AI_SCENE_GENERATION_FAILED",
        { provider, prompt: sceneConfig.prompt }
      );
    }
  }

  /**
   * Generate scene using Kling AI
   */
  async generateKlingScene(sceneConfig) {
    const apiKey = this.config.providers.kling.apiKey;
    if (!apiKey) {
      throw new Error("Kling AI API key not configured");
    }

    try {
      // Create video generation request
      const response = await axios.post(
        `${this.config.providers.kling.baseUrl}/v1/videos/text2video`,
        {
          prompt: sceneConfig.prompt,
          duration: Math.min(sceneConfig.duration, 10), // Kling max 10 seconds
          aspect_ratio: "16:9",
          motion_strength: this.mapMotionToStrength(sceneConfig.motion),
          quality: "high",
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: this.config.providers.kling.timeout,
        }
      );

      const taskId = response.data.task_id;

      // Poll for completion
      const videoUrl = await this.pollKlingTask(taskId);

      // Download video
      const filename = `kling_scene_${Date.now()}.mp4`;
      const filepath = path.join(this.config.tempDir, "ai-scenes", filename);
      await this.downloadFile(videoUrl, filepath);

      // Calculate cost (approximate)
      const cost = sceneConfig.duration * 0.02; // $0.02 per second

      return { file: filepath, cost };
    } catch (error) {
      throw new Error(`Kling AI generation failed: ${error.message}`);
    }
  }

  /**
   * Map motion type to Kling AI motion strength
   */
  mapMotionToStrength(motion) {
    const mapping = {
      static: 0.1,
      slow: 0.3,
      medium: 0.6,
      fast: 0.9,
    };
    return mapping[motion] || 0.6;
  }

  /**
   * Poll Kling AI task for completion
   */
  async pollKlingTask(taskId, maxAttempts = 60) {
    const apiKey = this.config.providers.kling.apiKey;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await axios.get(
          `${this.config.providers.kling.baseUrl}/v1/videos/${taskId}`,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          }
        );

        const status = response.data.status;

        if (status === "completed") {
          return response.data.video_url;
        } else if (status === "failed") {
          throw new Error("Kling AI task failed");
        }

        // Wait before next poll
        await this.delay(5000); // 5 seconds
      } catch (error) {
        if (attempt === maxAttempts - 1) {
          throw error;
        }
        await this.delay(5000);
      }
    }

    throw new Error("Kling AI task timeout");
  }

  /**
   * Download file from URL
   */
  async downloadFile(url, filepath) {
    const response = await axios({
      method: "GET",
      url,
      responseType: "stream",
    });

    const writer = require("fs").createWriteStream(filepath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  }

  /**
   * Create fallback scene when AI generation fails
   */
  createFallbackScene(sceneConfig, audioAnalysis) {
    return {
      id: `fallback_scene_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      file: null, // Will be generated as template-based
      timestamp: sceneConfig.timestamp,
      duration: sceneConfig.duration,
      prompt: sceneConfig.prompt,
      provider: "template",
      cost: 0,
      type: "template-based",
    };
  }

  /**
   * Generate image with DALL-E 3
   */
  async generateDALLE3Image(prompt, sceneConfig, jobId) {
    if (!this.openai) {
      throw new VideoComposerError(
        "OpenAI client not initialized",
        "DALLE3_NOT_AVAILABLE"
      );
    }

    try {
      console.log(
        `🎨 Generating DALL-E 3 image for scene: ${prompt.substring(0, 50)}...`
      );

      // Enhanced prompt for better visual results
      const enhancedPrompt = `${prompt}. Modern, professional, high-quality digital art. Perfect for video content. 16:9 aspect ratio composition. Clean, appealing visual style suitable for social media and educational content.`;

      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1792x1024", // 16:9 aspect ratio for video
        quality: "hd",
        style: "vivid", // More vibrant and appealing for video content
      });

      const imageUrl = response.data[0].url;

      if (!imageUrl) {
        throw new Error("No image URL returned from DALL-E 3");
      }

      // Download the image
      const filename = `dalle3_scene_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
      const imagePath = path.join(this.config.tempDir, "ai-scenes", filename);

      await this.downloadFile(imageUrl, imagePath);

      console.log(`✅ DALL-E 3 image generated successfully: ${filename}`);

      // Add cost tracking
      const job = this.activeJobs.get(jobId);
      if (job) {
        job.costs.breakdown.dalle3 = (job.costs.breakdown.dalle3 || 0) + 0.04; // $0.04 per HD image
        job.costs.total += 0.04;
      }

      return {
        type: "dalle3_image",
        file: imagePath,
        url: imageUrl,
        prompt: enhancedPrompt,
        timestamp: sceneConfig.timestamp,
        duration: sceneConfig.duration,
        style: sceneConfig.style,
        resolution: "1792x1024",
        cost: 0.04,
      };
    } catch (error) {
      console.error(`❌ DALL-E 3 generation failed:`, error.message);
      throw new VideoComposerError(
        `DALL-E 3 image generation failed: ${error.message}`,
        "DALLE3_GENERATION_FAILED",
        { prompt, error: error.message }
      );
    }
  }

  /**
   * Generate multiple DALL-E 3 images for video scenes
   */
  async generateDALLE3Scenes(scenePrompts, audioAnalysis, jobId) {
    const scenes = [];
    const job = this.activeJobs.get(jobId);

    try {
      console.log(
        `🎨 Generating ${scenePrompts.length} DALL-E 3 images for video scenes...`
      );

      // Process scenes with rate limiting (DALL-E 3 has stricter limits)
      const batchSize = 1; // Process 1 image at a time to avoid rate limits
      for (let i = 0; i < scenePrompts.length; i += batchSize) {
        const scene = scenePrompts[i];

        try {
          const dalleScene = await this.generateDALLE3Image(
            scene.prompt,
            scene,
            jobId
          );
          scenes.push(dalleScene);
          this.stats.aiScenesGenerated++;

          // Update job progress
          await this.updateJobStatus(
            jobId,
            "generating-visuals",
            `Generating DALL-E 3 image for scene: ${scene.prompt.substring(0, 50)}`
          );
        } catch (error) {
          console.error(
            `❌ DALL-E 3 generation failed for scene: ${scene.prompt.substring(0, 50)}`,
            error.message
          );
          scenes.push(this.createFallbackScene(scene, audioAnalysis));
        }
      }

      return scenes;
    } catch (error) {
      throw new VideoComposerError(
        `Failed to generate DALL-E 3 images: ${error.message}`,
        "DALLE3_GENERATION_FAILED",
        { error: error.message }
      );
    }
  }

  /**
   * Generate single platform variant
   */
  async generateSingleVariant(mainVideo, variantConfig, jobId) {
    const job = this.activeJobs.get(jobId);
    const filename = `${variantConfig.name}_${Date.now()}.mp4`;
    const filepath = path.join(this.config.outputDir, filename);

    try {
      let ffmpegCommand = ffmpeg(mainVideo.file);

      // Apply platform-specific optimizations
      const platformSettings = this.getPlatformSettings(variantConfig.platform);

      // Set resolution
      ffmpegCommand = ffmpegCommand.size(
        `${variantConfig.resolution.width}x${variantConfig.resolution.height}`
      );

      // Apply duration limits if specified
      if (
        variantConfig.duration ||
        variantConfig.startTime ||
        variantConfig.endTime
      ) {
        const startTime = variantConfig.startTime || 0;
        const duration =
          variantConfig.duration || variantConfig.endTime - startTime;

        ffmpegCommand = ffmpegCommand.seekInput(startTime).duration(duration);
      }

      // Apply platform-specific settings
      ffmpegCommand = ffmpegCommand.outputOptions([
        `-c:v ${platformSettings.videoCodec}`,
        `-c:a ${platformSettings.audioCodec}`,
        `-b:v ${platformSettings.videoBitrate}`,
        `-b:a ${platformSettings.audioBitrate}`,
        `-r ${platformSettings.frameRate}`,
        `-pix_fmt ${platformSettings.pixelFormat}`,
      ]);

      // Add platform-specific optimizations
      if (platformSettings.additionalOptions) {
        ffmpegCommand = ffmpegCommand.outputOptions(
          platformSettings.additionalOptions
        );
      }

      // Execute conversion
      await new Promise((resolve, reject) => {
        ffmpegCommand
          .output(filepath)
          .on("end", resolve)
          .on("error", reject)
          .run();
      });

      // Get variant info
      const variantInfo = await this.getVideoInfo(filepath);

      job.tempFiles.push(filepath);

      return {
        name: variantConfig.name,
        platform: variantConfig.platform,
        file: filepath,
        resolution: variantConfig.resolution,
        duration: variantInfo.duration,
        fileSize: variantInfo.fileSize,
        optimizedFor: platformSettings.optimizedFor,
      };
    } catch (error) {
      throw new Error(
        `Failed to generate variant ${variantConfig.name}: ${error.message}`
      );
    }
  }

  /**
   * Get platform-specific encoding settings
   */
  getPlatformSettings(platform) {
    const settings = {
      youtube: {
        videoCodec: "libx264",
        audioCodec: "aac",
        videoBitrate: "5000k",
        audioBitrate: "128k",
        frameRate: 30,
        pixelFormat: "yuv420p",
        optimizedFor: ["web", "mobile", "tv"],
        additionalOptions: ["-preset medium", "-crf 23"],
      },
      tiktok: {
        videoCodec: "libx264",
        audioCodec: "aac",
        videoBitrate: "3000k",
        audioBitrate: "96k",
        frameRate: 30,
        pixelFormat: "yuv420p",
        optimizedFor: ["mobile", "vertical"],
        additionalOptions: ["-preset fast", "-crf 25"],
      },
      instagram: {
        videoCodec: "libx264",
        audioCodec: "aac",
        videoBitrate: "3500k",
        audioBitrate: "128k",
        frameRate: 30,
        pixelFormat: "yuv420p",
        optimizedFor: ["mobile", "square", "vertical"],
        additionalOptions: ["-preset medium", "-crf 24"],
      },
      twitter: {
        videoCodec: "libx264",
        audioCodec: "aac",
        videoBitrate: "2500k",
        audioBitrate: "96k",
        frameRate: 30,
        pixelFormat: "yuv420p",
        optimizedFor: ["web", "mobile"],
        additionalOptions: ["-preset fast", "-crf 26"],
      },
      linkedin: {
        videoCodec: "libx264",
        audioCodec: "aac",
        videoBitrate: "4000k",
        audioBitrate: "128k",
        frameRate: 30,
        pixelFormat: "yuv420p",
        optimizedFor: ["web", "professional"],
        additionalOptions: ["-preset medium", "-crf 23"],
      },
      custom: {
        videoCodec: "libx264",
        audioCodec: "aac",
        videoBitrate: "4000k",
        audioBitrate: "128k",
        frameRate: 30,
        pixelFormat: "yuv420p",
        optimizedFor: ["general"],
        additionalOptions: ["-preset medium", "-crf 24"],
      },
    };

    return settings[platform] || settings.custom;
  }

  /**
   * Create additional assets (thumbnails, previews, etc.)
   */
  async createAdditionalAssets(mainVideo, jobId) {
    try {
      const job = this.activeJobs.get(jobId);
      const assets = {
        thumbnails: [],
        preview: {},
        frames: [],
      };

      // Generate thumbnails at different timestamps
      const thumbnailTimes = [
        0,
        mainVideo.duration * 0.25,
        mainVideo.duration * 0.5,
        mainVideo.duration * 0.75,
      ];

      for (let i = 0; i < thumbnailTimes.length; i++) {
        const timestamp = thumbnailTimes[i];
        const thumbnail = await this.generateThumbnail(
          mainVideo.file,
          timestamp,
          jobId
        );
        assets.thumbnails.push({
          timestamp,
          file: thumbnail.file,
          resolution: thumbnail.resolution,
        });
        job.tempFiles.push(thumbnail.file);
      }

      // Generate preview GIF
      const previewGif = await this.generatePreviewGif(mainVideo.file, jobId);
      assets.preview.gif = previewGif.file;
      job.tempFiles.push(previewGif.file);

      // Generate preview MP4 (first 10 seconds)
      const previewMp4 = await this.generatePreviewMp4(mainVideo.file, jobId);
      assets.preview.mp4 = previewMp4.file;
      assets.preview.duration = previewMp4.duration;
      job.tempFiles.push(previewMp4.file);

      // Extract key frames
      const keyFrames = await this.extractKeyFrames(mainVideo.file, jobId);
      assets.frames = keyFrames;
      keyFrames.forEach((frame) => job.tempFiles.push(frame.file));

      return assets;
    } catch (error) {
      throw new VideoComposerError(
        `Failed to create additional assets: ${error.message}`,
        "ASSET_CREATION_FAILED",
        { error: error.message }
      );
    }
  }

  /**
   * Generate thumbnail at specific timestamp
   */
  async generateThumbnail(videoFile, timestamp, jobId) {
    const filename = `thumbnail_${timestamp.toFixed(2)}s_${Date.now()}.jpg`;
    const filepath = path.join(this.config.tempDir, "assets", filename);

    await new Promise((resolve, reject) => {
      ffmpeg(videoFile)
        .seekInput(timestamp)
        .frames(1)
        .size("1280x720")
        .output(filepath)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    return {
      file: filepath,
      resolution: { width: 1280, height: 720 },
    };
  }

  /**
   * Generate preview GIF
   */
  async generatePreviewGif(videoFile, jobId) {
    const filename = `preview_${Date.now()}.gif`;
    const filepath = path.join(this.config.tempDir, "assets", filename);

    await new Promise((resolve, reject) => {
      ffmpeg(videoFile)
        .duration(5) // First 5 seconds
        .size("480x270")
        .fps(10)
        .output(filepath)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    return { file: filepath };
  }

  /**
   * Generate preview MP4
   */
  async generatePreviewMp4(videoFile, jobId) {
    const filename = `preview_${Date.now()}.mp4`;
    const filepath = path.join(this.config.tempDir, "assets", filename);

    await new Promise((resolve, reject) => {
      ffmpeg(videoFile)
        .duration(10) // First 10 seconds
        .size("854x480")
        .outputOptions(["-c:v libx264", "-crf 28"])
        .output(filepath)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    return {
      file: filepath,
      duration: 10,
    };
  }

  /**
   * Extract key frames from video
   */
  async extractKeyFrames(videoFile, jobId) {
    const frames = [];
    const frameCount = 5;
    const videoInfo = await this.getVideoInfo(videoFile);
    const interval = videoInfo.duration / frameCount;

    for (let i = 0; i < frameCount; i++) {
      const timestamp = i * interval;
      const filename = `frame_${i}_${Date.now()}.jpg`;
      const filepath = path.join(this.config.tempDir, "assets", filename);

      await new Promise((resolve, reject) => {
        ffmpeg(videoFile)
          .seekInput(timestamp)
          .frames(1)
          .size("1920x1080")
          .output(filepath)
          .on("end", resolve)
          .on("error", reject)
          .run();
      });

      frames.push({
        timestamp,
        file: filepath,
        description: `Key frame at ${timestamp.toFixed(2)}s`,
      });
    }

    return frames;
  }

  /**
   * Cleanup method for removing temporary files
   */
  async cleanup(jobId) {
    try {
      const job = this.activeJobs.get(jobId);
      if (job && job.tempFiles) {
        const fsSync = require("fs"); // Use synchronous fs for cleanup
        for (const file of job.tempFiles) {
          try {
            if (fsSync.existsSync(file)) {
              fsSync.unlinkSync(file);
            }
          } catch (error) {
            console.warn(
              `Warning: Could not delete temp file ${file}:`,
              error.message
            );
          }
        }
      }
      this.activeJobs.delete(jobId);
    } catch (error) {
      console.warn(`Warning: Cleanup failed for job ${jobId}:`, error.message);
    }
  }

  /**
   * Analyze video quality and compliance
   */
  async analyzeVideoQuality(mainVideo, videoConfig, jobId) {
    try {
      const job = this.activeJobs.get(jobId);

      // Get detailed video information
      const videoInfo = await this.getVideoInfo(mainVideo.file);

      // Calculate quality metrics
      const qualityScore = this.calculateQualityScore(videoInfo, videoConfig);

      // Check compliance with platform requirements
      const compliance = this.checkPlatformCompliance(videoInfo, videoConfig);

      return {
        qualityScore,
        compliance,
        videoInfo,
        recommendations: this.generateQualityRecommendations(
          qualityScore,
          compliance
        ),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new VideoComposerError(
        `Failed to analyze video quality: ${error.message}`,
        "QUALITY_ANALYSIS_FAILED",
        { error: error.message }
      );
    }
  }

  /**
   * Calculate quality score based on video metrics
   */
  calculateQualityScore(videoInfo, videoConfig) {
    let score = 10; // Start with perfect score

    // Check resolution match
    if (
      videoInfo.width !== videoConfig.resolution.width ||
      videoInfo.height !== videoConfig.resolution.height
    ) {
      score -= 1;
    }

    // Check frame rate
    if (Math.abs(videoInfo.frameRate - videoConfig.frameRate) > 1) {
      score -= 0.5;
    }

    // Check file size (reasonable range)
    const expectedSize = videoInfo.duration * 100000; // ~100KB per second baseline
    if (videoInfo.fileSize < expectedSize * 0.5) {
      score -= 1; // Too small, might be low quality
    }

    return Math.max(0, Math.min(10, score));
  }

  /**
   * Check platform compliance
   */
  checkPlatformCompliance(videoInfo, videoConfig) {
    const compliance = {
      resolution: true,
      duration: true,
      format: true,
      bitrate: true,
      issues: [],
    };

    // Check common platform limits
    if (videoInfo.duration > 300) {
      // 5 minutes
      compliance.duration = false;
      compliance.issues.push(
        "Duration exceeds common platform limits (5 minutes)"
      );
    }

    if (videoInfo.fileSize > 100 * 1024 * 1024) {
      // 100MB
      compliance.bitrate = false;
      compliance.issues.push(
        "File size exceeds common platform limits (100MB)"
      );
    }

    return compliance;
  }

  /**
   * Generate quality recommendations
   */
  generateQualityRecommendations(qualityScore, compliance) {
    const recommendations = [];

    if (qualityScore < 8) {
      recommendations.push(
        "Consider increasing video bitrate for better quality"
      );
    }

    if (!compliance.duration) {
      recommendations.push(
        "Consider splitting into shorter segments for better platform compatibility"
      );
    }

    if (!compliance.bitrate) {
      recommendations.push(
        "Consider reducing bitrate or resolution to decrease file size"
      );
    }

    if (recommendations.length === 0) {
      recommendations.push("Video quality and compliance are excellent!");
    }

    return recommendations;
  }

  /**
   * Generate final output structure
   */
  async generateFinalOutput(data) {
    try {
      const { mainVideo, variants, additionalAssets, analysis, job, input } =
        data;

      return {
        success: true,
        video: {
          mainFile: mainVideo.file,
          format: mainVideo.format,
          resolution: mainVideo.resolution,
          duration: mainVideo.duration,
          frameRate: input.videoConfig.frameRate,
          fileSize: mainVideo.fileSize,
          codec: input.videoConfig.codec,
          bitrate: "4000k", // Default bitrate
        },
        variants: variants || [],
        assets: additionalAssets || {},
        analysis,
        metadata: {
          jobId: job.id,
          generatedAt: new Date().toISOString(),
          processingTime: Date.now() - job.startTime,
          totalCost: job.costs.total,
          steps: job.steps,
          compositionDetails: {
            audioFile: input.audioData.mainFile,
            videoConfig: input.videoConfig,
            visualStyle: input.visualStyle,
          },
          processingSteps: job.steps,
          qualityMetrics: analysis.qualityScore
            ? { overallScore: analysis.qualityScore }
            : {},
          fileInfo: {
            outputFile: mainVideo.file,
            fileSize: mainVideo.fileSize,
            duration: mainVideo.duration,
          },
        },
        recommendations: {
          qualityImprovements: analysis.recommendations || [],
          performanceOptimizations: [
            "Consider using hardware acceleration for faster processing",
            "Batch processing multiple videos can improve efficiency",
          ],
          platformOptimizations: {
            youtube: [
              "Optimize for 16:9 aspect ratio",
              "Use H.264 codec for best compatibility",
            ],
            tiktok: [
              "Ensure vertical 9:16 format",
              "Keep duration under 3 minutes",
            ],
            instagram: [
              "Consider square 1:1 format for feed posts",
              "Use eye-catching thumbnails",
            ],
          },
          costOptimizations: [
            "Use template-based scenes instead of AI generation for lower costs",
            "Batch multiple videos to reduce setup overhead",
          ],
          nextSteps: [
            "Consider adding subtitle animations for better engagement",
            "Test different visual styles to find optimal performance",
            "Monitor video analytics to optimize future content",
          ],
        },
      };
    } catch (error) {
      throw new VideoComposerError(
        `Failed to generate final output: ${error.message}`,
        "FINAL_OUTPUT_FAILED",
        { error: error.message }
      );
    }
  }

  /**
   * Validate safe area configuration for TikTok
   */
  validateSafeArea(subtitleConfig) {
    try {
      const safeArea = subtitleConfig.safeArea;

      // TikTok safe area requirements (1080x1920)
      const requirements = {
        minTop: 120,
        minBottom: 240,
        minSides: 50,
      };

      return (
        safeArea.top >= requirements.minTop &&
        safeArea.bottom >= requirements.minBottom &&
        safeArea.left >= requirements.minSides &&
        safeArea.right >= requirements.minSides
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Segment text for optimal TikTok engagement
   */
  segmentTextForTikTok(text, maxWordsPerSegment = 4) {
    try {
      const words = text.split(" ");
      const segments = [];

      for (let i = 0; i < words.length; i += maxWordsPerSegment) {
        const segment = words.slice(i, i + maxWordsPerSegment).join(" ");
        segments.push(segment);
      }

      return segments;
    } catch (error) {
      console.error("Error segmenting text:", error);
      return [text]; // Return original text as fallback
    }
  }

  /**
   * Optimize subtitle timing for TikTok engagement
   */
  optimizeSubtitleTiming(segments) {
    try {
      const optimized = [];

      segments.forEach((segment, index) => {
        const duration = segment.endTime - segment.startTime;

        // Split long segments into smaller chunks (max 4 words)
        const words = segment.text.split(" ");
        if (words.length > 4) {
          const chunks = this.segmentTextForTikTok(segment.text, 4);
          const chunkDuration = duration / chunks.length;

          chunks.forEach((chunk, chunkIndex) => {
            optimized.push({
              startTime: segment.startTime + chunkIndex * chunkDuration,
              endTime: segment.startTime + (chunkIndex + 1) * chunkDuration,
              text: chunk,
            });
          });
        } else {
          // Keep original segment if it's already optimal
          optimized.push({
            startTime: segment.startTime,
            endTime: segment.endTime,
            text: segment.text,
          });
        }
      });

      return optimized;
    } catch (error) {
      console.error("Error optimizing subtitle timing:", error);
      return segments; // Return original segments as fallback
    }
  }

  /**
   * Check TikTok compliance for subtitles
   */
  checkTikTokCompliance(subtitleConfig, transcript) {
    try {
      const compliance = {
        safeArea: false,
        wordCount: false,
        duration: false,
        fontSpecs: false,
      };

      // Check safe area
      compliance.safeArea = this.validateSafeArea(subtitleConfig);

      // Check word count per segment
      const maxWords = subtitleConfig.maxWordsPerLine || 4;
      compliance.wordCount = transcript.segments.every((segment) => {
        return segment.text.split(" ").length <= maxWords;
      });

      // Check duration (optimal 21-34 seconds for TikTok)
      const totalDuration = Math.max(
        ...transcript.segments.map((s) => s.endTime)
      );
      compliance.duration = totalDuration >= 21 && totalDuration <= 34;

      // Check font specifications
      compliance.fontSpecs =
        subtitleConfig.fontSize >= 48 &&
        subtitleConfig.fontWeight === "bold" &&
        subtitleConfig.color === "#FFFFFF" &&
        subtitleConfig.stroke === "#000000";

      return compliance;
    } catch (error) {
      console.error("Error checking TikTok compliance:", error);
      return {
        safeArea: false,
        wordCount: false,
        duration: false,
        fontSpecs: false,
      };
    }
  }

  /**
   * Generate optimized libass style for TikTok
   */
  getOptimizedLibassStyle(config) {
    const safeArea = config.safeArea || {
      top: 120,
      bottom: 240,
      left: 50,
      right: 50,
    };
    const fontSize = config.fontSize || 56;
    const color = config.color || "#FFFFFF";
    const stroke = config.stroke || "#000000";
    const strokeWidth = config.strokeWidth || 3;

    // Calculate center position considering safe area
    const centerX = 540; // Center of 1080px width
    const centerY =
      960 - safeArea.bottom + (1920 - safeArea.top - safeArea.bottom) / 2;

    return `Alignment=2,FontSize=${fontSize},PrimaryColour=&H${color.replace("#", "")},OutlineColour=&H${stroke.replace("#", "")},Outline=${strokeWidth},Shadow=0,Bold=1,MarginV=${safeArea.bottom}`;
  }

  /**
   * Generate template-based visual scenes (fallback when AI generation fails)
   */
  async generateTemplateVisualScenes(visualStyle, audioAnalysis, jobId) {
    try {
      console.log("   🎨 Generating template-based visual scenes...");

      const job = this.activeJobs.get(jobId);
      const scenes = [];

      // Get template configuration based on style
      const template = visualStyle.template || "dynamic";
      const sceneCount = Math.min(audioAnalysis.segments?.length || 6, 8); // Max 8 scenes
      const totalDuration = audioAnalysis.duration || 150;
      const sceneDuration = totalDuration / sceneCount;

      // Template configurations
      const templates = {
        dynamic: {
          backgroundColor: "#0f0f0f",
          primaryColor: "#ffffff",
          accentColor: "#00ff88",
          scenes: [
            { type: "gradient", colors: ["#0f0f0f", "#1a1a2e"] },
            { type: "particles", count: 50 },
            { type: "waves", amplitude: 0.5 },
            { type: "geometric", shapes: "circles" },
            { type: "glow", intensity: 0.7 },
            { type: "noise", opacity: 0.3 },
          ],
        },
        podcast: {
          backgroundColor: "#1a1a1a",
          primaryColor: "#ffffff",
          accentColor: "#ff6b6b",
          scenes: [
            { type: "solid", color: "#1a1a1a" },
            { type: "subtle-gradient", colors: ["#1a1a1a", "#2a2a2a"] },
            { type: "minimal-wave", amplitude: 0.2 },
            { type: "simple-particles", count: 20 },
          ],
        },
        minimalist: {
          backgroundColor: "#ffffff",
          primaryColor: "#000000",
          accentColor: "#007acc",
          scenes: [
            { type: "solid", color: "#ffffff" },
            { type: "clean-gradient", colors: ["#ffffff", "#f8f9fa"] },
            { type: "simple-lines", count: 3 },
          ],
        },
      };

      const templateConfig = templates[template] || templates.dynamic;

      // Generate scenes based on template
      for (let i = 0; i < sceneCount; i++) {
        const startTime = i * sceneDuration;
        const endTime = Math.min(startTime + sceneDuration, totalDuration);

        // Cycle through template scenes
        const sceneTemplate =
          templateConfig.scenes[i % templateConfig.scenes.length];

        // Create scene file path (we'll generate a simple colored background for now)
        const sceneFileName = `template_scene_${i + 1}_${Date.now()}.mp4`;
        const sceneFilePath = path.join(this.config.tempDir, sceneFileName);

        // Generate a simple background video using FFmpeg
        await this.generateTemplateVideo(
          sceneTemplate,
          templateConfig,
          sceneFilePath,
          sceneDuration
        );

        scenes.push({
          id: `template_scene_${i + 1}`,
          startTime,
          endTime,
          duration: endTime - startTime,
          file: sceneFilePath,
          type: "template",
          config: sceneTemplate,
          metadata: {
            template,
            sceneIndex: i,
            generatedAt: new Date().toISOString(),
          },
        });

        // Track temp files for cleanup
        job.tempFiles.push(sceneFilePath);
      }

      console.log(`   ✅ Generated ${scenes.length} template scenes`);
      return scenes;
    } catch (error) {
      throw new VideoComposerError(
        `Failed to generate template visual scenes: ${error.message}`,
        "TEMPLATE_GENERATION_FAILED",
        { error: error.message }
      );
    }
  }

  /**
   * Generate a simple background video using FFmpeg
   */
  async generateTemplateVideo(
    sceneTemplate,
    templateConfig,
    outputPath,
    duration
  ) {
    return new Promise((resolve, reject) => {
      const width = 1080;
      const height = 1920;

      // Use simpler FFmpeg approach - just generate solid color backgrounds
      const backgroundColor =
        sceneTemplate.color || templateConfig.backgroundColor || "#0f0f0f";

      // Convert hex color to RGB for FFmpeg color filter
      let rgbColor = backgroundColor;
      if (backgroundColor.startsWith("#")) {
        rgbColor = backgroundColor.substring(1);
      }

      ffmpeg()
        .input(
          `color=c=${rgbColor}:size=${width}x${height}:duration=${duration}:rate=30`
        )
        .inputFormat("lavfi")
        .outputOptions([
          "-c:v",
          "libx264",
          "-preset",
          "fast",
          "-crf",
          "23",
          "-pix_fmt",
          "yuv420p",
          "-shortest",
        ])
        .output(outputPath)
        .on("end", () => {
          resolve();
        })
        .on("error", (error) => {
          reject(
            new Error(`Template video generation failed: ${error.message}`)
          );
        })
        .run();
    });
  }

  /**
   * Create background assets
   */
  async createBackground(visualStyle, backgroundConfig, jobId) {
    try {
      console.log("   🎨 Creating background assets...");

      const job = this.activeJobs.get(jobId);

      // For now, return a simple background configuration
      // The actual background will be handled by the visual scenes
      return {
        type: "template-based",
        style: visualStyle.template,
        backgroundColor: visualStyle.backgroundColor,
        primaryColor: visualStyle.primaryColor,
        accentColor: visualStyle.accentColor,
        assets: [], // No additional background assets needed for template-based approach
      };
    } catch (error) {
      throw new VideoComposerError(
        `Failed to create background: ${error.message}`,
        "BACKGROUND_CREATION_FAILED",
        { error: error.message }
      );
    }
  }

  /**
   * Process subtitles
   */
  async processSubtitles(transcript, subtitleConfig, jobId) {
    try {
      console.log("   📝 Processing subtitles...");

      const job = this.activeJobs.get(jobId);

      // Use the existing transcript from audio-synthesizer
      return {
        srtContent: transcript.srtContent,
        vttContent: transcript.vttContent,
        segments: transcript.segments,
        style: subtitleConfig,
        processed: true,
      };
    } catch (error) {
      throw new VideoComposerError(
        `Failed to process subtitles: ${error.message}`,
        "SUBTITLE_PROCESSING_FAILED",
        { error: error.message }
      );
    }
  }

  /**
   * Create visual effects
   */
  async createVisualEffects(effectsConfig, audioAnalysis, jobId) {
    try {
      console.log("   ✨ Creating visual effects...");

      const job = this.activeJobs.get(jobId);

      // For now, return basic effects configuration
      return {
        type: "basic",
        effects: [],
        transitions: [],
        animations: [],
      };
    } catch (error) {
      throw new VideoComposerError(
        `Failed to create visual effects: ${error.message}`,
        "EFFECTS_CREATION_FAILED",
        { error: error.message }
      );
    }
  }

  /**
   * Compose main video
   */
  async composeMainVideo(components, jobId) {
    try {
      console.log("   🎬 Composing main video...");

      const job = this.activeJobs.get(jobId);
      const audioFile = components.audioData.mainFile;

      // Generate output filename
      const timestamp = Date.now();
      const filename = `video_${timestamp}.mp4`;
      const tempOutputPath = path.join(this.config.outputDir, "temp", filename);
      const finalOutputPath = path.join(this.config.outputDir, filename);

      // Ensure temp directory exists
      await fs.mkdir(path.join(this.config.outputDir, "temp"), {
        recursive: true,
      });

      // Get audio duration to match video length
      const audioInfo = await this.getAudioInfo(audioFile);

      // Create a simple video with audio and basic background
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(
            `color=c=0f0f0f:size=1080x1920:duration=${audioInfo.duration}:rate=30`
          )
          .inputFormat("lavfi")
          .input(audioFile)
          .outputOptions([
            "-c:v",
            "libx264",
            "-c:a",
            "aac",
            "-preset",
            "fast",
            "-crf",
            "23",
            "-pix_fmt",
            "yuv420p",
            "-shortest",
          ])
          .output(tempOutputPath)
          .on("end", () => {
            resolve();
          })
          .on("error", (error) => {
            reject(new Error(`Video composition failed: ${error.message}`));
          })
          .run();
      });

      // Copy temp file to final location
      await fs.copyFile(tempOutputPath, finalOutputPath);
      console.log(`   ✅ Video composition completed: ${filename}`);

      // Get video info from final file
      const videoInfo = await this.getVideoInfo(finalOutputPath);

      // Add temp file to cleanup list (not the final file)
      job.tempFiles.push(tempOutputPath);

      return {
        file: finalOutputPath,
        filename,
        duration: videoInfo.duration,
        fileSize: videoInfo.fileSize,
        resolution: components.videoConfig.resolution,
        format: components.videoConfig.format,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new VideoComposerError(
        `Failed to compose main video: ${error.message}`,
        "VIDEO_COMPOSITION_FAILED",
        { error: error.message }
      );
    }
  }

  /**
   * Generate platform variants
   */
  async generatePlatformVariants(mainVideo, variantConfigs, jobId) {
    try {
      console.log("   📱 Generating platform variants...");

      // For now, return empty variants array
      // This can be expanded later to create platform-specific versions
      return [];
    } catch (error) {
      throw new VideoComposerError(
        `Failed to generate platform variants: ${error.message}`,
        "VARIANT_GENERATION_FAILED",
        { error: error.message }
      );
    }
  }

  /**
   * Get video information using FFprobe
   */
  async getVideoInfo(videoPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(new Error(`FFprobe failed: ${err.message}`));
          return;
        }

        const videoStream = metadata.streams.find(
          (stream) => stream.codec_type === "video"
        );

        if (!videoStream) {
          reject(new Error("No video stream found"));
          return;
        }

        const stats = require("fs").statSync(videoPath);

        resolve({
          duration: parseFloat(metadata.format.duration),
          bitrate: parseInt(metadata.format.bit_rate) || 0,
          fileSize: stats.size,
          width: videoStream.width,
          height: videoStream.height,
          frameRate: eval(videoStream.r_frame_rate) || 30,
          codec: videoStream.codec_name,
        });
      });
    });
  }
}

// Export the classes
module.exports = VideoComposer;
module.exports.VideoComposerError = VideoComposerError;

// Also export as named exports for flexibility
module.exports.VideoComposer = VideoComposer;

// Export the execute function for workflow compatibility
module.exports.execute = async function (input) {
  const composer = new VideoComposer();
  return await composer.compose(input);
};
