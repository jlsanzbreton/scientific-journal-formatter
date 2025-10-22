import { createIcon, injectIcons } from './components/icons.js';

const THEME_STORAGE_KEY = 'sjf.theme';

function qs(selector) {
  return document.querySelector(selector);
}

function parseMargins(value) {
  if (!value) return [18, 18, 18, 18];
  const parts = value
    .split(',')
    .map((segment) => Number(segment.trim()))
    .filter((num) => Number.isFinite(num));
  if (parts.length === 4) return parts;
  return [18, 18, 18, 18];
}

export function setupEditor({ preview, templateStore, assetService }) {
  const editor = qs('#editor');
  const fileInput = qs('#fileInput');
  const imgInput = qs('#imgInput');
  const pasteBtn = qs('#pasteBtn');
  const insertImageBtn = qs('#insertImageBtn');
  const columnsSel = qs('#columns');
  const fontFamilySel = qs('#fontFamily');
  const baseSizeInput = qs('#baseSize');
  const templateSelect = qs('#templateSelect');
  const applyTemplateBtn = qs('#applyTemplate');
  const pageSizeSel = qs('#pageSize');
  const adminToggle = qs('#adminToggle');
  const importTemplatesBtn = qs('#importTemplates');
  const exportTemplatesBtn = qs('#exportTemplates');
  const resetTemplatesBtn = qs('#resetTemplates');
  const newTemplateBtn = qs('#newTemplate');
  const saveTemplateBtn = qs('#saveTemplate');
  const deleteTemplateBtn = qs('#deleteTemplate');
  const tplKey = qs('#tplKey');
  const tplName = qs('#tplName');
  const tplColumns = qs('#tplColumns');
  const tplFont = qs('#tplFont');
  const tplBase = qs('#tplBase');
  const tplPage = qs('#tplPage');
  const tplMargins = qs('#tplMargins');
  const tplHeadings = qs('#tplHeadings');
  const tplFigure = qs('#tplFigure');
  const adminPanel = qs('#adminPanel');
  const themeToggle = qs('#themeToggle');
  const breadcrumbs = document.querySelectorAll('.breadcrumbs li');

  if (!editor) {
    throw new Error('Editor element not found');
  }

  let currentMargins = [18, 18, 18, 18];
  let currentTemplateKey = null;

  function getLayoutState() {
    return {
      columns: Number(columnsSel?.value ?? 2),
      fontFamily: fontFamilySel?.value ?? '',
      baseSize: Number(baseSizeInput?.value ?? 12),
      pageSize: pageSizeSel?.value ?? 'A4',
      margins: currentMargins,
    };
  }

  function refreshTemplateSelect(selectKey) {
    if (!templateSelect) return;
    const templates = templateStore.getTemplates();
    templateSelect.innerHTML = '';
    Object.entries(templates).forEach(([key, template]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = template.displayName || key;
      templateSelect.appendChild(option);
    });
    if (selectKey && templates[selectKey]) {
      templateSelect.value = selectKey;
    }
  }

  function updatePreview() {
    preview.refresh(editor.value, getLayoutState());
  }

  function surroundText(prefix, suffix = null) {
    const selStart = editor.selectionStart;
    const selEnd = editor.selectionEnd;
    const value = editor.value;
    const selected = value.slice(selStart, selEnd);
    const before = value.slice(0, selStart);
    const after = value.slice(selEnd);
    editor.value = before + prefix + selected + (suffix ?? prefix) + after;
    const offset = prefix.length;
    editor.focus();
    editor.selectionStart = selStart + offset;
    editor.selectionEnd = selEnd + offset;
    updatePreview();
  }

  function setAdminForm(templateKey) {
    const template = templateStore.getTemplate(templateKey);
    if (!template) return;
    tplKey.value = templateKey;
    tplName.value = template.displayName || '';
    tplColumns.value = template.columns ?? 2;
    tplFont.value = template.fontFamily || 'Inter, system-ui, sans-serif';
    tplBase.value = template.baseSizePx ?? 12;
    tplPage.value = template.pageSize || 'A4';
    tplMargins.value = (template.marginsMm || [18, 18, 18, 18]).join(', ');
    tplHeadings.value = JSON.stringify(template.headings ?? {}, null, 2);
    tplFigure.value = JSON.stringify(template.figure ?? {}, null, 2);
  }

  function applyTemplate(key) {
    const template = templateStore.getTemplate(key);
    if (!template) return;
    currentTemplateKey = key;

    if (baseSizeInput) baseSizeInput.value = template.baseSizePx ?? 12;
    if (fontFamilySel) fontFamilySel.value = template.fontFamily ?? fontFamilySel.value;
    if (columnsSel) columnsSel.value = String(template.columns ?? Number(columnsSel.value ?? 2));
    if (pageSizeSel) pageSizeSel.value = template.pageSize ?? 'A4';

    currentMargins = Array.isArray(template.marginsMm) && template.marginsMm.length === 4 ? template.marginsMm : [18, 18, 18, 18];

    preview.applyHeadingStyles(template);
    preview.setLayout({ ...getLayoutState(), margins: currentMargins, pageSize: template.pageSize ?? 'A4' });
    updatePreview();
  }

  function getFirstTemplateKey() {
    return templateStore.getKeys()[0] ?? null;
  }

  function bootstrapTemplates() {
    templateStore.load();
    const firstKey = getFirstTemplateKey();
    refreshTemplateSelect(firstKey);
    if (firstKey) {
      templateSelect.value = firstKey;
      applyTemplate(firstKey);
    }
  }

  function updateBreadcrumbHighlight(currentStep = 1) {
    breadcrumbs.forEach((crumb, index) => {
      if (index === currentStep) {
        crumb.setAttribute('aria-current', 'page');
      } else {
        crumb.removeAttribute('aria-current');
      }
    });
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      body.classList.add('theme-dark');
      body.classList.remove('theme-light');
      setThemeButtonState('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
      body.classList.remove('theme-dark');
      body.classList.add('theme-light');
      setThemeButtonState('light');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
  }

  function setThemeButtonState(theme) {
    if (!themeToggle) return;
    const label = themeToggle.querySelector('.button__label');
    const iconHolder = themeToggle.querySelector('svg');
    themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    if (label) {
      label.textContent = theme === 'dark' ? 'Modo claro' : 'Modo oscuro';
    }
    if (iconHolder) {
      const newIcon = createIcon(theme === 'dark' ? 'sun' : 'moon');
      iconHolder.replaceWith(newIcon);
    }
  }

  function initTheme() {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : 'light');
    applyTheme(theme);
  }

  injectIcons();
  initTheme();

  editor.addEventListener('input', updatePreview);
  columnsSel?.addEventListener('change', updatePreview);
  fontFamilySel?.addEventListener('change', updatePreview);
  baseSizeInput?.addEventListener('change', updatePreview);
  pageSizeSel?.addEventListener('change', updatePreview);

  fileInput?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const type = (file.name || '').toLowerCase();
    if (type.endsWith('.docx')) {
      alert('Lectura de .docx pendiente. Usa .md/.txt/.rtf.');
      return;
    }
    const text = await file.text();
    editor.value = text;
    updatePreview();
  });

  pasteBtn?.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      editor.value = text;
      updatePreview();
    } catch {
      alert('No se pudo leer del portapapeles.');
    }
  });

  imgInput?.addEventListener('change', (event) => {
    const added = assetService.addFiles(event.target.files);
    if (!added.length) return;
    alert(`Imágenes cargadas: ${added.map((item) => item.name).join(', ')}`);
  });

  insertImageBtn?.addEventListener('click', () => {
    if (!assetService.hasImages()) {
      alert('Primero sube imágenes.');
      return;
    }
    const options = assetService
      .getImages()
      .map((asset, index) => `${index + 1}) ${asset.name}`)
      .join('\n');
    const selection = prompt('Elige imagen (número):\n' + options);
    const idx = Number(selection) - 1;
    const chosen = assetService.getImageByIndex(idx);
    if (!chosen) return;
    surroundText(`\n\n![Figura](${chosen.url})\n\n`, '');
  });

  document.getElementById('h1Btn')?.addEventListener('click', () => surroundText('\n\n# ', ''));
  document.getElementById('h2Btn')?.addEventListener('click', () => surroundText('\n\n## ', ''));
  document.getElementById('boldBtn')?.addEventListener('click', () => surroundText('**'));
  document.getElementById('italicBtn')?.addEventListener('click', () => surroundText('*'));

  applyTemplateBtn?.addEventListener('click', () => {
    const key = templateSelect?.value;
    if (!key) return;
    applyTemplate(key);
  });

  adminToggle?.addEventListener('change', () => {
    if (adminPanel) {
      adminPanel.hidden = !adminToggle.checked;
    }
    if (adminToggle.checked && templateSelect?.value) {
      setAdminForm(templateSelect.value);
    }
  });

  templateSelect?.addEventListener('change', () => {
    if (adminToggle?.checked) {
      setAdminForm(templateSelect.value);
    }
    if (templateSelect?.value) {
      applyTemplate(templateSelect.value);
    }
  });

  newTemplateBtn?.addEventListener('click', () => {
    tplKey.value = '';
    tplName.value = '';
    tplColumns.value = 2;
    tplFont.value = 'Inter, system-ui, sans-serif';
    tplBase.value = 12;
    tplPage.value = 'A4';
    tplMargins.value = '18, 18, 18, 18';
    tplHeadings.value = '{"h1":{"size":"1.6em","weight":700},"h2":{"size":"1.3em","weight":600},"h3":{"size":"1.15em","weight":600}}';
    tplFigure.value = '{"captionSize":"0.9em","captionColor":"#555","span":"auto"}';
  });

  saveTemplateBtn?.addEventListener('click', () => {
    const key = tplKey.value.trim();
    if (!key) {
      alert('La clave de plantilla es obligatoria.');
      return;
    }

    let headings = {};
    let figure = {};

    try {
      headings = tplHeadings.value ? JSON.parse(tplHeadings.value) : {};
    } catch {
      alert('Headings JSON inválido');
      return;
    }

    try {
      figure = tplFigure.value ? JSON.parse(tplFigure.value) : {};
    } catch {
      alert('Figure JSON inválido');
      return;
    }

    const margins = parseMargins(tplMargins.value);

    try {
      templateStore.upsertTemplate(key, {
        displayName: tplName.value || key,
        columns: Number(tplColumns.value),
        fontFamily: tplFont.value,
        baseSizePx: Number(tplBase.value),
        pageSize: tplPage.value,
        marginsMm: margins,
        headings,
        figure,
      });
    } catch (error) {
      alert(`Plantilla inválida: ${error instanceof Error ? error.message : String(error)}`);
      return;
    }

    refreshTemplateSelect(key);
    templateSelect.value = key;
    alert('Plantilla guardada.');
  });

  deleteTemplateBtn?.addEventListener('click', () => {
    const key = templateSelect?.value;
    if (!key) return;
    if (!confirm(`¿Eliminar plantilla "${key}"?`)) return;
    templateStore.removeTemplate(key);
    refreshTemplateSelect(getFirstTemplateKey());
    newTemplateBtn?.click();
  });

  importTemplatesBtn?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const imported = JSON.parse(await file.text());
        templateStore.replaceAll(imported);
        const firstKey = getFirstTemplateKey();
        refreshTemplateSelect(firstKey);
        if (firstKey) {
          templateSelect.value = firstKey;
          if (adminToggle?.checked) {
            setAdminForm(firstKey);
          }
        }
        alert('Plantillas importadas.');
      } catch (error) {
        alert(
          error instanceof Error
            ? `No se pudo importar: ${error.message}`
            : 'No se pudo importar el archivo especificado.'
        );
      }
    };
    input.click();
  });

  exportTemplatesBtn?.addEventListener('click', () => {
    const blob = new Blob([templateStore.exportTemplates()], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'templates.json';
    link.click();
    URL.revokeObjectURL(link.href);
  });

  resetTemplatesBtn?.addEventListener('click', () => {
    if (!confirm('Restaurar plantillas por defecto?')) return;
    templateStore.resetTemplates();
    const firstKey = getFirstTemplateKey();
    refreshTemplateSelect(firstKey);
    if (firstKey) {
      templateSelect.value = firstKey;
      applyTemplate(firstKey);
    }
    alert('Restaurado.');
  });

  window.addEventListener('beforeunload', () => assetService.dispose(), { once: true });

  themeToggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });

  function setInitialContent() {
    editor.value =
      '# Título del artículo\n\n' +
      '**Autores:** A. Pérez, B. García\n\n' +
      '**Resumen:** Texto breve del resumen...\n\n' +
      '## Introducción\nEscribe aquí...\n\n' +
      '## Métodos\n...\n\n' +
      '## Resultados\n...\n\n' +
      '## Discusión\n...\n';
  }

  bootstrapTemplates();
  setInitialContent();
  const key = templateSelect?.value;
  if (key) {
    applyTemplate(key);
  } else {
    updatePreview();
  }

  updateBreadcrumbHighlight(1);
}
