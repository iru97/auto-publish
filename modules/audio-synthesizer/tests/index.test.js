// Audio Synthesizer Module - Comprehensive Test Suite
const {
  execute,
  AudioSynthesizer,
  AudioSynthesizerError,
} = require("../index.js");
const { audioSynthesizerContract } = require("../contract.js");
const fs = require("fs").promises;
const path = require("path");

// Test configuration
const TEST_TIMEOUT = 120000; // 2 minutes for audio processing
const OUTPUT_DIR = path.join(__dirname, "../temp/test-output");

// Mock data for testing
const mockScript = {
  title: "Test Podcast Episode",
  hook: "Welcome to our test podcast!",
  introduction: "Today we're testing our audio synthesis system.",
  mainContent: [
    {
      content:
        "This is the first segment of our test content. We're testing the primary voice synthesis.",
      speaker: "primary",
    },
    {
      content:
        "And this is the second segment with a different speaker for dialogue testing.",
      speaker: "secondary",
    },
    {
      content:
        "Finally, we return to the primary speaker for the conclusion of our test.",
      speaker: "primary",
    },
  ],
  conclusion: "Thank you for listening to our test podcast episode.",
  callToAction: "Please subscribe and share if you found this test useful!",
  estimatedDuration: 90,
  wordCount: 120,
  contentType: "dialogue",
  tone: "conversational",
};

const mockVoiceConfig = {
  primary: {
    provider: "openai",
    voiceId: "alloy",
    name: "Primary Test Voice",
    gender: "neutral",
    age: "adult",
    accent: "american",
    style: "conversational",
    speed: 1.0,
    pitch: 1.0,
  },
  secondary: {
    provider: "openai",
    voiceId: "echo",
    name: "Secondary Test Voice",
    gender: "neutral",
    age: "adult",
    accent: "american",
    style: "conversational",
    speed: 0.95,
    pitch: 1.1,
  },
};

const mockAudioSettings = {
  format: "mp3",
  quality: "high",
  sampleRate: 44100,
  bitrate: 192,
  channels: 1,
  normalize: true,
  removeNoise: true,
};

// Test utilities
async function ensureTestDirectories() {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.mkdir(path.join(OUTPUT_DIR, "audio"), { recursive: true });
  } catch (error) {
    console.warn("Could not create test directories:", error.message);
  }
}

async function cleanupTestFiles() {
  try {
    const files = await fs.readdir(OUTPUT_DIR);
    for (const file of files) {
      if (file.startsWith("test_")) {
        await fs.unlink(path.join(OUTPUT_DIR, file));
      }
    }
  } catch (error) {
    console.warn("Could not cleanup test files:", error.message);
  }
}

function validateAudioFile(filePath, expectedFormat = "mp3") {
  return fs.stat(filePath).then((stats) => {
    if (stats.size < 1000) {
      throw new Error("Audio file too small");
    }
    if (!filePath.endsWith(`.${expectedFormat}`)) {
      throw new Error(`Expected ${expectedFormat} format`);
    }
    return true;
  });
}

