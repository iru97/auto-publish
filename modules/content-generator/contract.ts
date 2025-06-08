/**
 * Content Generator Module Contract
 * Generates advanced podcast scripts based on topic research
 * Version: 1.0.0
 */

export interface ContentGeneratorInput {
  // Required: Research data from topic-researcher
  research: {
    niche: {
      name: string;
      description: string;
      category: string;
      keywords: string[];
      metrics: {
        searchVolume: number;
        competition: number;
        trend: number;
        engagement: number;
      };
    };
    keyInsights: Array<{
      insight: string;
      source: string;
      confidence: number;
      impact: "high" | "medium" | "low";
    }>;
    contentAngles: Array<{
      angle: string;
      description: string;
      viralPotential: number;
      difficulty: "easy" | "medium" | "hard";
      targetAudience: string;
    }>;
    audienceAnalysis: {
      demographics: {
        ageRange: string;
        gender: string;
        interests: string[];
        painPoints: string[];
        motivations: string[];
      };
      behavior: {
        contentPreferences: string[];
        engagementPatterns: string[];
        platforms: string[];
      };
    };
    competitorAnalysis: Array<{
      name: string;
      type: "channel" | "creator" | "brand";
      strengths: string[];
      weaknesses: string[];
      contentGaps: string[];
    }>;
    contentGaps: Array<{
      gap: string;
      opportunity: string;
      difficulty: number;
      potential: number;
    }>;
  };

  // Optional: Content generation preferences
  contentType?:
    | "monologue"
    | "dialogue"
    | "interview"
    | "storytelling"
    | "educational"
    | "debate";
  tone?:
    | "casual"
    | "professional"
    | "humorous"
    | "inspirational"
    | "controversial"
    | "educational";
  duration?: number; // Target duration in seconds (default: 90)
  language?: "en" | "es" | "fr" | "de" | "pt";
  targetPlatform?: "youtube" | "tiktok" | "instagram" | "spotify" | "generic";

  // Advanced options
  includeHooks?: boolean; // Include attention-grabbing hooks
  includeCallToAction?: boolean; // Include CTA at the end
  includeStatistics?: boolean; // Include relevant statistics
  includePersonalStories?: boolean; // Include personal anecdotes
  includeControversy?: boolean; // Include controversial elements

  // Voice configuration for dialogue
  voices?: {
    primary: {
      name: string;
      personality: string;
      role: "host" | "expert" | "interviewer" | "narrator";
    };
    secondary?: {
      name: string;
      personality: string;
      role: "guest" | "co-host" | "expert" | "interviewer";
    };
  };

  // Content constraints
  maxWords?: number;
  minWords?: number;
  keywordsToInclude?: string[];
  topicsToAvoid?: string[];

  // Quality settings
  creativityLevel?: number; // 1-10, higher = more creative/risky
  factualAccuracy?: number; // 1-10, higher = more fact-checking
  engagementFocus?: number; // 1-10, higher = more engagement-focused
}

export interface ContentGeneratorOutput {
  script: {
    // Main script content
    title: string;
    subtitle?: string;
    hook: string; // Opening hook (first 5-10 seconds)
    introduction: string;
    mainContent: Array<{
      section: string;
      content: string;
      speaker?: "primary" | "secondary"; // For dialogue
      timestamp?: number; // Estimated timestamp
      notes?: string; // Director notes
    }>;
    conclusion: string;
    callToAction?: string;

    // Script metadata
    estimatedDuration: number; // In seconds
    wordCount: number;
    readingLevel: string; // e.g., "8th grade", "college"
    tone: string;
    contentType: string;

    // Voice assignments (for TTS)
    voiceAssignments: {
      primary: {
        sections: number[];
        totalWords: number;
        estimatedDuration: number;
      };
      secondary?: {
        sections: number[];
        totalWords: number;
        estimatedDuration: number;
      };
    };
  };

