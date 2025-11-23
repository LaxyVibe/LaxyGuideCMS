const getH = () => {
  // Guard for SSR / build parsing
  if (typeof window !== 'undefined') {
    if (window.CMS && window.CMS.h) return window.CMS.h;
    if (window.h) return window.h;
  }
  // Fallback noop hyperscript (returns null) to keep parse valid
  return () => null;
};
const h = getH();

export function SelectPOIs({ state, ctrl }) {
  const allPOIs = state.pois || [];
  const loading = state.poiLoading;
  const error = state.poiError;
  const kb = state.knowledgeBase;
  const selected = state.selectedPOIs || [];
  const toggle = id => { ctrl.setPOIs(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]); };
  const total = selected.reduce((sum, id) => { const poi = allPOIs.find(p => p.id === id); return sum + (poi ? poi.duration : 0); }, 0);
  return h('div', null, [
    h('h3', { style: { fontSize: '14px', fontWeight: '600', margin: '0 0 12px' } }, 'Select POIs'),
    h('p', { style: { margin: '0 0 8px', fontSize: '12px', color: '#6b7280' } }, kb ? ('Knowledge Base: ' + kb) : 'Select a Knowledge Base in previous step'),
    h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' } }, [
      h('button', { type: 'button', style: { padding: '6px 12px', background: '#111827', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }, onClick: () => ctrl.refreshPOIs(true) }, 'Refresh POIs'),
      h('div', { style: { fontSize: '11px', color: error ? '#b91c1c' : '#374151' } }, loading ? 'Loading POIs...' : (error || ('Loaded ' + allPOIs.length + ' POI(s)')))
    ]),
    h('div', { style: { padding: '10px 14px', background: '#f0f7ff', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '12px', color: '#1e3a8a', marginBottom: '18px' } }, 'Total estimated duration: ' + total + ' minutes'),
    !kb ? h('div', { style: { fontSize: '12px', color: '#6b7280' } }, 'Please select a knowledge base first.') : null,
    (kb && !loading && !error && allPOIs.length === 0) ? h('div', { style: { fontSize: '12px', color: '#6b7280' } }, 'No POIs found for this knowledge base.') : null,
    (kb && !loading && allPOIs.length > 0) ? h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } }, allPOIs.map(poi => {
      const active = selected.includes(poi.id);
      return h('div', { key: poi.id, style: { border: '1px solid ' + (active ? '#3b82f6' : '#e5e7eb'), borderRadius: '8px', padding: '14px 18px', cursor: 'pointer', fontSize: '12px', background: active ? '#f5f9ff' : '#fff', boxShadow: active ? '0 0 0 1px #3b82f6' : 'none' }, onClick: () => toggle(poi.id) }, [
        h('input', { type: 'checkbox', checked: active, onChange: () => toggle(poi.id), style: { position: 'absolute', clip: 'rect(0,0,0,0)' } }),
        h('div', { style: { fontWeight: '600', fontSize: '12px' } }, poi.title),
        poi.subtitle ? h('div', { style: { color: '#6b7280' } }, poi.subtitle) : null,
        h('div', { style: { display: 'inline-block', padding: '2px 6px', fontSize: '11px', background: '#f3f4f6', borderRadius: '10px', border: '1px solid #e5e7eb', color: '#374151', marginTop: '6px' } }, (poi.duration || 5) + ' min')
      ]);
    })) : null
  ]);
}
export default SelectPOIs;
