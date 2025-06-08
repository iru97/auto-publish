# Video Composer Module

Advanced video composition engine that combines audio with AI-generated visuals, animations, and effects to create professional podcast videos.

## 🎬 Overview

The Video Composer module is a comprehensive video generation system that transforms audio content into engaging visual experiences. It combines multiple AI video providers, advanced visual effects, subtitle animations, and platform-specific optimizations to create professional-quality videos.

## ✨ Key Features

### 🤖 AI-Powered Video Generation

- **Multi-Provider Support**: Runway, Pika, Kling AI, Luma, Stable Video Diffusion
- **Intelligent Scene Generation**: Automatic visual prompts from transcript analysis
- **Motion Control**: Static, slow, medium, and fast motion options
- **Style Variations**: Realistic, animated, abstract, minimalist, cinematic

### 🎨 Advanced Visual Composition

- **Template System**: Podcast, educational, corporate, creative, minimal, dynamic
- **Background Generation**: Solid, gradient, image, video, AI-generated
- **Visual Effects**: Audio visualizers, particles, lighting effects
- **Branding Integration**: Logo overlays, watermarks, intro/outro sequences

### 📝 Subtitle Animation System

- **Multiple Styles**: Basic, modern, cinematic, podcast, animated
- **Animation Types**: Typewriter, fade, slide, bounce effects
- **Highlighting**: Underline, background, glow, outline styles
- **Custom Positioning**: Flexible placement and sizing

### 🎵 Audio Visualization

- **Visualizer Types**: Waveform, spectrum, bars, circular, particles
- **Style Options**: Minimal, modern, retro, neon, organic
- **Real-time Sync**: Perfect audio-visual synchronization
- **Customizable Colors**: Match your brand theme

### 📱 Platform Optimization

- **Multi-Platform Export**: YouTube, TikTok, Instagram, Twitter, LinkedIn
- **Aspect Ratio Support**: 16:9, 9:16, 1:1, 4:3
- **Quality Presets**: Low, medium, high, ultra
- **Codec Options**: H.264, H.265, VP9, AV1

## 🚀 Installation

### Prerequisites

```bash
# Install FFmpeg (required)
# Windows (using Chocolatey)
choco install ffmpeg

# macOS (using Homebrew)
brew install ffmpeg

# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# Install ImageMagick (optional, for advanced effects)
# Windows
choco install imagemagick

# macOS
brew install imagemagick

# Ubuntu/Debian
sudo apt install imagemagick
```

### Module Installation

```bash
# Install required dependencies
npm install

# Install optional AI providers
npm run install-optional

# Setup directories
npm run setup
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
# AI Video Providers (choose one or more)
RUNWAY_API_KEY=your_runway_api_key
PIKA_API_KEY=your_pika_api_key
KLING_API_KEY=your_kling_api_key
LUMA_API_KEY=your_luma_api_key
STABLE_VIDEO_API_KEY=your_stable_video_api_key

# Optional: Cloud rendering
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
GCP_PROJECT_ID=your_gcp_project
AZURE_SUBSCRIPTION_ID=your_azure_subscription
```

### Provider Comparison

| Provider         | Cost/sec | Max Duration | Best For        | Features                        |
| ---------------- | -------- | ------------ | --------------- | ------------------------------- |
| **Kling AI**     | $0.02    | 60s          | General use     | Motion control, high quality    |
| **Pika Labs**    | $0.03    | 10s          | Quick clips     | Fast generation, good quality   |
| **Runway**       | $0.05    | 30s          | Professional    | Best quality, advanced features |
| **Luma**         | $0.04    | 20s          | Cinematic       | Dream Machine, realistic        |
| **Stable Video** | $0.01    | 25s          | Budget-friendly | Open source, customizable       |

## 📖 Usage

### Basic Usage

```javascript
const { execute } = require('./index.js');

const input = {
  // Audio data from audio-synthesizer module
  audioData: {
    mainFile: './output/audio/podcast.mp3',
    segments: [...], // Audio segments
    transcript: {
      fullText: 'Your podcast transcript...',
      segments: [...], // Timestamped segments
      srtContent: '...', // SRT subtitles
      vttContent: '...' // VTT subtitles
    },
    metadata: {
      duration: 180, // 3 minutes
      sampleRate: 44100,
      channels: 1,
      format: 'mp3'
    }
  },

  // Video configuration
  videoConfig: {
    format: 'mp4',
    resolution: {
      width: 1920,
      height: 1080,
      aspectRatio: '16:9'
    },
    frameRate: 30,
    quality: 'high',
    codec: 'h264',
    bitrate: '5M'
  },

  // Visual style
  visualStyle: {
    template: 'podcast',
    theme: {
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
      accentColor: '#f59e0b',
      backgroundColor: '#f8fafc',
      textColor: '#1f2937'
    },
    typography: {
      primaryFont: 'Inter',
      secondaryFont: 'Roboto',
      titleSize: 48,
      subtitleSize: 24,
      bodySize: 16
    },
    layout: 'centered'
  }
};

const result = await execute(input);
console.log('Video generated:', result.video.mainFile);
```

