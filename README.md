# Scientific Journal Formatter — MVP + Admin Template Builder

PWA estática para maquetar artículos científicos y **crear/editar plantillas** en el navegador.
Las plantillas se guardan en **LocalStorage**, y puedes **exportar/importar** `templates.json`.

## Publicación en GitHub Pages (sin Actions)
1. Crear repo y subir todo el contenido a la **raíz**.
2. Settings → Pages → *Deploy from a branch*, Branch `main` y carpeta `/ (root)`.
3. Abrir la URL de Pages.

## Admin
- Activa **Modo Admin** (toggle arriba derecha).
- Crea/edita plantillas; se guardan en LocalStorage.
- **Exportar JSON** para compartir o versionar; **Importar JSON** para cargar un set.
- Botón **AI: Sugerir** (stub) para conectar tu API y derivar estilos desde una guía/PDF.

## Esquema de plantilla (JSON)
```json
{
  "plantilla_key": {
    "displayName": "Nombre visible",
    "columns": 2,
    "fontFamily": "Merriweather, serif",
    "baseSizePx": 11,
    "pageSize": "A4",
    "marginsMm": [18, 18, 18, 18],
    "headings": {
      "h1": {"size": "1.6em", "weight": 700, "margin": "0.8em 0 0.4em"},
      "h2": {"size": "1.3em", "weight": 600}
    },
    "figure": {"captionSize": "0.9em", "captionColor": "#555", "span": "auto"}
  }
}
```

## Roadmap
- Validación de plantilla con JSON Schema.
- Reglas finas por revista (títulos numerados, estilos de tabla/leyendas).
- Control de imágenes **span 1–N columnas** con UI sobre la previsualización.
- PWA offline con caché estático.
- Conector AI opcional para **inferencia de plantilla**.
# 🧠 SciForm – Scientific Journal Formatter

> **Versión:** 0.1.0  
> **Tipo:** Progressive Web App (PWA)  
> **Framework:** Vite 6 + Node 22  
> **Autor:** José L. Sanz Bretón  

---

## 🧩 Descripción general

**SciForm** es una PWA diseñada para ayudar a los autores científicos a **formatear sus artículos, figuras y referencias** según las plantillas de diferentes revistas académicas.

El usuario puede:
- Subir texto, figuras y referencias por separado.
- Elegir la plantilla de una revista.
- Generar el documento final ya formateado.
- Descargar o compartir el resultado en PDF, DOCX o LaTeX.

---

## 🗂️ Estructura de carpetas
scientific-journal-formatter/
├─ assets/
│  ├─ icons/        # Iconos generados automáticamente (16–512 px)
│  └─ logo/         # Máster original y versiones vectoriales
│     ├─ sciform_master_1024.png
│     └─ sciform_symbol.svg
├─ scripts/
│  └─ generate-icons.mjs  # Script Node para generar iconos con Sharp
├─ index.html
├─ manifest.webmanifest   # Configuración PWA
├─ vite.config.js
├─ package.json
└─ README.md