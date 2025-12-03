// Central state & types for CreateKnowledge widget
export const persistableKeys = [
    // Basic Information step
    'knowledgeBaseName',
    'description',
    'contentType',
    'tags',
    // Upload Materials step
    'uploadedDocuments',
    'uploadedImages',
    'urls',
    'textContent',
    'crawlingRules',
    'includeMedia',
    'seedUrl',
    // AI Processing step
    'processingStatus',
    'processingProgress',
    // Verify Knowledge step
    'extractedFacts',
    'pointsOfInterest',
    'contentStructure',
    'verificationComplete'
];

export const initialState = {
    // Basic Information
    knowledgeBaseName: '',
    description: '',
    contentType: '',
    tags: '',

    // Upload Materials
    uploadedDocuments: [],
    uploadedImages: [],
    urls: [],
    textContent: { title: '', content: '' },

    // Web crawling options
    crawlingRules: 'scoped',
    includeMedia: true,
    seedUrl: '',

    // AI Processing
    processingStatus: 'idle', // idle, processing, complete, error
    processingProgress: 0,
    processingStages: [
        { id: 'structure', label: 'Analyzing content structure', status: 'pending' },
        { id: 'extraction', label: 'Extracting key information', status: 'pending' },
        { id: 'organization', label: 'Organizing knowledge base', status: 'pending' },
        { id: 'verification', label: 'Preparing verification', status: 'pending' }
    ],

    // Verify Knowledge
    extractedFacts: [],
    pointsOfInterest: [],
    contentStructure: [],
    verificationComplete: false,

    // Transient UI state
    showDialog: false,
    step: 1,
    uploadTab: 'documents', // documents, urls, images, text
    processingStarted: false,
    isSaving: false,
    error: null
};

export function hydrate(raw) {
    if (!raw) return { ...initialState };
    try {
        const parsed = JSON.parse(raw);
        return { ...initialState, ...parsed };
    } catch {
        return { ...initialState };
    }
}

export function serialize(state) {
    const out = {};
    persistableKeys.forEach(k => { out[k] = state[k]; });
    return JSON.stringify(out);
}