### Advanced Usage with AI Visuals

```javascript
const advancedInput = {
  ...basicInput,

  // AI-powered visual generation
  aiVisuals: {
    enabled: true,
    provider: "kling", // or 'runway', 'pika', 'luma'
    style: "cinematic",
    scenes: [
      {
        timestamp: 0,
        duration: 10,
        prompt: "A modern podcast studio with warm lighting",
        motion: "slow",
      },
      {
        timestamp: 30,
        duration: 15,
        prompt: "Abstract visualization of data flowing",
        motion: "medium",
      },
    ],
    transitions: {
      type: "fade",
      duration: 1.0,
    },
  },

  // Subtitle animation
  subtitles: {
    enabled: true,
    style: "modern",
    position: "bottom",
    animation: {
      type: "typewriter",
      timing: "word",
      speed: 1.2,
    },
    highlighting: {
      enabled: true,
      color: "#f59e0b",
      style: "background",
    },
  },

  // Visual effects
  effects: {
    visualizer: {
      enabled: true,
      type: "waveform",
      style: "modern",
      position: "bottom",
      color: "#2563eb",
      intensity: 0.8,
    },
    particles: {
      enabled: true,
      type: "floating",
      count: 50,
      color: "#f59e0b",
      size: 3,
      speed: 0.5,
    },
  },

  // Branding
  branding: {
    logo: {
      file: "./assets/logo.png",
      position: "top-right",
      size: 100,
      opacity: 0.8,
    },
    watermark: {
      text: "@YourPodcast",
      position: "bottom",
      opacity: 0.6,
      font: "Inter",
      size: 14,
    },
  },

  // Platform variants
  outputVariants: [
    {
      name: "youtube",
      platform: "youtube",
      resolution: { width: 1920, height: 1080 },
    },
    {
      name: "tiktok",
      platform: "tiktok",
      resolution: { width: 1080, height: 1920 },
    },
    {
      name: "instagram",
      platform: "instagram",
      resolution: { width: 1080, height: 1080 },
    },
  ],
};

const result = await execute(advancedInput);
```

## 📊 Output Structure

```javascript
{
  // Main video file
  video: {
    mainFile: './output/video/podcast_20241207_123456.mp4',
    format: 'mp4',
    resolution: { width: 1920, height: 1080 },
    duration: 180.5,
    frameRate: 30,
    fileSize: 45678912, // bytes
    codec: 'h264',
    bitrate: '5000k'
  },

  // Platform-specific variants
  variants: [
    {
      name: 'youtube',
      platform: 'youtube',
      file: './output/video/podcast_youtube.mp4',
      resolution: { width: 1920, height: 1080 },
      duration: 180.5,
      fileSize: 45678912,
      optimizedFor: ['web', 'mobile']
    },
    // ... more variants
  ],

  // Generated assets
  assets: {
    thumbnails: [
      {
        timestamp: 0,
        file: './output/assets/thumbnail_0.jpg',
        resolution: { width: 1280, height: 720 }
      }
      // ... more thumbnails
    ],
    preview: {
      gif: './output/assets/preview.gif',
      mp4: './output/assets/preview.mp4',
      duration: 10
    },
    frames: [
      {
        timestamp: 30,
        file: './output/assets/frame_30s.jpg',
        description: 'Key frame at 30s'
      }
      // ... more frames
    ],
    aiGeneratedScenes: [
      {
        id: 'scene_001',
        file: './temp/scenes/scene_001.mp4',
        prompt: 'Modern podcast studio',
        timestamp: 0,
        duration: 10,
        provider: 'kling',
        cost: 0.20
      }
      // ... more scenes
    ]
  },

  // Quality analysis
  analysis: {
    videoQuality: {
      overall: 8.5, // 1-10 scale
      visual: 8.8,
      audio: 9.2,
      synchronization: 9.0,
      compression: 8.0
    },
    technicalMetrics: {
      averageBitrate: '4850k',
      peakBitrate: '6200k',
      compressionRatio: 0.85,
      colorSpace: 'bt709',
      dynamicRange: 'SDR',
      motionVectors: 1250,
      sceneChanges: 12
    },
    contentAnalysis: {
      visualComplexity: 7.2,
      motionIntensity: 6.8,
      colorVariance: 8.1,
      textReadability: 9.5,
      audioVideoSync: 9.8
    },
    platformCompliance: [
      {
        platform: 'youtube',
        compliant: true,
        issues: [],
        recommendations: ['Consider higher bitrate for 4K']
      }
      // ... more platforms
    ]
  },

  // Processing metadata
  metadata: {
    generatedAt: '2024-12-07T15:30:45.123Z',
    processingTime: 420000, // milliseconds
    totalCost: 2.45, // USD
    compositionDetails: {
      audioSource: './output/audio/podcast.mp3',
      visualElements: 15,
      effectsApplied: ['visualizer', 'particles', 'subtitles'],
      aiScenesGenerated: 3,
      transitionsUsed: ['fade', 'dissolve']
    },
    processingSteps: [
      {
        step: 'Audio analysis',
        duration: 5000,
        status: 'success',
        details: 'Extracted 45 visual cues'
      }
      // ... more steps
    ],
    qualityMetrics: {
      renderTime: 380000,
      memoryUsage: '4.2GB',
      cpuUsage: 85,
      gpuUsage: 60,
      diskSpace: '2.1GB'
    }
  },

  // Recommendations
  recommendations: {
    qualityImprovements: [
      'Consider using higher resolution for better detail',
      'Add more visual variety with additional AI scenes'
    ],
    performanceOptimizations: [
      'Enable GPU acceleration for faster rendering',
      'Use lower quality preset for faster processing'
    ],
    platformOptimizations: {
      youtube: ['Increase bitrate to 8Mbps for better quality'],
      tiktok: ['Add more dynamic visual effects'],
      instagram: ['Optimize for mobile viewing']
    },
    costOptimizations: [
      'Use template scenes instead of AI generation',
      'Reduce AI scene duration to minimize costs'
    ],
    nextSteps: [
      'Test video on target platforms',
      'Gather audience feedback for improvements'
    ]
  }
}
```

