/**
 * Content Generator Module Contract (JavaScript)
 * Generates advanced podcast scripts based on topic research
 * Version: 1.0.0
 */

const contentGeneratorContract = {
  name: "content-generator",
  version: "1.0.0",
  description:
    "Advanced podcast script generation with AI-powered content creation, multi-voice support, and comprehensive analysis",

  // Input schema definition
  input: {
    required: {
      research: { type: "object" },
    },
    optional: {
      contentType: { type: "string", default: "monologue" },
      tone: { type: "string", default: "casual" },
      duration: { type: "number", default: 90 },
      language: { type: "string", default: "en" },
      targetPlatform: { type: "string", default: "generic" },
      includeHooks: { type: "boolean", default: true },
      includeCallToAction: { type: "boolean", default: true },
      includeStatistics: { type: "boolean", default: true },
      includePersonalStories: { type: "boolean", default: false },
      includeControversy: { type: "boolean", default: false },
      creativityLevel: { type: "number", default: 7 },
      factualAccuracy: { type: "number", default: 8 },
      engagementFocus: { type: "number", default: 8 },
    },
  },

  // Output schema definition
  output: {
    script: {
      type: "object",
      required: [
        "title",
        "hook",
        "introduction",
        "mainContent",
        "conclusion",
        "estimatedDuration",
        "wordCount",
      ],
      properties: {
        title: { type: "string" },
        hook: { type: "string" },
        introduction: { type: "string" },
        mainContent: { type: "array" },
        conclusion: { type: "string" },
        estimatedDuration: { type: "number" },
        wordCount: { type: "number" },
      },
    },
    analysis: { type: "object" },
    variations: { type: "array" },
    productionNotes: { type: "object" },
    predictions: { type: "object" },
    metadata: {
      type: "object",
      required: ["generatedAt", "processingTime", "totalCost"],
      properties: {
        generatedAt: { type: "string" },
        processingTime: { type: "number" },
        totalCost: { type: "number" },
      },
    },
  },

  dependencies: [
    "openai",
    "axios",
    "natural",
    "compromise",
    "sentiment",
    "franc",
    "fs-extra",
    "uuid",
    "winston",
  ],

  metadata: {
    estimatedDuration: 60,
    costEstimate: 0.15,
    reliability: 0.92,
  },
};

module.exports = {
  contract: contentGeneratorContract,
  contentGeneratorContract,

  // Validation functions
  validateInput: (input) => {
    const errors = [];

    // Check required fields
    if (!input.research || typeof input.research !== "object") {
      errors.push("research field is required and must be an object");
    }

    // Check optional fields types
    if (input.contentType && typeof input.contentType !== "string") {
      errors.push("contentType must be a string");
    }

    if (input.tone && typeof input.tone !== "string") {
      errors.push("tone must be a string");
    }

    if (input.duration && typeof input.duration !== "number") {
      errors.push("duration must be a number");
    }

    if (input.language && typeof input.language !== "string") {
      errors.push("language must be a string");
    }

    return {
      valid: errors.length === 0,
      errors: errors,
    };
  },

  validateOutput: (output) => {
    const errors = [];

    // Check required output fields
    if (!output.script || typeof output.script !== "object") {
      errors.push("script field is required and must be an object");
    } else {
      // Check script required fields
      const requiredScriptFields = [
        "title",
        "hook",
        "introduction",
        "mainContent",
        "conclusion",
        "estimatedDuration",
        "wordCount",
      ];
      requiredScriptFields.forEach((field) => {
        if (!output.script[field]) {
          errors.push(`script.${field} is required`);
        }
      });
    }

    if (!output.metadata || typeof output.metadata !== "object") {
      errors.push("metadata field is required and must be an object");
    } else {
      // Check metadata required fields
      const requiredMetadataFields = ["generatedAt", "processingTime"];
      requiredMetadataFields.forEach((field) => {
        if (output.metadata[field] === undefined) {
          errors.push(`metadata.${field} is required`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors: errors,
    };
  },
};
