export interface TrendDetectorContract {
  name: "trend-detector";
  version: "1.0.0";
  description: "Detecta tendencias globales y selecciona subnichos con potencial de engagement y monetización";

  input: {
    schema: {
      keywords?: string[]; // Palabras clave específicas para buscar
      sources?: string[]; // Fuentes específicas a consultar
      timeframe?: string; // Marco temporal (24h, 7d, 30d)
      region?: string; // Región geográfica (US, ES, global)
      minEngagement?: number; // Mínimo engagement requerido
      maxSaturation?: number; // Máximo nivel de saturación aceptable
    };
    required: []; // Todos los campos son opcionales
    optional: [
      "keywords",
      "sources",
      "timeframe",
      "region",
      "minEngagement",
      "maxSaturation"
    ];
  };

  output: {
    schema: {
      selectedNiche: {
        name: string; // Nombre del subnicho seleccionado
        description: string; // Descripción detallada
        category: string; // Categoría principal
        metrics: {
          searchVolume: number; // Volumen de búsqueda mensual
          growthRate: number; // Tasa de crecimiento (%)
          competition: number; // Nivel de competencia (0-100)
          engagement: number; // Nivel de engagement (0-100)
          saturation: number; // Nivel de saturación (0-100)
          viralPotential: number; // Potencial viral (0-100)
        };
        sources: string[]; // Fuentes donde se detectó
        keywords: string[]; // Palabras clave relacionadas
        reasoning: string; // Justificación de la elección
        confidence: number; // Nivel de confianza (0-100)
      };
      alternatives: Array<{
        name: string; // Nombre del nicho alternativo
        score: number; // Puntuación total (0-100)
        reason: string; // Razón por la que no fue elegido
        metrics: {
          searchVolume: number;
          growthRate: number;
          competition: number;
          engagement: number;
        };
      }>;
      metadata: {
        timestamp: string; // ISO timestamp de la detección
        totalTrendsAnalyzed: number; // Total de tendencias analizadas
        sourcesUsed: string[]; // Fuentes efectivamente consultadas
        processingTime: number; // Tiempo de procesamiento (ms)
        apiCalls: number; // Número de llamadas API realizadas
        costEstimate: number; // Costo estimado de la operación (USD)
      };
    };
    format: "json";
  };

  dependencies: [
    "google-trends-api", // Para Google Trends
    "axios", // Para HTTP requests
    "cheerio", // Para web scraping
    "openai", // Para análisis con IA
    "dotenv" // Para variables de entorno
  ];

  metadata: {
    estimatedDuration: 45; // 45 segundos promedio
    costEstimate: 0.15; // $0.15 USD por ejecución
    reliability: 0.85; // 85% de confiabilidad
  };
}

// Exportar el contrato como constante para uso en runtime
export const trendDetectorContract: TrendDetectorContract = {
  name: "trend-detector",
  version: "1.0.0",
  description:
    "Detecta tendencias globales y selecciona subnichos con potencial de engagement y monetización",

  input: {
    schema: {
      keywords: [],
      sources: [],
      timeframe: "7d",
      region: "global",
      minEngagement: 50,
      maxSaturation: 70,
    },
    required: [],
    optional: [
      "keywords",
      "sources",
      "timeframe",
      "region",
      "minEngagement",
      "maxSaturation",
    ],
  },

  output: {
    schema: {
      selectedNiche: {
        name: "",
        description: "",
        category: "",
        metrics: {
          searchVolume: 0,
          growthRate: 0,
          competition: 0,
          engagement: 0,
          saturation: 0,
          viralPotential: 0,
        },
        sources: [],
        keywords: [],
        reasoning: "",
        confidence: 0,
      },
      alternatives: [],
      metadata: {
        timestamp: "",
        totalTrendsAnalyzed: 0,
        sourcesUsed: [],
        processingTime: 0,
        apiCalls: 0,
        costEstimate: 0,
      },
    },
    format: "json",
  },

  dependencies: ["google-trends-api", "axios", "cheerio", "openai", "dotenv"],

  metadata: {
    estimatedDuration: 45,
    costEstimate: 0.15,
    reliability: 0.85,
  },
};