## 🎨 Visual Templates

### Podcast Template

- Clean, professional layout
- Waveform visualization
- Minimal distractions
- Focus on content

### Educational Template

- Structured information display
- Clear typography
- Visual aids and diagrams
- Academic color scheme

### Corporate Template

- Professional branding
- Conservative design
- Company colors
- Business-appropriate effects

### Creative Template

- Dynamic animations
- Bold colors
- Artistic effects
- Experimental layouts

### Minimal Template

- Clean, simple design
- Monochromatic colors
- Subtle animations
- Focus on content

### Dynamic Template

- High-energy effects
- Vibrant colors
- Fast transitions
- Engaging animations

## 🔧 Advanced Configuration

### Custom Visual Effects

```javascript
const customEffects = {
  visualizer: {
    enabled: true,
    type: "custom",
    config: {
      bars: 64,
      smoothing: 0.8,
      colorGradient: ["#ff0000", "#00ff00", "#0000ff"],
      responsive: true,
    },
  },
  particles: {
    enabled: true,
    type: "custom",
    config: {
      count: 100,
      physics: {
        gravity: 0.1,
        wind: 0.05,
        bounce: 0.8,
      },
      appearance: {
        shape: "circle",
        size: [2, 8],
        opacity: [0.3, 0.8],
      },
    },
  },
};
```

### Custom Subtitle Styling

```javascript
const customSubtitles = {
  enabled: true,
  style: "custom",
  config: {
    font: {
      family: "Montserrat",
      weight: "bold",
      size: 32,
      color: "#ffffff",
      stroke: {
        color: "#000000",
        width: 2,
      },
    },
    background: {
      enabled: true,
      color: "rgba(0, 0, 0, 0.7)",
      padding: 10,
      borderRadius: 8,
    },
    animation: {
      type: "custom",
      keyframes: [
        { time: 0, opacity: 0, scale: 0.8 },
        { time: 0.2, opacity: 1, scale: 1.1 },
        { time: 1, opacity: 1, scale: 1 },
      ],
    },
  },
};
```

## 📈 Performance Optimization

### GPU Acceleration

```javascript
const optimizedConfig = {
  processing: {
    multipass: false, // Single pass for speed
    optimization: "speed", // vs 'quality' or 'balanced'
    denoising: false, // Disable for speed
    stabilization: false, // Disable for speed
    colorGrading: {
      enabled: false, // Disable for speed
    },
    motionBlur: false, // Disable for speed
    antiAliasing: false, // Disable for speed
  },
  rendering: {
    gpu: true, // Enable GPU acceleration
    threads: "auto", // Use all available cores
    memory: "8GB", // Allocate more memory
    priority: "high", // High process priority
  },
};
```

