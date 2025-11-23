// Audio generation simulation service
export function simulateGeneration(state, setState, doneCallback) {
  if (state.generationStarted) return;
  setState({ generationStarted: true });
  const steps = ['kb','script','tts','music','chapters','render'];
  const initMap = { kb: 'running', script: 'pending', tts: 'pending', music: 'pending', chapters: 'pending', render: 'pending' };
  setState({ generationSteps: initMap });
  let idx = 0;
  function advance() {
    if (idx >= steps.length) {
      const poiStatuses = {}; (state.selectedPOIs || []).forEach(id => { poiStatuses[id] = { status: 'complete' }; });
      setState({ generationComplete: true, poiStatuses }, () => doneCallback && doneCallback());
      return;
    }
    const current = steps[idx];
    const map = { ...state.generationSteps, [current]: 'done' };
    if (steps[idx+1]) map[steps[idx+1]] = 'running';
    setState({ generationSteps: map });
    idx++; setTimeout(advance, 900);
  }
  setTimeout(advance, 900);
}
