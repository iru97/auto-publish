/**
 * Video Composer Module Contract
 * Advanced video composition with AI-powered visual generation
 * Version: 1.0.0
 */

export interface VideoComposerContract {
  name: "video-composer";
  version: "1.0.0";
  description: "Advanced video composition engine that combines audio with AI-generated visuals, animations, and effects to create professional podcast videos";

  input: {
    required: {
      // Audio input from audio-synthesizer
      audioData: {
        mainFile: string; // Path to main audio file
        segments: Array<{
          id: string;
          file: string;
          startTime: number;
          endTime: number;
          duration: number;
          speaker?: string;
          text: string;
        }>;
        transcript: {
          fullText: string;
          segments: Array<{
            start: number;
            end: number;
            text: string;
            speaker?: string;
          }>;
          srtContent: string;
          vttContent: string;
        };
        metadata: {
          duration: number;
          sampleRate: number;
          channels: number;
          format: string;
        };
      };

      // Video configuration
      videoConfig: {
        format: "mp4" | "mov" | "webm" | "avi";
        resolution: {
          width: number;
          height: number;
          aspectRatio: "16:9" | "9:16" | "1:1" | "4:3";
        };
        frameRate: 24 | 30 | 60;
        quality: "low" | "medium" | "high" | "ultra";
        codec: "h264" | "h265" | "vp9" | "av1";
        bitrate?: string; // e.g., "2M", "5M", "10M"
      };

      // Visual style configuration
      visualStyle: {
        template:
          | "podcast"
          | "educational"
          | "corporate"
          | "creative"
          | "minimal"
          | "dynamic";
        theme: {
          primaryColor: string;
          secondaryColor: string;
          accentColor: string;
          backgroundColor: string;
          textColor: string;
        };
        typography: {
          primaryFont: string;
          secondaryFont: string;
          titleSize: number;
          subtitleSize: number;
          bodySize: number;
        };
        layout: "centered" | "split" | "overlay" | "sidebar" | "fullscreen";
      };
    };

    optional: {
      // AI-powered visual generation
      aiVisuals?: {
        enabled: boolean;
        provider:
          | "runway"
          | "pika"
          | "stable-video"
          | "luma"
          | "kling"
          | "local";
        style:
          | "realistic"
          | "animated"
          | "abstract"
          | "minimalist"
          | "cinematic";
        scenes: Array<{
          timestamp: number;
          duration: number;
          prompt: string;
          style?: string;
          motion?: "static" | "slow" | "medium" | "fast";
        }>;
        transitions: {
          type: "fade" | "slide" | "zoom" | "dissolve" | "wipe";
          duration: number;
        };
      };

      // Background and overlays
      background?: {
        type: "solid" | "gradient" | "image" | "video" | "ai-generated";
        content?: string; // Color, image path, or AI prompt
        opacity?: number;
        blur?: number;
        animation?: {
          type: "none" | "parallax" | "zoom" | "rotate" | "float";
          speed: number;
          direction?: "horizontal" | "vertical" | "circular";
        };
      };

      // Subtitle styling and animation
      subtitles?: {
        enabled: boolean;
        style: "basic" | "modern" | "cinematic" | "podcast" | "animated";
        position: "bottom" | "top" | "center" | "custom";
        animation: {
          type: "none" | "typewriter" | "fade" | "slide" | "bounce";
          timing: "word" | "sentence" | "segment";
          speed: number;
        };
        highlighting: {
          enabled: boolean;
          color: string;
          style: "underline" | "background" | "glow" | "outline";
        };
        customPosition?: {
          x: number;
          y: number;
          width: number;
          height: number;
        };
      };

      // Visual effects and animations
      effects?: {
        visualizer: {
          enabled: boolean;
          type: "waveform" | "spectrum" | "bars" | "circular" | "particles";
          style: "minimal" | "modern" | "retro" | "neon" | "organic";
          position: "bottom" | "top" | "center" | "corner";
          color: string;
          intensity: number;
        };
        particles: {
          enabled: boolean;
          type: "floating" | "falling" | "orbiting" | "pulsing";
          count: number;
          color: string;
          size: number;
          speed: number;
        };
        lighting: {
          enabled: boolean;
          type: "ambient" | "directional" | "spotlight" | "rim";
          color: string;
          intensity: number;
          animation?: boolean;
        };
      };

      // Branding and overlays
      branding?: {
        logo?: {
          file: string;
          position:
            | "top-left"
            | "top-right"
            | "bottom-left"
            | "bottom-right"
            | "center";
          size: number;
          opacity: number;
        };
        watermark?: {
          text: string;
          position: "corner" | "bottom" | "overlay";
          opacity: number;
          font: string;
          size: number;
        };
        intro?: {
          enabled: boolean;
          duration: number;
          template: string;
          customText?: string;
        };
        outro?: {
          enabled: boolean;
          duration: number;
          template: string;
          customText?: string;
          callToAction?: string;
        };
      };

      // Advanced processing options
      processing?: {
        multipass: boolean;
        optimization: "speed" | "quality" | "balanced";
        denoising: boolean;
        stabilization: boolean;
        colorGrading: {
          enabled: boolean;
          preset: "natural" | "cinematic" | "vibrant" | "vintage" | "custom";
          customLUT?: string;
        };
        motionBlur: boolean;
        antiAliasing: boolean;
      };

      // Output variants
      outputVariants?: Array<{
        name: string;
        platform:
          | "youtube"
          | "tiktok"
          | "instagram"
          | "twitter"
          | "linkedin"
          | "custom";
        resolution: { width: number; height: number };
        duration?: number; // For clips
        startTime?: number;
        endTime?: number;
        customSettings?: Record<string, any>;
      }>;
    };
  };

