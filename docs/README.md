# 📚 Documentación CTC Daily Hours

Bienvenido a la documentación completa del sistema CTC Daily Hours.

## 📖 Documentación Disponible

### Para Usuarios

- **[Manual de Usuario](MANUAL_USUARIO.md)** - Guía completa para usar el sistema
  - Instrucciones paso a paso
  - Guías por rol (Empleado, Responsable, Administrador)
  - Preguntas frecuentes
  - Solución de problemas

### Para Desarrolladores

- **[Manual Técnico](MANUAL_TECNICO.md)** - Documentación técnica completa
  - Arquitectura del sistema
  - Stack tecnológico
  - Estructura del proyecto
  - Base de datos
  - API y servicios
  - Despliegue y mantenimiento

- **[Arquitectura del Sistema](ARQUITECTURA.md)** - Diagramas y flujos
  - Diagramas de arquitectura
  - Flujos de datos
  - Diagramas de secuencia
  - Modelos de datos

## 🚀 Inicio Rápido

### Para Usuarios Finales
1. Lee el [Manual de Usuario](MANUAL_USUARIO.md)
2. Accede al sistema con tus credenciales
3. Consulta la guía específica para tu rol

### Para Desarrolladores
1. Lee la sección de [Instalación](../README.md#instalación-y-configuración) en el README principal
2. Revisa el [Manual Técnico](MANUAL_TECNICO.md)
3. Consulta [Arquitectura](ARQUITECTURA.md) para entender el diseño

## 📦 Exportar a PDF

Para convertir estos archivos Markdown a PDF, puedes usar:

### Opción 1: VS Code con extensión
1. Instala la extensión "Markdown PDF"
2. Abre el archivo .md
3. Ctrl+Shift+P → "Markdown PDF: Export (pdf)"

### Opción 2: Pandoc (línea de comandos)
```bash
# Instalar pandoc
# Windows: choco install pandoc
# Mac: brew install pandoc
# Linux: apt install pandoc

# Convertir a PDF
pandoc MANUAL_USUARIO.md -o MANUAL_USUARIO.pdf
pandoc MANUAL_TECNICO.md -o MANUAL_TECNICO.pdf
pandoc ARQUITECTURA.md -o ARQUITECTURA.pdf
```

### Opción 3: Online
1. Ve a https://www.markdowntopdf.com/
2. Sube el archivo .md
3. Descarga el PDF

## 📊 Estructura de la Documentación

```
docs/
├── README.md                 # Este archivo
├── MANUAL_USUARIO.md         # Manual funcional (~500 líneas)
├── MANUAL_TECNICO.md         # Documentación técnica (~600 líneas)
└── ARQUITECTURA.md           # Diagramas y arquitectura (~400 líneas)
```

## 🔄 Actualización de Documentación

La documentación debe actualizarse cuando:
- Se agregan nuevas funcionalidades
- Se modifican flujos existentes
- Se cambia la arquitectura
- Se detectan errores o mejoras

**Última actualización**: 24 de febrero de 2026  
**Versión del sistema**: 2.0

---

*Desarrollado con ❤️ para el Patio de Materiales CTC*
