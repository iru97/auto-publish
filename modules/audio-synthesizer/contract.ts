/**
 * Audio Synthesizer Module Contract
 * Converts podcast scripts into high-quality audio using AI voice synthesis
 * Version: 1.0.0
 */

export interface AudioSynthesizerInput {
  // Required: Script data from content-generator
  script: {
    title: string;
    hook: string;
    introduction: string;
    mainContent: Array<{
      section: string;
      content: string;
      speaker?: "primary" | "secondary";
      timestamp?: number;
      notes?: string;
    }>;
    conclusion: string;
    callToAction?: string;

    // Voice assignments
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

    estimatedDuration: number;
    wordCount: number;
    tone: string;
    contentType: string;
  };

  // Voice configuration
  voiceConfig: {
    primary: {
      provider: "openai" | "elevenlabs" | "azure" | "google" | "aws";
      voiceId: string;
      name: string;
      gender: "male" | "female" | "neutral";
      age: "young" | "adult" | "mature";
      accent: string;
      style:
        | "conversational"
        | "professional"
        | "energetic"
        | "calm"
        | "authoritative";
      speed: number; // 0.5-2.0
      pitch: number; // 0.5-2.0
      stability?: number; // ElevenLabs specific
      clarity?: number; // ElevenLabs specific
    };
    secondary?: {
      provider: "openai" | "elevenlabs" | "azure" | "google" | "aws";
      voiceId: string;
      name: string;
      gender: "male" | "female" | "neutral";
      age: "young" | "adult" | "mature";
      accent: string;
      style:
        | "conversational"
        | "professional"
        | "energetic"
        | "calm"
        | "authoritative";
      speed: number;
      pitch: number;
      stability?: number;
      clarity?: number;
    };
  };

  // Audio settings
  audioSettings: {
    format: "mp3" | "wav" | "m4a" | "ogg";
    quality: "low" | "medium" | "high" | "ultra";
    sampleRate: 16000 | 22050 | 44100 | 48000;
    bitrate?: number; // For MP3
    channels: 1 | 2; // Mono or Stereo
    normalize: boolean; // Audio normalization
    removeNoise: boolean; // Noise reduction
  };

  // Optional: Advanced audio processing
  audioProcessing?: {
    // Background music
    backgroundMusic?: {
      enabled: boolean;
      track?: string; // Path to music file
      volume: number; // 0.0-1.0
      fadeIn: number; // seconds
      fadeOut: number; // seconds
      loopDuration?: number; // seconds
    };

    // Sound effects
    soundEffects?: Array<{
      effect: string; // Path to effect file or effect name
      timestamp: number; // When to play (seconds)
      volume: number; // 0.0-1.0
      duration?: number; // Effect duration
    }>;

    // Audio transitions
    transitions?: {
      betweenSections: boolean;
      type: "fade" | "crossfade" | "silence" | "effect";
      duration: number; // seconds
    };

    // Voice effects
    voiceEffects?: {
      reverb?: number; // 0.0-1.0
      echo?: number; // 0.0-1.0
      compression?: boolean;
      equalization?: {
        bass: number; // -10 to +10
        mid: number; // -10 to +10
        treble: number; // -10 to +10
      };
    };
  };

  // Output preferences
  outputSettings?: {
    filename?: string;
    outputPath?: string;
    generateWaveform?: boolean;
    generateTranscript?: boolean;
    generateChapters?: boolean;
    generateMetadata?: boolean;
  };

  // Quality control
  qualityControl?: {
    maxRetries: number; // Retry failed synthesis
    validateAudio: boolean; // Check audio quality
    minDuration: number; // Minimum expected duration
    maxDuration: number; // Maximum expected duration
    silenceThreshold: number; // Detect excessive silence
  };
}

export interface AudioSynthesizerOutput {
  // Generated audio files
  audio: {
    // Main audio file
    mainFile: {
      path: string;
      filename: string;
      format: string;
      size: number; // bytes
      duration: number; // seconds
      sampleRate: number;
      bitrate?: number;
      channels: number;
    };

    // Individual voice segments (if requested)
    segments?: Array<{
      segmentId: string;
      speaker: "primary" | "secondary";
      startTime: number;
      endTime: number;
      duration: number;
      path: string;
      text: string;
    }>;

    // Waveform data (if requested)
    waveform?: {
      path: string;
      format: "png" | "svg" | "json";
      width: number;
      height: number;
      peaks: number[];
    };
  };

