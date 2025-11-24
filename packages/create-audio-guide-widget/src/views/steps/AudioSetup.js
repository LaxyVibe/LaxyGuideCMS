import React from 'react';
const h = (window.CMS && window.CMS.h) || React.createElement;
export function AudioSetup({ state, ctrl }) {
  const s = state;
  const categories = ['', 'Museum Tour', 'Art Walk', 'Historic Route', 'Nature Trail'];
  const languages = ['English', 'Japanese', 'Korean', 'Chinese', 'French', 'Spanish'];
  const list = s.knowledgeBases || [];
  const sectionTitleStyle = { fontSize: '14px', fontWeight: '600', margin: '0 0 12px' };
  return h('div', null, [
    h('h3', { style: sectionTitleStyle }, 'Audio Setup'),
    h('p', { style: { margin: '0 0 16px', fontSize: '12px', color: '#6b7280' } }, 'Basic configuration and voice selection'),
    h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '16px', marginBottom: '12px' } }, [
      h('div', { style: { gridColumn: '1 / -1' } }, [
        h('label', { style: { display: 'block', fontWeight: '600', marginBottom: '4px', fontSize: '12px' } }, 'Knowledge Base *'),
        h('div', { style: { display: 'flex', gap: '8px', marginBottom: '6px' } }, [
          h('select', { style: { flex: 1, padding: '8px 10px', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: '4px' }, value: s.knowledgeBase || '', onChange: e => ctrl.setState({ knowledgeBase: e.target.value }) }, [
            h('option', { value: '' }, 'Select knowledge base'),
            ...list.map(i => h('option', { key: i.name, value: i.name }, i.name))
          ]),
          h('button', { type: 'button', style: { padding: '6px 12px', background: '#111827', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }, onClick: () => ctrl.refreshKB(true) }, 'Refresh')
        ]),
        h('div', { style: { fontSize: '11px', color: s.kbError ? '#b91c1c' : '#374151', marginBottom: '6px' } }, s.kbLoading ? 'Loading...' : (s.kbError || ('Loaded ' + list.length + ' item(s)')))
      ]),
      h('div', { style: { gridColumn: '1 / -1' } }, [
        h('label', { style: { display: 'block', fontWeight: '600', marginBottom: '4px', fontSize: '12px' } }, 'Audio Guide Title *'),
        h('input', { style: { width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: '4px' }, value: s.guideTitle, placeholder: 'e.g., Complete Metropolitan Museum Audio Tour', onChange: e => ctrl.setField('guideTitle', e.target.value) })
      ]),
      h('div', null, [
        h('label', { style: { display: 'block', fontWeight: '600', marginBottom: '4px', fontSize: '12px' } }, 'Category'),
        h('select', { style: { width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: '4px' }, value: s.category, onChange: e => ctrl.setField('category', e.target.value) }, categories.map(opt => h('option', { key: opt, value: opt }, opt || 'Select category')))
      ]),
      h('div', null, [
        h('label', { style: { display: 'block', fontWeight: '600', marginBottom: '4px', fontSize: '12px' } }, 'Language'),
        h('select', { style: { width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: '4px' }, value: s.language, onChange: e => ctrl.setField('language', e.target.value) }, languages.map(opt => h('option', { key: opt, value: opt }, opt)))
      ]),
      h('div', { style: { gridColumn: '1 / -1' } }, [
        h('label', { style: { display: 'block', fontWeight: '600', marginBottom: '4px', fontSize: '12px' } }, 'Target Duration (minutes)'),
        h('div', null, [
          h('input', { type: 'range', min: '1', max: '60', value: s.duration, style: { width: '100%' }, onChange: e => ctrl.setField('duration', parseInt(e.target.value, 10) || 1) }),
          h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#374151', marginTop: '4px' } }, [
            h('span', null, '1 min'),
            h('span', null, s.duration + ' minutes'),
            h('span', null, '60 min')
          ])
        ])
      ])
    ]),
    h('div', { style: { marginTop: '8px', marginBottom: '4px' } }, [
      h('h3', { style: sectionTitleStyle }, 'Audio Options'),
      ['backgroundMusic', 'multipleVoices', 'chapterMarkers'].map(key => {
        const labelMap = { backgroundMusic: 'Background Music', multipleVoices: 'Multiple Voices', chapterMarkers: 'Chapter Markers' };
        const descMap = { backgroundMusic: 'Add subtle background music', multipleVoices: 'Use different voices for variety', chapterMarkers: 'Add navigation chapters' };
        return h('div', { key, style: { display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', marginBottom: '6px' } }, [
          h('div', { style: { width: '34px', height: '20px', background: s[key] ? '#111827' : '#e5e7eb', borderRadius: '10px', position: 'relative', cursor: 'pointer' }, onClick: () => ctrl.toggle(key) }, [
            h('div', { style: { position: 'absolute', top: '2px', left: s[key] ? '16px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.25)', transition: 'left .2s' } })
          ]),
          h('div', { style: { fontSize: '12px' } }, [
            h('div', { style: { fontWeight: '600', marginBottom: '2px' } }, labelMap[key]),
            h('div', { style: { color: '#6b7280' } }, descMap[key])
          ])
        ]);
      })
    ])
  ]);
}
export default AudioSetup;
