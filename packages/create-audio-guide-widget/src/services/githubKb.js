// GitHub knowledge base fetch service
const GITHUB_REPO = 'LaxyVibe/LaxyGuideCMS';
const KB_BASE_PATH = 'content/knowledgeBase';
// Bump cache key to v4 (name-only entries)
const CACHE_KEY = 'kb-selector-cache-v5';

function parseFrontmatter(raw) {
  if (typeof raw !== 'string' || !raw.startsWith('---')) return {};
  const end = raw.indexOf('\n---', 3); if (end === -1) return {};
  const fm = raw.substring(3, end).trim(); const obj = {};
  fm.split(/\r?\n/).forEach(line => { const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/); if (m) { let v = m[2].trim().replace(/^['"]|['"]$/g, ''); obj[m[1]] = v; } });
  return obj;
}

function getCmsAuthToken() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('netlify-cms-user') || localStorage.getItem('decap-cms-user');
    if (!raw) return null; const parsed = JSON.parse(raw); return parsed && parsed.token ? parsed.token : null;
  } catch { return null; }
}

function authHeaders() {
  const t = getCmsAuthToken();
  return t ? { Authorization: 'Bearer ' + t } : {};
}

export async function loadKnowledgeBases(force = false) {
  if (!force) {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const arr = JSON.parse(cached);
        if (Array.isArray(arr) && arr.length) {
          return arr;
        }
      }
    } catch { }
  }

  // Determine if we are using git-gateway (production) or github (local)
  // We can infer this from the hostname or by checking if we have a Netlify token
  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  let apiUrl;
  let headers = {};

  if (isLocal) {
    // Local: Direct GitHub API
    apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${KB_BASE_PATH}`;
    headers = { 'Accept': 'application/vnd.github.v3+json', ...authHeaders() };
  } else {
    // Production: Use git-gateway proxy
    // Path mapping: /.netlify/git/github/contents/...
    apiUrl = `/.netlify/git/github/contents/${KB_BASE_PATH}`;
    const token = getCmsAuthToken();
    if (token) {
      headers = { 'Authorization': 'Bearer ' + token };
    }
  }

  try {
    const r = await fetch(apiUrl, { headers });
    if (!r.ok) throw new Error('KB list failed ' + r.status);
    const items = await r.json(); if (!Array.isArray(items)) return [];
    const mdFiles = items.filter(f => f.type === 'file' && /\.md$/i.test(f.name));
    const results = mdFiles
      .map(f => ({ name: f.name.replace(/\.md$/, '') }))
      .sort((a, b) => a.name.localeCompare(b.name));
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(results)); } catch { }
    return results;
  } catch { return []; }
}
