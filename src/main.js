import { config } from './config';
import '../packages/create-audio-guide-widget/src/index.js';

// Fallback load for Netlify Identity if global not present
if (!window.netlifyIdentity) {
  const s = document.createElement('script');
  s.src = 'https://identity.netlify.com/v1/netlify-identity-widget.js';
  document.head.appendChild(s);
}

// Dynamic configuration based on environment
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const cmsConfig = { ...config };

if (!isLocal) {
  // Production: Use git-gateway
  cmsConfig.backend = {
    name: 'git-gateway',
    branch: 'main', // git-gateway uses the branch configured in Netlify, but this doesn't hurt
  };
}

// Initialize CMS manually
// Note: We don't need to wait for DOMContentLoaded if we are in a module script at the end of body,
// but it's safer to wait or check CMS existence.
// Since we import 'decap-cms' (which attaches to window.CMS), we can init.
// However, 'decap-cms' import might trigger auto-init if config.yml is found.
// We will remove config.yml to prevent double init or conflict.

if (window.CMS) {
  window.CMS.init({ config: cmsConfig });
} else {
  // In case of race condition or different bundle structure
  window.addEventListener('load', () => {
    if (window.CMS) window.CMS.init({ config: cmsConfig });
  });
}


// Inject title & replace pre-login logo (formerly IIFE)
function injectTitle() {
  const header = document.querySelector('header');
  if (!header) return;
  if (header.querySelector('.laxy-cms-title')) return;
  const container = header.querySelector('div');
  if (!container) return;
  const titleEl = document.createElement('span');
  titleEl.className = 'laxy-cms-title';
  titleEl.textContent = 'Laxy Guide Studio';
  const nav = container.querySelector('nav');
  if (nav) container.insertBefore(titleEl, nav); else container.prepend(titleEl);
}
function replacePreLoginLogo() {
  const logoSpan = document.querySelector("span[class*='DecapLogoIcon']");
  if (logoSpan && !logoSpan.dataset.laxyLogoReplaced) {
    logoSpan.classList.add('laxy-prelogin-logo');
    logoSpan.innerHTML = '';
    const img = document.createElement('img');
    img.src = 'https://guide.laxy.travel/assets/travel-Dcyy3aKV.svg';
    img.alt = 'Laxy Guide';
    logoSpan.appendChild(img);
    logoSpan.dataset.laxyLogoReplaced = 'true';
  }
}
const observer = new MutationObserver(() => { injectTitle(); replacePreLoginLogo(); });
observer.observe(document.body, { childList: true, subtree: true });
window.addEventListener('DOMContentLoaded', () => { injectTitle(); replacePreLoginLogo(); });
