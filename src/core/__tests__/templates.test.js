import { beforeEach, describe, expect, it } from 'vitest';

import { createTemplateStore } from '../templates.js';

const TEST_TEMPLATE_KEY = 'test-template';

function buildValidTemplate(overrides = {}) {
  return {
    displayName: 'Test Template',
    columns: 2,
    fontFamily: 'Inter',
    baseSizePx: 12,
    pageSize: 'A4',
    marginsMm: [20, 20, 20, 20],
    contentTopOffsetMm: 12,
    maxPages: 6,
    headings: null,
    figure: null,
    ...overrides,
  };
}

describe('createTemplateStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads default templates when storage is empty', () => {
    const store = createTemplateStore();
    const templates = store.load();
    expect(Object.keys(templates).length).toBeGreaterThan(0);
  });

  it('persists templates created via upsert', () => {
    const store = createTemplateStore();
    store.load();
    store.upsertTemplate(TEST_TEMPLATE_KEY, buildValidTemplate());

    const stored = JSON.parse(localStorage.getItem('sjf.templates'));
    expect(stored).toBeTruthy();
    expect(stored[TEST_TEMPLATE_KEY]).toBeTruthy();
    expect(stored[TEST_TEMPLATE_KEY].displayName).toBe('Test Template');

    const newStore = createTemplateStore();
    const templates = newStore.load();
    expect(templates[TEST_TEMPLATE_KEY].columns).toBe(2);
  });

  it('merges stored templates with defaults when reloading', () => {
    const store = createTemplateStore();
    const defaults = store.load();
    const firstKey = store.getKeys()[0];
    const original = defaults[firstKey];

    const overridden = buildValidTemplate({
      ...original,
      displayName: `${original.displayName} Updated`,
    });

    store.upsertTemplate(firstKey, overridden);

    const reloaded = createTemplateStore().load();
    expect(reloaded[firstKey].displayName).toContain('Updated');
    expect(reloaded[firstKey].columns).toBe(original.columns);
  });

  it('rejects invalid template structures', () => {
    const store = createTemplateStore();
    store.load();
    expect(() => store.upsertTemplate('bad', { columns: 2 })).toThrow(/template/i);
  });
});
