#!/usr/bin/env node

/**
 * Auto-Publish System - Ejecución Completamente Automática
 * Detecta tendencias automáticamente y genera contenido sin input del usuario
 */

require("dotenv").config();

// Configurar modo de desarrollo para evitar validaciones estrictas de dependencias
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "test";
}

const WorkflowEngine = require("./core/workflow-engine.js");
const completeWorkflow = require("./workflows/complete-autopublish-workflow.js");

// Configuración por defecto para ejecución automática
const DEFAULT_CONFIG = {
  // Trend detection inputs with 90-day analysis
  trends: {
    keywords: [], // Empty array for auto-detection
    timeframe: "90d", // Changed from 30d to 90d for better trend analysis
    sources: ["google-trends", "reddit", "twitter"],
    region: "global",
    minEngagement: 60, // Increased from 50 for higher quality trends
    maxSaturation: 65, // Decreased from 70 for less saturated markets
  },

  // Enhanced content generation for longer videos
  content: {
    contentType: "monologue",
    tone: "engaging", // Changed from casual to more engaging
    duration: 150, // Increased from 90 to 150 seconds (2.5 minutes)
    language: "en",
    targetPlatform: "youtube", // Optimized for longer content
    includeHooks: true,
    includeCallToAction: true,
    includeStatistics: true,
    includePersonalStories: true, // Enable for more engaging content
    creativityLevel: 8, // Increased from 7
    engagementFocus: 9, // Increased from 8
  },

  // Enhanced audio synthesis
  audio: {
    voice: "nova", // High-quality OpenAI voice
    speed: 0.95, // Slightly slower for better comprehension
    quality: "hd",
    format: "mp3",
  },

  // Enhanced video composition with DALL-E 3
  video: {
    resolution: { width: 1080, height: 1920 }, // Vertical format for social media
    frameRate: 30,
    quality: "high",
    codec: "h264",

    // Visual enhancements with AI
    visualStyle: {
      template: "dynamic", // Changed from podcast to dynamic
      backgroundColor: "#0f0f0f",
      primaryColor: "#ffffff",
      accentColor: "#00ff88",
      layout: "fullscreen",
    },

    // AI Visual Generation Configuration
    aiVisuals: {
      enabled: true, // Enable AI visual generation
      provider: "dalle3", // Use DALL-E 3 for high-quality images
      style: "realistic", // Professional realistic style
      sceneCount: 6, // More scenes for longer video
      transitionDuration: 0.5,
    },

    // Enhanced subtitles
    subtitles: {
      enabled: true,
      style: "dynamic", // More engaging subtitle style
      fontSize: 48, // Larger for mobile viewing
      fontFamily: "Arial Black",
      color: "#ffffff",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      position: "center",
      animation: "fadeIn", // Add animation
      timing: "optimized", // Better timing for comprehension
    },

    // Audio visualizer for engagement
    visualizer: {
      enabled: true,
      type: "bars", // Visual bars that react to audio
      position: "bottom",
      color: "#00ff88",
      opacity: 0.6,
    },

    // Branding elements
    branding: {
      enabled: false, // Disable for now
      logo: null,
      watermark: null,
    },
  },

  // Delivery configuration
  delivery: {
    outputFormats: ["mp4"],
    platforms: ["youtube", "tiktok", "instagram"], // Multiple platform variants
    generateThumbnail: true,
    generatePreview: true,
    autoOptimize: true,
  },
};

/**
 * Función principal de ejecución automática
 */
