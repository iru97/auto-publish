// Complete Auto-Publish Workflow Definition
// Orchestrates all modules: trend-detector → content-generator → audio-synthesizer → video-composer → delivery-system

const completeAutoPublishWorkflow = {
  id: "complete-autopublish",
  name: "Complete Auto-Publish Workflow",
  description:
    "End-to-end automated content creation from trending topics to published video with enhanced visuals",
  version: "2.0.0", // Updated version for enhanced features

  // Workflow metadata
  metadata: {
    estimatedDuration: "5-8 minutes",
    estimatedCost: "$2-5 per execution",
    outputFormats: ["mp4", "mp3", "srt", "json"],
    platforms: ["local", "youtube", "tiktok", "instagram"],
    author: "Auto-Publish System",
    tags: ["automation", "content-creation", "ai", "podcast", "video"],
  },

  // Input configuration
  input: {
    // Trend detection inputs with 90-day analysis
    trends: {
      timeframe: "90d", // Changed from 30d to 90d for better trend analysis
      sources: ["google-trends", "reddit", "twitter"],
      region: "global",
      minEngagement: 60, // Increased from 50 for higher quality trends
      maxSaturation: 65, // Decreased from 70 for less saturated markets
    },

    // Enhanced content generation for longer videos
    content: {
      contentType: "monologue",
      tone: "engaging", // Changed from casual to more engaging
      duration: 150, // Increased from 90 to 150 seconds (2.5 minutes)
      language: "en",
      targetPlatform: "youtube", // Optimized for longer content
      includeHooks: true,
      includeCallToAction: true,
      includeStatistics: true,
      includePersonalStories: true, // Enable for more engaging content
      creativityLevel: 8, // Increased from 7
      engagementFocus: 9, // Increased from 8
    },

    // Enhanced audio synthesis
    audio: {
      voice: "nova", // High-quality OpenAI voice
      speed: 0.95, // Slightly slower for better comprehension
      quality: "hd",
      format: "mp3",
    },

    // Enhanced video composition with DALL-E 3
    video: {
      resolution: { width: 1080, height: 1920 }, // Vertical format for social media
      frameRate: 30,
      quality: "high",
      codec: "h264",

      // Visual enhancements with AI
      visualStyle: {
        template: "dynamic", // Changed from podcast to dynamic
        backgroundColor: "#0f0f0f",
        primaryColor: "#ffffff",
        accentColor: "#00ff88",
        layout: "fullscreen",
      },

      // AI Visual Generation Configuration
      aiVisuals: {
        enabled: true, // Enable AI visual generation
        provider: "dalle3", // Use DALL-E 3 for high-quality images
        style: "realistic", // Professional realistic style
        sceneCount: 6, // More scenes for longer video
        transitionDuration: 0.5,
      },

      // Enhanced subtitles
      subtitles: {
        enabled: true,
        style: "dynamic", // More engaging subtitle style
        fontSize: 48, // Larger for mobile viewing
        fontFamily: "Arial Black",
        color: "#ffffff",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        position: "center",
        animation: "fadeIn", // Add animation
        timing: "optimized", // Better timing for comprehension
      },

      // Audio visualizer for engagement
      visualizer: {
        enabled: true,
        type: "bars", // Visual bars that react to audio
        position: "bottom",
        color: "#00ff88",
        opacity: 0.6,
      },

      // Branding elements
      branding: {
        enabled: false, // Disable for now
        logo: null,
        watermark: null,
      },
    },

    // Delivery configuration
    delivery: {
      outputFormats: ["mp4"],
      platforms: ["youtube", "tiktok", "instagram"], // Multiple platform variants
      generateThumbnail: true,
      generatePreview: true,
      autoOptimize: true,
    },
  },

  // Sequential workflow steps
  steps: [
    {
      id: "detect-trends",
      module: "trend-detector",
      name: "Detect 90-Day Trending Topics", // Updated name
      description:
        "Analyze trending topics from the last 90 days using real data sources",
      config: {
        enableRealScraping: true, // Enable real data scraping
        analysisDepth: "deep", // Deep analysis for better insights
        competitorAnalysis: true,
      },
      inputMapping: {
        keywords: "trends.keywords",
        sources: "trends.sources",
        timeframe: "trends.timeframe",
        region: "trends.region",
        minEngagement: "trends.minEngagement",
        maxSaturation: "trends.maxSaturation",
      },
      outputMapping: {
        "research.niche": "selectedNiche",
        "research.alternatives": "alternatives",
        "research.trendMetadata": "metadata",
      },
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 2,
      },
    },

    {
      id: "generate-content",
      module: "content-generator",
      name: "Generate Enhanced Long-Form Content", // Updated name
      description:
        "Create engaging 2.5-minute script with storytelling elements",
      config: {
        useAdvancedPrompts: true, // Enable advanced AI prompts
        includeVisualCues: true, // Add visual cues for DALL-E 3
        enhanceEngagement: true,
      },
      inputMapping: {
        research: {
          niche: "research.niche",
          alternatives: "research.alternatives",
          trendMetadata: "research.trendMetadata",
        },
        contentType: "content.contentType",
        tone: "content.tone",
        duration: "content.duration",
        language: "content.language",
        targetPlatform: "content.targetPlatform",
        includeHooks: "content.includeHooks",
        includeCallToAction: "content.includeCallToAction",
        includeStatistics: "content.includeStatistics",
        includePersonalStories: "content.includePersonalStories",
        creativityLevel: "content.creativityLevel",
        engagementFocus: "content.engagementFocus",
      },
      outputMapping: {
        script: "script",
        "content.metadata": "metadata",
        "content.analysis": "analysis",
      },
      retryPolicy: {
        maxRetries: 2,
        backoffMultiplier: 1.5,
      },
    },

    {
      id: "synthesize-audio",
      module: "audio-synthesizer",
      name: "High-Quality Audio Synthesis",
      description: "Generate premium audio with OpenAI TTS",
      inputMapping: {
        script: "script",
        voiceConfig: {
          primary: {
            provider: "openai",
            voiceId: "audio.voice",
            speed: "audio.speed",
            pitch: 0,
            stability: 0.75,
            clarity: 0.85,
          },
        },
        audioSettings: {
          format: "audio.format",
          quality: "audio.quality",
          sampleRate: 44100,
          bitrate: 192,
          channels: 2,
          normalize: true,
          removeNoise: true,
          backgroundMusic: false,
          soundEffects: false,
          transitions: true,
          compression: true,
          eq: true,
          reverb: false,
        },
      },
      outputMapping: {
        audioMainFile: "audio.mainFile.path",
        audioSegments: "audio.segments",
        audioTranscript: "transcript",
        audioMetadata: "metadata",
        audioAnalysis: "analysis",
      },
      retryPolicy: {
        maxRetries: 2,
        backoffMultiplier: 1.5,
      },
    },

    {
      id: "compose-video",
      module: "video-composer",
      name: "AI-Enhanced Video Composition", // Updated name
      description:
        "Create stunning video with DALL-E 3 generated visuals and dynamic effects",
      config: {
        enableAI: true, // Enable AI features
        useAdvancedEffects: true,
        optimizeForMobile: true,
      },
      inputMapping: {
        audioData: {
          mainFile: "audioMainFile",
          segments: "audioSegments",
          transcript: "audioTranscript",
          metadata: "audioMetadata",
        },
        videoConfig: {
          resolution: "video.resolution",
          frameRate: "video.frameRate",
          quality: "video.quality",
          codec: "video.codec",
          format: "mp4",
        },
        visualStyle: "video.visualStyle",
        aiVisuals: "video.aiVisuals",
        subtitles: "video.subtitles",
        audioVisualization: "video.visualizer",
        branding: "video.branding",
      },
      outputMapping: {
        "video.mainFile": "video.mainFile",
        "video.variants": "variants",
        "video.assets": "assets",
        "video.analysis": "analysis",
        "video.metadata": "metadata",
      },
      retryPolicy: {
        maxRetries: 1, // Lower retries for video generation due to cost
        backoffMultiplier: 2,
      },
    },

    {
      id: "deliver-content",
      module: "delivery-system",
      name: "Multi-Platform Content Delivery",
      description: "Deliver optimized content for multiple platforms",
      inputMapping: {
        videoContent: {
          mainVideo: "video",
          variants: "video.variants",
          assets: "video.assets",
          metadata: "video.metadata",
        },
        deliveryConfig: {
          platforms: "delivery.platforms",
          optimization: {
            autoResize: "delivery.autoOptimize",
            autoCompress: true,
            autoThumbnail: "delivery.generateThumbnail",
            autoTags: true,
            autoDescription: true,
          },
          scheduling: {
            enabled: false,
            publishAt: null,
            timezone: "UTC",
          },
        },
      },
      outputMapping: {
        deliveredContent: "delivery.content",
        platformVariants: "delivery.variants",
        analytics: "delivery.analytics",
        metadata: "delivery.metadata",
      },
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 1.5,
      },
    },
  ],

  // Global workflow configuration
  configuration: {
    // Parallel execution where possible
    parallelExecution: false, // Sequential for now

    // Error handling
    globalErrorHandling: {
      stopOnFirstError: true,
      savePartialResults: true,
      generateErrorReport: true,
    },

    // Progress tracking
    progressTracking: {
      enabled: true,
      granularity: "step", // step, substep, or detailed
      notifications: true,
    },

    // Output management
    outputManagement: {
      saveIntermediateResults: true,
      cleanupOnSuccess: false, // Keep all files for review
      cleanupOnFailure: false, // Keep for debugging
      outputDirectory: "output/{timestamp}",
    },

    // Performance optimization
    performance: {
      cacheResults: true,
      reuseConnections: true,
      optimizeMemory: true,
    },
  },

  // Validation rules for the entire workflow
  validation: {
    // Pre-execution validation
    preExecution: {
      checkModuleAvailability: true,
      validateContracts: true,
      checkDependencies: true,
      estimateResources: true,
    },

    // Runtime validation
    runtime: {
      validateStepInputs: true,
      validateStepOutputs: true,
      checkResourceUsage: true,
      monitorPerformance: true,
    },

    // Post-execution validation
    postExecution: {
      validateFinalOutput: true,
      generateQualityReport: true,
      checkDeliveryStatus: true,
      archiveResults: true,
    },
  },

  // Expected output structure
  expectedOutput: {
    // Final deliverables
    deliverables: {
      video: {
        file: "string", // Path to final video
        format: "mp4",
        duration: "number", // seconds
        size: "number", // bytes
        quality: "string", // low, medium, high, ultra
      },
      audio: {
        file: "string", // Path to audio file
        format: "mp3",
        duration: "number",
        size: "number",
      },
      transcript: {
        srt: "string", // Path to SRT file
        vtt: "string", // Path to VTT file
        text: "string", // Plain text transcript
      },
      metadata: {
        title: "string",
        description: "string",
        tags: "array",
        niche: "string",
        topic: "string",
        generatedAt: "string", // ISO timestamp
      },
    },

    // Execution report
    execution: {
      workflowId: "string",
      status: "string", // completed, failed, partial
      duration: "number", // milliseconds
      stepsCompleted: "number",
      totalSteps: "number",
      errors: "array",
      warnings: "array",
    },

    // Analytics and metrics
    analytics: {
      performance: {
        totalTime: "number",
        stepTimes: "object",
        resourceUsage: "object",
      },
      quality: {
        audioQuality: "number", // 1-10 scale
        videoQuality: "number", // 1-10 scale
        contentQuality: "number", // 1-10 scale
        overallScore: "number", // 1-10 scale
      },
      costs: {
        totalCost: "number",
        costBreakdown: "object",
        currency: "USD",
      },
    },

    // Delivery information
    delivery: {
      platform: "string",
      status: "string", // success, failed, pending
      url: "string", // If applicable
      deliveredAt: "string", // ISO timestamp
      metrics: "object",
    },
  },

  // Enhanced error handling
  errorHandling: {
    onStepFailure: "continue-with-fallback", // Try to continue even if one step fails
    maxWorkflowRetries: 1,
    notificationOnFailure: true,
    savePartialResults: true, // Save successful step results even if workflow fails
  },

  // Performance monitoring
  monitoring: {
    trackPerformance: true,
    logDetailedMetrics: true,
    alertOnSlowExecution: true,
    maxExecutionTime: 900, // 15 minutes max (increased for AI generation)
  },

  // Cost tracking for AI services
  costTracking: {
    enabled: true,
    maxBudgetPerRun: 2.0, // $2 max per execution (increased for DALL-E 3)
    trackByModule: true,
    alertOnHighCost: true,
  },
};

module.exports = completeAutoPublishWorkflow;
