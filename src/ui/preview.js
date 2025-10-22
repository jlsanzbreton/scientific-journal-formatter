import previewStylesUrl from '../styles/main.css?url';

export function createPreview(iframe) {
  if (!iframe) {
    throw new Error('Preview iframe not found');
  }

  let headingCss = '';
  let layoutCss = '';
  let pendingMarkdown = '';
  let pendingLayout = {
    columns: 2,
    fontFamily: '',
    baseSize: 12,
    pageSize: 'A4',
    margins: [18, 18, 18, 18],
  };
  let ready = false;
  const readyQueue = [];

  function getDocument() {
    return iframe.contentDocument ?? iframe.contentWindow?.document ?? null;
  }

  function ensureDocument() {
    const doc = getDocument();
    if (!doc) {
      throw new Error('Preview document not ready');
    }
    return doc;
  }

  function initDocument() {
    iframe.srcdoc = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="${previewStylesUrl}" />
    <style id="tplStyle"></style>
  </head>
  <body>
    <article id="doc" class="preview-doc" style="column-count: 2;"></article>
  </body>
</html>`;
  }

  function getStyleElement(doc) {
    return doc.getElementById('tplStyle');
  }

  function syncStyle(doc) {
    const style = getStyleElement(doc);
    if (style) {
      style.textContent = `${headingCss}${layoutCss}`;
    }
  }

  function runWhenReady(fn) {
    if (ready) {
      fn();
    } else {
      readyQueue.push(fn);
    }
  }

  function applyHeadingStyles(template) {
    const headings = template?.headings ?? {};
    let css = '';

    if (headings.h1) {
      css += `.preview-doc h1{font-size:${headings.h1.size ?? '1.6em'};font-weight:${headings.h1.weight ?? 700};margin:${headings.h1.margin ?? '0.8em 0 0.4em'};}`;
    }
    if (headings.h2) {
      css += `.preview-doc h2{font-size:${headings.h2.size ?? '1.3em'};font-weight:${headings.h2.weight ?? 600};margin:${headings.h2.margin ?? '0.7em 0 0.35em'};}`;
    }
    if (headings.h3) {
      css += `.preview-doc h3{font-size:${headings.h3.size ?? '1.15em'};font-weight:${headings.h3.weight ?? 600};margin:${headings.h3.margin ?? '0.6em 0 0.3em'};}`;
    }

    const figure = template?.figure ?? {};
    if (figure.captionSize || figure.captionColor) {
      const parts = [];
      if (figure.captionSize) parts.push(`font-size:${figure.captionSize};`);
      if (figure.captionColor) parts.push(`color:${figure.captionColor};`);
      css += `.figure figcaption{${parts.join('')}}`;
    }

    headingCss = css;

    runWhenReady(() => {
      const doc = ensureDocument();
      syncStyle(doc);
    });
  }

  function setLayout({ columns, fontFamily, baseSize, pageSize, margins }) {
    pendingLayout = {
      columns: columns ?? pendingLayout.columns,
      fontFamily: fontFamily ?? pendingLayout.fontFamily,
      baseSize: baseSize ?? pendingLayout.baseSize,
      pageSize: pageSize ?? pendingLayout.pageSize,
      margins: Array.isArray(margins) && margins.length === 4 ? margins : pendingLayout.margins,
    };

    runWhenReady(() => {
      const doc = ensureDocument();
      const host = doc.getElementById('doc');
      if (!host) return;

      host.style.columnCount = String(pendingLayout.columns);
      if (pendingLayout.fontFamily) {
        host.style.setProperty('--font-family', pendingLayout.fontFamily);
      }
      if (pendingLayout.baseSize) {
        host.style.setProperty('--base-size', `${pendingLayout.baseSize}px`);
      }

      const [top, right, bottom, left] = pendingLayout.margins;
      layoutCss = `@media print{@page{size:${pendingLayout.pageSize};margin:${top}mm ${right}mm ${bottom}mm ${left}mm;}}`;
      syncStyle(doc);
    });
  }

  function getMarked() {
    const globalMarked = window.marked ?? globalThis.marked;
    return typeof globalMarked?.parse === 'function' ? globalMarked : null;
  }

  function renderMarkdown(markdown) {
    pendingMarkdown = markdown ?? '';

    runWhenReady(() => {
      const doc = ensureDocument();
      const host = doc.getElementById('doc');
      if (!host) return;

      const parser = getMarked();
      const html = parser ? parser.parse(pendingMarkdown) : pendingMarkdown;
      host.innerHTML = html;

      host.querySelectorAll('img').forEach((img) => {
        const figure = doc.createElement('figure');
        figure.className = 'figure';
        img.replaceWith(figure);
        figure.appendChild(img);
        const caption = doc.createElement('figcaption');
        caption.textContent = img.getAttribute('alt') || 'Figura';
        figure.appendChild(caption);
      });
    });
  }

  function refresh(markdown, layout) {
    renderMarkdown(markdown);
    setLayout(layout);
  }

  initDocument();

  iframe.addEventListener('load', () => {
    ready = true;
    const doc = ensureDocument();
    const host = doc.getElementById('doc');
    if (host) {
      host.style.columnCount = String(pendingLayout.columns);
      if (pendingLayout.fontFamily) {
        host.style.setProperty('--font-family', pendingLayout.fontFamily);
      }
      if (pendingLayout.baseSize) {
        host.style.setProperty('--base-size', `${pendingLayout.baseSize}px`);
      }
    }
    syncStyle(doc);
    readyQueue.splice(0).forEach((fn) => {
      try {
        fn();
      } catch (error) {
        console.warn('[preview] Deferred render failed', error);
      }
    });
  });

  return {
    applyHeadingStyles,
    setLayout,
    renderMarkdown,
    refresh,
  };
}