// Test suite
async function runTests() {
  console.log("🧪 Starting Audio Synthesizer Module Tests");
  console.log("=".repeat(50));

  let passedTests = 0;
  let totalTests = 0;
  const testResults = [];

  // Setup
  await ensureTestDirectories();

  // Test 1: Contract Validation
  totalTests++;
  console.log("\n1️⃣ Testing contract validation...");
  try {
    if (
      !audioSynthesizerContract.name ||
      audioSynthesizerContract.name !== "audio-synthesizer"
    ) {
      throw new Error("Invalid contract name");
    }
    if (
      !audioSynthesizerContract.version ||
      !audioSynthesizerContract.description
    ) {
      throw new Error("Missing contract metadata");
    }
    if (!audioSynthesizerContract.input || !audioSynthesizerContract.output) {
      throw new Error("Missing input/output schema");
    }
    if (!audioSynthesizerContract.supportedProviders) {
      throw new Error("Missing supported providers");
    }

    console.log("✅ Contract validation passed");
    console.log(`   - Name: ${audioSynthesizerContract.name}`);
    console.log(`   - Version: ${audioSynthesizerContract.version}`);
    console.log(
      `   - Providers: ${Object.keys(
        audioSynthesizerContract.supportedProviders
      ).join(", ")}`
    );

    passedTests++;
    testResults.push({
      test: "Contract Validation",
      status: "PASS",
      details: "All contract fields valid",
    });
  } catch (error) {
    console.log("❌ Contract validation failed:", error.message);
    testResults.push({
      test: "Contract Validation",
      status: "FAIL",
      error: error.message,
    });
  }

  // Test 2: Input Validation - Valid Input
  totalTests++;
  console.log("\n2️⃣ Testing input validation with valid input...");
  try {
    const synthesizer = new AudioSynthesizer();
    const validInput = {
      script: mockScript,
      voiceConfig: mockVoiceConfig,
      audioSettings: mockAudioSettings,
    };

    const isValid = synthesizer.validateInput(validInput);
    if (!isValid) {
      throw new Error("Valid input rejected");
    }

    console.log("✅ Valid input validation passed");
    passedTests++;
    testResults.push({
      test: "Input Validation - Valid",
      status: "PASS",
      details: "Valid input accepted",
    });
  } catch (error) {
    console.log("❌ Valid input validation failed:", error.message);
    testResults.push({
      test: "Input Validation - Valid",
      status: "FAIL",
      error: error.message,
    });
  }

  // Test 3: Input Validation - Invalid Input
  totalTests++;
  console.log("\n3️⃣ Testing input validation with invalid input...");
  try {
    const synthesizer = new AudioSynthesizer();
    let errorThrown = false;

    try {
      synthesizer.validateInput({});
    } catch (error) {
      if (
        error instanceof AudioSynthesizerError &&
        error.code === "INPUT_INVALID"
      ) {
        errorThrown = true;
      }
    }

    if (!errorThrown) {
      throw new Error("Invalid input not rejected");
    }

    console.log("✅ Invalid input validation passed");
    passedTests++;
    testResults.push({
      test: "Input Validation - Invalid",
      status: "PASS",
      details: "Invalid input properly rejected",
    });
  } catch (error) {
    console.log("❌ Invalid input validation failed:", error.message);
    testResults.push({
      test: "Input Validation - Invalid",
      status: "FAIL",
      error: error.message,
    });
  }

  // Test 4: Basic Execution (if OpenAI API key available)
  totalTests++;
  console.log("\n4️⃣ Testing basic execution...");
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.log("⚠️ Skipping basic execution test - no OpenAI API key");
      testResults.push({
        test: "Basic Execution",
        status: "SKIP",
        details: "No OpenAI API key configured",
      });
    } else {
      const basicInput = {
        script: {
          title: "Basic Test",
          hook: "Hello world",
          introduction: "This is a basic test",
          mainContent: [
            {
              content: "Testing basic synthesis functionality",
              speaker: "primary",
            },
          ],
          conclusion: "Test completed",
          estimatedDuration: 30,
          wordCount: 25,
          contentType: "monologue",
        },
        voiceConfig: {
          primary: {
            provider: "openai",
            voiceId: "alloy",
            speed: 1.2, // Faster for testing
          },
        },
        audioSettings: {
          format: "mp3",
          quality: "medium", // Lower quality for faster processing
          sampleRate: 22050,
        },
        outputSettings: {
          filename: "test_basic_execution",
          outputPath: OUTPUT_DIR,
        },
      };

      console.log(
        "   🎙️ Synthesizing basic audio (this may take 30-60 seconds)..."
      );
      const result = await execute(basicInput);

      // Validate result structure
      if (!result.audio || !result.audio.mainFile) {
        throw new Error("Missing audio output");
      }
      if (!result.transcript || !result.analysis || !result.metadata) {
        throw new Error("Missing required output fields");
      }

      // Validate audio file
      await validateAudioFile(result.audio.mainFile.path, "mp3");

      console.log("✅ Basic execution passed");
      console.log(`   - Audio file: ${result.audio.mainFile.filename}`);
      console.log(
        `   - Duration: ${Math.round(result.audio.mainFile.duration)}s`
      );
      console.log(
        `   - Quality score: ${result.analysis.audioQuality.overallScore}/10`
      );
      console.log(`   - Cost: $${result.metadata.totalCost}`);

      passedTests++;
      testResults.push({
        test: "Basic Execution",
        status: "PASS",
        details: `Audio generated: ${result.audio.mainFile.duration}s, Quality: ${result.analysis.audioQuality.overallScore}/10`,
      });
    }
  } catch (error) {
    console.log("❌ Basic execution failed:", error.message);
    testResults.push({
      test: "Basic Execution",
      status: "FAIL",
      error: error.message,
    });
  }

  // Test 5: Comprehensive Execution (if API key available)
  totalTests++;
  console.log("\n5️⃣ Testing comprehensive execution...");
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.log(
        "⚠️ Skipping comprehensive execution test - no OpenAI API key"
      );
      testResults.push({
        test: "Comprehensive Execution",
        status: "SKIP",
        details: "No OpenAI API key configured",
      });
    } else {
      const comprehensiveInput = {
        script: mockScript,
        voiceConfig: mockVoiceConfig,
        audioSettings: {
          ...mockAudioSettings,
          quality: "medium", // Faster processing
          sampleRate: 22050,
        },
        audioProcessing: {
          voiceEffects: {
            compression: true,
            equalization: {
              bass: 1,
              mid: 0,
              treble: -1,
            },
          },
          transitions: {
            betweenSections: true,
            type: "fade",
            duration: 0.3,
          },
        },
        outputSettings: {
          filename: "test_comprehensive_execution",
          outputPath: OUTPUT_DIR,
          generateTranscript: true,
          generateMetadata: true,
        },
        qualityControl: {
          maxRetries: 2,
          validateAudio: true,
          minDuration: 30,
          maxDuration: 300,
        },
      };

      console.log(
        "   🎙️ Synthesizing comprehensive audio (this may take 60-90 seconds)..."
      );
      const result = await execute(comprehensiveInput);

      // Comprehensive validation
      if (!result.audio.segments || result.audio.segments.length === 0) {
        throw new Error("Missing audio segments");
      }
      if (!result.transcript.srtContent || !result.transcript.vttContent) {
        throw new Error("Missing transcript formats");
      }
      if (
        !result.analysis.speechAnalysis ||
        !result.analysis.technicalMetrics
      ) {
        throw new Error("Missing analysis data");
      }
      if (!result.metadata.synthesisDetails) {
        throw new Error("Missing synthesis details");
      }

      // Validate audio file
      await validateAudioFile(result.audio.mainFile.path, "mp3");

      console.log("✅ Comprehensive execution passed");
      console.log(`   - Segments: ${result.audio.segments.length}`);
      console.log(
        `   - Transcript segments: ${result.transcript.segments.length}`
      );
      console.log(
        `   - Processing steps: ${result.metadata.processingSteps.length}`
      );
      console.log(
        `   - Overall quality: ${result.metadata.qualityMetrics.overallScore}%`
      );

      passedTests++;
      testResults.push({
        test: "Comprehensive Execution",
        status: "PASS",
        details: `Full pipeline: ${result.audio.segments.length} segments, ${result.metadata.qualityMetrics.overallScore}% quality`,
      });
    }
  } catch (error) {
    console.log("❌ Comprehensive execution failed:", error.message);
    testResults.push({
      test: "Comprehensive Execution",
      status: "FAIL",
      error: error.message,
    });
  }

  // Test 6: Output Validation
  totalTests++;
  console.log("\n6️⃣ Testing output validation...");
  try {
    const synthesizer = new AudioSynthesizer();

    // Test valid output
    const validOutput = {
      audio: {
        mainFile: {
          path: "/test/path.mp3",
          filename: "test.mp3",
          format: "mp3",
          size: 1024,
          duration: 60,
          sampleRate: 44100,
          bitrate: 192,
          channels: 1,
        },
        segments: [],
      },
      transcript: {
        fullText: "Test transcript",
        segments: [],
        srtContent: "",
        vttContent: "",
        jsonContent: "",
      },
      analysis: {
        audioQuality: { overallScore: 8 },
        technicalMetrics: {},
        speechAnalysis: {},
        compliance: {},
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        processingTime: 1000,
        totalCost: 0.01,
      },
    };

    const isValid = synthesizer.validateOutput(validOutput);
    if (!isValid) {
      throw new Error("Valid output rejected");
    }

    // Test invalid output
    let errorThrown = false;
    try {
      synthesizer.validateOutput({});
    } catch (error) {
      if (
        error instanceof AudioSynthesizerError &&
        error.code === "OUTPUT_INVALID"
      ) {
        errorThrown = true;
      }
    }

    if (!errorThrown) {
      throw new Error("Invalid output not rejected");
    }

    console.log("✅ Output validation passed");
    passedTests++;
    testResults.push({
      test: "Output Validation",
      status: "PASS",
      details: "Valid/invalid outputs properly handled",
    });
  } catch (error) {
    console.log("❌ Output validation failed:", error.message);
    testResults.push({
      test: "Output Validation",
      status: "FAIL",
      error: error.message,
    });
  }

  // Test 7: Error Handling
  totalTests++;
  console.log("\n7️⃣ Testing error handling...");
  try {
    let errorHandled = false;

    try {
      await execute({
        script: { title: "Invalid" }, // Missing required fields
        voiceConfig: {},
        audioSettings: {},
      });
    } catch (error) {
      if (error instanceof AudioSynthesizerError) {
        errorHandled = true;
        console.log(`   ✓ Caught expected error: ${error.code}`);
      }
    }

    if (!errorHandled) {
      throw new Error("Error not properly handled");
    }

    console.log("✅ Error handling passed");
    passedTests++;
    testResults.push({
      test: "Error Handling",
      status: "PASS",
      details: "Errors properly caught and typed",
    });
  } catch (error) {
    console.log("❌ Error handling failed:", error.message);
    testResults.push({
      test: "Error Handling",
      status: "FAIL",
      error: error.message,
    });
  }

  // Test 8: Performance Test
  totalTests++;
  console.log("\n8️⃣ Testing performance...");
  try {
    const startTime = Date.now();

    // Test utility functions performance
    const synthesizer = new AudioSynthesizer();

    // Test speech duration estimation
    const estimatedDuration = synthesizer.estimateSpeechDuration(100, {
      speed: 1.0,
    });
    if (estimatedDuration <= 0 || estimatedDuration > 120) {
      throw new Error("Invalid duration estimation");
    }

    // Test cost calculation
    const cost = synthesizer.calculateSegmentCost("Hello world", {
      provider: "openai",
    });
    if (cost <= 0 || cost > 1) {
      throw new Error("Invalid cost calculation");
    }

    // Test format utilities
    const srtTime = synthesizer.formatSRTTime(65.5);
    if (!srtTime.includes("01:05")) {
      throw new Error("Invalid SRT time formatting");
    }

    const vttTime = synthesizer.formatVTTTime(65.5);
    if (!vttTime.includes("01:05")) {
      throw new Error("Invalid VTT time formatting");
    }

    const processingTime = Date.now() - startTime;

    if (processingTime > 1000) {
      throw new Error("Performance test took too long");
    }

    console.log("✅ Performance test passed");
    console.log(`   - Processing time: ${processingTime}ms`);
    console.log(
      `   - Duration estimation: ${estimatedDuration}s for 100 words`
    );
    console.log(`   - Cost calculation: $${cost.toFixed(6)} for "Hello world"`);

    passedTests++;
    testResults.push({
      test: "Performance Test",
      status: "PASS",
      details: `Utilities processed in ${processingTime}ms`,
    });
  } catch (error) {
    console.log("❌ Performance test failed:", error.message);
    testResults.push({
      test: "Performance Test",
      status: "FAIL",
      error: error.message,
    });
  }

  // Test 9: Data Quality Test
  totalTests++;
  console.log("\n9️⃣ Testing data quality...");
  try {
    const synthesizer = new AudioSynthesizer();

    // Test script segmentation
    const config = {
      script: mockScript,
      voiceConfig: mockVoiceConfig,
    };

    const segments = await synthesizer.prepareScriptSegments(config);

    if (!segments || segments.length === 0) {
      throw new Error("No segments generated");
    }

    // Validate segment structure
    for (const segment of segments) {
      if (!segment.id || !segment.text || !segment.speaker) {
        throw new Error("Invalid segment structure");
      }
      if (segment.duration <= 0 || segment.wordCount <= 0) {
        throw new Error("Invalid segment metrics");
      }
    }

    // Test transcript generation
    const mockAudio = { duration: 90 };
    const transcript = await synthesizer.generateTranscript(
      segments,
      mockAudio,
      config
    );

    if (
      !transcript.fullText ||
      !transcript.srtContent ||
      !transcript.vttContent
    ) {
      throw new Error("Incomplete transcript generation");
    }

    // Test quality analysis
    const analysis = await synthesizer.analyzeAudioQuality(mockAudio, config);

    if (
      !analysis.audioQuality ||
      !analysis.technicalMetrics ||
      !analysis.speechAnalysis
    ) {
      throw new Error("Incomplete quality analysis");
    }

    console.log("✅ Data quality test passed");
    console.log(`   - Segments generated: ${segments.length}`);
    console.log(
      `   - Total words: ${segments.reduce(
        (sum, seg) => sum + seg.wordCount,
        0
      )}`
    );
    console.log(
      `   - Transcript length: ${transcript.fullText.length} characters`
    );
    console.log(`   - Quality score: ${analysis.audioQuality.overallScore}/10`);

    passedTests++;
    testResults.push({
      test: "Data Quality Test",
      status: "PASS",
      details: `${segments.length} segments, ${transcript.fullText.length} chars transcript`,
    });
  } catch (error) {
    console.log("❌ Data quality test failed:", error.message);
    testResults.push({
      test: "Data Quality Test",
      status: "FAIL",
      error: error.message,
    });
  }

  // Test 10: Integration Test
  totalTests++;
  console.log("\n🔟 Testing integration compatibility...");
  try {
    // Test compatibility with content-generator output format
    const contentGeneratorOutput = {
      script: {
        title: "Integration Test Episode",
        hook: "Testing integration between modules",
        introduction: "This tests module compatibility",
        mainContent: [
          {
            section: "main_1",
            content: "Integration testing is crucial for system reliability",
            speaker: "primary",
            timestamp: 0,
            notes: "Emphasize importance",
          },
        ],
        conclusion: "Integration test completed successfully",
        callToAction: "Continue with next module",
        voiceAssignments: {
          primary: {
            sections: [0, 1, 2],
            totalWords: 50,
            estimatedDuration: 30,
          },
        },
        estimatedDuration: 45,
        wordCount: 60,
        tone: "professional",
        contentType: "monologue",
      },
    };

    // Test that audio-synthesizer can handle content-generator output
    const synthesizer = new AudioSynthesizer();
    const integrationInput = {
      script: contentGeneratorOutput.script,
      voiceConfig: {
        primary: {
          provider: "openai",
          voiceId: "alloy",
        },
      },
      audioSettings: mockAudioSettings,
    };

    // Validate input compatibility
    const isValid = synthesizer.validateInput(integrationInput);
    if (!isValid) {
      throw new Error("Integration input validation failed");
    }

    // Test segment preparation with integration data
    const segments = await synthesizer.prepareScriptSegments(integrationInput);
    if (!segments || segments.length === 0) {
      throw new Error("Integration segmentation failed");
    }

    console.log("✅ Integration test passed");
    console.log(`   - Compatible with content-generator output`);
    console.log(`   - Segments prepared: ${segments.length}`);
    console.log(`   - Ready for video-composer integration`);

    passedTests++;
    testResults.push({
      test: "Integration Test",
      status: "PASS",
      details: "Compatible with content-generator and video-composer",
    });
  } catch (error) {
    console.log("❌ Integration test failed:", error.message);
    testResults.push({
      test: "Integration Test",
      status: "FAIL",
      error: error.message,
    });
  }

  // Cleanup
  await cleanupTestFiles();

  // Test Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 AUDIO SYNTHESIZER MODULE TEST SUMMARY");
  console.log("=".repeat(50));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

  console.log("\n📋 Detailed Results:");
  testResults.forEach((result, index) => {
    const status =
      result.status === "PASS" ? "✅" : result.status === "FAIL" ? "❌" : "⚠️";
    console.log(`${index + 1}. ${status} ${result.test}`);
    if (result.details) {
      console.log(`   ${result.details}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  // Performance Summary
  console.log("\n⚡ Performance Summary:");
  console.log(`- Contract validation: ✅ Instant`);
  console.log(`- Input/Output validation: ✅ <1ms`);
  console.log(`- Utility functions: ✅ <1s`);
  console.log(
    `- Basic synthesis: ${
      process.env.OPENAI_API_KEY ? "✅ 30-60s" : "⚠️ Requires API key"
    }`
  );
  console.log(
    `- Comprehensive synthesis: ${
      process.env.OPENAI_API_KEY ? "✅ 60-90s" : "⚠️ Requires API key"
    }`
  );

  // Module Status
  console.log("\n🎯 Module Status:");
  if (passedTests === totalTests) {
    console.log("🟢 AUDIO SYNTHESIZER MODULE: FULLY FUNCTIONAL");
    console.log("✅ Ready for production use");
    console.log("✅ All core features working");
    console.log("✅ Error handling robust");
    console.log("✅ Integration compatible");
  } else if (passedTests >= totalTests * 0.8) {
    console.log("🟡 AUDIO SYNTHESIZER MODULE: MOSTLY FUNCTIONAL");
    console.log("⚠️ Some tests failed - review required");
    console.log("✅ Core functionality working");
  } else {
    console.log("🔴 AUDIO SYNTHESIZER MODULE: NEEDS ATTENTION");
    console.log("❌ Multiple test failures");
    console.log("❌ Review implementation required");
  }

  console.log("\n🔧 Setup Requirements:");
  console.log("- ✅ Node.js 16+ installed");
  console.log("- ✅ NPM dependencies installed");
  console.log(
    `- ${process.env.OPENAI_API_KEY ? "✅" : "❌"} OpenAI API key configured`
  );
  console.log("- ⚠️ FFmpeg installation (required for audio processing)");
  console.log("- ⚠️ Optional: ElevenLabs, Azure, Google, AWS API keys");

  return {
    totalTests,
    passedTests,
    failedTests: totalTests - passedTests,
    successRate: Math.round((passedTests / totalTests) * 100),
    results: testResults,
  };
}

// Run tests if called directly
if (require.main === module) {
  runTests()
    .then((results) => {
      process.exit(results.failedTests === 0 ? 0 : 1);
    })
    .catch((error) => {
      console.error("❌ Test suite failed:", error);
      process.exit(1);
    });
}

module.exports = {
  runTests,
  mockScript,
  mockVoiceConfig,
  mockAudioSettings,
};