async function runAutoPublish(customConfig = {}) {
  console.log("🚀 INICIANDO AUTO-PUBLISH AUTOMÁTICO\\n");

  try {
    // Verificar configuración mínima
    await verifyConfiguration();

    // Combinar configuración por defecto con personalizada
    const config = mergeConfig(DEFAULT_CONFIG, customConfig);

    console.log("⚙️ Configuración:");
    console.log(`   Timeframe: ${config.trends.timeframe}`);
    console.log(`   Fuentes: ${config.trends.sources.join(", ")}`);
    console.log(`   Duración contenido: ${config.content.duration}s`);
    console.log(`   Voz: ${config.audio.voice}`);
    console.log(
      `   AI Visuals: ${config.video.aiVisuals.enabled ? config.video.aiVisuals.provider : "disabled"}`
    );
    console.log(`   Plataformas: ${config.delivery.platforms.join(", ")}\\n`);

    // Inicializar motor de workflow
    const engine = new WorkflowEngine();

    // Configurar listeners para progreso
    setupProgressListeners(engine);

    // Ejecutar workflow completo
    console.log("🔍 Iniciando análisis automático de tendencias...");
    const result = await engine.execute(completeWorkflow, config);

    // Mostrar resultados
    displayResults(result);

    return result;
  } catch (error) {
    console.error("❌ Error en ejecución automática:", error.message);

    if (error.code) {
      console.error(`   Código: ${error.code}`);
    }

    if (error.details) {
      console.error("   Detalles:", JSON.stringify(error.details, null, 2));
    }

    process.exit(1);
  }
}

/**
 * Verificar que la configuración mínima esté disponible
 */
async function verifyConfiguration() {
  const requiredEnvVars = ["OPENAI_API_KEY"];
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    throw new Error(`Variables de entorno faltantes: ${missing.join(", ")}`);
  }

  // Verificar que al menos un TTS esté configurado
  const ttsProviders = [
    "ELEVENLABS_API_KEY",
    "OPENAI_API_KEY",
    "AZURE_SPEECH_KEY",
    "GOOGLE_APPLICATION_CREDENTIALS",
  ];

  const availableTTS = ttsProviders.filter((provider) => process.env[provider]);

  if (availableTTS.length === 0) {
    throw new Error("No hay proveedores de TTS configurados");
  }

  console.log("✅ Configuración verificada");
  console.log(`   TTS disponibles: ${availableTTS.length}`);
  console.log(
    `   APIs configuradas: ${Object.keys(process.env).filter((k) => k.includes("API_KEY")).length}\\n`
  );
}

/**
 * Combinar configuraciones
 */
function mergeConfig(defaultConfig, customConfig) {
  return {
    ...defaultConfig,
    ...customConfig,
    trends: {
      ...defaultConfig.trends,
      ...(customConfig.trends || {}),
    },
    content: {
      ...defaultConfig.content,
      ...(customConfig.content || {}),
    },
    audio: {
      ...defaultConfig.audio,
      ...(customConfig.audio || {}),
    },
    video: {
      ...defaultConfig.video,
      ...(customConfig.video || {}),
      visualStyle: {
        ...defaultConfig.video.visualStyle,
        ...(customConfig.video?.visualStyle || {}),
      },
      aiVisuals: {
        ...defaultConfig.video.aiVisuals,
        ...(customConfig.video?.aiVisuals || {}),
      },
      subtitles: {
        ...defaultConfig.video.subtitles,
        ...(customConfig.video?.subtitles || {}),
      },
      visualizer: {
        ...defaultConfig.video.visualizer,
        ...(customConfig.video?.visualizer || {}),
      },
      branding: {
        ...defaultConfig.video.branding,
        ...(customConfig.video?.branding || {}),
      },
    },
    delivery: {
      ...defaultConfig.delivery,
      ...(customConfig.delivery || {}),
    },
  };
}

/**
 * Configurar listeners de progreso
 */
