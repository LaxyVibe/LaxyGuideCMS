// Audio generation simulation service
// Audio generation service
export function simulateGeneration(state, setState, doneCallback) {
  if (state.generationStarted) return;
  setState({ generationStarted: true });
  const steps = ['kb', 'script', 'tts', 'music', 'chapters', 'render'];
  const initMap = { kb: 'running', script: 'pending', tts: 'pending', music: 'pending', chapters: 'pending', render: 'pending' };
  setState({ generationSteps: initMap });

  let idx = 0;

  async function advance() {
    if (idx >= steps.length) {
      const poiStatuses = {}; (state.selectedPOIs || []).forEach(id => { poiStatuses[id] = { status: 'complete' }; });
      setState({ generationComplete: true, poiStatuses }, () => doneCallback && doneCallback());
      return;
    }

    const current = steps[idx];

    // Mark current as running (if not already)
    setState(prev => ({ generationSteps: { ...prev.generationSteps, [current]: 'running' } }));

    try {
      if (current === 'tts') {
        // Construct script from selected POIs
        // IDs are expected to be "Name: Content" or just content/slug
        const script = (state.selectedPOIs || []).map(id => {
          // If id contains ": ", assume it's "Name: Content" and take the content part
          // Otherwise use it as is (it might be the content itself if no name prefix, or just a slug)
          // Based on previous step, it is "Name: Content" for 'en'
          const parts = id.indexOf(': ') > -1 ? id.split(': ') : [id];
          return parts.length > 1 ? parts.slice(1).join(': ') : parts[0];
        }).join('\n\n');

        const voiceId = state.chosenVoiceId || 'English_expressive_narrator';

        // Call Netlify function
        const resp = await fetch('/.netlify/functions/generate-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ script, voiceId })
        });

        if (resp.ok) {
          const data = await resp.json();
          if (data.url) {
            setState({ finalAudioUrl: data.url });
          }
        } else {
          console.error('TTS generation failed', await resp.text());
          throw new Error('TTS failed');
        }
      }

      // Mark current as done and next as running
      setState(prev => {
        const map = { ...prev.generationSteps, [current]: 'done' };
        if (steps[idx + 1]) map[steps[idx + 1]] = 'running';
        return { generationSteps: map };
      });

      idx++;
      // Only delay if NOT tts (since we already waited for the API), or keep a small delay for smooth transition
      setTimeout(advance, current === 'tts' ? 100 : 800);
    } catch (err) {
      console.error('Generation step error', err);
      // Mark as error but proceed for now (or stop)
      setState(prev => ({ generationSteps: { ...prev.generationSteps, [current]: 'error' } }));
      idx++;
      setTimeout(advance, 800);
    }
  }

  setTimeout(advance, 100);
}
