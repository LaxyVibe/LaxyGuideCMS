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
        // Construct credentials from individual environment variables
        const credentials = {
            type: process.env.GOOGLE_TYPE,
            project_id: process.env.GOOGLE_PROJECT_ID,
            private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
            private_key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            client_id: process.env.GOOGLE_CLIENT_ID,
            auth_uri: process.env.GOOGLE_AUTH_URI,
            token_uri: process.env.GOOGLE_TOKEN_URI,
            auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
            client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
            universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN,
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
        const endpoint = `https://discoveryengine.googleapis.com/v1alpha/projects/${projectId}/locations/global/collections/default_collection/engines/${engineId}/servingConfigs/default_search:search`;

        console.log(`Searching for: ${name}`);

        const body = {
            query: name,
            pageSize: 10,
            queryExpansionSpec: { condition: 'AUTO' },
            spellCorrectionSpec: { mode: 'AUTO' },
            contentSearchSpec: {
                snippetSpec: { returnSnippet: true },
                extractiveContentSpec: { maxExtractiveAnswerCount: 1 },
                summarySpec: {
                    summaryResultCount: 1,
                    includeCitations: false,
                    ignoreAdversarialQuery: false,
                    ignoreNonSummarySeekingQuery: false,
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
        // Try to get the summary first, otherwise fall back to the first result's snippet
        let description = '';

        if (data.summary && data.summary.summaryText) {
            description = data.summary.summaryText;
        } else if (data.results && data.results.length > 0) {
            // Fallback to snippet if no summary
            const firstResult = data.results[0];
            if (firstResult.document && firstResult.document.derivedStructData && firstResult.document.derivedStructData.snippets) {
                description = firstResult.document.derivedStructData.snippets[0].snippet;
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