  // Transcript with timestamps
  transcript: {
    // Full transcript
    fullText: string;

    // Timestamped segments
    segments: Array<{
      id: string;
      speaker: "primary" | "secondary";
      startTime: number;
      endTime: number;
      text: string;
      confidence: number;
      words?: Array<{
        word: string;
        startTime: number;
        endTime: number;
        confidence: number;
      }>;
    }>;

    // SRT format
    srtContent: string;

    // VTT format
    vttContent: string;

    // JSON format
    jsonContent: string;
  };

  // Audio analysis
  analysis: {
    // Quality metrics
    audioQuality: {
      overallScore: number; // 1-10
      clarity: number; // 1-10
      naturalness: number; // 1-10
      consistency: number; // 1-10
      backgroundNoise: number; // 1-10 (lower is better)
    };

    // Technical metrics
    technicalMetrics: {
      peakAmplitude: number;
      rmsLevel: number;
      dynamicRange: number;
      frequencyResponse: {
        bass: number;
        mid: number;
        treble: number;
      };
      silencePercentage: number;
    };

    // Speech analysis
    speechAnalysis: {
      averageSpeed: number; // words per minute
      pauseAnalysis: {
        totalPauses: number;
        averagePauseLength: number;
        longestPause: number;
      };
      emotionalTone: {
        energy: number; // 1-10
        positivity: number; // 1-10
        confidence: number; // 1-10
        engagement: number; // 1-10
      };
    };

    // Compliance checks
    compliance: {
      durationMatch: boolean; // Matches expected duration
      contentComplete: boolean; // All content synthesized
      qualityThreshold: boolean; // Meets quality standards
      formatCompliance: boolean; // Correct format
    };
  };

  // Chapter markers (if requested)
  chapters?: Array<{
    id: string;
    title: string;
    startTime: number;
    endTime: number;
    description?: string;
  }>;

  // Metadata
  metadata: {
    // Generation info
    generatedAt: string;
    processingTime: number; // milliseconds
    totalCost: number; // USD

    // Voice synthesis details
    synthesisDetails: {
      primaryVoice: {
        provider: string;
        voiceId: string;
        charactersProcessed: number;
        cost: number;
        processingTime: number;
      };
      secondaryVoice?: {
        provider: string;
        voiceId: string;
        charactersProcessed: number;
        cost: number;
        processingTime: number;
      };
    };

    // Audio processing details
    processingSteps: Array<{
      step: string;
      duration: number;
      success: boolean;
      details?: string;
    }>;

    // Quality scores
    qualityMetrics: {
      overallScore: number; // 0-100
      audioQuality: number; // 0-100
      speechQuality: number; // 0-100
      technicalQuality: number; // 0-100
    };

    // File information
    fileInfo: {
      originalScript: {
        wordCount: number;
        estimatedDuration: number;
      };
      generatedAudio: {
        actualDuration: number;
        fileSize: number;
        compressionRatio?: number;
      };
    };
  };

  // Recommendations for improvement
  recommendations?: Array<{
    category: "voice" | "audio" | "processing" | "quality";
    suggestion: string;
    impact: "low" | "medium" | "high";
    implementation: string;
  }>;
}

export interface AudioSynthesizerContract {
  name: "audio-synthesizer";
  version: "1.0.0";
  description: "Advanced audio synthesis module that converts podcast scripts into high-quality audio using multiple AI voice providers with comprehensive audio processing";

  input: AudioSynthesizerInput;
  output: AudioSynthesizerOutput;

  // Supported voice providers
  supportedProviders: {
    openai: {
      voices: string[];
      maxCharacters: number;
      costPerCharacter: number;
      supportedFormats: string[];
      features: string[];
    };
    elevenlabs: {
      voices: string[];
      maxCharacters: number;
      costPerCharacter: number;
      supportedFormats: string[];
      features: string[];
    };
    azure: {
      voices: string[];
      maxCharacters: number;
      costPerCharacter: number;
      supportedFormats: string[];
      features: string[];
    };
    google: {
      voices: string[];
      maxCharacters: number;
      costPerCharacter: number;
      supportedFormats: string[];
      features: string[];
    };
    aws: {
      voices: string[];
      maxCharacters: number;
      costPerCharacter: number;
      supportedFormats: string[];
      features: string[];
    };
  };

