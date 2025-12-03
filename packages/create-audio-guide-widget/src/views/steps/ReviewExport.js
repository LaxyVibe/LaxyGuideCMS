import React from 'react';
const h = React.createElement;
export function ReviewExport({ state, ctrl }) {
  const s = state;
  if (!s.finalized && s.generationComplete) {
    const shareable = 'https://laxy.app/audio/' + (s.guideTitle || 'untitled-guide').replace(/\s+/g, '-').toLowerCase();
    ctrl.setField('finalized', true);
    if (!s.finalAudioUrl) {
      const fakeAudioUrl = 'https://cdn.example.com/audio/' + (s.guideTitle || 'guide').replace(/\s+/g, '-').toLowerCase() + '.mp3';
      ctrl.setField('finalAudioUrl', fakeAudioUrl);
    }
    ctrl.setField('shareableUrl', shareable); ctrl.setField('transcriptReady', !!s.includeTranscript);
  }
  const selected = s.selectedPOIs || [];
  // POI metadata is not persisted, so we extract title from ID if possible or use default
  const total = selected.length * 5; // Estimate 5 min per POI if unknown
  const exportFormats = Array.isArray(s.exportFormats) ? s.exportFormats : [];
  const toggleFormat = fmt => { const list = [...exportFormats]; const i = list.indexOf(fmt); if (i >= 0) list.splice(i, 1); else list.push(fmt); ctrl.setField('exportFormats', list); };
  function copyShareable() { if (navigator?.clipboard && s.shareableUrl) navigator.clipboard.writeText(s.shareableUrl).then(() => alert('Link copied')); }
  function playAudio() {
    if (s.finalAudioUrl) {
      const a = new Audio(s.finalAudioUrl);
      a.play().catch(e => alert('Playback failed: ' + e.message));
    } else {
      alert('Audio not generated yet');
    }
  }
  return h('div', null, [
    h('h3', { style: { fontSize: '14px', fontWeight: '600', margin: '0 0 12px' } }, 'Review & Export'),
    h('p', { style: { margin: '0 0 16px', fontSize: '12px', color: '#6b7280' } }, 'Preview and export your audio guide'),
    h('div', { style: { border: '1px solid #e5e7eb', borderRadius: '6px', padding: '16px 18px', marginBottom: '18px', background: '#fff' } }, [
      h('div', { style: { textAlign: 'center', marginBottom: '18px' } }, [
        h('div', { style: { width: '42px', height: '42px', background: '#d1fae5', color: '#059669', fontWeight: '600', fontSize: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' } }, '✓'),
        h('div', { style: { fontSize: '13px', fontWeight: '600', marginBottom: '4px' } }, 'Your Audio Guide is Ready!'),
        h('div', { style: { fontSize: '11px', color: '#6b7280' } }, 'Preview your audio guide and choose export options.')
      ]),
      h('div', { style: { border: '1px solid #e5e7eb', borderRadius: '6px', padding: '10px 12px', marginBottom: '14px', background: '#f9fafb', fontSize: '11px' } }, [
        h('div', { style: { fontWeight: '600', marginBottom: '6px' } }, s.guideTitle || 'Untitled Guide'),
        h('div', null, total + ' minutes • ' + selected.length + ' locations • ' + (s.language || 'English')),
        s.finalAudioUrl ? h('audio', {
          controls: true,
          src: s.finalAudioUrl,
          style: { width: '100%', height: '36px', marginTop: '8px' }
        }) : h('div', { style: { fontSize: '11px', color: '#6b7280', padding: '8px 0' } }, 'Audio generation pending...')
      ]),
      h('div', { style: { marginTop: '4px' } }, selected.map((id, i) => {
        // Extract title from "Name: Content" format
        const title = id.indexOf(': ') > -1 ? id.split(': ')[0] : id;
        // Truncate if too long (e.g. if it was just content)
        const displayTitle = title.length > 50 ? title.substring(0, 50) + '...' : title;

        return h('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '6px', marginBottom: '6px', background: '#fafafa' } }, [
          h('div', { style: { width: '20px', height: '20px', borderRadius: '10px', background: '#f3f4f6', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: '#374151' } }, String(i + 1)),
          h('div', { style: { fontWeight: '600' } }, displayTitle),
          h('div', { style: { marginLeft: 'auto', fontSize: '11px', color: '#6b7280' } }, '5 min')
        ]);
      }))
    ]),
    h('div', { style: { border: '1px solid #e5e7eb', borderRadius: '6px', padding: '16px 18px', marginBottom: '18px', background: '#fff' } }, [
      h('div', { style: { fontWeight: '600', fontSize: '12px', marginBottom: '12px' } }, 'Export Options'),
      h('div', null, [
        h('div', { style: { fontSize: '11px', fontWeight: '600', marginBottom: '6px' } }, 'Download Formats'),
        h('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' } }, ['MP3', 'M4A', 'WAV', 'OGG'].map(fmt => h('button', { key: fmt, type: 'button', style: { padding: '6px 10px', fontSize: '11px', borderRadius: '4px', border: '1px solid ' + (exportFormats.includes(fmt) ? '#111827' : '#d1d5db'), background: exportFormats.includes(fmt) ? '#111827' : '#fff', color: exportFormats.includes(fmt) ? '#fff' : '#374151', cursor: 'pointer' }, onClick: () => toggleFormat(fmt) }, fmt))),
        s.includeTranscript ? h('div', { style: { marginBottom: '12px' } }, [
          h('div', { style: { fontSize: '11px', fontWeight: '600', marginBottom: '6px' } }, 'Additional Files'),
          h('button', { type: 'button', style: { padding: '6px 12px', fontSize: '11px', background: '#f3f4f6', color: '#111827', border: 'none', borderRadius: '4px', cursor: 'pointer' }, onClick: () => alert('Download transcript (simulated)') }, 'Download Transcript')
        ]) : null,
        h('div', { style: { fontSize: '11px', fontWeight: '600', marginBottom: '6px' } }, 'Sharing Options'),
        h('div', { style: { display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' } }, [
          h('button', { type: 'button', style: { padding: '6px 12px', fontSize: '11px', background: '#f3f4f6', color: '#111827', border: 'none', borderRadius: '4px', cursor: 'pointer' }, onClick: () => alert('Generate QR Code (simulated)') }, 'Generate QR Code'),
          h('button', { type: 'button', style: { padding: '6px 12px', fontSize: '11px', background: '#f3f4f6', color: '#111827', border: 'none', borderRadius: '4px', cursor: 'pointer' }, onClick: () => alert('Create Podcast Feed (simulated)') }, 'Create Podcast Feed')
        ]),
        h('div', { style: { background: '#f5f9ff', border: '1px solid #cfe3ff', borderRadius: '6px', padding: '12px 16px', fontSize: '11px', color: '#1e3a8a', display: 'flex', flexDirection: 'column', gap: '6px' } }, [
          h('div', { style: { fontWeight: '600', fontSize: '11px' } }, 'Shareable Link'),
          h('div', null, s.shareableUrl || 'Not generated'),
          s.shareableUrl ? h('button', { type: 'button', style: { padding: '4px 10px', fontSize: '11px', background: '#111827', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', alignSelf: 'flex-start' }, onClick: copyShareable }, 'Copy Link') : null
        ])
      ])
    ])
  ]);
}
