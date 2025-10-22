import Ajv from 'ajv';
import defaultTemplatesData from '../data/templates.json' assert { type: 'json' };

const STORAGE_KEY = 'sjf.templates';
const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });

const headingSchema = {
  type: 'object',
  properties: {
    size: { type: 'string', minLength: 1 },
    weight: { type: 'integer', minimum: 100, maximum: 900 },
    margin: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
};

const headingsSchema = {
  type: 'object',
  properties: {
    h1: headingSchema,
    h2: headingSchema,
    h3: headingSchema,
  },
  additionalProperties: false,
};

const figureSchema = {
  type: 'object',
  properties: {
    captionSize: { type: 'string', minLength: 1 },
    captionColor: { type: 'string', minLength: 1 },
    span: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
};

const templateSchema = {
  type: 'object',
  properties: {
    displayName: { type: 'string', minLength: 1 },
    columns: { type: 'integer', minimum: 1, maximum: 6 },
    fontFamily: { type: 'string', minLength: 1 },
    baseSizePx: { type: 'integer', minimum: 6, maximum: 36 },
    pageSize: { type: 'string', minLength: 1 },
    marginsMm: {
      type: 'array',
      items: { type: 'number', minimum: 0 },
      minItems: 4,
      maxItems: 4,
    },
    contentTopOffsetMm: { type: 'number', minimum: 0 },
    maxPages: { type: 'integer', minimum: 1 },
    headings: { anyOf: [{ type: 'null' }, headingsSchema] },
    figure: { anyOf: [{ type: 'null' }, figureSchema] },
  },
  required: ['columns', 'fontFamily', 'baseSizePx', 'pageSize', 'marginsMm'],
  additionalProperties: false,
};

const templatesSchema = {
  type: 'object',
  propertyNames: { pattern: '^[a-zA-Z0-9._-]{1,64}$' },
  additionalProperties: templateSchema,
};

const validateTemplateEntry = ajv.compile(templateSchema);
const validateTemplatesMap = ajv.compile(templatesSchema);

function formatAjvErrors(errors, context) {
  if (!errors?.length) return `${context} inválido`;
  return errors
    .map((err) => {
      const path = err.instancePath ? err.instancePath.replace(/\//g, '.').replace(/^\./, '') : '';
      const where = path ? `${context}.${path}` : context;
      return `${where} ${err.message}`;
    })
    .join('; ');
}

function assertTemplateMap(map) {
  if (!validateTemplatesMap(map)) {
    throw new Error(formatAjvErrors(validateTemplatesMap.errors, 'templates'));
  }
}

function assertTemplateEntry(key, template) {
  if (!validateTemplateEntry(template)) {
    throw new Error(formatAjvErrors(validateTemplateEntry.errors, `template["${key}"]`));
  }
}

function cloneDefaultTemplates() {
  const clone = structuredClone(defaultTemplatesData);
  assertTemplateMap(clone);
  return clone;
}

/**
 * Creates an in-memory store that manages template definitions and persistence.
 */
export function createTemplateStore() {
  let defaultTemplates = cloneDefaultTemplates();
  let templates = structuredClone(defaultTemplates);

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        assertTemplateMap(parsed);
        return parsed;
      }
    } catch (error) {
      console.warn('[templates] Stored templates are invalid and will be reset.', error);
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
    defaultTemplates = cloneDefaultTemplates();
    const stored = loadFromStorage();
    templates = structuredClone(stored ?? defaultTemplates);
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
    const clone = structuredClone(template);
    assertTemplateEntry(key, clone);
    templates[key] = clone;
    persist();
    return structuredClone(clone);
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
    const clone = structuredClone(newTemplates);
    assertTemplateMap(clone);
    templates = clone;
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
