# Audio Synthesizer Module

Advanced audio synthesis module that converts podcast scripts into high-quality audio using multiple AI voice providers with comprehensive audio processing capabilities.

## Overview

The Audio Synthesizer module is a sophisticated system designed to transform text-based podcast scripts into professional-quality audio content. It supports multiple voice synthesis providers, advanced audio processing, and comprehensive quality analysis.

### Key Features

- **Multi-Provider Support**: OpenAI TTS, ElevenLabs, Azure Cognitive Services, Google Cloud TTS, AWS Polly
- **Advanced Audio Processing**: Noise reduction, compression, EQ, normalization
- **Quality Analysis**: Comprehensive audio quality metrics and recommendations
- **Transcript Generation**: SRT, VTT, and JSON format transcripts with timestamps
- **Batch Processing**: Concurrent synthesis with configurable concurrency limits
- **Error Recovery**: Robust retry mechanisms and fallback providers
- **Cost Optimization**: Intelligent provider selection and cost tracking
- **Format Support**: MP3, WAV, M4A, OGG, FLAC output formats

## Installation

```bash
# Install required dependencies
npm install

# Install optional dependencies for enhanced features
npm run install-optional

# Setup directories
npm run setup

# Install FFmpeg (required)
# Windows: Download from https://ffmpeg.org/download.html
# macOS: brew install ffmpeg
# Linux: sudo apt-get install ffmpeg
```

## Environment Configuration

Create a `.env` file with your API keys:

```env
# OpenAI (Primary provider)
OPENAI_API_KEY=your_openai_api_key

# ElevenLabs (Premium quality)
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Azure Cognitive Services
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=your_azure_region

# Google Cloud TTS
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json

# AWS Polly
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
```

## Basic Usage

```javascript
const { execute } = require("./index.js");

// Basic synthesis
const result = await execute({
  script: {
    title: "My Podcast Episode",
    hook: "Welcome to our amazing podcast!",
    introduction: "Today we'll discuss the future of AI.",
    mainContent: [
      {
        content:
          "Artificial Intelligence is transforming our world in unprecedented ways.",
        speaker: "primary",
      },
      {
        content: "That's absolutely right! The implications are fascinating.",
        speaker: "secondary",
      },
    ],
    conclusion: "Thank you for listening to our podcast.",
    callToAction: "Don't forget to subscribe and share!",
    estimatedDuration: 120,
    wordCount: 150,
    contentType: "dialogue",
  },
  voiceConfig: {
    primary: {
      provider: "openai",
      voiceId: "alloy",
      speed: 1.0,
      pitch: 1.0,
    },
    secondary: {
      provider: "openai",
      voiceId: "echo",
      speed: 0.95,
      pitch: 1.1,
    },
  },
  audioSettings: {
    format: "mp3",
    quality: "high",
    sampleRate: 44100,
    bitrate: 192,
    normalize: true,
    removeNoise: true,
  },
});

console.log("Audio generated:", result.audio.mainFile.path);
console.log("Quality score:", result.analysis.audioQuality.overallScore);
console.log("Total cost:", result.metadata.totalCost);
```

## Advanced Usage

### Multi-Provider Configuration

```javascript
const result = await execute({
  script: {
    /* your script */
  },
  voiceConfig: {
    primary: {
      provider: "elevenlabs",
      voiceId: "rachel",
      stability: 0.7,
      clarity: 0.8,
      style: "conversational",
    },
    secondary: {
      provider: "azure",
      voiceId: "en-US-JennyNeural",
      speed: 1.1,
      pitch: 0.9,
    },
  },
  audioSettings: {
    format: "wav",
    quality: "ultra",
    sampleRate: 48000,
    channels: 1,
  },
  audioProcessing: {
    backgroundMusic: {
      enabled: true,
      track: "./assets/background.mp3",
      volume: 0.15,
      fadeIn: 3,
      fadeOut: 3,
    },
    voiceEffects: {
      reverb: 0.1,
      compression: true,
      equalization: {
        bass: 2,
        mid: 0,
        treble: 1,
      },
    },
    transitions: {
      betweenSections: true,
      type: "crossfade",
      duration: 1.0,
    },
  },
  outputSettings: {
    filename: "premium_podcast_episode",
    generateWaveform: true,
    generateChapters: true,
    generateMetadata: true,
  },
  qualityControl: {
    maxRetries: 5,
    validateAudio: true,
    minDuration: 60,
    maxDuration: 1800,
  },
});
```

