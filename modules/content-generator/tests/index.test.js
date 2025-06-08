/**
 * Content Generator Module Tests
 * Comprehensive test suite for content generation functionality
 */

const contentGenerator = require("../index");
const contract = require("../contract");

// Test data
const mockResearchData = {
  niche: {
    name: "Sustainable Living",
    description: "Eco-friendly lifestyle and environmental consciousness",
    category: "lifestyle",
    keywords: [
      "sustainability",
      "eco-friendly",
      "green living",
      "environment",
      "climate",
    ],
    metrics: {
      searchVolume: 15000,
      competition: 0.7,
      trend: 8.5,
      engagement: 7.2,
    },
  },
  keyInsights: [
    {
      insight:
        "70% of consumers want to buy from sustainable brands but only 35% actually do",
      source: "Environmental Research Institute 2024",
      confidence: 0.9,
      impact: "high",
    },
    {
      insight: "Simple energy-saving habits can reduce household bills by 25%",
      source: "Energy Efficiency Council",
      confidence: 0.85,
      impact: "high",
    },
    {
      insight:
        "Millennials are 3x more likely to pay premium for sustainable products",
      source: "Consumer Behavior Study",
      confidence: 0.8,
      impact: "medium",
    },
  ],
  contentAngles: [
    {
      angle: "Simple daily habits that save the planet and your wallet",
      description: "Easy sustainable practices that reduce costs",
      viralPotential: 8.5,
      difficulty: "easy",
      targetAudience: "environmentally conscious millennials",
    },
    {
      angle: "The hidden costs of not going green",
      description: "Financial impact of unsustainable choices",
      viralPotential: 7.8,
      difficulty: "medium",
      targetAudience: "budget-conscious consumers",
    },
  ],
  audienceAnalysis: {
    demographics: {
      ageRange: "25-40",
      gender: "mixed",
      interests: ["environment", "health", "lifestyle", "money-saving", "DIY"],
      painPoints: [
        "expensive eco products",
        "time constraints",
        "information overload",
      ],
      motivations: [
        "save money",
        "help environment",
        "healthy living",
        "social responsibility",
      ],
    },
    behavior: {
      contentPreferences: [
        "how-to guides",
        "quick tips",
        "personal stories",
        "statistics",
      ],
      engagementPatterns: [
        "comments on tips",
        "shares practical advice",
        "saves for later",
      ],
      platforms: ["instagram", "tiktok", "youtube", "pinterest"],
    },
  },
  competitorAnalysis: [
    {
      name: "EcoLifestyle Channel",
      type: "channel",
      strengths: ["high production value", "expert interviews"],
      weaknesses: ["slow pacing", "too technical"],
      contentGaps: ["beginner-friendly content", "budget focus"],
    },
  ],
  contentGaps: [
    {
      gap: "Affordable sustainable living for beginners",
      opportunity: "Create budget-friendly eco content",
      difficulty: 3,
      potential: 8.5,
    },
    {
      gap: "Quick sustainable swaps for busy people",
      opportunity: "Time-efficient eco tips",
      difficulty: 2,
      potential: 9.0,
    },
  ],
};

