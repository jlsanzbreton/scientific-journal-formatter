# RFC-2025-02 — Template Compliance & Rich Layout

## Context
- Los pasos 1–3 del RFC-2025-01 ya reorganizaron el proyecto (`src/`, sanitización, UI basada en la marca).
- Persisten tres necesidades antes de abordar la PWA offline (Paso 4 del RFC-2025-01):
  1. Las imágenes insertadas vía PWA se muestran como huecos porque DOMPurify bloquea URLs `blob:`.
  2. El editor carece de controles de alineación y spans parciales; ahora sólo ofrece negrita/cursiva.
  3. Cada plantilla necesita validación automática (check verde cuando el documento cumple la revista).

## Objetivo
Implementar layout enriquecido (front matter + columnas controladas), controles avanzados de formato y un motor de validación por plantilla, dejando el repositorio listo para continuar con la PWA offline.

## Secuencia de trabajo (Codex debe avanzar paso a paso y confirmar cada hito)

### Paso 0 — Sincronizar rama y dependencias
1. Ejecutar `git pull` sobre la rama `dev` y asegurarse de que no hay cambios locales pendientes.
2. Verificar que `npm install` está actualizado (si el lock cambia, comunicar antes de subir).

### Paso 1 — Front matter y control manual de offset
1. En `index.html` (panel "2 · Diseño") añadir controles visibles para "Inicio de columnas":
   - `input[type="range"]` (0–80 mm) enlazado con `input[type="number"]` (min 0, step 1).
   - Ambos deben sincronizarse con `currentTopOffsetMm` en `src/ui/editor.js` y refrescar la previsualización.
2. Reestructurar el HTML del iframe en `src/ui/preview.js` para usar:
   ```html
   <article class="preview-doc">
     <section class="preview-front"></section>
     <section class="preview-columns"></section>
   </article>
   ```
3. Actualizar `renderMarkdown` para separar automáticamente el front matter:
   - Primer `h1` y nodos siguientes (p, hr, ul, ol, blockquote, figure) hasta encontrar `h2` o equivalente → `.preview-front`.
   - Resto del contenido → `.preview-columns`.
   - Si no hay `h1`, todo va al bloque de columnas.
4. Ajustar `setLayout` para aplicar `column-count`, `column-gap`, `column-fill` y `--column-top-offset` sobre `.preview-columns`.
5. Actualizar `src/styles/main.css`:
   - `.preview-front` sin columnas (anchura total, spacing amigable).
   - `.preview-columns` hereda las reglas multi-columna existentes.
   - `column-top-offset` se usa como `margin-top` o `padding-top` en `.preview-columns`.
6. Asegurarse de que al aplicar una plantilla el valor se propaga al slider y al número. Guardar/exportar plantillas debe seguir preservando `contentTopOffsetMm`.
7. Ejecutar `npm run build` y preparar texto de commit sugerido (`chore: split preview front matter` o similar). No hacer commit; dejarlo listo para revisión humana.

### Paso 2 — Inserción y renderizado de imágenes con spans
1. Ajustar `preview.js` para permitir URLs `blob:` al sanitizar con DOMPurify (`ADD_URI_SAFE_ATTR` o `setConfig`), evitando abrir la puerta a dominios no confiables.
2. Mejorar el flujo del botón “+ Imagen” en `src/ui/editor.js`:
   - Tras elegir imagen, solicitar span deseado (1..columnas actuales). Valor inválido → 1.
   - Insertar Markdown con sufijo `|span=X`, por ejemplo `![Figura|span=2](blob:...)`.
   - Actualizar tooltip del botón explicando la sintaxis y el comportamiento.
3. En `renderMarkdown`, al envolver cada `<img>` en `<figure>`:
   - Detectar `|span=X` en el `alt` y almacenar `figure.dataset.span = X`.
   - Limpiar el alt para el caption e indicar el span en un atributo opcional (`data-span`).
4. Extender `src/styles/main.css`:
   - `.figure[data-span="1"]` → comportamiento actual.
   - `.figure[data-span]:not([data-span="1"])` → `column-span: all`, anchura centrada, margen vertical distinto.
5. Probar con spans 1..3 en una plantilla de 3 columnas para comprobar el comportamiento.
6. Ejecutar `npm run build` y redactar texto sugerido de commit (`feat: allow multi-span figures`). Sin commit.

### Paso 3 — Controles de alineación y spans por párrafo
1. Añadir botones en la toolbar del editor (`index.html`) para alineación izquierda, centrado, justificado y columnas individuales (1–4) aplicables a la selección.
2. En `src/ui/editor.js`, implementar helpers que envuelvan el bloque seleccionado en etiquetas HTML soportadas (`<div class="align-justify span-2">…</div>`). Mantener compatibilidad con Markdown (se aceptan raw HTML blocks).
3. Actualizar la previsualización para reconocer esas clases y aplicar estilos adecuados: `.align-left`, `.align-center`, `.align-justify`, `.span-1..span-4` (con `column-span` cuando span > 1).
4. Documentar los estilos en el tooltip de cada botón (breve explicación + atajo, si se desea).
5. `npm run build`, validar manualmente con texto real (combinando distintos estilos). Preparar texto de commit (`feat: add alignment and span controls`).

### Paso 4 — Motor de validación por plantilla
1. Definir estructura de reglas en `src/data/templates.json` (sección `rules` opcional por plantilla): límites de columnas, `maxPages`, tamaño base, requisitos mínimos de front matter, etc.
2. Crear `src/core/templateRules.js` con funciones para:
   - Evaluar un estado (`content`, layout aplicado, plantilla activa) y devolver lista de incumplimientos.
   - Reutilizar cálculos existentes (`maxPages`, columnas, spans). Para conteo de páginas usar aproximación heurística (por ahora basta con comprobar que `maxPages` coincide con el valor de UI hasta que integremos paginado real).
3. Integrar en el editor: tras `updatePreview` (con debounce) ejecutar la validación y actualizar un panel/flotante en UI (ej. dentro de “3 · Plantillas”) mostrando check verde y listado de errores.
4. Añadir tests unitarios en `src/core/__tests__/templateRules.test.js` cubriendo al menos tres casos (todo OK, columnas incorrectas, offset fuera de rango).
5. `npm run build` + `npm test`. Preparar texto de commit (`feat: add template compliance check`).

### Paso 5 — Documentación y entrega
1. Actualizar `README.md` con sección “Template compliance” explicando nuevo panel, spans y controles de alineación.
2. Registrar avances en este RFC (Paso 1…5) y enlazarlo desde el README si procede.
3. Listar pruebas manuales realizadas (plantilla con spans, validación OK/KO).
4. `npm run build` final para verificar estado.
5. No realizar commit; entregar resumen y sugerencias de mensajes para que el equipo humano los ejecute.

## Reglas para ejecución autónoma
- Avanzar en orden. No saltar pasos sin aprobación.
- Al cerrar cada paso, ejecutar los comandos indicados y anotar resultados (build/test) en el comentario de entrega.
- No hacer commits ni pushes; sólo preparar los textos sugeridos.
- Solicitar feedback humano si el progreso queda bloqueado >1h o si aparecen conflictos al fusionar con defaults.
