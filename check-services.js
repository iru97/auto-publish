#!/usr/bin/env node

// Script para verificar qué servicios están configurados y activos
require("dotenv").config();

console.log("🔍 VERIFICACIÓN DE SERVICIOS CONFIGURADOS\n");

// Verificar APIs configuradas
const services = {
  "OpenAI (GPT-4 + TTS)": !!process.env.OPENAI_API_KEY,
  "ElevenLabs (TTS Principal)": !!process.env.ELEVENLABS_API_KEY,
  "Kling AI (Video IA)": !!process.env.KLING_API_KEY,
  "Azure Speech": !!process.env.AZURE_SPEECH_KEY,
  "Google Cloud TTS": !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
  "AWS Polly": !!(
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
  ),
};

console.log("📋 APIS CONFIGURADAS:");
Object.entries(services).forEach(([service, configured]) => {
  const status = configured ? "✅ Configurado" : "❌ No configurado";
  console.log(`  ${service}: ${status}`);
});

console.log("\n🎯 SERVICIOS QUE SE USARÁN POR DEFECTO:\n");

console.log("1. 🔍 TREND DETECTOR:");
console.log("   - OpenAI GPT-4 (análisis de tendencias)");
console.log("   - Web scraping (Google Trends, Reddit, Twitter)");
console.log("   - Costo estimado: $0.05-0.10\n");

console.log("2. ✍️ CONTENT GENERATOR:");
console.log("   - OpenAI GPT-4 (generación de scripts)");
console.log("   - Análisis de texto local (Natural, Sentiment)");
console.log("   - Costo estimado: $0.10-0.25\n");

console.log("3. 🎙️ AUDIO SYNTHESIZER:");
if (process.env.ELEVENLABS_API_KEY) {
  console.log("   - ElevenLabs TTS (principal)");
  console.log("   - OpenAI TTS (fallback)");
  console.log("   - Costo estimado: $0.15-0.40");
} else if (process.env.OPENAI_API_KEY) {
  console.log("   - OpenAI TTS (principal)");
  console.log("   - Costo estimado: $0.15-0.30");
} else {
  console.log("   - ❌ Sin TTS configurado");
}
console.log("   - FFmpeg (procesamiento local)\n");

console.log("4. 🎬 VIDEO COMPOSER:");
console.log("   - Templates locales (principal) - GRATIS");
console.log("   - Canvas + Fabric.js (gráficos locales)");
console.log("   - FFmpeg (composición local)");
if (process.env.KLING_API_KEY) {
  console.log("   - Kling AI (disponible pero deshabilitado por defecto)");
}
console.log("   - Costo estimado: $0.00\n");

console.log("5. 📤 DELIVERY SYSTEM:");
console.log("   - Entrega local (principal) - GRATIS");
console.log("   - Preview HTML generado automáticamente");
console.log("   - Costo estimado: $0.00\n");

// Calcular costo total
let totalMin = 0.3;
let totalMax = 0.65;

if (process.env.ELEVENLABS_API_KEY) {
  totalMax = 0.75;
}

console.log("💰 COSTO TOTAL ESTIMADO POR VIDEO:");
console.log(`   $${totalMin.toFixed(2)} - $${totalMax.toFixed(2)} USD\n`);

console.log("🚀 PARA EJECUTAR EL SISTEMA:\n");

console.log("📋 OPCIONES DE EJECUCIÓN:\n");

console.log("1. 🤖 MODO COMPLETAMENTE AUTOMÁTICO (RECOMENDADO):");
console.log("   node run-autopublish-auto.js");
console.log("   - Detecta tendencias automáticamente");
console.log("   - Selecciona nicho y topic óptimos");
console.log("   - Genera contenido sin input del usuario");
console.log("   - Costo: $0.30-0.75 por video\n");

console.log("2. 🎯 MODO AUTOMÁTICO CON PRESETS:");
console.log("   node run-autopublish-auto.js --preset=tech");
console.log("   node run-autopublish-auto.js --preset=health");
console.log("   node run-autopublish-auto.js --preset=business");
console.log("   node run-autopublish-auto.js --preset=entertainment");
console.log("   - Filtros optimizados por categoría");
console.log("   - Configuración especializada\n");

console.log("3. 🔧 MODO MANUAL (AVANZADO):");
console.log('   node run-autopublish.js --topic "tu tema" --niche "tu nicho"');
console.log("   - Control total sobre topic y nicho");
console.log("   - Para casos específicos\n");

console.log("4. 🧪 VALIDACIÓN DE CONFIGURACIÓN:");
console.log("   node run-autopublish-auto.js --dry-run");
console.log("   - Verifica configuración sin ejecutar");
console.log("   - Útil para debugging\n");

console.log("💡 RECOMENDACIÓN:");
console.log("   Empieza con: node run-autopublish-auto.js");
console.log("   El sistema detectará automáticamente las mejores tendencias\n");

// Verificar dependencias críticas
console.log("🔧 VERIFICANDO DEPENDENCIAS CRÍTICAS:\n");

try {
  require("openai");
  console.log("✅ OpenAI SDK instalado");
} catch (e) {
  console.log("❌ OpenAI SDK no instalado");
}

try {
  require("fluent-ffmpeg");
  console.log("✅ FFmpeg wrapper instalado");
} catch (e) {
  console.log("❌ FFmpeg wrapper no instalado");
}

try {
  require("canvas");
  console.log("✅ Canvas instalado");
} catch (e) {
  console.log("❌ Canvas no instalado");
}

console.log(
  "\n✨ Sistema listo para usar con servicios locales y APIs mínimas!"
);