  output: {
    // Main video output
    video: {
      mainFile: string;
      format: string;
      resolution: { width: number; height: number };
      duration: number;
      frameRate: number;
      fileSize: number;
      codec: string;
      bitrate: string;
    };

    // Platform-specific variants
    variants: Array<{
      name: string;
      platform: string;
      file: string;
      resolution: { width: number; height: number };
      duration: number;
      fileSize: number;
      optimizedFor: string[];
    }>;

    // Generated assets
    assets: {
      thumbnails: Array<{
        timestamp: number;
        file: string;
        resolution: { width: number; height: number };
      }>;
      preview: {
        gif: string;
        mp4: string;
        duration: number;
      };
      frames: Array<{
        timestamp: number;
        file: string;
        description: string;
      }>;
      aiGeneratedScenes?: Array<{
        id: string;
        file: string;
        prompt: string;
        timestamp: number;
        duration: number;
        provider: string;
        cost: number;
      }>;
    };

    // Technical analysis
    analysis: {
      videoQuality: {
        overall: number; // 1-10
        visual: number;
        audio: number;
        synchronization: number;
        compression: number;
      };
      technicalMetrics: {
        averageBitrate: string;
        peakBitrate: string;
        compressionRatio: number;
        colorSpace: string;
        dynamicRange: string;
        motionVectors: number;
        sceneChanges: number;
      };
      contentAnalysis: {
        visualComplexity: number;
        motionIntensity: number;
        colorVariance: number;
        textReadability: number;
        audioVideoSync: number;
      };
      platformCompliance: Array<{
        platform: string;
        compliant: boolean;
        issues: string[];
        recommendations: string[];
      }>;
    };

    // Processing metadata
    metadata: {
      generatedAt: string;
      processingTime: number;
      totalCost: number;
      compositionDetails: {
        audioSource: string;
        visualElements: number;
        effectsApplied: string[];
        aiScenesGenerated: number;
        transitionsUsed: string[];
      };
      processingSteps: Array<{
        step: string;
        duration: number;
        status: "success" | "warning" | "error";
        details: string;
      }>;
      qualityMetrics: {
        renderTime: number;
        memoryUsage: string;
        cpuUsage: number;
        gpuUsage?: number;
        diskSpace: string;
      };
      fileInfo: {
        inputFiles: string[];
        outputFiles: string[];
        temporaryFiles: string[];
        totalSize: string;
      };
    };

    // Recommendations and insights
    recommendations: {
      qualityImprovements: string[];
      performanceOptimizations: string[];
      platformOptimizations: Record<string, string[]>;
      costOptimizations: string[];
      nextSteps: string[];
    };
  };

