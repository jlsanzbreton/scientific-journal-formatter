import { createTemplateStore } from '../core/templates.js';
import { setupEditor } from './editor.js';
import { createPreview } from './preview.js';
import { createAssetService } from '../services/assets.js';
import { registerPwa } from '../services/pwa.js';

export function initUi() {
  const templateStore = createTemplateStore();
  const previewFrame = document.getElementById('preview');
  const preview = createPreview(previewFrame);
  const assetService = createAssetService();

  setupEditor({ preview, templateStore, assetService });
  registerPwa();
}
