const SVG_NS = 'http://www.w3.org/2000/svg';

const ICONS = {
  moon: {
    viewBox: '0 0 24 24',
    elements: [
      {
        tag: 'path',
        attrs: {
          d: 'M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79z',
        },
      },
    ],
  },
  sun: {
    viewBox: '0 0 24 24',
    elements: [
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '4' } },
      { tag: 'path', attrs: { d: 'M12 2v2' } },
      { tag: 'path', attrs: { d: 'M12 20v2' } },
      { tag: 'path', attrs: { d: 'm4.93 4.93 1.41 1.41' } },
      { tag: 'path', attrs: { d: 'm17.66 17.66 1.41 1.41' } },
      { tag: 'path', attrs: { d: 'M2 12h2' } },
      { tag: 'path', attrs: { d: 'M20 12h2' } },
      { tag: 'path', attrs: { d: 'm6.34 17.66-1.41 1.41' } },
      { tag: 'path', attrs: { d: 'm19.07 4.93-1.41 1.41' } },
    ],
  },
  download: {
    viewBox: '0 0 24 24',
    elements: [
      { tag: 'path', attrs: { d: 'M12 3v12' } },
      { tag: 'path', attrs: { d: 'M7 12l5 5 5-5' } },
      { tag: 'path', attrs: { d: 'M5 19h14' } },
    ],
  },
  document: {
    viewBox: '0 0 24 24',
    elements: [
      { tag: 'path', attrs: { d: 'M7 3h7l5 5v13H7z' } },
      { tag: 'path', attrs: { d: 'M14 3v5h5' } },
    ],
  },
  layout: {
    viewBox: '0 0 24 24',
    elements: [
      { tag: 'rect', attrs: { x: '3', y: '4', width: '18', height: '16', rx: '2', ry: '2' } },
      { tag: 'path', attrs: { d: 'M9 4v16' } },
    ],
  },
  preview: {
    viewBox: '0 0 24 24',
    elements: [
      { tag: 'path', attrs: { d: 'M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z' } },
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '2.5' } },
    ],
  },
  share: {
    viewBox: '0 0 24 24',
    elements: [
      { tag: 'circle', attrs: { cx: '6', cy: '12', r: '2' } },
      { tag: 'circle', attrs: { cx: '18', cy: '6', r: '2' } },
      { tag: 'circle', attrs: { cx: '18', cy: '18', r: '2' } },
      { tag: 'path', attrs: { d: 'M8 11l8-4' } },
      { tag: 'path', attrs: { d: 'M8 13l8 4' } },
    ],
  },
  upload: {
    viewBox: '0 0 24 24',
    elements: [
      { tag: 'path', attrs: { d: 'M12 21V9' } },
      { tag: 'path', attrs: { d: 'M7 14l5-5 5 5' } },
      { tag: 'path', attrs: { d: 'M4 3h16' } },
    ],
  },
  clipboard: {
    viewBox: '0 0 24 24',
    elements: [
      { tag: 'rect', attrs: { x: '7', y: '4', width: '10', height: '16', rx: '2', ry: '2' } },
      { tag: 'path', attrs: { d: 'M9 4V3h6v1' } },
    ],
  },
  grid: {
    viewBox: '0 0 24 24',
    elements: [
      { tag: 'rect', attrs: { x: '3', y: '3', width: '6', height: '6', rx: '1' } },
      { tag: 'rect', attrs: { x: '15', y: '3', width: '6', height: '6', rx: '1' } },
      { tag: 'rect', attrs: { x: '3', y: '15', width: '6', height: '6', rx: '1' } },
      { tag: 'rect', attrs: { x: '15', y: '15', width: '6', height: '6', rx: '1' } },
    ],
  },
  layers: {
    viewBox: '0 0 24 24',
    elements: [
      { tag: 'path', attrs: { d: 'M12 4l9 5-9 5-9-5 9-5z' } },
      { tag: 'path', attrs: { d: 'M3 14l9 5 9-5' } },
    ],
  },
  spark: {
    viewBox: '0 0 24 24',
    elements: [
      { tag: 'path', attrs: { d: 'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z' } },
    ],
  },
  import: {
    viewBox: '0 0 24 24',
    elements: [
      { tag: 'path', attrs: { d: 'M12 3v12' } },
      { tag: 'path', attrs: { d: 'M8 11l4 4 4-4' } },
      { tag: 'path', attrs: { d: 'M5 21h14' } },
    ],
  },
  export: {
    viewBox: '0 0 24 24',
    elements: [
      { tag: 'path', attrs: { d: 'M12 21V9' } },
      { tag: 'path', attrs: { d: 'M16 13l-4-4-4 4' } },
      { tag: 'path', attrs: { d: 'M5 3h14' } },
    ],
  },
  refresh: {
    viewBox: '0 0 24 24',
    elements: [
      { tag: 'path', attrs: { d: 'M21 12a9 9 0 1 1-2.6-6.4' } },
      { tag: 'path', attrs: { d: 'M21 5v7h-7' } },
    ],
  },
  plus: {
    viewBox: '0 0 24 24',
    elements: [
      { tag: 'path', attrs: { d: 'M12 5v14' } },
      { tag: 'path', attrs: { d: 'M5 12h14' } },
    ],
  },
  save: {
    viewBox: '0 0 24 24',
    elements: [
      { tag: 'path', attrs: { d: 'M5 5h11l3 3v11H5z' } },
      { tag: 'path', attrs: { d: 'M9 5v5h6V5' } },
      { tag: 'path', attrs: { d: 'M9 17h6' } },
    ],
  },
  trash: {
    viewBox: '0 0 24 24',
    elements: [
      { tag: 'path', attrs: { d: 'M4 7h16' } },
      { tag: 'path', attrs: { d: 'M10 11v6' } },
      { tag: 'path', attrs: { d: 'M14 11v6' } },
      { tag: 'path', attrs: { d: 'M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12' } },
      { tag: 'path', attrs: { d: 'M9 7V5h6v2' } },
    ],
  },
  edit: {
    viewBox: '0 0 24 24',
    elements: [
      { tag: 'path', attrs: { d: 'M4 20h4l10-10-4-4L4 16z' } },
      { tag: 'path', attrs: { d: 'M14 6l4 4' } },
    ],
  },
  image: {
    viewBox: '0 0 24 24',
    elements: [
      { tag: 'rect', attrs: { x: '3', y: '5', width: '18', height: '14', rx: '2' } },
      { tag: 'circle', attrs: { cx: '9', cy: '10', r: '2' } },
      { tag: 'path', attrs: { d: 'M21 15l-4-4-4 4-3-3-4 4' } },
    ],
  },
  bookmark: {
    viewBox: '0 0 24 24',
    elements: [
      { tag: 'path', attrs: { d: 'M6 4h12v16l-6-3-6 3z' } },
    ],
  },
};

export function createIcon(name, { className } = {}) {
  const definition = ICONS[name];
  if (!definition) return null;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', definition.viewBox);
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('icon');
  if (className) {
    svg.classList.add(className);
  }

  definition.elements.forEach(({ tag, attrs }) => {
    const element = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    svg.appendChild(element);
  });

  return svg;
}

export function injectIcons(root = document) {
  const placeholders = root.querySelectorAll('[data-icon]');
  placeholders.forEach((placeholder) => {
    const iconName = placeholder.getAttribute('data-icon');
    const className = placeholder.getAttribute('data-icon-class') || '';
    const icon = createIcon(iconName, { className });
    if (!icon) return;
    icon.setAttribute('focusable', 'false');

    const attributes = placeholder.getAttributeNames();
    attributes.forEach((attr) => {
      if (attr === 'data-icon' || attr === 'data-icon-class') return;
      const value = placeholder.getAttribute(attr);
      if (value === null) return;
      icon.setAttribute(attr, value);
    });

    placeholder.classList.forEach((cls) => {
      if (!icon.classList.contains(cls)) {
        icon.classList.add(cls);
      }
    });

    placeholder.replaceWith(icon);
  });
}
