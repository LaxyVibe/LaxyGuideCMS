// Netlify Function: generate-audio
// Receives { script, model, voiceId } and calls Minimax TTS API, then returns { url or data }

const fetch = (...args) => import('node-fetch').then(({ default: fetchFn }) => fetchFn(...args));

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { script, model: reqModel, voiceId: reqVoiceId } = JSON.parse(event.body || '{}');

    if (!script || typeof script !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing script' }),
      };
    }

    const apiKey = process.env.MINIMAX_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'MINIMAX_API_KEY not configured' }),
      };
    }

    const model = reqModel || 'speech-2.6-hd';
    const voiceId = reqVoiceId || 'English_expressive_narrator';

    // Endpoint from Minimax speech-t2a-http docs (t2a_v2)
    const endpoint = 'https://api.minimax.io/v1/t2a_v2';

    // Request body based on official curl example, with your script plugged into `text`
    const body = {
      model,
      text: script,
      stream: false,
      language_boost: 'auto',
      // Request a URL instead of hex audio
      output_format: 'url',
      voice_setting: {
        voice_id: voiceId,
        speed: 1,
        vol: 1,
        pitch: 0,
      },
      pronunciation_dict: {
        tone: [
          'Omg/Oh my god',
        ],
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: 'mp3',
        channel: 1,
      },
      voice_modify: {
        pitch: 0,
        intensity: 0,
        timbre: 0,
        sound_effects: 'spacious_echo',
      },
    };

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('Minimax error:', resp.status, errText);
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'Failed to call Minimax TTS' }),
      };
    }

    const data = await resp.json();

    // When output_format is 'url', API returns an object like { audio: '<url>', ... }
    const result = data?.data || data;
    const url = result?.audio || result?.audio_url || result?.url;

    if (!url) {
      console.error('Minimax response missing audio URL:', data);
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'Minimax did not return audio URL' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