### Quality vs Speed Trade-offs

| Setting      | Speed      | Quality    | Memory     | Cost       |
| ------------ | ---------- | ---------- | ---------- | ---------- |
| **Speed**    | ⭐⭐⭐⭐⭐ | ⭐⭐       | ⭐⭐       | ⭐         |
| **Balanced** | ⭐⭐⭐     | ⭐⭐⭐⭐   | ⭐⭐⭐     | ⭐⭐⭐     |
| **Quality**  | ⭐         | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🧪 Testing

### Basic Test

```bash
npm run test:basic
```

### Full Test Suite

```bash
npm test
```

### Manual Testing

```javascript
const { execute } = require("./index.js");

// Test with minimal configuration
const testInput = {
  audioData: {
    mainFile: "./test/sample.mp3",
    segments: [],
    transcript: {
      fullText: "This is a test podcast.",
      segments: [],
      srtContent: "",
      vttContent: "",
    },
    metadata: {
      duration: 30,
      sampleRate: 44100,
      channels: 1,
      format: "mp3",
    },
  },
  videoConfig: {
    format: "mp4",
    resolution: { width: 1280, height: 720, aspectRatio: "16:9" },
    frameRate: 30,
    quality: "medium",
    codec: "h264",
  },
  visualStyle: {
    template: "minimal",
    theme: {
      primaryColor: "#000000",
      secondaryColor: "#ffffff",
      accentColor: "#ff0000",
      backgroundColor: "#f0f0f0",
      textColor: "#333333",
    },
    typography: {
      primaryFont: "Arial",
      secondaryFont: "Helvetica",
      titleSize: 32,
      subtitleSize: 18,
      bodySize: 14,
    },
    layout: "centered",
  },
};

execute(testInput)
  .then((result) => {
    console.log("✅ Test passed");
    console.log("Generated video:", result.video.mainFile);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error.message);
  });
```

## 🔍 Troubleshooting

### Common Issues

#### FFmpeg Not Found

```bash
# Install FFmpeg
npm install ffmpeg-static

# Or install system-wide
# Windows: choco install ffmpeg
# macOS: brew install ffmpeg
# Linux: sudo apt install ffmpeg
```

#### Out of Memory

```javascript
// Reduce memory usage
const config = {
  videoConfig: {
    resolution: { width: 1280, height: 720 }, // Lower resolution
    quality: "medium", // Lower quality
  },
  processing: {
    optimization: "speed", // Faster processing
  },
};
```

#### AI Provider Errors

```javascript
// Check API keys
console.log("KLING_API_KEY:", process.env.KLING_API_KEY ? "Set" : "Missing");

// Use fallback provider
const config = {
  aiVisuals: {
    provider: "local", // Use local generation
    fallback: true, // Enable fallback
  },
};
```

#### Slow Processing

```javascript
// Enable optimizations
const config = {
  processing: {
    optimization: "speed",
    multipass: false,
    gpu: true,
  },
  aiVisuals: {
    enabled: false, // Disable AI for speed
  },
};
```

## 🔗 Integration

### With Audio Synthesizer

```javascript
const audioResult = await audioSynthesizer.execute(audioInput);
const videoInput = {
  audioData: audioResult.audio,
  // ... video configuration
};
const videoResult = await videoComposer.execute(videoInput);
```

### With Content Generator

```javascript
const contentResult = await contentGenerator.execute(contentInput);
const audioInput = {
  script: contentResult.script,
  // ... audio configuration
};
const audioResult = await audioSynthesizer.execute(audioInput);
const videoInput = {
  audioData: audioResult.audio,
  // ... video configuration
};
const videoResult = await videoComposer.execute(videoInput);
```

## 🗺️ Roadmap

### Version 1.1.0 (Next Release)

- [ ] Real-time preview generation
- [ ] Advanced motion graphics
- [ ] Custom shader effects
- [ ] Improved AI scene generation
- [ ] Better error recovery

### Version 1.2.0

- [ ] 3D visual effects
- [ ] Advanced color grading
- [ ] Multi-camera simulation
- [ ] Interactive elements
- [ ] Live streaming support

### Version 2.0.0

- [ ] Real-time collaboration
- [ ] Cloud rendering
- [ ] Advanced AI integration
- [ ] VR/AR support
- [ ] Professional broadcast features

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

- GitHub Issues: [Report bugs](https://github.com/auto-publish/video-composer/issues)
- Documentation: [Full docs](https://github.com/auto-publish/video-composer/wiki)
- Community: [Discord server](https://discord.gg/auto-publish)

---

**Video Composer Module v1.0.0** - Advanced video composition for the modern age 🎬
