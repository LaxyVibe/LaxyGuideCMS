// Netlify Function: generate-description
// Receives { name } and calls Google Vertex AI Search (Discovery Engine) API
// Returns { description }

const fetch = (...args) => import('node-fetch').then(({ default: fetchFn }) => fetchFn(...args));
const { GoogleAuth } = require('google-auth-library');

exports.handler = async function (event) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const { name } = JSON.parse(event.body || '{}');

        if (!name) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing knowledge base name' }),
            };
        }

        // 1. Authenticate with Google Cloud
        // Use only essential secrets from env: private key and client email.
        // Other non-sensitive fields are hardcoded here.
        const credentials = {
            type: 'service_account',
            project_id: process.env.GOOGLE_PROJECT_ID || 'laxy-guide',
            private_key_id: '01ae51ebf02879c4030c4fed596c95110c8510bc',
            private_key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            client_id: '112144368421874274595',
            auth_uri: 'https://accounts.google.com/o/oauth2/auth',
            token_uri: 'https://oauth2.googleapis.com/token',
            auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
            client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/laxy-guide-knowledge-base-v2%40laxy-guide.iam.gserviceaccount.com',
            universe_domain: 'googleapis.com',
        };

        const auth = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
            credentials,
        });

        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();

        // 2. Call Vertex AI Search API
        // Using the endpoint provided by the user
        const projectId = '683838849728';
        const engineId = 'guide-knowledge-base_1764745841706';
        const endpoint = `https://discoveryengine.googleapis.com/v1/projects/${projectId}/locations/global/collections/default_collection/engines/${engineId}/servingConfigs/default_search:search`;

        console.log(`Searching for: ${name}`);

        const body = {
            query: name,
            pageSize: 5,
            queryExpansionSpec: { condition: 'AUTO' },
            spellCorrectionSpec: { mode: 'AUTO' },
            contentSearchSpec: {
                snippetSpec: { returnSnippet: true },
                extractiveContentSpec: { maxExtractiveAnswerCount: 5, maxExtractiveSegmentCount: 1 },
                summarySpec: {
                    summaryResultCount: 5,
                    includeCitations: true,
                    ignoreAdversarialQuery: false,
                    ignoreNonSummarySeekingQuery: false,
                    useSemanticChunks: true,
                    modelSpec: { version: 'stable' },
                    modelPromptSpec: {
                        preamble: "Answer in one sentence."
                    }
                }
            },
            userInfo: { timeZone: 'Asia/Hong_Kong' },
            languageCode: 'en-GB',
        };

        const resp = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken.token}`,
            },
            body: JSON.stringify(body),
        });

        if (!resp.ok) {
            const errText = await resp.text();
            console.error('Vertex AI Search error:', resp.status, errText);
            return {
                statusCode: 502,
                body: JSON.stringify({ error: 'Failed to call Vertex AI Search' }),
            };
        }

        const data = await resp.json();
        console.log('Vertex AI Search response:');
        console.log(data)
        // 3. Extract Description
        // Priority: Summary > Extractive Answer > Snippet
        let description = '';

        if (data.summary && data.summary.summaryText) {
            description = data.summary.summaryText;
        } else if (data.results && data.results.length > 0) {
            const firstResult = data.results[0];
            const derived = firstResult.document?.derivedStructData;
            
            if (derived) {
                if (derived.extractiveAnswers && derived.extractiveAnswers.length > 0) {
                    description = derived.extractiveAnswers[0].content;
                } else if (derived.snippets && derived.snippets.length > 0) {
                    description = derived.snippets[0].snippet;
                }
            }
        }

        if (!description) {
            description = `Could not generate a description for ${name}.`;
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description }),
        };

    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error: ' + err.message }),
        };
    }
};
