import React from 'react';
const h = React.createElement;
export function VoiceStyle({ state, ctrl }) {
  const s = state;
  const voices = [
    { id: 'voice_sarah', title: 'Sarah - Professional Female', lang: 'English' },
    { id: 'voice_david', title: 'David - Documentary Narrator', lang: 'English' },
    { id: 'voice_emma', title: 'Emma - Enthusiastic Host', lang: 'English' }
  ];
  const tones = ['Professional', 'Friendly', 'Dramatic', 'Casual', 'Educational'];
  const allFormats = ['MP3', 'M4A', 'WAV', 'OGG'];
  const musicChoices = ['Classical', 'Ambient', 'Nature', 'None'];
  const toggleFormat = fmt => { const list = Array.isArray(s.exportFormats) ? [...s.exportFormats] : []; const i = list.indexOf(fmt); if (i >= 0) list.splice(i, 1); else list.push(fmt); ctrl.setField('exportFormats', list); };
  return h('div', null, [
    h('h3', { style: { fontSize: '14px', fontWeight: '600', margin: '0 0 12px' } }, 'Voice & Style'),
    h('p', { style: { margin: '0 0 16px', fontSize: '12px', color: '#6b7280' } }, 'Configure voice, tone, and audio settings'),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' } }, voices.map(v => {
      const active = s.chosenVoiceId === v.id;
      return h('div', { key: v.id, style: { border: '1px solid ' + (active ? '#3b82f6' : '#e5e7eb'), borderRadius: '8px', padding: '14px 18px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: active ? '#f5f9ff' : '#fff' }, onClick: () => ctrl.setField('chosenVoiceId', v.id) }, [
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } }, [
          h('div', { style: { width: '16px', height: '16px', borderRadius: '50%', border: active ? '5px solid #2563eb' : '2px solid #9ca3af', boxSizing: 'border-box' } }),
          h('div', null, [h('div', { style: { fontWeight: '600' } }, v.title), h('div', { style: { color: '#6b7280' } }, v.lang)])
        ]),
        h('button', { type: 'button', style: { padding: '6px 10px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }, onClick: e => { e.stopPropagation(); alert('Preview ' + v.title); } }, 'Preview')
      ]);
    })),
    h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'flex-start', marginBottom: '24px' } }, [
      h('div', null, [
        h('label', { style: { display: 'block', fontWeight: '600', fontSize: '12px', marginBottom: '6px' } }, 'Tone'),
        h('select', { style: { width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: '4px', background: '#f9fafb' }, value: s.tone, onChange: e => ctrl.setField('tone', e.target.value) }, tones.map(t => h('option', { key: t, value: t }, t)))
      ]),
      h('div', null, [
        h('label', { style: { display: 'block', fontWeight: '600', fontSize: '12px', marginBottom: '6px' } }, 'Export Formats'),
        h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } }, allFormats.map(fmt => h('div', { key: fmt, style: { padding: '6px 14px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', background: (Array.isArray(s.exportFormats) && s.exportFormats.includes(fmt)) ? '#111827' : '#f3f4f6', color: (Array.isArray(s.exportFormats) && s.exportFormats.includes(fmt)) ? '#fff' : '#374151', border: (Array.isArray(s.exportFormats) && s.exportFormats.includes(fmt)) ? '1px solid #111827' : '1px solid #e5e7eb' }, onClick: () => toggleFormat(fmt) }, fmt)))
      ])
    ]),
    h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' } }, [
      h('div', { style: { width: '38px', height: '22px', background: s.includeTranscript ? '#111827' : '#e5e7eb', borderRadius: '11px', position: 'relative', cursor: 'pointer' }, onClick: () => ctrl.toggle('includeTranscript') }, [
        h('div', { style: { position: 'absolute', top: '3px', left: s.includeTranscript ? '18px' : '3px', width: '16px', height: '16px', background: '#fff', borderRadius: '50%', boxShadow: '0 1px 4px rgba(0,0,0,0.25)', transition: 'left .2s' } })
      ]),
      h('div', null, [h('div', { style: { fontSize: '12px', fontWeight: '600', marginBottom: '2px' } }, 'Include Transcript'), h('div', { style: { fontSize: '11px', color: '#6b7280' } }, 'Generate downloadable text transcript')])
    ]),
    s.backgroundMusic ? h('div', { style: { border: '1px solid #e0d4ff', background: '#faf7ff', padding: '14px 18px', borderRadius: '10px' } }, [
      h('div', { style: { fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', color: '#5b21b6' } }, '🎵 Background Music Options'),
      h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' } }, musicChoices.map(choice => h('div', { key: choice, style: { padding: '6px 10px', fontSize: '12px', background: s.musicStyle === choice ? '#5b21b6' : '#fff', color: s.musicStyle === choice ? '#fff' : '#374151', border: '1px solid ' + (s.musicStyle === choice ? '#5b21b6' : '#e5e7eb'), borderRadius: '4px', cursor: 'pointer', textAlign: 'center' }, onClick: () => ctrl.setField('musicStyle', choice) }, choice)))
    ]) : null
  ]);
}
