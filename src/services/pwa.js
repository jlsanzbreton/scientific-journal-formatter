export function registerPwa() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((error) => console.warn('[pwa] Service worker registration failed', error));
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    const button = document.getElementById('installBtn');
    if (!button) return;
    button.hidden = false;
    button.onclick = () => event.prompt();
  });
}
