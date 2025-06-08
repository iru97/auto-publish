# 🎬 Workflows n8n - Sistema Automático de Vídeos

Guía completa para configurar e importar los workflows n8n del Sistema Automático de Vídeos Dubai Chocolate.

## 📋 Requisitos Previos

### 1. Instalación de n8n

```bash
# Opción 1: npm global
npm install n8n -g

# Opción 2: Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Opción 3: npx (temporal)
npx n8n
```

### 2. Dependencias del Sistema

```bash
# FFmpeg (requerido para montaje de vídeo)
# Windows: Descargar desde https://ffmpeg.org
# macOS: brew install ffmpeg
# Linux: sudo apt install ffmpeg

# Node.js Canvas (para generación de fondos)
npm install canvas

# Verificar instalación
ffmpeg -version
node -e "console.log(require('canvas'))"
```

## 🔧 Configuración de Credenciales

### 1. ElevenLabs API Key

1. Ir a [ElevenLabs](https://elevenlabs.io)
2. Crear cuenta y obtener API key
3. En n8n: **Settings** → **Credentials** → **Create New**
4. Tipo: **HTTP Header Auth**
5. Configurar:
   ```
   Name: ElevenLabs API Key
   Header Name: xi-api-key
   Header Value: [tu_api_key_aquí]
   ```

### 2. OpenAI API Key (para Whisper)

1. Ir a [OpenAI](https://platform.openai.com)
2. Crear API key
3. En n8n: **Settings** → **Credentials** → **Create New**
4. Tipo: **HTTP Header Auth**
5. Configurar:
   ```
   Name: OpenAI API Key
   Header Name: Authorization
   Header Value: Bearer [tu_api_key_aquí]
   ```

### 3. Telegram Bot (opcional)

1. Crear bot con [@BotFather](https://t.me/BotFather)
2. Obtener bot token
3. Obtener chat ID:
   ```bash
   # Enviar mensaje al bot y consultar:
   curl https://api.telegram.org/bot[TOKEN]/getUpdates
   ```
4. En n8n: **Settings** → **Credentials** → **Create New**
5. Tipo: **Telegram API**
6. Configurar:
   ```
   Name: Telegram Bot
   Access Token: [bot_token]
   ```

## 📥 Importar Workflow

### 1. Descargar Workflow

```bash
# Descargar el archivo JSON
wget https://raw.githubusercontent.com/[repo]/n8n_workflows/dubai_chocolate_complete_workflow.json

# O copiar el contenido del archivo
```

### 2. Importar en n8n

1. Abrir n8n (http://localhost:5678)
2. Click en **"+"** → **Import from File**
3. Seleccionar `dubai_chocolate_complete_workflow.json`
4. Click **Import**

### 3. Configurar Credenciales

1. Abrir el workflow importado
2. Click en cada nodo que requiera credenciales:
   - **ElevenLabs TTS**: Seleccionar "ElevenLabs API Key"
   - **Whisper Transcripción**: Seleccionar "OpenAI API Key"
   - **Notificación Telegram**: Seleccionar "Telegram Bot"
   - **Enviar Vídeo Telegram**: Seleccionar "Telegram Bot"

## 🚀 Ejecución del Workflow

### 1. Ejecución Manual

1. Click en **Execute Workflow**
2. El proceso tomará ~3-4 minutos
3. Monitorear progreso en cada nodo
4. Verificar archivos generados en directorio de n8n

### 2. Ejecución Programada

```json
// Añadir nodo Cron al inicio del workflow
{
  "parameters": {
    "rule": {
      "interval": [
        {
          "field": "cronExpression",
          "expression": "0 9 * * *" // Diario a las 9:00 AM
        }
      ]
    }
  },
  "name": "Programar Ejecución",
  "type": "n8n-nodes-base.cron"
}
```

### 3. Trigger por Webhook

```json
// Añadir nodo Webhook al inicio
{
  "parameters": {
    "httpMethod": "POST",
    "path": "generate-dubai-video",
    "responseMode": "responseNode"
  },
  "name": "Webhook Trigger",
  "type": "n8n-nodes-base.webhook"
}
```

## 📊 Estructura del Workflow

### Nodos Principales

1. **Guión del Podcast** (Sticky Note)

   - Contiene el guión completo de 90 segundos
   - Editable para diferentes temas

2. **ElevenLabs TTS** (HTTP Request)

   - Convierte texto a audio
   - Voz: Diego (español)
   - Modelo: eleven_multilingual_v2

3. **Guardar Audio** (Write File)

   - Guarda MP3 generado
   - Nombre: `podcast_audio_YYYYMMDD_HHmmss.mp3`

4. **Whisper Transcripción** (HTTP Request)

   - Genera subtítulos SRT
   - Modelo: whisper-1
   - Idioma: español

5. **Guardar Subtítulos** (Write File)

   - Guarda archivo SRT
   - Nombre: `subtitles_YYYYMMDD_HHmmss.srt`

6. **Crear Fondo Visual** (Code Node)

   - Genera imagen de fondo 1080x1920
   - Gradiente azul con título
   - Canvas HTML5

7. **Guardar Fondo** (Write File)

   - Guarda PNG generado
   - Nombre: `background_YYYYMMDD_HHmmss.png`

8. **Montar Vídeo FFmpeg** (Code Node)

   - Combina audio + fondo + subtítulos
   - FFmpeg con optimización para redes sociales
   - Output: MP4 H.264 + AAC

9. **Guardar Vídeo Final** (Write File)

   - Guarda MP4 optimizado
   - Nombre: `dubai_chocolate_podcast_YYYYMMDD_HHmmss.mp4`

10. **Notificación Telegram** (Telegram)

    - Envía mensaje de completado
    - Formato Markdown con detalles

11. **Enviar Vídeo Telegram** (Telegram)

    - Envía vídeo final
    - Caption automático

12. **Generar Informe** (Code Node)

    - Crea informe Markdown completo
    - Métricas y estadísticas

13. **Guardar Informe** (Write File)
    - Guarda informe MD
    - Nombre: `dubai_chocolate_report_YYYYMMDD_HHmmss.md`

## 🔧 Personalización

### Cambiar Voz TTS

```json
// En nodo "ElevenLabs TTS", modificar URL:
"url": "https://api.elevenlabs.io/v1/text-to-speech/[VOICE_ID]"

// Voces disponibles:
// pNInz6obpgDQGcFmaJgB - Diego (español)
// EXAVITQu4vr4xnSDxMaL - Bella (inglés)
// ErXwobaYiN019PkySvjV - Antoni (inglés)
```

### Modificar Estilo Visual

```javascript
// En nodo "Crear Fondo Visual", editar:
const gradient = ctx.createLinearGradient(0, 0, 0, height);
gradient.addColorStop(0, "#tu_color_1");
gradient.addColorStop(0.5, "#tu_color_2");
gradient.addColorStop(1, "#tu_color_3");

// Cambiar texto
ctx.fillText("TU TÍTULO", width / 2, height / 2 - 50);
ctx.fillText("TU SUBTÍTULO", width / 2, height / 2 + 50);
```

### Añadir Múltiples Voces

```json
// Duplicar nodo TTS para segunda voz
{
  "parameters": {
    "url": "https://api.elevenlabs.io/v1/text-to-speech/[VOICE_ID_2]",
    "bodyParameters": {
      "parameters": [
        {
          "name": "text",
          "value": "{{ $('Guión Voz 2').first().json.content }}"
        }
      ]
    }
  },
  "name": "ElevenLabs TTS Voz 2"
}
```

## 📁 Archivos Generados

El workflow genera automáticamente:

```
~/.n8n/files/
├── podcast_audio_20240115_143022.mp3     # Audio sintetizado
├── subtitles_20240115_143045.srt         # Subtítulos SRT
├── background_20240115_143067.png        # Fondo visual
├── dubai_chocolate_podcast_20240115_143089.mp4  # Vídeo final
└── dubai_chocolate_report_20240115_143112.md    # Informe
```

## 🚨 Solución de Problemas

### Error: "Canvas module not found"

```bash
# Instalar canvas en directorio de n8n
cd ~/.n8n
npm install canvas
```

### Error: "FFmpeg not found"

```bash
# Verificar instalación
which ffmpeg

# Si no está instalado:
# Windows: Descargar desde https://ffmpeg.org
# macOS: brew install ffmpeg
# Linux: sudo apt install ffmpeg
```

### Error: "ElevenLabs API rate limit"

```json
// Añadir delay entre requests
{
  "parameters": {
    "amount": 2,
    "unit": "seconds"
  },
  "name": "Wait",
  "type": "n8n-nodes-base.wait"
}
```

### Error: "File size too large for Telegram"

```javascript
// En nodo "Enviar Vídeo Telegram", añadir verificación:
if (videoBuffer.length > 50 * 1024 * 1024) {
  throw new Error("Vídeo demasiado grande para Telegram (>50MB)");
}
```

## 📈 Métricas y Monitoreo

### Costes por Ejecución

- **ElevenLabs TTS**: ~$0.02 (1,847 caracteres)
- **OpenAI Whisper**: ~$0.006 (90 segundos)
- **Total**: ~$0.026 por vídeo

### Tiempo de Ejecución

- **TTS**: 15-30 segundos
- **Transcripción**: 30-60 segundos
- **Montaje**: 60-120 segundos
- **Total**: 2-4 minutos

### Logs y Debugging

```javascript
// Añadir logging en nodos Code:
console.log("Estado:", {
  timestamp: new Date().toISOString(),
  node: "Nombre del Nodo",
  data: $input.all(),
});
```

## 🔄 Workflows Adicionales

### Workflow de Solo Audio

```json
// Versión simplificada sin vídeo
// Incluye solo: Guión → TTS → Guardar → Telegram
```

### Workflow con Múltiples Temas

```json
// Array de guiones para batch processing
// Loop automático por diferentes temas
```

### Workflow con Detección de Tendencias

```json
// Integración con Google Trends API
// Generación automática de guiones
```

## 📞 Soporte

Para problemas específicos:

1. Verificar logs de n8n: **Executions** → **[Execution ID]**
2. Revisar credenciales configuradas
3. Verificar dependencias del sistema
4. Consultar documentación oficial de n8n

---

**🎯 Objetivo**: Workflow visual completo para generación automática de vídeos
**📅 Estado**: Funcional y listo para importar
**🚀 Próximo**: Workflows para detección automática de tendencias
