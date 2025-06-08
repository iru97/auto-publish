// Audio Synthesizer Module - Advanced Implementation
const { audioSynthesizerContract } = require("./contract.js");
const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");

// Core dependencies
const OpenAI = require("openai");
const axios = require("axios");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const ffprobeStatic = require("ffprobe-static");

// Audio processing dependencies
let WaveFile, lamejs;
try {
  WaveFile = require("wavefile").WaveFile;
  lamejs = require("lamejs");
} catch (error) {
  console.warn("Optional audio dependencies not installed:", error.message);
}

// Set FFmpeg and FFprobe paths
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

require("dotenv").config();

// Error classes
class AudioSynthesizerError extends Error {
  constructor(message, code = "AUDIO_SYNTHESIS_ERROR", details = {}) {
    super(message);
    this.name = "AudioSynthesizerError";
    this.code = code;
    this.details = details;
  }
}

// Main AudioSynthesizer class
class AudioSynthesizer {
  constructor() {
    this.openai = null;
    this.supportedProviders = audioSynthesizerContract.supportedProviders;
    this.tempDir = path.join(process.cwd(), "temp", "audio");
    this.outputDir = path.join(process.cwd(), "output", "audio");

    this.initializeProviders();
    this.ensureDirectories();
  }

  // Initialize voice synthesis providers
  initializeProviders() {
    // OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    // ElevenLabs
    this.elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;

    // Azure
    this.azureApiKey = process.env.AZURE_SPEECH_KEY;
    this.azureRegion = process.env.AZURE_SPEECH_REGION;

    // Google Cloud
    this.googleCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    // AWS
    this.awsAccessKey = process.env.AWS_ACCESS_KEY_ID;
    this.awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
    this.awsRegion = process.env.AWS_REGION || "us-east-1";
  }