// Test utilities
function runTest(testName, testFunction) {
  console.log(`\n🧪 Running: ${testName}`);
  try {
    const result = testFunction();
    if (result instanceof Promise) {
      return result
        .then(() => {
          console.log(`✅ PASSED: ${testName}`);
          return true;
        })
        .catch((error) => {
          console.log(`❌ FAILED: ${testName}`);
          console.log(`   Error: ${error.message}`);
          return false;
        });
    } else {
      console.log(`✅ PASSED: ${testName}`);
      return true;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${testName}`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

function validateScriptStructure(script) {
  const required = [
    "title",
    "hook",
    "introduction",
    "mainContent",
    "conclusion",
    "estimatedDuration",
    "wordCount",
  ];
  for (const field of required) {
    if (!script[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  if (!Array.isArray(script.mainContent) || script.mainContent.length === 0) {
    throw new Error("mainContent must be a non-empty array");
  }

  if (
    typeof script.estimatedDuration !== "number" ||
    script.estimatedDuration <= 0
  ) {
    throw new Error("estimatedDuration must be a positive number");
  }

  if (typeof script.wordCount !== "number" || script.wordCount <= 0) {
    throw new Error("wordCount must be a positive number");
  }
}

function validateAnalysis(analysis) {
  const requiredMetrics = [
    "hookStrength",
    "retentionPotential",
    "viralPotential",
    "emotionalImpact",
    "factualAccuracy",
    "originalityScore",
    "relevanceScore",
    "clarityScore",
    "seoScore",
    "trendAlignment",
    "audienceAlignment",
    "demographicFit",
    "platformOptimization",
  ];

  for (const metric of requiredMetrics) {
    if (
      typeof analysis[metric] !== "number" ||
      analysis[metric] < 1 ||
      analysis[metric] > 10
    ) {
      throw new Error(`Invalid ${metric}: must be number between 1-10`);
    }
  }

  if (!analysis.keywordDensity || typeof analysis.keywordDensity !== "object") {
    throw new Error("keywordDensity must be an object");
  }
}

// Test Suite
async function runAllTests() {
  console.log("🚀 Starting Content Generator Module Tests");
  console.log("==========================================");

  const results = [];

  // Test 1: Contract Validation
  results.push(
    await runTest("Contract Validation", () => {
      if (!contract.name || contract.name !== "content-generator") {
        throw new Error("Invalid contract name");
      }

      if (!contract.version || !contract.description) {
        throw new Error("Missing contract metadata");
      }

      if (!contract.dependencies || !contract.dependencies.required) {
        throw new Error("Missing contract dependencies");
      }

      if (!contract.validateInput || !contract.validateOutput) {
        throw new Error("Missing validation functions");
      }

      return true;
    })
  );

  // Test 2: Input Validation - Valid Input
  results.push(
    await runTest("Input Validation - Valid Input", () => {
      const validInput = {
        research: mockResearchData,
        contentType: "monologue",
        tone: "casual",
        duration: 90,
      };

      const validation = contract.validateInput(validInput);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      return true;
    })
  );

  // Test 3: Input Validation - Invalid Input
  results.push(
    await runTest("Input Validation - Invalid Input", () => {
      const invalidInputs = [
        {},
        { research: null },
        { research: { niche: null } },
        { research: mockResearchData, duration: -1 },
        { research: mockResearchData, creativityLevel: 15 },
      ];

      for (const input of invalidInputs) {
        const validation = contract.validateInput(input);
        if (validation.valid) {
          throw new Error(
            `Should have failed validation for: ${JSON.stringify(input)}`
          );
        }
      }

      return true;
    })
  );

  // Test 4: Basic Content Generation
  results.push(
    await runTest("Basic Content Generation", async () => {
      const input = {
        research: mockResearchData,
        contentType: "monologue",
        tone: "casual",
        duration: 90,
        targetPlatform: "generic",
      };

      const result = await contentGenerator.execute(input);

      // Validate basic structure
      if (!result.script || !result.analysis || !result.metadata) {
        throw new Error("Missing required output sections");
      }

      validateScriptStructure(result.script);
      validateAnalysis(result.analysis);

      // Check script content quality
      if (result.script.title.length < 10) {
        throw new Error("Title too short");
      }

      if (result.script.hook.length < 20) {
        throw new Error("Hook too short");
      }

      if (result.script.mainContent.length < 1) {
        throw new Error("Insufficient main content");
      }

      return true;
    })
  );

  // Test 5: Advanced Content Generation
  results.push(
    await runTest("Advanced Content Generation", async () => {
      const input = {
        research: mockResearchData,
        contentType: "dialogue",
        tone: "professional",
        duration: 120,
        targetPlatform: "youtube",
        includeHooks: true,
        includeCallToAction: true,
        includeStatistics: true,
        creativityLevel: 8,
        factualAccuracy: 9,
        engagementFocus: 8,
        voices: {
          primary: {
            name: "Alex",
            personality: "enthusiastic expert",
            role: "host",
          },
          secondary: {
            name: "Sam",
            personality: "curious learner",
            role: "co-host",
          },
        },
      };

      const result = await contentGenerator.execute(input);

      // Validate advanced features
      if (!result.script.callToAction) {
        throw new Error("Missing call to action");
      }

      if (!result.script.voiceAssignments.secondary) {
        throw new Error("Missing secondary voice assignment for dialogue");
      }

      if (!result.variations || result.variations.length === 0) {
        throw new Error("Missing content variations");
      }

      if (!result.productionNotes) {
        throw new Error("Missing production notes");
      }

      if (!result.predictions) {
        throw new Error("Missing performance predictions");
      }

      return true;
    })
  );

  // Test 6: Platform-Specific Optimization
  results.push(
    await runTest("Platform-Specific Optimization", async () => {
      const platforms = ["tiktok", "youtube", "instagram", "spotify"];

      for (const platform of platforms) {
        const input = {
          research: mockResearchData,
          targetPlatform: platform,
          duration:
            platform === "tiktok" ? 60 : platform === "spotify" ? 300 : 120,
        };

        const result = await contentGenerator.execute(input);

        // Platform-specific validations
        if (platform === "tiktok" && result.script.estimatedDuration > 180) {
          throw new Error(
            `TikTok content too long: ${result.script.estimatedDuration}s`
          );
        }

        if (platform === "instagram" && result.script.estimatedDuration > 90) {
          throw new Error(
            `Instagram content too long: ${result.script.estimatedDuration}s`
          );
        }

        // Check platform optimization score
        if (result.analysis.platformOptimization < 6) {
          throw new Error(
            `Low platform optimization for ${platform}: ${result.analysis.platformOptimization}`
          );
        }
      }

      return true;
    })
  );

  // Test 7: Content Quality Metrics
  results.push(
    await runTest("Content Quality Metrics", async () => {
      const input = {
        research: mockResearchData,
        factualAccuracy: 9,
        creativityLevel: 8,
        engagementFocus: 9,
      };

      const result = await contentGenerator.execute(input);

      // Quality thresholds
      if (result.analysis.factualAccuracy < 7) {
        throw new Error(
          `Low factual accuracy: ${result.analysis.factualAccuracy}`
        );
      }

      if (result.analysis.relevanceScore < 6) {
        throw new Error(
          `Low relevance score: ${result.analysis.relevanceScore}`
        );
      }

      if (result.analysis.clarityScore < 6) {
        throw new Error(`Low clarity score: ${result.analysis.clarityScore}`);
      }

      if (result.metadata.qualityScore < 60) {
        throw new Error(
          `Overall quality too low: ${result.metadata.qualityScore}`
        );
      }

      if (result.metadata.confidenceScore < 50) {
        throw new Error(
          `Confidence too low: ${result.metadata.confidenceScore}`
        );
      }

      return true;
    })
  );

  // Test 8: Content Variations Generation
  results.push(
    await runTest("Content Variations Generation", async () => {
      const input = {
        research: mockResearchData,
        duration: 120, // Long enough to generate shorter variation
      };

      const result = await contentGenerator.execute(input);

      if (!result.variations || result.variations.length === 0) {
        throw new Error("No variations generated");
      }

      // Check variation types
      const variationTypes = result.variations.map((v) => v.type);
      const expectedTypes = ["shorter", "longer", "different_tone"];

      let hasValidVariation = false;
      for (const type of expectedTypes) {
        if (variationTypes.includes(type)) {
          hasValidVariation = true;
          break;
        }
      }

      if (!hasValidVariation) {
        throw new Error("No valid variation types found");
      }

      // Validate variation structure
      for (const variation of result.variations) {
        if (
          !variation.title ||
          !variation.hook ||
          !variation.keyChanges ||
          typeof variation.estimatedDuration !== "number"
        ) {
          throw new Error("Invalid variation structure");
        }
      }

      return true;
    })
  );

  // Test 9: Error Handling
  results.push(
    await runTest("Error Handling", async () => {
      // Test various error conditions
      const errorTests = [
        {
          input: null,
          expectedError: "Invalid input",
        },
        {
          input: {},
          expectedError: "Research data is required",
        },
        {
          input: { research: { niche: null } },
          expectedError: "Research niche data is required",
        },
      ];

      for (const test of errorTests) {
        try {
          await contentGenerator.execute(test.input);
          throw new Error(
            `Should have thrown error for: ${JSON.stringify(test.input)}`
          );
        } catch (error) {
          if (!error.message.includes(test.expectedError)) {
            throw new Error(
              `Wrong error message. Expected: ${test.expectedError}, Got: ${error.message}`
            );
          }
        }
      }

      return true;
    })
  );

  // Test 10: Performance Benchmarks
  results.push(
    await runTest("Performance Benchmarks", async () => {
      const startTime = Date.now();

      const input = {
        research: mockResearchData,
        contentType: "monologue",
        duration: 90,
      };

      const result = await contentGenerator.execute(input);

      const executionTime = Date.now() - startTime;

      // Performance thresholds
      if (executionTime > 180000) {
        // 3 minutes
        throw new Error(`Execution too slow: ${executionTime}ms`);
      }

      if (result.metadata.processingTime > executionTime + 1000) {
        throw new Error("Inconsistent processing time reporting");
      }

      // Memory usage check (basic)
      const memUsage = process.memoryUsage();
      if (memUsage.heapUsed > 500 * 1024 * 1024) {
        // 500MB
        console.warn(
          `High memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`
        );
      }

      console.log(`   ⏱️  Execution time: ${executionTime}ms`);
      console.log(
        `   💾 Memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`
      );

      return true;
    })
  );

  // Test 11: Integration with Topic Researcher Output
  results.push(
    await runTest("Integration with Topic Researcher Output", async () => {
      // Simulate topic-researcher output format
      const topicResearcherOutput = {
        research: mockResearchData,
        recommendations: {
          contentType: "monologue",
          targetPlatform: "tiktok",
          estimatedEngagement: 8.5,
        },
      };

      const input = {
        research: topicResearcherOutput.research,
        contentType: topicResearcherOutput.recommendations.contentType,
        targetPlatform: topicResearcherOutput.recommendations.targetPlatform,
      };

      const result = await contentGenerator.execute(input);

      // Validate integration compatibility
      if (result.analysis.audienceAlignment < 6) {
        throw new Error("Poor integration with research data");
      }

      // Check if research insights are utilized
      const scriptText = [
        result.script.title,
        result.script.hook,
        result.script.introduction,
        ...result.script.mainContent.map((section) => section.content),
        result.script.conclusion,
      ]
        .join(" ")
        .toLowerCase();

      let insightsUsed = 0;
      for (const insight of mockResearchData.keyInsights) {
        const keywords = insight.insight.toLowerCase().split(" ").slice(0, 3);
        if (keywords.some((keyword) => scriptText.includes(keyword))) {
          insightsUsed++;
        }
      }

      if (insightsUsed === 0) {
        throw new Error("Research insights not utilized in content");
      }

      return true;
    })
  );

  // Test 12: Output Validation
  results.push(
    await runTest("Output Validation", async () => {
      const input = {
        research: mockResearchData,
      };

      const result = await contentGenerator.execute(input);

      // Validate output against contract
      const validation = contract.validateOutput(result);
      if (!validation.valid) {
        throw new Error(
          `Output validation failed: ${validation.errors.join(", ")}`
        );
      }

      // Additional output checks
      if (!result.metadata.generatedAt) {
        throw new Error("Missing generation timestamp");
      }

      if (!Array.isArray(result.metadata.aiModelsUsed)) {
        throw new Error("AI models used must be an array");
      }

      if (
        typeof result.metadata.confidenceScore !== "number" ||
        result.metadata.confidenceScore < 0 ||
        result.metadata.confidenceScore > 100
      ) {
        throw new Error("Invalid confidence score");
      }

      return true;
    })
  );

  // Results Summary
  console.log("\n📊 Test Results Summary");
  console.log("======================");

  const passed = results.filter((r) => r === true).length;
  const total = results.length;
  const passRate = Math.round((passed / total) * 100);

  console.log(`✅ Passed: ${passed}/${total} (${passRate}%)`);
  console.log(`❌ Failed: ${total - passed}/${total}`);

  if (passRate >= 90) {
    console.log("🎉 EXCELLENT: Module is ready for production!");
  } else if (passRate >= 75) {
    console.log("✅ GOOD: Module is functional with minor issues");
  } else if (passRate >= 50) {
    console.log("⚠️  WARNING: Module has significant issues");
  } else {
    console.log("🚨 CRITICAL: Module is not ready for use");
  }

  console.log("\n🏁 Content Generator Tests Completed");

  return passRate >= 75;
}

// Run tests if called directly
if (require.main === module) {
  runAllTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Test suite failed:", error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  mockResearchData,
};
