import defaultTemplatesData from '../data/templates.json' assert { type: 'json' };

const STORAGE_KEY = 'sjf.templates';

/**
 * Creates an in-memory store that manages template definitions and persistence.
 */
export function createTemplateStore() {
  let defaultTemplates = structuredClone(defaultTemplatesData);
  let templates = structuredClone(defaultTemplates);

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (error) {
      console.warn('[templates] Failed to parse stored templates.', error);
    }
    return null;
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    } catch (error) {
      console.warn('[templates] Unable to persist templates.', error);
    }
  }

  function load() {
    defaultTemplates = structuredClone(defaultTemplatesData);
    const stored = loadFromStorage();
    templates = stored ?? structuredClone(defaultTemplates);
    return templates;
  }

  function getTemplates() {
    return templates;
  }

  function getTemplate(key) {
    return templates[key];
  }

  function getKeys() {
    return Object.keys(templates);
  }

  function upsertTemplate(key, template) {
    templates[key] = template;
    persist();
    return templates[key];
  }

  function removeTemplate(key) {
    delete templates[key];
    persist();
  }

  function resetTemplates() {
    templates = structuredClone(defaultTemplates);
    persist();
    return templates;
  }

  function replaceAll(newTemplates) {
    templates = structuredClone(newTemplates);
    persist();
    return templates;
  }

  function exportTemplates() {
    return JSON.stringify(templates, null, 2);
  }

  function getDefaultTemplates() {
    return structuredClone(defaultTemplates);
  }

  return {
    load,
    getTemplates,
    getTemplate,
    getKeys,
    upsertTemplate,
    removeTemplate,
    resetTemplates,
    replaceAll,
    exportTemplates,
    getDefaultTemplates,
  };
}