### Batch Processing

```javascript
const scripts = [
  {
    /* script 1 */
  },
  {
    /* script 2 */
  },
  {
    /* script 3 */
  },
];

const results = await Promise.all(
  scripts.map((script) =>
    execute({
      script,
      voiceConfig: {
        /* shared config */
      },
      audioSettings: {
        /* shared settings */
      },
    })
  )
);
```

## Voice Providers

### OpenAI TTS

- **Voices**: alloy, echo, fable, onyx, nova, shimmer
- **Cost**: $0.015 per 1K characters
- **Features**: Fast processing, multiple voices, good quality
- **Best for**: General purpose, cost-effective synthesis

### ElevenLabs

- **Voices**: rachel, domi, bella, antoni, elli, josh, arnold, adam, sam
- **Cost**: $0.30 per 1K characters
- **Features**: Ultra-realistic, voice cloning, emotion control
- **Best for**: Premium quality, natural-sounding speech

### Azure Cognitive Services

- **Voices**: JennyNeural, GuyNeural, AriaNeural, DavisNeural
- **Cost**: $0.016 per 1K characters
- **Features**: Neural voices, SSML support, custom lexicon
- **Best for**: Enterprise applications, multilingual support

### Google Cloud TTS

- **Voices**: Wavenet-D, Wavenet-F, Neural2-C, Neural2-D
- **Cost**: $0.016 per 1K characters
- **Features**: WaveNet quality, neural voices, SSML
- **Best for**: High-quality synthesis, Google ecosystem

### AWS Polly

- **Voices**: Joanna, Matthew, Amy, Brian, Emma, Justin
- **Cost**: $0.004 per 1K characters
- **Features**: Neural voices, newscaster style, conversational
- **Best for**: Cost-effective, AWS ecosystem integration

## Audio Processing Features

### Noise Reduction

```javascript
audioSettings: {
  removeNoise: true; // Applies highpass filter at 80Hz
}
```

### Compression

```javascript
audioProcessing: {
  voiceEffects: {
    compression: true; // Dynamic range compression for consistent levels
  }
}
```

### Equalization

```javascript
audioProcessing: {
  voiceEffects: {
    equalization: {
      bass: 2,    // +2dB boost at 100Hz
      mid: 0,     // No change at 1kHz
      treble: -1  // -1dB cut at 10kHz
    }
  }
}
```

### Normalization

```javascript
audioSettings: {
  normalize: true; // Loudness normalization to -16 LUFS
}
```

## Output Structure

