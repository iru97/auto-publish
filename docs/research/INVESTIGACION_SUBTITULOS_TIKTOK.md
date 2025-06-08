# INVESTIGACIÓN: SUBTÍTULOS OPTIMIZADOS PARA TIKTOK

## 📊 RESUMEN EJECUTIVO

Basado en análisis de miles de videos de TikTok y estudios de engagement, se han identificado las mejores prácticas para subtítulos que maximizan conversiones y engagement.

---

## 🎯 3.1 ESPACIOS SEGUROS PARA SUBTÍTULOS EN TIKTOK

### **Dimensiones Críticas (1080x1920)**

#### **Zonas de Riesgo a Evitar:**

- **Top 120px**: Username, captions, notificaciones
- **Bottom 240px**: Botones de navegación, like/comment/share
- **Laterales 50px**: Márgenes para evitar recorte
- **Esquina inferior izquierda**: Profile icon y texto adicional
- **Lado derecho**: Iconos de engagement (like, comment, share, follow)

#### **Zona Segura Óptima:**

- **Centro del video**: 980x1560px (área segura)
- **Tercio superior**: Ideal para texto principal
- **Centro-centro**: Máximo engagement para podcasts/audio content

### **Posicionamiento Recomendado:**

```
┌─────────────────────────┐ ← Top 120px (EVITAR)
│     ZONA PELIGROSA      │
├─────────────────────────┤
│                         │
│    🎯 ZONA SEGURA      │ ← Centro óptimo
│     PARA SUBTÍTULOS     │   (980x1560px)
│                         │
├─────────────────────────┤
│     ZONA PELIGROSA      │ ← Bottom 240px (EVITAR)
└─────────────────────────┘
```

---

## 📝 3.2 MÁXIMO DE PALABRAS/CARACTERES PARA ENGAGEMENT

### **Límites Técnicos de TikTok:**

- **Captions**: 2,200 caracteres máximo
- **Comments**: 150 caracteres máximo
- **Bio**: 80 caracteres máximo

### **Límites Óptimos para Engagement:**

#### **Por Línea de Subtítulo:**

- **Máximo recomendado**: 3-5 palabras por línea
- **Caracteres por línea**: 15-25 caracteres
- **Duración por subtítulo**: 1-3 segundos

#### **Ejemplos de Segmentación Óptima:**

❌ **Incorrecto**: "Aquí tienes cinco historias terroríficas de Reddit"
✅ **Correcto**:

```
"Aquí tienes"
"cinco historias"
"terroríficas"
"de Reddit"
```

### **Datos de Engagement:**

- **Videos con subtítulos**: +152% conversión vs sin subtítulos
- **Texto en primeros 7 segundos**: +43% conversión
- **Subtítulos cortos y frecuentes**: +280% engagement

---

## 🎨 3.3 ESPECIFICACIONES TÉCNICAS PARA IMPLEMENTACIÓN

### **Tipografía Óptima:**

- **Tipo**: Sans-serif, bold/thick
- **Tamaño**: 48-72px (ajustable según contenido)
- **Peso**: Bold/Black weight mínimo
- **Espaciado**: 1.2-1.5 line height

### **Colores y Contraste:**

- **Texto**: Blanco (#FFFFFF) por defecto
- **Borde**: Negro (#000000) 2-4px
- **Sombra**: Drop shadow opcional
- **Fondo**: Evitar fondos sólidos en centro

### **Animaciones Recomendadas:**

- **Aparición**: Fade in (0.2s)
- **Permanencia**: Sincronizado con audio
- **Desaparición**: Fade out (0.2s)
- **Posición**: Fija en centro (no mover)

### **Timing Óptimo:**

- **Duración video**: 21-34 segundos (+280% conversión)
- **Sincronización**: Perfecta con audio
- **Velocidad lectura**: Igual a velocidad de habla

---

## 📈 MÉTRICAS DE ÉXITO COMPROBADAS

### **Mejoras de Conversión Documentadas:**

- **Resolución 720p+**: +312% conversión
- **Formato 9:16**: +91% conversión
- **CTA en texto**: +152% conversión
- **Duración 21-34s**: +280% conversión
- **Múltiples escenas**: +38% conversión (ecommerce)
- **Texto + voiceover**: +87% conversión (ecommerce)

### **Mejores Prácticas por Industria:**

- **Gaming**: 5+ escenas (+171% conversión)
- **Ecommerce**: Texto + offer (+80% conversión)
- **Podcast/Audio**: Centro absoluto del screen

---

## 🛠️ IMPLEMENTACIÓN EN VIDEO-COMPOSER

### **Configuración Recomendada:**

```javascript
const subtitleConfig = {
  position: "center",
  maxWordsPerLine: 4,
  fontSize: 56,
  fontWeight: "bold",
  fontFamily: "Arial Black",
  color: "#FFFFFF",
  stroke: "#000000",
  strokeWidth: 3,
  animation: "fade",
  duration: "auto", // Sincronizado con audio
  safeArea: {
    top: 120,
    bottom: 240,
    left: 50,
    right: 50,
  },
};
```

### **Algoritmo de Segmentación:**

1. **Dividir por pausas naturales** en el audio
2. **Máximo 4 palabras** por subtítulo
3. **Duración mínima**: 1 segundo
4. **Duración máxima**: 3 segundos
5. **Overlap**: 0ms (sin solapamiento)

---

## ✅ CHECKLIST DE VALIDACIÓN

### **Antes de Generar Video:**

- [ ] Subtítulos en zona segura (centro)
- [ ] Máximo 4 palabras por línea
- [ ] Font bold/sans-serif
- [ ] Contraste adecuado (blanco + borde negro)
- [ ] Sincronización perfecta con audio
- [ ] Duración total 21-34 segundos
- [ ] Resolución 1080x1920 (9:16)

### **Después de Generar Video:**

- [ ] Test en dispositivo móvil
- [ ] Verificar legibilidad en pantalla pequeña
- [ ] Confirmar que no se superpone con elementos importantes
- [ ] Validar timing de aparición/desaparición
- [ ] Comprobar que no hay texto cortado

---

## 🎯 PRÓXIMOS PASOS

1. **Implementar configuración optimizada** en video-composer
2. **Crear algoritmo de segmentación** inteligente
3. **Agregar validación de zona segura** automática
4. **Test A/B** con diferentes configuraciones
5. **Métricas de engagement** en videos generados

---

**Fuentes:**

- House of Marketers: TikTok Safe Zone Guide
- Predis.ai: Ultimate TikTok Safe Zone Guide
- ContentFries: TikTok Captions for Engagement
- TikTok for Business: Creative Best Practices
- Jon Loomer: Safe Zones Templates

**Fecha**: Enero 2025
**Estado**: Investigación completada ✅
**Siguiente**: Implementación en video-composer
