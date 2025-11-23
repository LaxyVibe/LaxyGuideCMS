import { initialState, hydrate, serialize, persistableKeys } from '../model/state';
import { loadKnowledgeBases } from '../services/githubKb';
import { simulateGeneration } from '../services/audioGeneration';
// Add dynamic POI fetch helper (GitHub raw fetch similar to KB list)
const POI_REPO = 'LaxyVibe/LaxyGuideCMS';
const POI_BASE_PATH = 'content/knowledgeBase';
async function fetchPOIsForKB(kbName, locale = 'en') {
  if (!kbName) return [];
  try {
    const rawUrl = `https://raw.githubusercontent.com/${POI_REPO}/main/${POI_BASE_PATH}/${kbName}.md`;
    const txt = await fetch(rawUrl).then(r => { if (!r.ok) throw new Error('KB file load failed ' + r.status); return r.text(); });
    if (!txt.startsWith('---')) return [];
    const end = txt.indexOf('\n---', 3); if (end === -1) return [];
    const fmBlock = txt.substring(3, end);
    // Identify locale blocks
    const localeMatches = []; const localePattern = /^([a-z][a-z-]*):\s*$/gm; let m;
    while ((m = localePattern.exec(fmBlock))) { localeMatches.push({ code: m[1], index: m.index }); }
    localeMatches.forEach((entry, i) => { entry.end = (i + 1 < localeMatches.length) ? localeMatches[i + 1].index : fmBlock.length; });
    // Choose locale block (fallback order: requested locale, 'en', first locale)
    let target = localeMatches.find(x => x.code === locale) || localeMatches.find(x => x.code === 'en') || localeMatches[0];
    if (!target) return [];
    const localeBlock = fmBlock.substring(target.index, target.end);
    // Extract pointsOfInterest section lines within locale block
    const poiStartRegex = /^\s*pointsOfInterest:\s*$/m;
    const startMatch = poiStartRegex.exec(localeBlock);
    if (!startMatch) return [];
    const afterStart = localeBlock.substring(startMatch.index + startMatch[0].length);
    // Stop at next top-level key inside locale (same indentation as pointsOfInterest or less) or end of locale block
    // We'll take lines until a line that starts with non-space then a word and colon at column 0 OR until another locale code pattern; simpler: until a line that matches /^\S.*:\s*$/ at column 0.
    const lines = afterStart.split(/\r?\n/);
    const collected = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) { collected.push(line); continue; }
      if (/^[A-Za-z0-9_-]+:\s*$/.test(line)) break; // next key at root of locale
      collected.push(line);
    }
    // Parse list items
    const poiLines = collected;
    const items = []; let current = null; let baseIndent = null;
    poiLines.forEach(line => {
      const itemStart = line.match(/^(\s*)-\s*(.*)$/);
      if (itemStart) {
        // New item
        if (current) items.push(current);
        current = {};
        if (baseIndent === null) baseIndent = itemStart[1];
        const rest = itemStart[2].trim();
        if (rest) {
          const kv = rest.match(/^(point|title|name):\s*(.*)$/);
          if (kv) { current.point = kv[2].trim().replace(/^['"]|['"]$/g, ''); }
          else {
            current.point = rest.replace(/^['"]|['"]$/g, '');
          }
        }
        return;
      }
      // Property lines belonging to current item
      if (current) {
        const prop = line.match(/^\s+([A-Za-z0-9_-]+):\s*(.*)$/);
        if (prop) {
          let val = prop[2].trim();
          val = val.replace(/^['"]|['"]$/g, '');
          current[prop[1]] = val;
        }
      }
    });
    if (current) items.push(current);
    // Map to POI objects
    const slugify = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const results = items.filter(i => i.point).map(i => ({
      id: slugify(i.point) || i.point,
      title: i.point,
      subtitle: i.description || '',
      duration: parseInt(i.duration, 10) || 5,
      content: i.content || ''
    }));
    return results;
  } catch { return []; }
}
// Helper to map chosen language to locale code
function mapLanguageToLocale(lang) {
  const map = { English: 'en', Japanese: 'jp', Korean: 'kr', Chinese: 'zh', French: 'fr', Spanish: 'es' };
  return map[lang] || 'en';
}
const h = (window.CMS && window.CMS.h) || window.h;
const createClass = (window.CMS && window.CMS.createClass) || window.createClass;
import { WizardShell } from '../views/WizardShell';
export const CreateAudioGuideControl = createClass({
  getInitialState() {
    const base = hydrate(this.props.value);
    return { ...base };
  },
  componentDidUpdate(prev) {
    if (this.props.value !== prev.value) {
      const hydrated = hydrate(this.props.value);
      // Preserve transient UI state so dialog remains open during field edits
      this.setState({
        ...hydrated,
        showDialog: this.state.showDialog,
        step: this.state.step,
        kbLoading: this.state.kbLoading,
        kbError: this.state.kbError,
        knowledgeBases: this.state.knowledgeBases,
        kbQuery: this.state.kbQuery,
        error: this.state.error,
        isSaving: this.state.isSaving,
        // Preserve POI transient state
        pois: this.state.pois,
        poiLoading: this.state.poiLoading,
        poiError: this.state.poiError,
        currentPoisKb: this.state.currentPoisKb,
        currentLocale: this.state.currentLocale
      });
    }
  },
  openDialog() { this.setState({ showDialog: true }); },
  closeDialog() { this.setState({ showDialog: false }); },
  persist() { this.props.onChange && this.props.onChange(serialize(this.state)); },
  setField(key, value) { this.setState({ [key]: value }, () => this.persist()); },
  toggle(key) { this.setField(key, !this.state[key]); },
  setPOIs(list) { this.setField('selectedPOIs', list); },
  next() {
    const current = this.state.step || 1;
    const nextStep = Math.min(5, current + 1);
    // SelectPOIs is step 2; trigger fetch when entering it (from step 1)
    if (current === 1 && nextStep === 2) {
      this.refreshPOIs(false);
    }
    this.setState({ step: nextStep });
  },
  prev() { this.setState({ step: Math.max(1, (this.state.step || 1) - 1) }); },
  refreshKB(force = false) {
    this.setState({ kbLoading: true, kbError: null });
    loadKnowledgeBases(force).then(list => {
      this.setState({ kbLoading: false, knowledgeBases: list, kbError: list.length ? null : 'No knowledge bases found' });
    }).catch(() => this.setState({ kbLoading: false, kbError: 'Failed to load knowledge bases' }));
  },
  refreshPOIs(force = false) {
    const kb = this.state.knowledgeBase;
    if (!kb) { this.setState({ pois: [], poiError: 'Select knowledge base first', currentPoisKb: '', poiLoading: false }); return; }
    const locale = mapLanguageToLocale(this.state.language);
    if (!force && this.state.currentPoisKb === kb && this.state.pois.length && this.state.currentLocale === locale) return;
    this.setState({ poiLoading: true, poiError: null });
    fetchPOIsForKB(kb, locale).then(list => {
      this.setState({ poiLoading: false, pois: list, currentPoisKb: kb, currentLocale: locale, poiError: list.length ? null : 'No POIs found' });
    }).catch(() => this.setState({ poiLoading: false, poiError: 'Failed to load POIs', pois: [] }));
  },
  startGeneration() { simulateGeneration(this.state, (patch, cb) => this.setState(patch, cb), () => this.persist()); },
  render() { return WizardShell({ ctrl: this, state: this.state }); }
});
export const CreateAudioGuidePreview = createClass({
  render() {
    const raw = this.props.value || ''; let out = {}; try { out = JSON.parse(raw); } catch { out.script = raw; }
    return h('pre', { style: { fontSize: '12px', whiteSpace: 'pre-wrap', background: '#f9fafb', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px' } }, JSON.stringify(out, null, 2));
  }
});