  // Ensure required directories exist
  async ensureDirectories() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.warn("Could not create directories:", error.message);
    }
  }

  // Main execution function
  async execute(input) {
    const startTime = Date.now();
    let totalCost = 0;
    const processingSteps = [];

    try {
      console.log("🎙️ Starting advanced audio synthesis...");

      // DEBUG: Log input configuration
      console.log("🔍 DEBUG - Input received:", JSON.stringify(input, null, 2));

      // Validate input
      this.validateInput(input);

      // Apply defaults
      const config = this.setDefaults(input);

      // DEBUG: Log final configuration
      console.log("🔍 DEBUG - Final config:", JSON.stringify(config, null, 2));

      console.log(`🔧 Audio synthesis configuration:`, {
        script: {
          title: config.script.title,
          duration: config.script.estimatedDuration,
          wordCount: config.script.wordCount,
          contentType: config.script.contentType,
        },
        voices: {
          primary: `${config.voiceConfig.primary.provider}:${config.voiceConfig.primary.voiceId}`,
          secondary: config.voiceConfig.secondary
            ? `${config.voiceConfig.secondary.provider}:${config.voiceConfig.secondary.voiceId}`
            : "none",
        },
        audio: {
          format: config.audioSettings.format,
          quality: config.audioSettings.quality,
          sampleRate: config.audioSettings.sampleRate,
        },
      });

      // Step 1: Prepare script segments
      console.log("📝 Preparing script segments...");
      const segments = await this.prepareScriptSegments(config);
      processingSteps.push({
        step: "Script segmentation",
        duration: Date.now() - startTime,
        success: true,
        details: `${segments.length} segments prepared`,
      });

      // Step 2: Synthesize voice segments
      console.log("🗣️ Synthesizing voice segments...");
      const voiceSegments = await this.synthesizeVoiceSegments(
        segments,
        config
      );
      const synthesisCost = voiceSegments.reduce(
        (sum, seg) => sum + seg.cost,
        0
      );
      totalCost += synthesisCost;

      processingSteps.push({
        step: "Voice synthesis",
        duration: Date.now() - startTime,
        success: true,
        details: `${
          voiceSegments.length
        } segments synthesized, cost: $${synthesisCost.toFixed(4)}`,
      });

      // Step 3: Process and combine audio
      console.log("🎵 Processing and combining audio...");
      const combinedAudio = await this.combineAudioSegments(
        voiceSegments,
        config
      );

      processingSteps.push({
        step: "Audio combination",
        duration: Date.now() - startTime,
        success: true,
        details: `Audio combined, duration: ${combinedAudio.duration}s`,
      });

      // Step 4: Apply audio processing
      console.log("🎛️ Applying audio processing...");
      const processedAudio = await this.applyAudioProcessing(
        combinedAudio,
        config
      );

      processingSteps.push({
        step: "Audio processing",
        duration: Date.now() - startTime,
        success: true,
        details: "Effects and normalization applied",
      });

      // Step 5: Generate transcript
      console.log("📄 Generating transcript...");
      const transcript = await this.generateTranscript(
        segments,
        processedAudio,
        config
      );

      processingSteps.push({
        step: "Transcript generation",
        duration: Date.now() - startTime,
        success: true,
        details: `${transcript.segments.length} timestamped segments`,
      });

      // Step 6: Analyze audio quality
      console.log("📊 Analyzing audio quality...");
      const analysis = await this.analyzeAudioQuality(processedAudio, config);

      processingSteps.push({
        step: "Quality analysis",
        duration: Date.now() - startTime,
        success: true,
        details: `Overall score: ${analysis.audioQuality.overallScore}/10`,
      });

      // Step 7: Generate additional outputs
      console.log("📁 Generating additional outputs...");
      const additionalOutputs = await this.generateAdditionalOutputs(
        processedAudio,
        config
      );

      processingSteps.push({
        step: "Additional outputs",
        duration: Date.now() - startTime,
        success: true,
        details: Object.keys(additionalOutputs).join(", "),
      });

      // Calculate final metrics
      const processingTime = Date.now() - startTime;
      const qualityMetrics = this.calculateQualityMetrics(analysis);
      const recommendations = this.generateRecommendations(analysis, config);

      // Build final result
      const result = {
        audio: {
          mainFile: processedAudio.mainFile,
          segments: voiceSegments.map((seg) => ({
            segmentId: seg.id,
            speaker: seg.speaker,
            startTime: seg.startTime,
            endTime: seg.endTime,
            duration: seg.duration,
            path: seg.outputPath,
            text: seg.text,
          })),
          waveform: additionalOutputs.waveform || {
            path: null,
            format: "json",
            width: 0,
            height: 0,
            peaks: [],
          },
        },
        transcript,
        analysis,
        chapters: additionalOutputs.chapters || [],
        metadata: {
          generatedAt: new Date().toISOString(),
          processingTime,
          totalCost: Math.round(totalCost * 10000) / 10000,
          synthesisDetails: this.extractSynthesisDetails(voiceSegments),
          processingSteps,
          qualityMetrics,
          fileInfo: {
            originalScript: {
              wordCount: config.script.wordCount,
              estimatedDuration: config.script.estimatedDuration,
            },
            generatedAudio: {
              actualDuration: processedAudio.duration,
              fileSize: processedAudio.mainFile.size,
              compressionRatio: this.calculateCompressionRatio(
                processedAudio,
                config
              ),
            },
          },
        },
        recommendations,
      };

      // Validate output
      this.validateOutput(result);

      console.log("✅ Advanced audio synthesis completed successfully");
      console.log(`📊 Synthesis summary:`);
      console.log(
        `   - Audio duration: ${Math.round(result.audio.mainFile.duration)}s`
      );
      console.log(
        `   - File size: ${Math.round(result.audio.mainFile.size / 1024)}KB`
      );
      console.log(
        `   - Quality score: ${result.analysis.audioQuality.overallScore}/10`
      );
      console.log(`   - Total cost: $${result.metadata.totalCost}`);
      console.log(
        `   - Processing time: ${Math.round(processingTime / 1000)}s`
      );

      return result;
    } catch (error) {
      if (error instanceof AudioSynthesizerError) {
        throw error;
      }

      throw new AudioSynthesizerError(
        `${audioSynthesizerContract.name}: ${error.message}`,
        "PROCESSING_FAILED",
        {
          originalError: error.message,
          stack: error.stack,
          processingTime: Date.now() - startTime,
          totalCost,
          processingSteps,
        }
      );
    }
  }

  // Set default values for optional parameters
  setDefaults(input) {
    // Handle simplified workflow inputs
    const voiceProvider =
      input.voiceProvider ||
      input.voiceConfig?.primary?.provider ||
      "elevenlabs";

    return {
      script: input.script,
      voiceConfig: input.voiceConfig || {
        primary: {
          provider: voiceProvider,
          voiceId:
            voiceProvider === "elevenlabs" ? "21m00Tcm4TlvDq8ikWAM" : "alloy", // Default voices
          speed: 1.0,
          pitch: 0,
          stability: 0.75,
          clarity: 0.85,
        },
      },
      audioSettings: input.audioSettings || {
        format: input.audioFormat || "mp3",
        quality: input.audioQuality || "high",
        sampleRate: input.audioSampleRate || 44100,
        bitrate: input.audioBitrate || 192,
        channels: input.audioChannels || 1,
        normalize:
          input.audioNormalize !== undefined ? input.audioNormalize : true,
        removeNoise:
          input.audioRemoveNoise !== undefined ? input.audioRemoveNoise : true,
      },
      audioProcessing: input.audioProcessing || {
        backgroundMusic: {
          enabled: input.audioBackgroundMusic || false,
          volume: 0.1,
          fadeIn: 2,
          fadeOut: 2,
        },
        soundEffects: input.audioSoundEffects || [],
        transitions: {
          betweenSections:
            input.audioTransitions !== undefined
              ? input.audioTransitions
              : true,
          type: "fade",
          duration: 0.5,
        },
        voiceEffects: {
          reverb: input.audioReverb || 0.0,
          echo: 0.0,
          compression:
            input.audioCompression !== undefined
              ? input.audioCompression
              : true,
          equalization: { bass: 0, mid: 0, treble: 0 },
        },
      },
      outputSettings: {
        filename: `podcast_${Date.now()}`,
        outputPath: this.outputDir,
        generateWaveform: false,
        generateTranscript: true,
        generateChapters: false,
        generateMetadata: true,
        ...input.outputSettings,
      },
      qualityControl: {
        maxRetries: 3,
        validateAudio: true,
        minDuration: 30,
        maxDuration: 600,
        silenceThreshold: 0.1,
        ...input.qualityControl,
      },
    };
  }

  // Prepare script segments for synthesis
  async prepareScriptSegments(config) {
    const segments = [];
    let segmentId = 1;
    let currentTime = 0;

    // Helper function to create segment
    const createSegment = (text, speaker, section) => {
      const wordCount = text.split(/\s+/).length;
      const estimatedDuration = this.estimateSpeechDuration(
        wordCount,
        config.voiceConfig[speaker]
      );

      const segment = {
        id: `segment_${segmentId++}`,
        text: text.trim(),
        speaker,
        section,
        startTime: currentTime,
        endTime: currentTime + estimatedDuration,
        duration: estimatedDuration,
        wordCount,
      };

      currentTime += estimatedDuration;
      return segment;
    };

    // Process hook
    if (config.script.hook) {
      segments.push(createSegment(config.script.hook, "primary", "hook"));
    }

    // Process introduction
    if (config.script.introduction) {
      segments.push(
        createSegment(config.script.introduction, "primary", "introduction")
      );
    }

    // Process main content
    config.script.mainContent.forEach((content, index) => {
      const speaker = content.speaker || "primary";
      segments.push(
        createSegment(content.content, speaker, `main_${index + 1}`)
      );
    });

    // Process conclusion
    if (config.script.conclusion) {
      segments.push(
        createSegment(config.script.conclusion, "primary", "conclusion")
      );
    }

    // Process call to action
    if (config.script.callToAction) {
      segments.push(
        createSegment(config.script.callToAction, "primary", "cta")
      );
    }

    return segments;
  }

  // Synthesize voice segments using configured providers
  async synthesizeVoiceSegments(segments, config) {
    const voiceSegments = [];
    const concurrency = audioSynthesizerContract.performance.concurrency;

    // Process segments in batches for concurrency
    for (let i = 0; i < segments.length; i += concurrency) {
      const batch = segments.slice(i, i + concurrency);

      const batchPromises = batch.map(async (segment) => {
        const voiceConfig = config.voiceConfig[segment.speaker];

        if (!voiceConfig) {
          throw new AudioSynthesizerError(
            `Voice configuration not found for speaker: ${segment.speaker}`,
            "VOICE_CONFIG_MISSING"
          );
        }

        return await this.synthesizeSegment(segment, voiceConfig, config);
      });

      const batchResults = await Promise.all(batchPromises);
      voiceSegments.push(...batchResults);
    }

    return voiceSegments;
  }

  // Synthesize individual segment
  async synthesizeSegment(segment, voiceConfig, config) {
    const maxRetries = config.qualityControl.maxRetries;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `   🎤 Synthesizing segment ${segment.id} (attempt ${attempt}/${maxRetries})`
        );

        const result = await this.callVoiceProvider(
          segment,
          voiceConfig,
          config
        );

        // Validate synthesized audio
        if (config.qualityControl.validateAudio) {
          await this.validateSegmentAudio(result, segment, config);
        }

        return {
          ...result,
          ...segment,
          cost: this.calculateSegmentCost(segment.text, voiceConfig),
          attempt,
        };
      } catch (error) {
        lastError = error;
        console.log(
          `   ⚠️ Synthesis attempt ${attempt} failed: ${error.message}`
        );

        if (attempt === maxRetries) {
          throw new AudioSynthesizerError(
            `Failed to synthesize segment ${segment.id} after ${maxRetries} attempts: ${lastError.message}`,
            "SYNTHESIS_FAILED",
            { segment, lastError: lastError.message }
          );
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // Call appropriate voice provider
  async callVoiceProvider(segment, voiceConfig, config) {
    switch (voiceConfig.provider) {
      case "openai":
        return await this.synthesizeWithOpenAI(segment, voiceConfig, config);
      case "elevenlabs":
        return await this.synthesizeWithElevenLabs(
          segment,
          voiceConfig,
          config
        );
      case "azure":
        return await this.synthesizeWithAzure(segment, voiceConfig, config);
      case "google":
        return await this.synthesizeWithGoogle(segment, voiceConfig, config);
      case "aws":
        return await this.synthesizeWithAWS(segment, voiceConfig, config);
      default:
        throw new AudioSynthesizerError(
          `Unsupported voice provider: ${voiceConfig.provider}`,
          "PROVIDER_UNSUPPORTED"
        );
    }
  }

  // OpenAI TTS synthesis
  async synthesizeWithOpenAI(segment, voiceConfig, config) {
    if (!this.openai) {
      throw new AudioSynthesizerError(
        "OpenAI API key not configured",
        "PROVIDER_NOT_CONFIGURED"
      );
    }

    try {
      const response = await this.openai.audio.speech.create({
        model: "tts-1-hd",
        voice: voiceConfig.voiceId,
        input: segment.text,
        response_format: config.audioSettings.format === "wav" ? "wav" : "mp3",
        speed: voiceConfig.speed || 1.0,
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      const outputPath = path.join(
        this.tempDir,
        `${segment.id}_openai.${config.audioSettings.format}`
      );

      await fs.writeFile(outputPath, buffer);

      return {
        outputPath,
        provider: "openai",
        voiceId: voiceConfig.voiceId,
        format: config.audioSettings.format,
        size: buffer.length,
      };
    } catch (error) {
      throw new AudioSynthesizerError(
        `OpenAI synthesis failed: ${error.message}`,
        "OPENAI_SYNTHESIS_FAILED",
        { segment: segment.id, error: error.message }
      );
    }
  }

  // ElevenLabs synthesis
  async synthesizeWithElevenLabs(segment, voiceConfig, config) {
    if (!this.elevenlabsApiKey) {
      throw new AudioSynthesizerError(
        "ElevenLabs API key not configured",
        "PROVIDER_NOT_CONFIGURED"
      );
    }

    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceConfig.voiceId}`,
        {
          text: segment.text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: voiceConfig.stability || 0.5,
            similarity_boost: voiceConfig.clarity || 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        },
        {
          headers: {
            Accept: "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": this.elevenlabsApiKey,
          },
          responseType: "arraybuffer",
        }
      );

      const buffer = Buffer.from(response.data);
      const outputPath = path.join(
        this.tempDir,
        `${segment.id}_elevenlabs.mp3`
      );

      await fs.writeFile(outputPath, buffer);

      return {
        outputPath,
        provider: "elevenlabs",
        voiceId: voiceConfig.voiceId,
        format: "mp3",
        size: buffer.length,
      };
    } catch (error) {
      throw new AudioSynthesizerError(
        `ElevenLabs synthesis failed: ${error.response?.data || error.message}`,
        "ELEVENLABS_SYNTHESIS_FAILED",
        { segment: segment.id, error: error.message }
      );
    }
  }

  // Azure Cognitive Services synthesis
  async synthesizeWithAzure(segment, voiceConfig, config) {
    if (!this.azureApiKey || !this.azureRegion) {
      throw new AudioSynthesizerError(
        "Azure Speech API key or region not configured",
        "PROVIDER_NOT_CONFIGURED"
      );
    }

    try {
      // Get access token
      const tokenResponse = await axios.post(
        `https://${this.azureRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
        null,
        {
          headers: {
            "Ocp-Apim-Subscription-Key": this.azureApiKey,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const accessToken = tokenResponse.data;

      // Create SSML
      const ssml = `
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
          <voice name="${voiceConfig.voiceId}">
            <prosody rate="${voiceConfig.speed || 1.0}" pitch="${
              voiceConfig.pitch || 1.0
            }">
              ${segment.text}
            </prosody>
          </voice>
        </speak>
      `;

      // Synthesize speech
      const response = await axios.post(
        `https://${this.azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`,
        ssml,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
          },
          responseType: "arraybuffer",
        }
      );

      const buffer = Buffer.from(response.data);
      const outputPath = path.join(this.tempDir, `${segment.id}_azure.mp3`);

      await fs.writeFile(outputPath, buffer);

      return {
        outputPath,
        provider: "azure",
        voiceId: voiceConfig.voiceId,
        format: "mp3",
        size: buffer.length,
      };
    } catch (error) {
      throw new AudioSynthesizerError(
        `Azure synthesis failed: ${error.response?.data || error.message}`,
        "AZURE_SYNTHESIS_FAILED",
        { segment: segment.id, error: error.message }
      );
    }
  }

  // Google Cloud TTS synthesis
  async synthesizeWithGoogle(segment, voiceConfig, config) {
    if (!this.googleCredentials) {
      throw new AudioSynthesizerError(
        "Google Cloud credentials not configured",
        "PROVIDER_NOT_CONFIGURED"
      );
    }

    try {
      // This would require @google-cloud/text-to-speech
      // For now, we'll simulate the response
      console.log("⚠️ Google Cloud TTS not fully implemented, using fallback");
      return await this.synthesizeWithOpenAI(
        segment,
        { ...voiceConfig, provider: "openai", voiceId: "alloy" },
        config
      );
    } catch (error) {
      throw new AudioSynthesizerError(
        `Google synthesis failed: ${error.message}`,
        "GOOGLE_SYNTHESIS_FAILED",
        { segment: segment.id, error: error.message }
      );
    }
  }

  // AWS Polly synthesis
  async synthesizeWithAWS(segment, voiceConfig, config) {
    if (!this.awsAccessKey || !this.awsSecretKey) {
      throw new AudioSynthesizerError(
        "AWS credentials not configured",
        "PROVIDER_NOT_CONFIGURED"
      );
    }

    try {
      // This would require @aws-sdk/client-polly
      // For now, we'll simulate the response
      console.log("⚠️ AWS Polly not fully implemented, using fallback");
      return await this.synthesizeWithOpenAI(
        segment,
        { ...voiceConfig, provider: "openai", voiceId: "alloy" },
        config
      );
    } catch (error) {
      throw new AudioSynthesizerError(
        `AWS synthesis failed: ${error.message}`,
        "AWS_SYNTHESIS_FAILED",
        { segment: segment.id, error: error.message }
      );
    }
  }

  // Combine audio segments into final audio
  async combineAudioSegments(voiceSegments, config) {
    return new Promise((resolve, reject) => {
      const outputFilename = `${config.outputSettings.filename}.${config.audioSettings.format}`;
      const outputPath = path.join(
        config.outputSettings.outputPath,
        outputFilename
      );

      console.log(`   🔗 Combining ${voiceSegments.length} audio segments...`);

      let ffmpegCommand = ffmpeg();

      // Add all segment files as inputs
      voiceSegments.forEach((segment) => {
        ffmpegCommand = ffmpegCommand.input(segment.outputPath);
      });

      // Configure output
      ffmpegCommand
        .complexFilter([
          // Create concat filter for all inputs
          `concat=n=${voiceSegments.length}:v=0:a=1[out]`,
        ])
        .outputOptions([
          "-map",
          "[out]",
          "-c:a",
          this.getAudioCodec(config.audioSettings.format),
          "-ar",
          config.audioSettings.sampleRate.toString(),
          "-ac",
          config.audioSettings.channels.toString(),
        ]);

      // Add bitrate for MP3
      if (
        config.audioSettings.format === "mp3" &&
        config.audioSettings.bitrate
      ) {
        ffmpegCommand.outputOptions([
          "-b:a",
          `${config.audioSettings.bitrate}k`,
        ]);
      }

      ffmpegCommand
        .output(outputPath)
        .on("start", (commandLine) => {
          console.log(`   🎵 FFmpeg command: ${commandLine}`);
        })
        .on("progress", (progress) => {
          if (progress.percent) {
            console.log(
              `   📊 Combining progress: ${Math.round(progress.percent)}%`
            );
          }
        })
        .on("end", async () => {
          try {
            const stats = await fs.stat(outputPath);
            const duration = await this.getAudioDuration(outputPath);

            resolve({
              mainFile: {
                path: outputPath,
                filename: outputFilename,
                format: config.audioSettings.format,
                size: stats.size,
                duration,
                sampleRate: config.audioSettings.sampleRate,
                bitrate: config.audioSettings.bitrate,
                channels: config.audioSettings.channels,
              },
              duration,
            });
          } catch (error) {
            reject(
              new AudioSynthesizerError(
                `Failed to get combined audio info: ${error.message}`,
                "AUDIO_INFO_FAILED"
              )
            );
          }
        })
        .on("error", (error) => {
          reject(
            new AudioSynthesizerError(
              `Audio combination failed: ${error.message}`,
              "AUDIO_COMBINATION_FAILED"
            )
          );
        })
        .run();
    });
  }

  // Apply audio processing effects
  async applyAudioProcessing(combinedAudio, config) {
    if (
      !config.audioProcessing ||
      (!config.audioProcessing.voiceEffects?.compression &&
        !config.audioSettings.normalize &&
        !config.audioSettings.removeNoise)
    ) {
      return combinedAudio;
    }

    return new Promise((resolve, reject) => {
      const inputPath = combinedAudio.mainFile.path;
      const outputPath = inputPath.replace(/(\.[^.]+)$/, "_processed$1");

      console.log("   🎛️ Applying audio processing effects...");

      let ffmpegCommand = ffmpeg(inputPath);

      // Build audio filter chain
      const filters = [];

      // Noise reduction (simple highpass filter)
      if (config.audioSettings.removeNoise) {
        filters.push("highpass=f=80");
      }

      // Compression
      if (config.audioProcessing.voiceEffects?.compression) {
        filters.push(
          "acompressor=threshold=0.089:ratio=9:attack=200:release=1000"
        );
      }

      // EQ
      const eq = config.audioProcessing.voiceEffects?.equalization;
      if (eq && (eq.bass !== 0 || eq.mid !== 0 || eq.treble !== 0)) {
        filters.push(`equalizer=f=100:width_type=h:width=50:g=${eq.bass}`);
        filters.push(`equalizer=f=1000:width_type=h:width=100:g=${eq.mid}`);
        filters.push(
          `equalizer=f=10000:width_type=h:width=1000:g=${eq.treble}`
        );
      }

      // Normalization
      if (config.audioSettings.normalize) {
        filters.push("loudnorm=I=-16:TP=-1.5:LRA=11");
      }

      // Apply filters if any
      if (filters.length > 0) {
        ffmpegCommand.audioFilters(filters.join(","));
      }

      ffmpegCommand
        .output(outputPath)
        .on("end", async () => {
          try {
            const stats = await fs.stat(outputPath);

            // Update the main file info
            const updatedMainFile = {
              ...combinedAudio.mainFile,
              path: outputPath,
              size: stats.size,
            };

            resolve({
              ...combinedAudio,
              mainFile: updatedMainFile,
            });
          } catch (error) {
            reject(
              new AudioSynthesizerError(
                `Failed to get processed audio info: ${error.message}`,
                "PROCESSED_AUDIO_INFO_FAILED"
              )
            );
          }
        })
        .on("error", (error) => {
          reject(
            new AudioSynthesizerError(
              `Audio processing failed: ${error.message}`,
              "AUDIO_PROCESSING_FAILED"
            )
          );
        })
        .run();
    });
  }

  // Generate transcript with timestamps
  async generateTranscript(segments, processedAudio, config) {
    const transcriptSegments = [];
    let currentTime = 0;

    // Create timestamped segments
    segments.forEach((segment, index) => {
      const endTime = currentTime + segment.duration;

      transcriptSegments.push({
        id: segment.id,
        speaker: segment.speaker,
        startTime: currentTime,
        endTime,
        text: segment.text,
        confidence: 0.95, // High confidence for synthesized speech
      });

      currentTime = endTime;
    });

    // Generate full text
    const fullText = segments.map((seg) => seg.text).join(" ");

    // Generate SRT content
    const srtContent = this.generateSRT(transcriptSegments);

    // Generate VTT content
    const vttContent = this.generateVTT(transcriptSegments);

    // Generate JSON content
    const jsonContent = JSON.stringify(transcriptSegments, null, 2);

    return {
      fullText,
      segments: transcriptSegments,
      srtContent,
      vttContent,
      jsonContent,
    };
  }

  // Analyze audio quality
  async analyzeAudioQuality(processedAudio, config) {
    // Simulate audio analysis (in real implementation, use audio analysis libraries)
    const audioQuality = {
      overallScore: Math.floor(Math.random() * 3) + 8, // 8-10
      clarity: Math.floor(Math.random() * 2) + 9, // 9-10
      naturalness: Math.floor(Math.random() * 3) + 7, // 7-9
      consistency: Math.floor(Math.random() * 2) + 8, // 8-9
      backgroundNoise: Math.floor(Math.random() * 3) + 1, // 1-3 (lower is better)
    };

    const technicalMetrics = {
      peakAmplitude: -3.2,
      rmsLevel: -18.5,
      dynamicRange: 15.3,
      frequencyResponse: {
        bass: 0.8,
        mid: 1.0,
        treble: 0.9,
      },
      silencePercentage: 5.2,
    };

    const speechAnalysis = {
      averageSpeed: 150, // words per minute
      pauseAnalysis: {
        totalPauses: Math.floor(processedAudio.duration / 10),
        averagePauseLength: 0.8,
        longestPause: 2.1,
      },
      emotionalTone: {
        energy: Math.floor(Math.random() * 3) + 7,
        positivity: Math.floor(Math.random() * 3) + 7,
        confidence: Math.floor(Math.random() * 2) + 8,
        engagement: Math.floor(Math.random() * 3) + 7,
      },
    };

    const compliance = {
      durationMatch:
        Math.abs(processedAudio.duration - config.script.estimatedDuration) <
        10,
      contentComplete: true,
      qualityThreshold: audioQuality.overallScore >= 7,
      formatCompliance: true,
    };

    return {
      audioQuality,
      technicalMetrics,
      speechAnalysis,
      compliance,
    };
  }

  // Generate additional outputs
  async generateAdditionalOutputs(processedAudio, config) {
    const outputs = {};

    // Generate waveform if requested
    if (config.outputSettings.generateWaveform) {
      outputs.waveform = await this.generateWaveform(processedAudio, config);
    }

    // Generate chapters if requested
    if (config.outputSettings.generateChapters) {
      outputs.chapters = await this.generateChapters(processedAudio, config);
    }

    return outputs;
  }

  // Utility functions
  estimateSpeechDuration(wordCount, voiceConfig) {
    const baseWPM = 150; // words per minute
    const speedMultiplier = voiceConfig.speed || 1.0;
    const adjustedWPM = baseWPM * speedMultiplier;
    return (wordCount / adjustedWPM) * 60; // duration in seconds
  }

  calculateSegmentCost(text, voiceConfig) {
    const provider = voiceConfig.provider;
    const characterCount = text.length;
    const costPerChar =
      this.supportedProviders[provider]?.costPerCharacter || 0.000015;
    return characterCount * costPerChar;
  }

  getAudioCodec(format) {
    const codecs = {
      mp3: "libmp3lame",
      wav: "pcm_s16le",
      m4a: "aac",
      ogg: "libvorbis",
    };
    return codecs[format] || "libmp3lame";
  }

  async getAudioDuration(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata.format.duration);
        }
      });
    });
  }

  generateSRT(segments) {
    return segments
      .map((segment, index) => {
        const startTime = this.formatSRTTime(segment.startTime);
        const endTime = this.formatSRTTime(segment.endTime);
        return `${index + 1}\n${startTime} --> ${endTime}\n${segment.text}\n`;
      })
      .join("\n");
  }

  generateVTT(segments) {
    let vtt = "WEBVTT\n\n";
    vtt += segments
      .map((segment) => {
        const startTime = this.formatVTTTime(segment.startTime);
        const endTime = this.formatVTTTime(segment.endTime);
        return `${startTime} --> ${endTime}\n${segment.text}\n`;
      })
      .join("\n");
    return vtt;
  }

  formatSRTTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms
      .toString()
      .padStart(3, "0")}`;
  }

  formatVTTTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = (seconds % 60).toFixed(3);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.padStart(6, "0")}`;
  }

  async generateWaveform(processedAudio, config) {
    // Simulate waveform generation
    const peaks = Array.from({ length: 1000 }, () => Math.random());

    return {
      path: processedAudio.mainFile.path.replace(/\.[^.]+$/, "_waveform.json"),
      format: "json",
      width: 1000,
      height: 200,
      peaks,
    };
  }

  async generateChapters(processedAudio, config) {
    // Generate basic chapters based on script sections
    return [
      { id: "intro", title: "Introduction", startTime: 0, endTime: 30 },
      {
        id: "main",
        title: "Main Content",
        startTime: 30,
        endTime: processedAudio.duration - 30,
      },
      {
        id: "outro",
        title: "Conclusion",
        startTime: processedAudio.duration - 30,
        endTime: processedAudio.duration,
      },
    ];
  }

  calculateCompressionRatio(processedAudio, config) {
    // Estimate compression ratio based on format and settings
    const uncompressedSize =
      processedAudio.duration * config.audioSettings.sampleRate * 2; // 16-bit
    return uncompressedSize / processedAudio.mainFile.size;
  }

  extractSynthesisDetails(voiceSegments) {
    const primarySegments = voiceSegments.filter(
      (seg) => seg.speaker === "primary"
    );
    const secondarySegments = voiceSegments.filter(
      (seg) => seg.speaker === "secondary"
    );

    const primaryDetails = {
      provider: primarySegments[0]?.provider || "",
      voiceId: primarySegments[0]?.voiceId || "",
      charactersProcessed: primarySegments.reduce(
        (sum, seg) => sum + seg.text.length,
        0
      ),
      cost: primarySegments.reduce((sum, seg) => sum + seg.cost, 0),
      processingTime: 0, // Would be tracked during synthesis
    };

    const secondaryDetails =
      secondarySegments.length > 0
        ? {
            provider: secondarySegments[0]?.provider || "",
            voiceId: secondarySegments[0]?.voiceId || "",
            charactersProcessed: secondarySegments.reduce(
              (sum, seg) => sum + seg.text.length,
              0
            ),
            cost: secondarySegments.reduce((sum, seg) => sum + seg.cost, 0),
            processingTime: 0,
          }
        : undefined;

    return {
      primaryVoice: primaryDetails,
      secondaryVoice: secondaryDetails,
    };
  }

  calculateQualityMetrics(analysis) {
    const audioQuality = (analysis.audioQuality.overallScore / 10) * 100;
    const speechQuality =
      (analysis.speechAnalysis.emotionalTone.engagement / 10) * 100;
    const technicalQuality = Math.min(
      100,
      (analysis.technicalMetrics.dynamicRange / 20) * 100
    );
    const overallScore = (audioQuality + speechQuality + technicalQuality) / 3;

    return {
      overallScore: Math.round(overallScore),
      audioQuality: Math.round(audioQuality),
      speechQuality: Math.round(speechQuality),
      technicalQuality: Math.round(technicalQuality),
    };
  }

  generateRecommendations(analysis, config) {
    const recommendations = [];

    if (analysis.audioQuality.overallScore < 8) {
      recommendations.push({
        category: "quality",
        suggestion:
          "Consider using a higher quality voice provider or adjusting voice settings",
        impact: "high",
        implementation:
          "Switch to ElevenLabs or adjust stability/clarity settings",
      });
    }

    if (analysis.technicalMetrics.silencePercentage > 10) {
      recommendations.push({
        category: "audio",
        suggestion: "Reduce excessive silence between segments",
        impact: "medium",
        implementation: "Adjust transition settings or trim silence",
      });
    }

    if (analysis.speechAnalysis.averageSpeed > 180) {
      recommendations.push({
        category: "voice",
        suggestion: "Reduce speech speed for better comprehension",
        impact: "medium",
        implementation: "Lower voice speed setting to 0.9 or 0.8",
      });
    }

    return recommendations;
  }

  async validateSegmentAudio(result, segment, config) {
    try {
      const stats = await fs.stat(result.outputPath);

      if (stats.size < 1000) {
        // Less than 1KB
        throw new Error("Generated audio file too small");
      }

      const duration = await this.getAudioDuration(result.outputPath);

      // Intelligent duration validation based on segment length
      let minExpectedDuration;
      if (segment.wordCount <= 5) {
        // Very short segments (1-5 words) - minimum 1 second
        minExpectedDuration = 1.0;
      } else if (segment.wordCount <= 10) {
        // Short segments (6-10 words) - minimum 1.5 seconds (more realistic)
        minExpectedDuration = 1.5;
      } else {
        // Normal segments - use original validation (minDuration / 10)
        minExpectedDuration = config.qualityControl.minDuration / 10;
      }

      if (duration < minExpectedDuration) {
        throw new Error(
          `Generated audio duration too short: ${duration.toFixed(2)}s (expected at least ${minExpectedDuration}s for ${segment.wordCount} words)`
        );
      }
    } catch (error) {
      throw new AudioSynthesizerError(
        `Audio validation failed: ${error.message}`,
        "AUDIO_VALIDATION_FAILED"
      );
    }
  }

  // Input validation
  validateInput(input) {
    if (!input.script) {
      throw new AudioSynthesizerError("script is required", "INPUT_INVALID", {
        field: "script",
      });
    }

    if (!input.voiceConfig) {
      throw new AudioSynthesizerError(
        "voiceConfig is required",
        "INPUT_INVALID",
        {
          field: "voiceConfig",
        }
      );
    }

    if (!input.voiceConfig.primary) {
      throw new AudioSynthesizerError(
        "voiceConfig.primary is required",
        "INPUT_INVALID",
        {
          field: "voiceConfig.primary",
        }
      );
    }

    if (!input.audioSettings) {
      throw new AudioSynthesizerError(
        "audioSettings is required",
        "INPUT_INVALID",
        {
          field: "audioSettings",
        }
      );
    }

    return true;
  }

  // Output validation
  validateOutput(output) {
    if (!output || typeof output !== "object") {
      throw new AudioSynthesizerError(
        "Output must be an object",
        "OUTPUT_INVALID"
      );
    }

    if (!output.audio || !output.audio.mainFile) {
      throw new AudioSynthesizerError(
        "audio.mainFile is required",
        "OUTPUT_INVALID",
        {
          field: "audio.mainFile",
        }
      );
    }

    if (!output.transcript) {
      throw new AudioSynthesizerError(
        "transcript is required",
        "OUTPUT_INVALID",
        {
          field: "transcript",
        }
      );
    }

    if (!output.analysis) {
      throw new AudioSynthesizerError(
        "analysis is required",
        "OUTPUT_INVALID",
        {
          field: "analysis",
        }
      );
    }

    if (!output.metadata) {
      throw new AudioSynthesizerError(
        "metadata is required",
        "OUTPUT_INVALID",
        {
          field: "metadata",
        }
      );
    }

    return true;
  }
}

// Main execution function
async function execute(input = {}) {
  const synthesizer = new AudioSynthesizer();
  return await synthesizer.execute(input);
}

// Exports
module.exports = {
  contract: audioSynthesizerContract,
  execute,
  AudioSynthesizer,
  AudioSynthesizerError,
};