  // Module dependencies
  dependencies: {
    required: string[];
    optional: string[];
  };

  // Performance characteristics
  performance: {
    estimatedDuration: number; // seconds per minute of audio
    estimatedCost: number; // USD per minute of audio
    reliability: number; // 0-100
    scalability: "low" | "medium" | "high";
    concurrency: number; // Max parallel synthesis jobs
  };

  // Compatibility
  compatibility: {
    nodeVersion: string;
    platforms: string[];
    memoryRequirement: string;
    diskSpaceRequirement: string;
  };
}

// Export the contract instance
export const audioSynthesizerContract: AudioSynthesizerContract = {
  name: "audio-synthesizer",
  version: "1.0.0",
  description:
    "Advanced audio synthesis module that converts podcast scripts into high-quality audio using multiple AI voice providers with comprehensive audio processing",

  input: {} as AudioSynthesizerInput,
  output: {} as AudioSynthesizerOutput,

  supportedProviders: {
    openai: {
      voices: ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
      maxCharacters: 4096,
      costPerCharacter: 0.000015,
      supportedFormats: ["mp3", "opus", "aac", "flac"],
      features: ["high-quality", "fast-processing", "multiple-voices"],
    },
    elevenlabs: {
      voices: [
        "rachel",
        "domi",
        "bella",
        "antoni",
        "elli",
        "josh",
        "arnold",
        "adam",
        "sam",
      ],
      maxCharacters: 5000,
      costPerCharacter: 0.00003,
      supportedFormats: ["mp3", "wav"],
      features: [
        "ultra-realistic",
        "voice-cloning",
        "emotion-control",
        "stability-control",
      ],
    },
    azure: {
      voices: [
        "en-US-JennyNeural",
        "en-US-GuyNeural",
        "en-US-AriaNeural",
        "en-US-DavisNeural",
      ],
      maxCharacters: 10000,
      costPerCharacter: 0.000016,
      supportedFormats: ["mp3", "wav", "ogg"],
      features: ["neural-voices", "ssml-support", "custom-lexicon"],
    },
    google: {
      voices: [
        "en-US-Wavenet-D",
        "en-US-Wavenet-F",
        "en-US-Neural2-C",
        "en-US-Neural2-D",
      ],
      maxCharacters: 5000,
      costPerCharacter: 0.000016,
      supportedFormats: ["mp3", "wav", "ogg"],
      features: ["wavenet-quality", "neural-voices", "ssml-support"],
    },
    aws: {
      voices: ["Joanna", "Matthew", "Amy", "Brian", "Emma", "Justin"],
      maxCharacters: 6000,
      costPerCharacter: 0.000004,
      supportedFormats: ["mp3", "ogg", "pcm"],
      features: ["neural-voices", "newscaster-style", "conversational-style"],
    },
  },

  dependencies: {
    required: [
      "openai",
      "@aws-sdk/client-polly",
      "@azure/cognitiveservices-speech-sdk",
      "@google-cloud/text-to-speech",
      "axios",
      "ffmpeg-static",
      "fluent-ffmpeg",
      "node-wav",
      "lamejs",
    ],
    optional: [
      "elevenlabs-node",
      "audiowaveform",
      "sox-audio",
      "noise-reduction",
      "audio-normalize",
      "peak-meter",
    ],
  },

  performance: {
    estimatedDuration: 45, // 45 seconds per minute of audio
    estimatedCost: 0.25, // $0.25 per minute of audio
    reliability: 94, // 94% success rate
    scalability: "high",
    concurrency: 5, // Max 5 parallel synthesis jobs
  },

  compatibility: {
    nodeVersion: ">=16.0.0",
    platforms: ["win32", "darwin", "linux"],
    memoryRequirement: "1GB",
    diskSpaceRequirement: "500MB",
  },
};

export default audioSynthesizerContract;
