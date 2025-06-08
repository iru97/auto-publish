// Contrato del módulo trend-detector en JavaScript
const trendDetectorContract = {
  name: "trend-detector",
  version: "1.0.0",
  description:
    "Detecta tendencias globales y selecciona subnichos con potencial de engagement y monetización",

  input: {
    required: {},
    optional: {
      keywords: { type: "array", items: { type: "string" } },
      sources: { type: "array", items: { type: "string" } },
      timeframe: { type: "string", default: "7d" },
      region: { type: "string", default: "global" },
      minEngagement: { type: "number", default: 50 },
      maxSaturation: { type: "number", default: 70 },
    },
  },

  output: {
    selectedNiche: {
      type: "object",
      required: [
        "name",
        "description",
        "category",
        "metrics",
        "reasoning",
        "confidence",
      ],
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        category: { type: "string" },
        metrics: {
          type: "object",
          properties: {
            searchVolume: { type: "number" },
            growthRate: { type: "number" },
            competition: { type: "number" },
            engagement: { type: "number" },
            saturation: { type: "number" },
            viralPotential: { type: "number" },
          },
        },
        sources: { type: "array", items: { type: "string" } },
        keywords: { type: "array", items: { type: "string" } },
        reasoning: { type: "string" },
        confidence: { type: "number" },
      },
    },
    alternatives: {
      type: "array",
      items: { type: "object" },
    },
    metadata: {
      type: "object",
      required: ["timestamp", "totalTrendsAnalyzed", "processingTime"],
      properties: {
        timestamp: { type: "string" },
        totalTrendsAnalyzed: { type: "number" },
        sourcesUsed: { type: "array", items: { type: "string" } },
        processingTime: { type: "number" },
        apiCalls: { type: "number" },
        costEstimate: { type: "number" },
      },
    },
  },

  dependencies: ["google-trends-api", "axios", "cheerio", "openai", "dotenv"],

  metadata: {
    estimatedDuration: 45,
    costEstimate: 0.15,
    reliability: 0.85,
  },
};

module.exports = {
  contract: trendDetectorContract,
  trendDetectorContract,
};