```javascript
{
  audio: {
    mainFile: {
      path: "/path/to/output.mp3",
      filename: "podcast_episode.mp3",
      format: "mp3",
      size: 2048576,
      duration: 120.5,
      sampleRate: 44100,
      bitrate: 192,
      channels: 1
    },
    segments: [
      {
        segmentId: "segment_1",
        speaker: "primary",
        startTime: 0,
        endTime: 15.2,
        duration: 15.2,
        path: "/temp/segment_1.mp3",
        text: "Welcome to our podcast..."
      }
    ],
    waveform: {
      path: "/path/to/waveform.json",
      format: "json",
      width: 1000,
      height: 200,
      peaks: [0.1, 0.3, 0.8, ...]
    }
  },
  transcript: {
    fullText: "Complete transcript text...",
    segments: [
      {
        id: "segment_1",
        speaker: "primary",
        startTime: 0,
        endTime: 15.2,
        text: "Welcome to our podcast...",
        confidence: 0.95
      }
    ],
    srtContent: "1\n00:00:00,000 --> 00:00:15,200\nWelcome to our podcast...\n",
    vttContent: "WEBVTT\n\n00:00:00.000 --> 00:00:15.200\nWelcome to our podcast...\n",
    jsonContent: "[{\"id\":\"segment_1\",\"speaker\":\"primary\",...}]"
  },
  analysis: {
    audioQuality: {
      overallScore: 9,
      clarity: 10,
      naturalness: 8,
      consistency: 9,
      backgroundNoise: 2
    },
    technicalMetrics: {
      peakAmplitude: -3.2,
      rmsLevel: -18.5,
      dynamicRange: 15.3,
      frequencyResponse: {
        bass: 0.8,
        mid: 1.0,
        treble: 0.9
      },
      silencePercentage: 5.2
    },
    speechAnalysis: {
      averageSpeed: 150,
      pauseAnalysis: {
        totalPauses: 12,
        averagePauseLength: 0.8,
        longestPause: 2.1
      },
      emotionalTone: {
        energy: 8,
        positivity: 7,
        confidence: 9,
        engagement: 8
      }
    },
    compliance: {
      durationMatch: true,
      contentComplete: true,
      qualityThreshold: true,
      formatCompliance: true
    }
  },
  chapters: [
    {
      id: "intro",
      title: "Introduction",
      startTime: 0,
      endTime: 30
    }
  ],
  metadata: {
    generatedAt: "2024-01-15T10:30:00.000Z",
    processingTime: 45000,
    totalCost: 0.0234,
    synthesisDetails: {
      primaryVoice: {
        provider: "openai",
        voiceId: "alloy",
        charactersProcessed: 1250,
        cost: 0.01875,
        processingTime: 15000
      },
      secondaryVoice: {
        provider: "openai",
        voiceId: "echo",
        charactersProcessed: 310,
        cost: 0.00465,
        processingTime: 8000
      }
    },
    processingSteps: [
      {
        step: "Script segmentation",
        duration: 1200,
        success: true,
        details: "5 segments prepared"
      }
    ],
    qualityMetrics: {
      overallScore: 87,
      audioQuality: 90,
      speechQuality: 85,
      technicalQuality: 86
    },
    fileInfo: {
      originalScript: {
        wordCount: 150,
        estimatedDuration: 120
      },
      generatedAudio: {
        actualDuration: 120.5,
        fileSize: 2048576,
        compressionRatio: 12.5
      }
    }
  },
  recommendations: [
    {
      category: "quality",
      suggestion: "Consider using ElevenLabs for even higher quality",
      impact: "medium",
      implementation: "Switch primary voice to ElevenLabs provider"
    }
  ]
}
```

## Performance Metrics

### Processing Time

- **Basic synthesis**: ~30 seconds per minute of audio
- **Advanced processing**: ~45-60 seconds per minute of audio
- **Concurrent processing**: Up to 5 parallel synthesis jobs

### Cost Estimates

- **OpenAI**: ~$0.15 per minute of audio
- **ElevenLabs**: ~$3.00 per minute of audio
- **Azure**: ~$0.16 per minute of audio
- **Google**: ~$0.16 per minute of audio
- **AWS**: ~$0.04 per minute of audio

### Quality Scores

- **OpenAI**: 7-8/10 (Good quality, fast)
- **ElevenLabs**: 9-10/10 (Excellent quality, slower)
- **Azure**: 8-9/10 (Very good quality)
- **Google**: 8-9/10 (Very good quality)
- **AWS**: 6-7/10 (Decent quality, very fast)

## Error Handling

The module includes comprehensive error handling:

```javascript
try {
  const result = await execute(config);
} catch (error) {
  if (error.name === "AudioSynthesizerError") {
    console.error("Synthesis error:", error.code);
    console.error("Details:", error.details);

    switch (error.code) {
      case "PROVIDER_NOT_CONFIGURED":
        console.log("Configure API keys in .env file");
        break;
      case "SYNTHESIS_FAILED":
        console.log("Try different voice provider or settings");
        break;
      case "AUDIO_COMBINATION_FAILED":
        console.log("Check FFmpeg installation");
        break;
    }
  }
}
```

## Testing

```bash
# Run basic validation
npm run validate

# Run basic functionality test
npm run test:basic

# Run comprehensive tests
npm test
```

## Configuration Options

### Audio Settings

```javascript
audioSettings: {
  format: "mp3",        // mp3, wav, m4a, ogg, flac
  quality: "high",      // low, medium, high, ultra
  sampleRate: 44100,    // 22050, 44100, 48000
  bitrate: 192,         // 128, 192, 256, 320 (for MP3)
  channels: 1,          // 1 (mono), 2 (stereo)
  normalize: true,      // Apply loudness normalization
  removeNoise: true     // Apply noise reduction
}
```

### Voice Configuration

