import CMS from 'decap-cms';
import { config } from './config';
import { CreateAudioGuideControl, CreateAudioGuidePreview } from '../packages/create-audio-guide-widget/src/controller/wizardController';

// Fallback load for Netlify Identity if global not present
if (!window.netlifyIdentity) {
  const s = document.createElement('script');
  s.src = 'https://identity.netlify.com/v1/netlify-identity-widget.js';
  document.head.appendChild(s);
}

// Register widget manually using the imported CMS instance
// This avoids relying on window.CMS being populated immediately or race conditions
CMS.registerWidget('CreateAudioGuide', CreateAudioGuideControl, CreateAudioGuidePreview);

// Dynamic configuration based on environment
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const cmsConfig = { ...config };

if (!isLocal) {
  // Production: Use git-gateway
  cmsConfig.backend = {
    name: 'git-gateway',
    branch: 'main',
  };
}

// Initialize CMS
CMS.init({ config: cmsConfig });



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
