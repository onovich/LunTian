import { createLunTianGame } from './app/createLunTianGame.js';
import './styles.css';
import { APP_TEMPLATE } from './view/template.js';

function boot() {
  const root = document.getElementById('app-root');
  if (!root) throw new Error('Missing #app-root');

  root.innerHTML = APP_TEMPLATE;
  createLunTianGame().init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