function setupProgressListeners(engine) {
  engine.on("stepStart", (data) => {
    console.log(`\\n🔄 ${data.step.name}: ${data.step.description}`);
  });

  engine.on("stepProgress", (data) => {
    if (data.details) {
      console.log(`   ${data.details}`);
    }
  });

  engine.on("stepComplete", (data) => {
    const duration = ((Date.now() - data.startTime) / 1000).toFixed(1);
    console.log(`✅ ${data.step.name} completado (${duration}s)`);

    // Mostrar información clave del resultado
    if (data.step.name === "trend-detection" && data.result) {
      console.log(
        `   📊 Nicho detectado: ${data.result.selectedNiche || "N/A"}`
      );
      console.log(`   🎯 Topic: ${data.result.trendingTopic || "N/A"}`);
      if (data.result.opportunityScore) {
        console.log(`   ⭐ Puntuación: ${data.result.opportunityScore}/10`);
      }
    }

    if (data.step.name === "content-generation" && data.result) {
      console.log(
        `   📝 Script generado: ${data.result.wordCount || "N/A"} palabras`
      );
      console.log(
        `   ⏱️ Duración estimada: ${data.result.estimatedDuration || "N/A"}s`
      );
    }

    if (data.step.name === "audio-synthesis" && data.result) {
      console.log(
        `   🎙️ Audio generado: ${data.result.audioDuration || "N/A"}s`
      );
      console.log(`   📁 Archivo: ${data.result.audioFile || "N/A"}`);
    }

    if (data.step.name === "video-composition" && data.result) {
      console.log(
        `   🎬 Video generado: ${data.result.videoDuration || "N/A"}s`
      );
      console.log(`   📁 Archivo: ${data.result.videoFile || "N/A"}`);
    }

    if (data.step.name === "content-delivery" && data.result) {
      console.log(`   📤 Entregado en: ${data.result.deliveryUrl || "local"}`);
      console.log(`   📊 Estado: ${data.result.deliveryStatus || "N/A"}`);
    }
  });

  engine.on("stepError", (data) => {
    console.error(`❌ Error en ${data.step.name}: ${data.error.message}`);
  });

  engine.on("workflowComplete", (data) => {
    const totalDuration = ((Date.now() - data.startTime) / 1000 / 60).toFixed(
      1
    );
    console.log(`\\n🎉 Workflow completado en ${totalDuration} minutos`);
  });
}

/**
 * Mostrar resultados finales
 */
function displayResults(result) {
  console.log("\\n📋 RESUMEN DE RESULTADOS:\\n");

  // Información del contenido generado
  if (result.deliverables) {
    console.log("📁 ARCHIVOS GENERADOS:");

    if (result.deliverables.video) {
      console.log(`   🎬 Video: ${result.deliverables.video.file}`);
      console.log(`   📏 Resolución: ${result.deliverables.video.duration}s`);
      console.log(
        `   💾 Tamaño: ${(result.deliverables.video.size / 1024 / 1024).toFixed(1)}MB`
      );
    }

    if (result.deliverables.audio) {
      console.log(`   🎙️ Audio: ${result.deliverables.audio.file}`);
      console.log(`   ⏱️ Duración: ${result.deliverables.audio.duration}s`);
    }

    if (result.deliverables.transcript) {
      console.log(
        `   📝 Transcripción: ${result.deliverables.transcript.text}`
      );
    }

    if (result.deliverables.metadata) {
      console.log(`   🏷️ Título: ${result.deliverables.metadata.title}`);
      console.log(`   🎯 Nicho: ${result.deliverables.metadata.niche}`);
      console.log(`   📊 Topic: ${result.deliverables.metadata.topic}`);
    }
  }

  // Métricas de calidad
  if (result.analytics?.quality) {
    console.log("\\n📊 MÉTRICAS DE CALIDAD:");
    console.log(`   🎙️ Audio: ${result.analytics.quality.audioQuality}/10`);
    console.log(`   🎬 Video: ${result.analytics.quality.videoQuality}/10`);
    console.log(
      `   📝 Contenido: ${result.analytics.quality.contentQuality}/10`
    );
    console.log(`   ⭐ General: ${result.analytics.quality.overallScore}/10`);
  }

  // Información de costos
  if (result.analytics?.costs) {
    console.log("\\n💰 COSTOS:");
    console.log(
      `   💵 Total: $${result.analytics.costs.totalCost.toFixed(3)} USD`
    );

    if (result.analytics.costs.costBreakdown) {
      Object.entries(result.analytics.costs.costBreakdown).forEach(
        ([service, cost]) => {
          console.log(`   ${service}: $${cost.toFixed(3)}`);
        }
      );
    }
  }

  // Performance
  if (result.analytics?.performance) {
    console.log("\\n⚡ PERFORMANCE:");
    console.log(
      `   ⏱️ Tiempo total: ${(result.analytics.performance.totalTime / 1000 / 60).toFixed(1)} min`
    );

    if (result.analytics.performance.stepTimes) {
      Object.entries(result.analytics.performance.stepTimes).forEach(
        ([step, time]) => {
          console.log(`   ${step}: ${(time / 1000).toFixed(1)}s`);
        }
      );
    }
  }

  // Información de entrega
  if (result.delivery) {
    console.log("\\n📤 ENTREGA:");
    console.log(`   📍 Plataforma: ${result.delivery.platform}`);
    console.log(`   ✅ Estado: ${result.delivery.status}`);

    if (result.delivery.url) {
      console.log(`   🔗 URL: ${result.delivery.url}`);
    }
  }

  console.log("\\n✨ ¡Contenido generado automáticamente con éxito!");
}

