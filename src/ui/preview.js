import { marked } from 'marked';
import createDOMPurify from 'dompurify';

import previewStylesUrl from '../styles/main.css?url';

marked.setOptions(
  /** @type {import('marked').MarkedOptions & Record<string, unknown>} */ ({
    gfm: true,
    breaks: true,
    headerIds: true,
    mangle: false,
  }),
);

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
    contentTopOffsetMm: 0,
  };
  let ready = false;
  const readyQueue = [];
  let DOMPurify = createDOMPurify(window);

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
    <article id="doc" class="preview-doc">
      <section class="preview-front"></section>
      <section class="preview-columns"></section>
    </article>
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

  function setLayout({ columns, fontFamily, baseSize, pageSize, margins, contentTopOffsetMm }) {
    pendingLayout = {
      columns: columns ?? pendingLayout.columns,
      fontFamily: fontFamily ?? pendingLayout.fontFamily,
      baseSize: baseSize ?? pendingLayout.baseSize,
      pageSize: pageSize ?? pendingLayout.pageSize,
      margins: Array.isArray(margins) && margins.length === 4 ? margins : pendingLayout.margins,
      contentTopOffsetMm:
        typeof contentTopOffsetMm === 'number' && Number.isFinite(contentTopOffsetMm)
          ? Math.max(contentTopOffsetMm, 0)
          : pendingLayout.contentTopOffsetMm,
    };

    runWhenReady(() => {
      const doc = ensureDocument();
      const host = doc.getElementById('doc');
      if (!host) return;

      if (pendingLayout.fontFamily) {
        host.style.setProperty('--font-family', pendingLayout.fontFamily);
      }
      if (pendingLayout.baseSize) {
        host.style.setProperty('--base-size', `${pendingLayout.baseSize}px`);
      }

      const columnsContainer = doc.querySelector('.preview-columns');
      if (columnsContainer) {
        columnsContainer.style.columnCount = String(pendingLayout.columns);
        columnsContainer.style.columnGap = 'var(--column-gap)';
        columnsContainer.style.columnFill = 'balance';
        columnsContainer.style.setProperty(
          '--column-top-offset',
          `${pendingLayout.contentTopOffsetMm ?? 0}mm`,
        );
      }

      const [top, right, bottom, left] = pendingLayout.margins;
      layoutCss = `@media print{@page{size:${pendingLayout.pageSize};margin:${top}mm ${right}mm ${bottom}mm ${left}mm;}}`;
      syncStyle(doc);
    });
  }

  function renderMarkdown(markdown) {
    pendingMarkdown = markdown ?? '';

    runWhenReady(() => {
      const doc = ensureDocument();
      const host = doc.getElementById('doc');
      if (!host) return;

      const rawHtml = /** @type {string} */ (marked.parse(pendingMarkdown));
      const sanitized = DOMPurify.sanitize(rawHtml, {
        USE_PROFILES: { html: true },
        RETURN_TRUSTED_TYPE: false,
      });

      const wrapper = doc.createElement('div');
      wrapper.innerHTML = sanitized;

      host.innerHTML = '';
      const frontSection = doc.createElement('section');
      frontSection.className = 'preview-front';
      const columnsSection = doc.createElement('section');
      columnsSection.className = 'preview-columns';
      host.append(frontSection, columnsSection);

      const nodes = Array.from(wrapper.childNodes);
      const firstH1Index = nodes.findIndex(
        (node) => node.nodeType === Node.ELEMENT_NODE && node.tagName?.toLowerCase() === 'h1',
      );
      const allowedFrontMatterTags = new Set(['p', 'hr', 'ul', 'ol', 'blockquote', 'figure']);
      const frontMatterStopTags = new Set([
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'section',
        'table',
        'article',
        'main',
        'aside',
      ]);

      const appendNode = (container, node) => {
        if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
          return;
        }
        container.appendChild(node);
      };

      if (firstH1Index === -1) {
        nodes.forEach((node) => appendNode(columnsSection, node));
      } else {
        for (let i = 0; i < firstH1Index; i += 1) {
          appendNode(frontSection, nodes[i]);
        }
        let cutoff = nodes.length;
        for (let i = firstH1Index + 1; i < nodes.length; i += 1) {
          const node = nodes[i];
          if (node.nodeType === Node.ELEMENT_NODE) {
            const tag = node.tagName.toLowerCase();
            if (frontMatterStopTags.has(tag)) {
              cutoff = i;
              break;
            }
            if (!allowedFrontMatterTags.has(tag)) {
              cutoff = i;
              break;
            }
          } else if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent?.trim()) {
              cutoff = i;
              break;
            }
          } else {
            cutoff = i;
            break;
          }
        }
        for (let i = firstH1Index; i < cutoff; i += 1) {
          appendNode(frontSection, nodes[i]);
        }
        for (let i = cutoff; i < nodes.length; i += 1) {
          appendNode(columnsSection, nodes[i]);
        }
      }

      if (!frontSection.hasChildNodes()) {
        frontSection.remove();
      }

      host.querySelectorAll('img').forEach((img) => {
        const figure = doc.createElement('figure');
        figure.className = 'figure';
        const originalAlt = img.getAttribute('alt') || '';
        let cleanAlt = originalAlt;
        let span = 1;
        const spanMatch = originalAlt.match(/\|span=(\d+)/i);
        if (spanMatch) {
          span = Math.max(1, Number(spanMatch[1]));
          cleanAlt = originalAlt.replace(spanMatch[0], '');
        }
        figure.dataset.span = String(span);

        cleanAlt = cleanAlt.replace(/\|\s*$/, '').trim();

        img.setAttribute('alt', cleanAlt || 'Figura');
        img.replaceWith(figure);
        figure.appendChild(img);
        const caption = doc.createElement('figcaption');
        caption.textContent = cleanAlt || 'Figura';
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
    if (iframe.contentWindow) {
      DOMPurify = createDOMPurify(iframe.contentWindow);
    }
    const doc = ensureDocument();
    const host = doc.getElementById('doc');
    if (host && pendingLayout.fontFamily) {
      host.style.setProperty('--font-family', pendingLayout.fontFamily);
    }
    if (host && pendingLayout.baseSize) {
      host.style.setProperty('--base-size', `${pendingLayout.baseSize}px`);
    }
    const columnsContainer = doc.querySelector('.preview-columns');
    if (columnsContainer) {
      columnsContainer.style.columnCount = String(pendingLayout.columns);
      columnsContainer.style.columnGap = 'var(--column-gap)';
      columnsContainer.style.columnFill = 'balance';
      columnsContainer.style.setProperty(
        '--column-top-offset',
        `${pendingLayout.contentTopOffsetMm ?? 0}mm`,
      );
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
