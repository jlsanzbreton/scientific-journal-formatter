import './styles/main.css';
import { initUi } from './ui/main.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUi, { once: true });
} else {
  initUi();
}
