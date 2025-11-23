// Main entry: initialize Decap CMS from npm build, register custom widget package
import 'decap-cms';
// Removed failing identity import; use script tag fallback if needed
import '../packages/create-audio-guide-widget/src/index.js';
// Fallback load for Netlify Identity if global not present
if (!window.netlifyIdentity) {
  const s = document.createElement('script');
  s.src = 'https://identity.netlify.com/v1/netlify-identity-widget.js';
  document.head.appendChild(s);
}
// Ensure widget registration waits for CMS init
if (window.CMS) {
  // already loaded; nothing extra
} else {
  document.addEventListener('DOMContentLoaded', () => {});
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
