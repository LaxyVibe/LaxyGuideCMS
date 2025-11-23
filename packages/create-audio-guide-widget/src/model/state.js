// Central state & types
export const persistableKeys = [
  'script','url','model','voiceId','knowledgeBase','guideTitle','category','language','duration','backgroundMusic','multipleVoices','chapterMarkers','selectedPOIs','chosenVoiceId','tone','exportFormats','includeTranscript','musicStyle','generationSteps','generationStarted','generationComplete','poiStatuses','finalized','finalAudioUrl','shareableUrl','transcriptReady'
];
export const initialState = {
  script: '',
  url: '',
  model: 'speech-2.6-hd',
  voiceId: 'English_expressive_narrator',
  knowledgeBase: '',
  guideTitle: '',
  category: '',
  language: 'English',
  duration: 5,
  backgroundMusic: false,
  multipleVoices: false,
  chapterMarkers: true,
  selectedPOIs: [],
  chosenVoiceId: '',
  tone: 'Professional',
  exportFormats: ['MP3','M4A'],
  includeTranscript: false,
  musicStyle: '',
  generationSteps: {},
  generationStarted: false,
  generationComplete: false,
  poiStatuses: {},
  finalized: false,
  finalAudioUrl: '',
  shareableUrl: '',
  transcriptReady: false,
  // transient UI/meta
  kbLoading: false,
  kbError: null,
  knowledgeBases: [],
  kbQuery: '',
  showDialog: false,
  step: 1,
  isSaving: false,
  error: null,
  // POI dynamic data (transient)
  poiLoading: false,
  poiError: null,
  pois: [],
  currentPoisKb: ''
};
export function hydrate(raw) {
  if (!raw) return { ...initialState };
  try { const parsed = JSON.parse(raw); return { ...initialState, ...parsed }; } catch { return { ...initialState, script: raw }; }
}
export function serialize(state) {
  const out = {}; persistableKeys.forEach(k => { out[k] = state[k]; });
  return JSON.stringify(out);
}
