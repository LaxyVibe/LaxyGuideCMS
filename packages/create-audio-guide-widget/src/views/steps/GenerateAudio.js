import React from 'react';
const h = (window.CMS && window.CMS.h) || React.createElement;

export function GenerateAudio({ state, ctrl }) {
  const s = state;
  // Generation is now triggered by componentDidUpdate in the controller, not here.

  const selected = s.selectedPOIs || [];
  const allPOIs = s.pois || [];

  const labels = {
    kb: 'Processing knowledge base content',
    script: 'Generating script for ' + selected.length + ' locations',
    tts: 'Converting text to speech',
    music: 'Adding background music',
    chapters: 'Creating chapter markers',
    render: 'Rendering final audio files'
  };

  const stepRow = (k) => {
    const st = s.generationSteps[k];
    return h('div', { key: k, style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: st === 'done' ? '#059669' : st === 'running' ? '#6d28d9' : '#374151' } }, [
      h('div', { style: { width: '14px', height: '14px', borderRadius: '50%', background: st === 'done' ? '#10b981' : st === 'running' ? '#8b5cf6' : '#d1d5db' } }),
      h('span', null, labels[k])
    ]);
  };

  // Calculate total duration from selected POIs using state.pois
  const total = selected.reduce((sum, id) => {
    const poi = allPOIs.find(p => p.id === id);
    return sum + (poi ? (poi.duration || 0) : 0);
  }, 0);

  return h('div', null, [
    h('h3', { style: { fontSize: '14px', fontWeight: '600', margin: '0 0 12px' } }, 'Generate Audio'),
    h('p', { style: { margin: '0 0 16px', fontSize: '12px', color: '#6b7280' } }, 'AI creates your audio guide'),
    h('div', { style: { border: '1px solid #e5e7eb', background: '#fafafa', borderRadius: '6px', padding: '40px 32px', textAlign: 'center', marginBottom: '24px' } }, [
      h('div', { style: { marginBottom: '8px', fontSize: '15px', fontWeight: '600', color: '#4c1d95' } }, 'Generating Your Audio Guide'),
      h('div', { style: { fontSize: '11px', color: '#6b7280' } }, 'Creating "' + (s.guideTitle || 'Untitled Guide') + '" with ' + selected.length + ' points of interest.'),
      h('div', { style: { textAlign: 'left', margin: '24px auto 0', maxWidth: '640px', lineHeight: '20px' } }, Object.keys(labels).map(stepRow)),
      h('div', { style: { background: '#f5f0ff', border: '1px solid #e9d5ff', borderRadius: '6px', padding: '12px 16px', fontSize: '11px', color: '#6d28d9', marginTop: '24px' } }, [
        h('div', { style: { fontWeight: '600', marginBottom: '2px' } }, 'Estimated completion: ' + (total ? Math.max(1, Math.round(total * 0.4)) + '-' + Math.max(2, Math.round(total * 0.6)) + ' minutes' : '3-5 minutes')),
        h('div', null, 'Processing ' + (total || 0) + ' minutes of audio content')
      ])
    ])
  ]);
}
export default GenerateAudio;