```javascript
voiceConfig: {
  primary: {
    provider: "openai",     // openai, elevenlabs, azure, google, aws
    voiceId: "alloy",       // Provider-specific voice ID
    name: "Primary Voice",  // Human-readable name
    gender: "neutral",      // male, female, neutral
    age: "adult",          // child, young, adult, senior
    accent: "american",     // american, british, australian, etc.
    style: "conversational", // conversational, professional, casual
    speed: 1.0,            // 0.5 - 2.0
    pitch: 1.0,            // 0.5 - 2.0
    stability: 0.5,        // 0.0 - 1.0 (ElevenLabs)
    clarity: 0.75          // 0.0 - 1.0 (ElevenLabs)
  }
}
```

### Audio Processing

```javascript
audioProcessing: {
  backgroundMusic: {
    enabled: false,
    track: "",           // Path to background music file
    volume: 0.1,         // 0.0 - 1.0
    fadeIn: 2,           // Seconds
    fadeOut: 2,          // Seconds
    loopDuration: 0      // 0 = no loop, >0 = loop duration
  },
  soundEffects: [],      // Array of sound effect configurations
  transitions: {
    betweenSections: true,
    type: "fade",        // fade, crossfade, silence
    duration: 0.5        // Seconds
  },
  voiceEffects: {
    reverb: 0.0,         // 0.0 - 1.0
    echo: 0.0,           // 0.0 - 1.0
    compression: true,    // Enable dynamic range compression
    equalization: {
      bass: 0,           // -10 to +10 dB
      mid: 0,            // -10 to +10 dB
      treble: 0          // -10 to +10 dB
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **FFmpeg not found**

   ```bash
   # Install FFmpeg
   # Windows: Download from https://ffmpeg.org/
   # macOS: brew install ffmpeg
   # Linux: sudo apt-get install ffmpeg
   ```

2. **API key errors**

   ```bash
   # Check .env file configuration
   # Verify API keys are valid and have sufficient credits
   ```

3. **Audio quality issues**

   ```javascript
   // Try different voice provider
   voiceConfig: {
     primary: {
       provider: "elevenlabs", // Higher quality
       voiceId: "rachel"
     }
   }
   ```

4. **Processing timeout**
   ```javascript
   // Reduce concurrent processing
   // Split large scripts into smaller segments
   ```

### Performance Optimization

1. **Use appropriate quality settings**

   ```javascript
   audioSettings: {
     quality: "medium", // Instead of "ultra" for faster processing
     sampleRate: 22050  // Instead of 48000 for smaller files
   }
   ```

2. **Optimize provider selection**

   ```javascript
   // Use AWS for cost-effective synthesis
   // Use OpenAI for balanced quality/speed
   // Use ElevenLabs only for premium content
   ```

3. **Enable concurrent processing**
   ```javascript
   // Module automatically processes up to 5 segments concurrently
   // Ensure sufficient system resources
   ```

## Integration Examples

### With Content Generator

```javascript
const contentResult = await contentGenerator.execute(researchData);
const audioResult = await audioSynthesizer.execute({
  script: contentResult.script,
  voiceConfig: {
    primary: { provider: "openai", voiceId: "alloy" },
  },
  audioSettings: { format: "mp3" },
});
```

### With Video Composer

```javascript
const audioResult = await audioSynthesizer.execute(scriptData);
const videoResult = await videoComposer.execute({
  audio: audioResult.audio.mainFile,
  transcript: audioResult.transcript,
  duration: audioResult.audio.mainFile.duration,
});
```

## Roadmap

### Version 1.1.0

- [ ] Real-time synthesis streaming
- [ ] Voice cloning capabilities
- [ ] Advanced emotion control
- [ ] Multi-language support

### Version 1.2.0

- [ ] Background music auto-generation
- [ ] Sound effects library integration
- [ ] Advanced audio mastering
- [ ] Podcast-specific optimizations

### Version 2.0.0

- [ ] Neural voice training
- [ ] Real-time voice conversion
- [ ] Advanced audio analysis
- [ ] Cloud processing options

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:

- GitHub Issues: [audio-synthesizer/issues](https://github.com/auto-publish/audio-synthesizer/issues)
- Documentation: [audio-synthesizer/docs](https://github.com/auto-publish/audio-synthesizer/docs)
- Community: [Discord](https://discord.gg/auto-publish)
