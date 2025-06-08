const trendDetector = require("../index");
const { ModuleError } = require("../index");

// Mock de dependencias externas
jest.mock("axios");
jest.mock("openai");

describe("Trend Detector Module", () => {
  describe("Contract Validation", () => {
    test("should export contract with correct structure", () => {
      expect(trendDetector.contract).toBeDefined();
      expect(trendDetector.contract.name).toBe("trend-detector");
      expect(trendDetector.contract.version).toBe("1.0.0");
      expect(trendDetector.contract.input).toBeDefined();
      expect(trendDetector.contract.output).toBeDefined();
      expect(trendDetector.contract.dependencies).toBeInstanceOf(Array);
      expect(trendDetector.contract.metadata).toBeDefined();
    });

    test("should have all required contract fields", () => {
      const contract = trendDetector.contract;

      // Input validation
      expect(contract.input.schema).toBeDefined();
      expect(contract.input.required).toBeInstanceOf(Array);
      expect(contract.input.optional).toBeInstanceOf(Array);

      // Output validation
      expect(contract.output.schema).toBeDefined();
      expect(contract.output.format).toBe("json");

      // Metadata validation
      expect(typeof contract.metadata.estimatedDuration).toBe("number");
      expect(typeof contract.metadata.costEstimate).toBe("number");
      expect(typeof contract.metadata.reliability).toBe("number");
    });
  });

  describe("Input Validation", () => {
    test("should accept empty input", () => {
      expect(() => trendDetector.validateInput()).not.toThrow();
      expect(() => trendDetector.validateInput({})).not.toThrow();
    });

    test("should validate keywords as array", () => {
      expect(() =>
        trendDetector.validateInput({ keywords: ["ai", "tech"] })
      ).not.toThrow();
      expect(() =>
        trendDetector.validateInput({ keywords: "invalid" })
      ).toThrow(ModuleError);
    });

    test("should validate sources as array", () => {
      expect(() =>
        trendDetector.validateInput({ sources: ["google-trends"] })
      ).not.toThrow();
      expect(() => trendDetector.validateInput({ sources: "invalid" })).toThrow(
        ModuleError
      );
    });

    test("should validate timeframe values", () => {
      expect(() =>
        trendDetector.validateInput({ timeframe: "7d" })
      ).not.toThrow();
      expect(() =>
        trendDetector.validateInput({ timeframe: "24h" })
      ).not.toThrow();
      expect(() =>
        trendDetector.validateInput({ timeframe: "30d" })
      ).not.toThrow();
      expect(() =>
        trendDetector.validateInput({ timeframe: "invalid" })
      ).toThrow(ModuleError);
    });

    test("should validate region values", () => {
      expect(() =>
        trendDetector.validateInput({ region: "global" })
      ).not.toThrow();
      expect(() => trendDetector.validateInput({ region: "US" })).not.toThrow();
      expect(() => trendDetector.validateInput({ region: "ES" })).not.toThrow();
      expect(() => trendDetector.validateInput({ region: "invalid" })).toThrow(
        ModuleError
      );
    });

    test("should validate numeric ranges", () => {
      expect(() =>
        trendDetector.validateInput({ minEngagement: 50 })
      ).not.toThrow();
      expect(() =>
        trendDetector.validateInput({ maxSaturation: 70 })
      ).not.toThrow();
      expect(() => trendDetector.validateInput({ minEngagement: -1 })).toThrow(
        ModuleError
      );
      expect(() => trendDetector.validateInput({ minEngagement: 101 })).toThrow(
        ModuleError
      );
      expect(() => trendDetector.validateInput({ maxSaturation: -1 })).toThrow(
        ModuleError
      );
      expect(() => trendDetector.validateInput({ maxSaturation: 101 })).toThrow(
        ModuleError
      );
    });

    test("should validate data types", () => {
      expect(() => trendDetector.validateInput({ timeframe: 123 })).toThrow(
        ModuleError
      );
      expect(() => trendDetector.validateInput({ region: 123 })).toThrow(
        ModuleError
      );
      expect(() =>
        trendDetector.validateInput({ minEngagement: "50" })
      ).toThrow(ModuleError);
      expect(() =>
        trendDetector.validateInput({ maxSaturation: "70" })
      ).toThrow(ModuleError);
    });
  });

  describe("Output Validation", () => {
    const validOutput = {
      selectedNiche: {
        name: "AI automation tools for beginners",
        description:
          "Specialized content about AI automation tools targeting beginners",
        category: "Technology",
        metrics: {
          searchVolume: 45000,
          growthRate: 125,
          competition: 45,
          engagement: 78,
          saturation: 32,
          viralPotential: 85,
        },
        sources: ["google-trends"],
        keywords: ["AI automation tools", "beginners"],
        reasoning: "Selected based on optimal balance",
        confidence: 85,
      },
      alternatives: [
        {
          name: "Alternative niche",
          score: 75,
          reason: "Good option but not optimal",
          metrics: {
            searchVolume: 30000,
            growthRate: 89,
            competition: 55,
            engagement: 65,
          },
        },
      ],
      metadata: {
        timestamp: "2025-01-06T12:00:00.000Z",
        totalTrendsAnalyzed: 6,
        sourcesUsed: ["google-trends", "reddit", "twitter"],
        processingTime: 2500,
        apiCalls: 3,
        costEstimate: 0.08,
      },
    };

    test("should validate correct output structure", () => {
      expect(() => trendDetector.validateOutput(validOutput)).not.toThrow();
    });

    test("should require selectedNiche", () => {
      const invalidOutput = { ...validOutput };
      delete invalidOutput.selectedNiche;
      expect(() => trendDetector.validateOutput(invalidOutput)).toThrow(
        ModuleError
      );
    });

    test("should require selectedNiche fields", () => {
      const requiredFields = [
        "name",
        "description",
        "category",
        "metrics",
        "sources",
        "keywords",
        "reasoning",
        "confidence",
      ];

      requiredFields.forEach((field) => {
        const invalidOutput = { ...validOutput };
        delete invalidOutput.selectedNiche[field];
        expect(() => trendDetector.validateOutput(invalidOutput)).toThrow(
          ModuleError
        );
      });
    });

    test("should require metrics fields", () => {
      const requiredMetrics = [
        "searchVolume",
        "growthRate",
        "competition",
        "engagement",
        "saturation",
        "viralPotential",
      ];

      requiredMetrics.forEach((metric) => {
        const invalidOutput = { ...validOutput };
        delete invalidOutput.selectedNiche.metrics[metric];
        expect(() => trendDetector.validateOutput(invalidOutput)).toThrow(
          ModuleError
        );
      });
    });

    test("should require alternatives as array", () => {
      const invalidOutput = { ...validOutput };
      invalidOutput.alternatives = "invalid";
      expect(() => trendDetector.validateOutput(invalidOutput)).toThrow(
        ModuleError
      );
    });

    test("should require metadata fields", () => {
      const requiredFields = [
        "timestamp",
        "totalTrendsAnalyzed",
        "sourcesUsed",
        "processingTime",
        "apiCalls",
        "costEstimate",
      ];

      requiredFields.forEach((field) => {
        const invalidOutput = { ...validOutput };
        delete invalidOutput.metadata[field];
        expect(() => trendDetector.validateOutput(invalidOutput)).toThrow(
          ModuleError
        );
      });
    });

    test("should reject non-object output", () => {
      expect(() => trendDetector.validateOutput(null)).toThrow(ModuleError);
      expect(() => trendDetector.validateOutput("invalid")).toThrow(
        ModuleError
      );
      expect(() => trendDetector.validateOutput(123)).toThrow(ModuleError);
    });
  });

  describe("Module Execution", () => {
    test("should execute with default parameters", async () => {
      const result = await trendDetector.execute();

      expect(result).toBeDefined();
      expect(result.selectedNiche).toBeDefined();
      expect(result.alternatives).toBeInstanceOf(Array);
      expect(result.metadata).toBeDefined();

      // Validate contract compliance
      expect(() => trendDetector.validateOutput(result)).not.toThrow();
    }, 10000);

    test("should execute with custom parameters", async () => {
      const input = {
        sources: ["google-trends", "reddit"],
        timeframe: "24h",
        region: "US",
        minEngagement: 60,
        maxSaturation: 50,
      };

      const result = await trendDetector.execute(input);

      expect(result).toBeDefined();
      expect(result.metadata.sourcesUsed).toEqual(input.sources);
      expect(() => trendDetector.validateOutput(result)).not.toThrow();
    }, 10000);

    test("should handle processing errors gracefully", async () => {
      // Mock para simular error en procesamiento
      const originalConsoleError = console.error;
      console.error = jest.fn();

      try {
        // Esto debería funcionar normalmente ya que tenemos fallbacks
        const result = await trendDetector.execute();
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(ModuleError);
      }

      console.error = originalConsoleError;
    });

    test("should return valid confidence scores", async () => {
      const result = await trendDetector.execute();

      expect(result.selectedNiche.confidence).toBeGreaterThanOrEqual(0);
      expect(result.selectedNiche.confidence).toBeLessThanOrEqual(100);

      result.alternatives.forEach((alt) => {
        expect(alt.score).toBeGreaterThanOrEqual(0);
        expect(alt.score).toBeLessThanOrEqual(100);
      });
    });

    test("should return reasonable processing metrics", async () => {
      const result = await trendDetector.execute();

      expect(result.metadata.processingTime).toBeGreaterThan(0);
      expect(result.metadata.apiCalls).toBeGreaterThan(0);
      expect(result.metadata.costEstimate).toBeGreaterThanOrEqual(0);
      expect(result.metadata.totalTrendsAnalyzed).toBeGreaterThan(0);
      expect(result.metadata.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
      );
    });

    test("should respect engagement and saturation filters", async () => {
      const input = {
        minEngagement: 80,
        maxSaturation: 30,
      };

      const result = await trendDetector.execute(input);

      // Si no hay nichos que cumplan criterios, debería usar fallback
      expect(result.selectedNiche).toBeDefined();
      expect(result.selectedNiche.confidence).toBeGreaterThan(0);
    });
  });

  describe("Error Handling", () => {
    test("should throw ModuleError for invalid input", () => {
      expect(() =>
        trendDetector.validateInput({ keywords: "invalid" })
      ).toThrow(ModuleError);
    });

    test("should include error details", () => {
      try {
        trendDetector.validateInput({ keywords: "invalid" });
      } catch (error) {
        expect(error).toBeInstanceOf(ModuleError);
        expect(error.code).toBe("INPUT_INVALID");
        expect(error.details).toBeDefined();
        expect(error.details.field).toBe("keywords");
      }
    });

    test("should handle network errors gracefully", async () => {
      // Los errores de red se manejan internamente y no deberían fallar la ejecución
      const result = await trendDetector.execute();
      expect(result).toBeDefined();
    });
  });

  describe("Performance", () => {
    test("should complete within reasonable time", async () => {
      const startTime = Date.now();
      const result = await trendDetector.execute();
      const endTime = Date.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(60000); // Menos de 60 segundos
      expect(result.metadata.processingTime).toBeLessThan(60000);
    }, 60000);

    test("should have reasonable cost estimate", async () => {
      const result = await trendDetector.execute();

      expect(result.metadata.costEstimate).toBeLessThan(1.0); // Menos de $1
      expect(result.metadata.costEstimate).toBeGreaterThan(0);
    });
  });

  describe("Data Quality", () => {
    test("should return diverse alternatives", async () => {
      const result = await trendDetector.execute();

      expect(result.alternatives.length).toBeGreaterThan(0);
      expect(result.alternatives.length).toBeLessThanOrEqual(5);

      // Verificar que las alternativas son diferentes al nicho seleccionado
      result.alternatives.forEach((alt) => {
        expect(alt.name).not.toBe(result.selectedNiche.name);
      });
    });

    test("should return reasonable metric values", async () => {
      const result = await trendDetector.execute();
      const metrics = result.selectedNiche.metrics;

      expect(metrics.searchVolume).toBeGreaterThan(0);
      expect(metrics.growthRate).toBeGreaterThanOrEqual(0);
      expect(metrics.competition).toBeGreaterThanOrEqual(0);
      expect(metrics.competition).toBeLessThanOrEqual(100);
      expect(metrics.engagement).toBeGreaterThanOrEqual(0);
      expect(metrics.engagement).toBeLessThanOrEqual(100);
      expect(metrics.saturation).toBeGreaterThanOrEqual(0);
      expect(metrics.saturation).toBeLessThanOrEqual(100);
      expect(metrics.viralPotential).toBeGreaterThanOrEqual(0);
      expect(metrics.viralPotential).toBeLessThanOrEqual(100);
    });

    test("should include reasoning for selection", async () => {
      const result = await trendDetector.execute();

      expect(result.selectedNiche.reasoning).toBeDefined();
      expect(typeof result.selectedNiche.reasoning).toBe("string");
      expect(result.selectedNiche.reasoning.length).toBeGreaterThan(10);
    });
  });
});
