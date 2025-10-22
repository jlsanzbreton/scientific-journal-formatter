# RFC-2025-01 — First Steps

## Context
- Proyecto: "Scientific Journal Formatter" (SciForm), PWA para maquetar articulos cientificos y generar PDF.
- Estado actual: UI basica con Tailwind CDN, logica monolitica en `app.js`, plantillas en `templates/templates.json`, service worker sin cache, sin sanitizacion de Markdown, sin pipeline de PDF.
- Branding: seguir la estetica del master `assets/logo/sciform_master_1024.png` (ocre paleo, marfil, negro antracita). Tonos propuestos: `#c89b5b` (ocre), `#f4ecd8` (marfil), `#1b1b1b` (antracita), `#f2b179` (acento), tipografias serif (Merriweather) + sans-serif (Inter).
- Repositorio: estructura plana en raiz, assets mezclados con codigo, sin `src/`. Se acaba de crear `.gitignore` y de retirar `node_modules/` del index git.

## Objetivo
Preparar el MVP para evolucionar de forma segura: saneamiento de datos, PWA offline, UI alineada con la marca, motor PDF, estructura modular y tooling minimo.

## Secuencia de trabajo (Codex debe avanzar paso a paso y confirmar cada hito)

### Paso 0 — Higiene repo (ya ejecutado manualmente)
1. Verificar que `.gitignore` contiene `node_modules/`, `dist/`, `.DS_Store`, artefactos locales.
2. Confirmar que `node_modules/` fue eliminado del index remoto (`git status` debe listar las eliminaciones). No volver a versionarlo.
3. Tras merge, ejecutar `rm -rf node_modules && npm install` en local para rehidratar dependencias ignoradas.

### Paso 1 — Reordenar estructura fuente
1. Crear carpeta `src/` con subcarpetas: `src/ui`, `src/core`, `src/services`, `src/data`, `src/styles`.
2. Mover `app.js` a `src/ui/main.js` y dividirlo en modulos:
   - `src/core/templates.js` (CRUD plantillas + schema + storage).
   - `src/ui/editor.js` (eventos textarea/markdown).
   - `src/ui/preview.js` (iframe, estilos dinamicos, sanitizacion).
   - `src/services/assets.js` (imagenes locales + revoke object URLs).
   - `src/services/pwa.js` (register SW, install prompt).
3. Trasladar `styles.css` a `src/styles/main.css`. Actualizar imports en Vite (`import './styles/main.css';`).
4. Mover `templates/templates.json` a `src/data/templates.json` y ajustar fetch/local import (usar import JSON via `assert { type: 'json' }`).
5. Crear `src/main.js` como punto de entrada que orquesta la inicializacion.
6. Actualizar `index.html` para apuntar a `/src/main.js` compilado por Vite (usar `<script type="module" src="/src/main.js"></script>`).
7. Crear carpeta `public/` para `manifest.webmanifest`, assets estaticos y service worker si se desea servir sin procesado.

### Paso 2 — UI/UX segun marca
1. Sustituir dependencia de Tailwind CDN por estilos propios en `src/styles/main.css` usando variables CSS para la paleta propuesta.
2. Aplicar layout basado en grid responsive con bloques diferenciados:
   - Header oscuro (`#1b1b1b`) con logotipo y toggle admin.
   - Panel interactivo en marfil (`#f4ecd8`) con acentos ocre (`#c89b5b`).
   - Botones primarios en ocre, secundarios en antracita.
3. Ajustar tipografias: encabezados `Merriweather`, cuerpo `Inter`, monospace `JetBrains Mono` o `Source Code Pro` (link de Google Fonts).
4. Añadir estados hover/focus accesibles (contraste >= 4.5:1).
5. Mejorar jerarquia visual: separar secciones Importar/Layout/Plantillas con cards, agregar breadcrumbs de pasos, mensajes de ayuda en tooltips.
6. Incorporar ilustraciones ligeras o iconos monocromo inspirados en el simbolo del logo (pueden generarse en SVG minimalista dentro de `src/ui/components/icons.js`).
7. Implementar modo oscuro invertido (opcional) reutilizando variables CSS.

