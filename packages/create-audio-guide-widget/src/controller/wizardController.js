import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { initialState, hydrate, serialize, persistableKeys } from '../model/state';
import { loadKnowledgeBases } from '../services/githubKb';
import { simulateGeneration } from '../services/audioGeneration';
import { WizardShell } from '../views/WizardShell';

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
    const localeMatches = []; const localePattern = /^([a-z][a-z-]*):\s*$/gm; let m;
    while ((m = localePattern.exec(fmBlock))) { localeMatches.push({ code: m[1], index: m.index }); }
    localeMatches.forEach((entry, i) => { entry.end = (i + 1 < localeMatches.length) ? localeMatches[i + 1].index : fmBlock.length; });
    let target = localeMatches.find(x => x.code === locale) || localeMatches.find(x => x.code === 'en') || localeMatches[0];
    if (!target) return [];
    const localeBlock = fmBlock.substring(target.index, target.end);

    const poiStartRegex = /^(\s*)pointsOfInterest:\s*$/m;
    const startMatch = poiStartRegex.exec(localeBlock);
    if (!startMatch) return [];

    const baseIndentLen = startMatch[1].length;
    const afterStart = localeBlock.substring(startMatch.index + startMatch[0].length);
    const lines = afterStart.split(/\r?\n/);
    const collected = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) { collected.push(line); continue; }
      const indentMatch = line.match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1].length : 0;
      if (indent <= baseIndentLen) break;
      collected.push(line);
    }
    const poiLines = collected;

    const items = []; let current = null; let lastKey = null;
    poiLines.forEach(line => {
      const itemStart = line.match(/^(\s*)-\s*(.*)$/);
      if (itemStart) {
        if (current) items.push(current);
        current = {};
        lastKey = null;
        const rest = itemStart[2].trim();
        if (rest) {
          const kv = rest.match(/^(point|title|name):\s*(.*)$/);
          if (kv) { current.point = kv[2].trim().replace(/^['"]|['"]$/g, ''); }
          else { current.point = rest.replace(/^['"]|['"]$/g, ''); }
        }
        return;
      }
      if (current) {
        const prop = line.match(/^\s+([A-Za-z0-9_-]+):\s*(.*)$/);
        if (prop) {
          const key = prop[1];
          let val = prop[2].trim();
          if (['>', '|', '>-', '|-'].includes(val)) {
            current[key] = '';
            lastKey = key;
          } else {
            current[key] = val.replace(/^['"]|['"]$/g, '');
            lastKey = null;
          }
          return;
        }
        if (lastKey && current[lastKey] !== undefined) {
          const trimmed = line.trim();
          if (trimmed) {
            current[lastKey] += (current[lastKey] ? '\n' : '') + trimmed;
          } else {
            current[lastKey] += '\n\n';
          }
        }
      }
    });
    if (current) items.push(current);

    const slugify = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const results = items.filter(i => i.point).map(i => {
      const slug = slugify(i.point) || i.point;
      let idValue = slug;

      if (locale === 'en' && i.content && i.content.trim().length > 0) {
        // Remove markdown images and trim whitespace
        const plainContent = i.content.replace(/!\[[^\]]*\]\([^)]*\)/g, '').trim();
        idValue = `${i.point}: ${plainContent}`;
      }

      return {
        id: idValue,
        title: i.point,
        subtitle: i.description || '',
        duration: parseInt(i.duration, 10) || 5,
        content: i.content || ''
      };
    });
    return results;
  } catch { return []; }
}
function mapLanguageToLocale(lang) {
  const map = { English: 'en', Japanese: 'jp', Korean: 'kr', Chinese: 'zh', French: 'fr', Spanish: 'es' };
  return map[lang] || 'en';
}

// Inner Widget Component (Functional, uses Local React Hooks)
function AudioGuideWizard(props) {
  // Initialize state from props.value
  const [state, setState] = useState(() => hydrate(props.value));

  // Ref to track if we are currently saving to avoid loops
  const isInternalUpdate = useRef(false);

  // Sync from props.value when it changes externally
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    const externalState = hydrate(props.value);
    setState(prev => ({
      ...externalState,
      // Preserve transient UI state
      showDialog: prev.showDialog,
      step: prev.step,
      kbLoading: prev.kbLoading,
      kbError: prev.kbError,
      knowledgeBases: prev.knowledgeBases,
      kbQuery: prev.kbQuery,
      error: prev.error,
      isSaving: prev.isSaving,
      pois: prev.pois,
      poiLoading: prev.poiLoading,
      poiError: prev.poiError,
      currentPoisKb: prev.currentPoisKb,
      currentLocale: prev.currentLocale
    }));
  }, [props.value]);

  // Persist helper
  const persist = useCallback((newState) => {
    isInternalUpdate.current = true;
    props.onChange(serialize(newState));
  }, [props]);

  // Update state helper
  const updateState = useCallback((updates, shouldPersist = false) => {
    setState(prev => {
      const next = { ...prev, ...updates };
      if (shouldPersist) persist(next);
      return next;
    });
  }, [persist]);

  // Auto-start generation effect
  useEffect(() => {
    if (state.step === 4 && !state.generationStarted && !state.generationComplete) {
      // Use timeout to step out of current render cycle
      setTimeout(() => {
        simulateGeneration(state, (patch, cb) => {
          setState(prev => {
            const next = { ...prev, ...patch };
            if (cb) setTimeout(cb, 0); // Simulate callback behavior
            return next;
          });
        }, () => persist(state)); // Note: this might use stale state if not careful, but simulateGeneration uses the passed state object
      }, 0);
    }
  }, [state.step, state.generationStarted, state.generationComplete, state, persist]);

  // Controller methods
  const ctrl = {
    setState: (updates) => updateState(updates),
    setField: (key, value) => updateState({ [key]: value }, true),
    persist: () => persist(state),
    openDialog: () => updateState({ showDialog: true }),
    closeDialog: () => updateState({ showDialog: false }),
    toggle: (key) => updateState({ [key]: !state[key] }, true),
    setPOIs: (list) => updateState({ selectedPOIs: list }, true),
    next: () => {
      const current = state.step || 1;
      const nextStep = Math.min(5, current + 1);
      if (current === 1 && nextStep === 2) {
        ctrl.refreshPOIs(false);
      }
      updateState({ step: nextStep });
    },
    prev: () => updateState({ step: Math.max(1, (state.step || 1) - 1) }),
    refreshKB: (force = false) => {
      updateState({ kbLoading: true, kbError: null });
      loadKnowledgeBases(force).then(list => {
        updateState({ kbLoading: false, knowledgeBases: list, kbError: list.length ? null : 'No knowledge bases found' });
      }).catch(() => updateState({ kbLoading: false, kbError: 'Failed to load knowledge bases' }));
    },
    refreshPOIs: (force = false) => {
      const kb = state.knowledgeBase;
      if (!kb) { updateState({ pois: [], poiError: 'Select knowledge base first', currentPoisKb: '', poiLoading: false }); return; }
      const locale = mapLanguageToLocale(state.language);
      if (!force && state.currentPoisKb === kb && state.pois.length && state.currentLocale === locale) return;
      updateState({ poiLoading: true, poiError: null });
      fetchPOIsForKB(kb, locale).then(list => {
        updateState({ poiLoading: false, pois: list, currentPoisKb: kb, currentLocale: locale, poiError: list.length ? null : 'No POIs found' });
      }).catch(() => updateState({ poiLoading: false, poiError: 'Failed to load POIs', pois: [] }));
    },
    startGeneration: () => {
      // Triggered via effect now, but kept for manual retry if needed
      simulateGeneration(state, (patch, cb) => {
        setState(prev => { const next = { ...prev, ...patch }; if (cb) setTimeout(cb, 0); return next; });
      }, () => persist(state));
    }
  };

  return React.createElement(WizardShell, { ctrl, state });
}

// Factory function to create widget components using the CMS instance
// Factory function to create widget components using the CMS instance
export function createAudioGuideWidget(CMS) {
  // Use CMS.h if available, otherwise fallback to window.h or React.createElement
  const h = CMS?.h || (typeof window !== 'undefined' && window.h) || React.createElement;

  class Control extends React.Component {
    constructor(props) {
      super(props);
      this.mountRef = React.createRef();
      this.root = null;
    }

    componentDidMount() {
      if (this.mountRef.current) {
        this.root = ReactDOM.createRoot(this.mountRef.current);
        this.root.render(React.createElement(AudioGuideWizard, this.props));
      }
    }

    componentDidUpdate() {
      if (this.root) {
        this.root.render(React.createElement(AudioGuideWizard, this.props));
      }
    }

    componentWillUnmount() {
      if (this.root) {
        this.root.unmount();
      }
    }

    render() {
      // Render a container using Decap's h (or fallback)
      // We use a callback ref if h doesn't support object refs, but let's try object ref first.
      // Actually, to be safe across React versions, let's use a callback ref wrapper if needed,
      // but standard React.createRef works with most modern hyperscript implementations.
      // However, if h is from a very old React, it might expect string refs or callback refs.
      // Let's use a simple callback ref to be safe.
      return h('div', {
        className: 'laxy-audio-guide-widget',
        ref: (el) => { this.mountRef.current = el; }
      });
    }
  }

  const Preview = (props) => {
    const raw = props.value || '';
    let out = {};
    try { out = JSON.parse(raw); } catch { out.script = raw; }
    return h('pre', { style: { fontSize: '12px', whiteSpace: 'pre-wrap', background: '#f9fafb', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px' } }, JSON.stringify(out, null, 2));
  };

  return { Control, Preview };
}

// Keep named exports for backwards compatibility if needed
// We check if window.CMS is available and has what we need, otherwise export null or a placeholder
const globalCMS = (typeof window !== 'undefined' && window.CMS) ? window.CMS : null;
// Only try to create if globalCMS exists, otherwise export nulls (which is fine if not used)
const globalWidgets = globalCMS ? createAudioGuideWidget(globalCMS) : { Control: null, Preview: null };

export const CreateAudioGuideControl = globalWidgets.Control;
export const CreateAudioGuidePreview = globalWidgets.Preview;