  // Module configuration
  config: {
    dependencies: {
      required: [
        "ffmpeg-static",
        "fluent-ffmpeg",
        "canvas",
        "fabric",
        "sharp",
        "jimp",
        "node-ffmpeg",
        "video-lib",
        "remotion",
      ];
      optional: [
        "@runwayml/sdk",
        "pika-labs-api",
        "stable-video-diffusion",
        "luma-ai-sdk",
        "kling-ai-api",
        "opencv4nodejs",
        "tensorflow",
        "@mediapipe/tasks-vision",
      ];
      system: ["ffmpeg", "imagemagick", "python3"];
    };

    providers: {
      aiVideo: {
        runway: {
          apiKey: "RUNWAY_API_KEY";
          baseUrl: "https://api.runwayml.com";
          models: ["gen2", "gen3"];
          costPerSecond: 0.05;
          maxDuration: 30;
          features: ["text-to-video", "image-to-video", "video-to-video"];
        };
        pika: {
          apiKey: "PIKA_API_KEY";
          baseUrl: "https://api.pika.art";
          models: ["pika-1.0", "pika-1.5"];
          costPerSecond: 0.03;
          maxDuration: 10;
          features: ["text-to-video", "image-to-video"];
        };
        kling: {
          apiKey: "KLING_API_KEY";
          baseUrl: "https://api.kling.ai";
          models: ["kling-v1", "kling-v1.5"];
          costPerSecond: 0.02;
          maxDuration: 60;
          features: ["text-to-video", "image-to-video", "motion-control"];
        };
        luma: {
          apiKey: "LUMA_API_KEY";
          baseUrl: "https://api.lumalabs.ai";
          models: ["dream-machine"];
          costPerSecond: 0.04;
          maxDuration: 20;
          features: ["text-to-video", "image-to-video"];
        };
      };

      rendering: {
        local: {
          ffmpeg: true;
          gpu: "auto-detect";
          threads: "auto";
          memory: "4GB";
        };
        cloud: {
          aws: "optional";
          gcp: "optional";
          azure: "optional";
        };
      };
    };

    performance: {
      estimatedDuration: "2-10 minutes per minute of video";
      memoryUsage: "2-8GB depending on resolution and effects";
      diskSpace: "1-5GB temporary space required";
      cpuIntensive: true;
      gpuAccelerated: true;
      parallelProcessing: true;
    };

    compatibility: {
      platforms: ["youtube", "tiktok", "instagram", "twitter", "linkedin"];
      formats: ["mp4", "mov", "webm", "avi"];
      codecs: ["h264", "h265", "vp9", "av1"];
      resolutions: ["720p", "1080p", "1440p", "4K"];
      aspectRatios: ["16:9", "9:16", "1:1", "4:3"];
    };
  };

  // Error handling
  errors: {
    VIDEO_GENERATION_FAILED: "Failed to generate video content";
    AI_PROVIDER_ERROR: "AI video provider returned an error";
    AUDIO_SYNC_ERROR: "Failed to synchronize audio with video";
    RENDERING_ERROR: "Video rendering process failed";
    QUALITY_CHECK_FAILED: "Generated video failed quality validation";
    INSUFFICIENT_RESOURCES: "Insufficient system resources for processing";
    INVALID_CONFIGURATION: "Invalid video configuration provided";
    FILE_ACCESS_ERROR: "Cannot access required input files";
    CODEC_NOT_SUPPORTED: "Requested codec not supported";
    RESOLUTION_NOT_SUPPORTED: "Requested resolution not supported";
  };

  // Metadata
  metadata: {
    estimatedDuration: "2-10 minutes per minute of video";
    estimatedCost: "$0.10-$5.00 per minute depending on AI usage";
    reliability: "91%";
    lastUpdated: "2024-12-07";
    maintainer: "auto-publish-system";
    tags: ["video", "composition", "ai", "ffmpeg", "podcast", "automation"];
  };
}