/**
 * Configuraciones predefinidas para diferentes casos de uso
 */
const PRESETS = {
  // Configuración para contenido tecnológico
  tech: {
    advanced: {
      trendFilters: {
        categories: ["technology", "business", "innovation"],
        minVolume: 2000,
      },
      contentStyle: "educational",
      aiEnhancement: {
        creativity: 0.8,
        factChecking: true,
      },
    },
  },

  // Configuración para contenido de salud y bienestar
  health: {
    advanced: {
      trendFilters: {
        categories: ["health", "fitness", "wellness", "nutrition"],
        minVolume: 1500,
      },
      contentStyle: "educational",
      aiEnhancement: {
        creativity: 0.6,
        factChecking: true,
        sentimentTarget: "positive",
      },
    },
  },

  // Configuración para entretenimiento
  entertainment: {
    advanced: {
      trendFilters: {
        categories: ["entertainment", "lifestyle", "culture"],
        minVolume: 3000,
      },
      contentStyle: "entertainment",
      aiEnhancement: {
        creativity: 0.9,
        sentimentTarget: "engaging",
      },
    },
  },

  // Configuración para negocios
  business: {
    advanced: {
      trendFilters: {
        categories: ["business", "finance", "entrepreneurship"],
        minVolume: 1000,
      },
      contentStyle: "educational",
      videoTemplate: "corporate",
      aiEnhancement: {
        creativity: 0.7,
        factChecking: true,
      },
    },
  },
};

// Manejo de argumentos de línea de comandos
if (require.main === module) {
  const args = process.argv.slice(2);
  const preset = args.find((arg) => arg.startsWith("--preset="))?.split("=")[1];
  const verbose = args.includes("--verbose");
  const dryRun = args.includes("--dry-run");

  // Configurar logging
  if (verbose) {
    process.env.LOG_LEVEL = "debug";
  }

  // Seleccionar configuración
  let config = {};
  if (preset && PRESETS[preset]) {
    config = PRESETS[preset];
    console.log(`🎯 Usando preset: ${preset}\\n`);
  }

  // Dry run para testing
  if (dryRun) {
    console.log("🧪 DRY RUN - Solo validación de configuración\\n");
    verifyConfiguration()
      .then(() => {
        console.log("✅ Configuración válida para ejecución automática");
        console.log("💡 Para ejecutar realmente, quita el flag --dry-run");
      })
      .catch((error) => {
        console.error("❌ Error en configuración:", error.message);
        process.exit(1);
      });
  } else {
    // Ejecución real
    runAutoPublish(config);
  }
}

module.exports = {
  runAutoPublish,
  PRESETS,
  DEFAULT_CONFIG,
};