### Paso 3 — Sanitizacion y seguridad de contenido
1. Sustituir uso directo de `marked.parse` por pipeline con DOMPurify o `sanitize-html` (dependencia instalable) para limpiar HTML antes de inyectar en iframe.
2. Configurar `marked` con `gfm: true`, `breaks: true` y salida controlada (sin `sanitize` legacy).
3. En `preview.js`, inyectar contenido via `srcdoc` o `DOMParser` para evitar manipulaciones del host.
4. Validar entrada de plantillas via JSON Schema (`ajv`). Rechazar schemas invalidos tanto en importacion como admin UI.

### Paso 4 — PWA offline y assets
1. Reemplazar `sw.js` con Workbox build (modo `injectManifest`). Crear `src/sw.js` con precache de `index.html`, `src/` bundles, `manifest`, fuentes locales.
2. Configurar caching strategy: `StaleWhileRevalidate` para plantillas JSON, `CacheFirst` para assets.
3. Eliminar dependencias CDN (Tailwind, Marked) y servir bundles locales para funcionar offline.
4. Añadir test manual: `npm run build && npm run preview` + Lighthouse PWA audit (documentar resultados en README).

### Paso 5 — Pipeline PDF y exportaciones
1. Evaluar libs: `pagedjs` (render en navegador) vs `pdfmake` (programatico). Seleccionar opcion y documentar decision.
2. Implementar generacion PDF desde preview: boton `Generar PDF` que usa layout actual.
3. Preparar hooks para exportar DOCX/LaTeX (puede quedar como stub documentado con interfaz).
4. Permitir descargar paquete ZIP con texto Markdown, figuras y BibTeX para interoperabilidad.

### Paso 6 — Tooling y calidad
1. Configurar ESLint (`eslint-config-standard-with-typescript` si se migra a TS) + Prettier, integrarlos en `package.json` scripts.
2. Añadir Vitest para pruebas unitarias (templates, sanitizacion) y Playwright para pruebas e2e basicas (flow Importar->Aplicar plantilla->Generar PDF stub).
3. Configurar GitHub Actions simple: `npm ci`, `npm run lint`, `npm run test`, `npm run build`.
4. Documentar comandos en README y asegurarse de que `npm run build` produce `dist/` listo para GitHub Pages (sin `base` hardcode si se detecta dominio custom).

### Paso 7 — UX features adicionales
1. Guardar estados de editor (texto, imagenes) en IndexedDB con migraciones versionadas.
2. Añadir wizard de onboarding (modal) que explique los pasos.
3. Incluir sistema de avisos: limites de paginas, peso de imagenes, formato referencias.
4. Preparar telemetria opcional (opt-in) para eventos basicos.

### Paso 8 — Documentacion y handoff
1. Actualizar README con roadmap, instrucciones offline, politicas de privacidad.
2. Redactar guia de contribucion (`CONTRIBUTING.md`) y definicion de `ISSUE_TEMPLATE` para nuevas revistas.
3. Preparar changelog desde version 0.1.0 siguiendo Keep a Changelog.
4. Revisar licencias de dependencias (sharp, workbox) y anadir seccion en README.

## Reglas para ejecucion autonoma
- Avanzar en orden de pasos. No saltar pasos salvo instruccion explicita.
- Tras completar cada paso, ejecutar tests o verificaciones pertinentes y pegar resultados en comentario de PR.
- Mantener commits atonicos por paso (prefijo `step-0`, `step-1`, ...).
- Solicitar feedback humano si se detecta bloqueo mayor de 1h en un paso.

## Registro de avances
- 2025-10-22 — Paso 2: UI/UX alineada con la marca implementada. Se reemplazó Tailwind por hoja de estilos propia con paleta (ocre, marfil, antracita, acento), se reorganizó el layout en paneles responsivos con breadcrumbs, tooltips e iconografía SVG personalizada (`src/ui/components/icons.js`) y se añadió modo oscuro conmutado por el usuario. `npm run build` finalizó correctamente registrando los bundles actualizados.