  // Content analysis
  analysis: {
    // Engagement metrics
    hookStrength: number; // 1-10
    retentionPotential: number; // 1-10
    viralPotential: number; // 1-10
    emotionalImpact: number; // 1-10

    // Content quality
    factualAccuracy: number; // 1-10
    originalityScore: number; // 1-10
    relevanceScore: number; // 1-10
    clarityScore: number; // 1-10

    // SEO and discoverability
    keywordDensity: { [keyword: string]: number };
    seoScore: number; // 1-10
    trendAlignment: number; // 1-10

    // Audience fit
    audienceAlignment: number; // 1-10
    demographicFit: number; // 1-10
    platformOptimization: number; // 1-10
  };

  // Content variations
  variations: Array<{
    type: "shorter" | "longer" | "different_tone" | "different_angle";
    title: string;
    hook: string;
    keyChanges: string[];
    estimatedDuration: number;
  }>;

  // Production notes
  productionNotes: {
    // Audio production
    musicSuggestions: Array<{
      type: "intro" | "background" | "transition" | "outro";
      mood: string;
      timing: string;
    }>;

    // Sound effects
    soundEffects: Array<{
      effect: string;
      timing: string;
      purpose: string;
    }>;

    // Pacing notes
    pacingNotes: Array<{
      section: number;
      note: string;
      emphasis: "slow" | "normal" | "fast";
    }>;

    // Visual suggestions (for video)
    visualSuggestions: Array<{
      timing: string;
      visual: string;
      type: "text" | "image" | "animation" | "transition";
    }>;
  };

  // Performance predictions
  predictions: {
    expectedViews: {
      platform: string;
      range: { min: number; max: number };
      confidence: number;
    }[];
    expectedEngagement: {
      likes: number;
      comments: number;
      shares: number;
      confidence: number;
    };
    monetizationPotential: {
      cpm: number;
      sponsorshipValue: number;
      affiliateOpportunities: string[];
    };
  };

  // Metadata
  metadata: {
    generatedAt: string;
    processingTime: number;
    aiModelsUsed: string[];
    confidenceScore: number; // Overall confidence 0-100
    qualityScore: number; // Overall quality 0-100
    sources: Array<{
      type: string;
      reference: string;
      reliability: number;
    }>;
  };
}

export interface ContentGeneratorContract {
  name: "content-generator";
  version: "1.0.0";
  description: "Advanced podcast script generation with AI-powered content creation, multi-voice support, and comprehensive analysis";

  input: ContentGeneratorInput;
  output: ContentGeneratorOutput;

  // Module dependencies
  dependencies: {
    required: string[];
    optional: string[];
  };

  // Performance characteristics
  performance: {
    estimatedDuration: number; // seconds
    estimatedCost: number; // USD
    reliability: number; // 0-100
    scalability: "low" | "medium" | "high";
  };

  // Compatibility
  compatibility: {
    nodeVersion: string;
    platforms: string[];
    memoryRequirement: string;
  };
}

// Export the contract instance
export const contentGeneratorContract: ContentGeneratorContract = {
  name: "content-generator",
  version: "1.0.0",
  description:
    "Advanced podcast script generation with AI-powered content creation, multi-voice support, and comprehensive analysis",

  input: {} as ContentGeneratorInput,
  output: {} as ContentGeneratorOutput,

  dependencies: {
    required: [
      "openai",
      "natural",
      "sentiment",
      "compromise",
      "keyword-extractor",
      "readability-scores",
      "text-statistics",
      "language-detect",
    ],
    optional: ["google-translate", "textstat", "syllable", "flesch-kincaid"],
  },

  performance: {
    estimatedDuration: 120, // 2 minutes for comprehensive generation
    estimatedCost: 1.25, // USD for AI processing
    reliability: 92, // 92% success rate
    scalability: "high",
  },

  compatibility: {
    nodeVersion: ">=16.0.0",
    platforms: ["win32", "darwin", "linux"],
    memoryRequirement: "512MB",
  },
};

export default contentGeneratorContract;
