import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security HTTP headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// JSON body parser with size limit to prevent payload flooding
app.use(express.json({ limit: '25mb' }));

/**
 * Sanitizes error messages to strictly prevent leaking API keys, credentials,
 * or internal URLs to clients.
 */
function sanitizeErrorMessage(error: any, fallbackMessage: string): string {
  if (!error) return fallbackMessage;
  const raw = typeof error === 'string' ? error : (error.message || fallbackMessage);
  return String(raw)
    .replace(/AIza[0-9A-Za-z\-_]{35}/g, '[REDACTED_API_KEY]')
    .replace(/key=[0-9A-Za-z\-_]+/gi, 'key=[REDACTED]')
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED]')
    .replace(/apiKey[:=]\s*["']?[^"'\s]+["']?/gi, 'apiKey=[REDACTED]');
}

/**
 * Validates whether the Gemini API key is present and configured.
 */
function isGeminiKeyConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim().length > 0 && key !== 'MY_GEMINI_API_KEY');
}

/**
 * Lazily initializes GoogleGenAI only when a valid key exists,
 * preventing noisy SDK startup warnings on cold boot.
 */
function getAIClient(): GoogleGenAI | null {
  if (!isGeminiKeyConfigured()) return null;
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Multi-turn Gemini Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'AI assistant is currently offline: GEMINI_API_KEY is not configured in server environment.',
      });
    }

    const { messages, modelChoice = 'gemini-3.8-flash', systemPrompt } = req.body;
    
    // Choose model safely: gemini-3.8-flash (standard), gemini-3.1-flash-lite (fast)
    const validModel = modelChoice === 'gemini-3.1-flash-lite' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';

    const systemInstruction = (typeof systemPrompt === 'string' && systemPrompt.slice(0, 1000)) || 
      'You are EDSER AI Assistant, a friendly and thoughtful specialist in mindful daily planning, digital organization spreadsheets, and screen-free creative activities for children. Provide helpful, calm, practical answers with elegant formatting.';

    // Validate and limit contents to prevent memory exhaustion
    let contents: any[] = [];
    if (Array.isArray(messages)) {
      contents = messages.slice(-20).map((m: any) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: String(m.parts?.[0]?.text || m.text || '').slice(0, 4000) }],
      }));
    } else {
      const promptText = String(req.body.prompt || 'Hello').slice(0, 4000);
      contents = [{ role: 'user', parts: [{ text: promptText }] }];
    }

    const response = await ai.models.generateContent({
      model: validModel,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      reply: response.text || '',
      model: validModel,
    });
  } catch (error: any) {
    console.error('Chat error occurred (details redacted from client response)');
    res.status(500).json({ error: sanitizeErrorMessage(error, 'Chat generation encountered an error') });
  }
});

// 2. Audio Transcription Endpoint using gemini-3.5-transcribe
app.post('/api/transcribe', async (req, res) => {
  try {
    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Voice transcription is unavailable: GEMINI_API_KEY is not configured.',
      });
    }

    const { audioData, mimeType = 'audio/webm' } = req.body;
    if (!audioData || typeof audioData !== 'string') {
      return res.status(400).json({ error: 'Valid base64 audioData is required' });
    }

    // Limit maximum base64 audio data length (~20MB)
    if (audioData.length > 25 * 1024 * 1024) {
      return res.status(413).json({ error: 'Audio payload exceeds size limit' });
    }

    const audioPart = {
      inlineData: {
        mimeType: String(mimeType).slice(0, 64),
        data: audioData,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [audioPart, { text: 'Transcribe this voice audio accurately. Return only the transcription without extra commentary.' }],
      },
    });

    res.json({ transcript: response.text || '' });
  } catch (error: any) {
    console.error('Transcribe error occurred');
    res.status(500).json({ error: sanitizeErrorMessage(error, 'Voice transcription failed') });
  }
});

// 3. Google Search Grounding Endpoint using gemini-3.8-flash
app.post('/api/search-grounding', async (req, res) => {
  try {
    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({ error: 'Search grounding unavailable: GEMINI_API_KEY is not configured.' });
    }

    const prompt = typeof req.body.prompt === 'string' ? req.body.prompt.trim().slice(0, 1000) : '';
    if (!prompt) return res.status(400).json({ error: 'Valid prompt required' });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const webSources: { title?: string; uri?: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      for (const chunk of chunks) {
        if (chunk.web?.uri) {
          webSources.push({
            title: chunk.web.title || chunk.web.uri,
            uri: chunk.web.uri,
          });
        }
      }
    }

    res.json({
      text: response.text || '',
      sources: webSources,
    });
  } catch (error: any) {
    console.error('Search grounding error occurred');
    res.status(500).json({ error: sanitizeErrorMessage(error, 'Search grounding failed') });
  }
});

// 4. Google Maps Grounding Endpoint using gemini-3.8-flash
app.post('/api/maps-grounding', async (req, res) => {
  try {
    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({ error: 'Maps grounding unavailable: GEMINI_API_KEY is not configured.' });
    }

    const query = typeof req.body.query === 'string' ? req.body.query.trim().slice(0, 500) : '';
    if (!query) return res.status(400).json({ error: 'Valid query required' });

    const { latitude, longitude } = req.body;
    const toolConfig: any = {};
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      toolConfig.retrievalConfig = {
        latLng: {
          latitude,
          longitude,
        },
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: query,
      config: {
        tools: [{ googleMaps: {} }],
        ...(Object.keys(toolConfig).length > 0 ? { toolConfig } : {}),
      },
    });

    const mapPlaces: { title?: string; uri?: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      for (const chunk of chunks) {
        if (chunk.maps?.uri) {
          mapPlaces.push({
            title: chunk.maps.title || 'Location details on Google Maps',
            uri: chunk.maps.uri,
          });
        }
      }
    }

    res.json({
      text: response.text || '',
      places: mapPlaces,
    });
  } catch (error: any) {
    console.error('Maps grounding error occurred');
    res.status(500).json({ error: sanitizeErrorMessage(error, 'Maps grounding failed') });
  }
});

// 5. Veo Video Generation API (text-to-video & image-to-video)
app.post('/api/generate-video', async (req, res) => {
  try {
    const ai = getAIClient();
    if (!ai) {
      return res.status(200).json({
        simulated: true,
        message: 'Veo video preview mode active.',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      });
    }

    const { prompt, imageBase64, aspectRatio = '16:9' } = req.body;
    
    const requestPayload: any = {
      model: 'veo-3.1-lite-generate-preview',
      prompt: typeof prompt === 'string' ? prompt.slice(0, 500) : 'A gentle breeze flipping pages of an undated aesthetic planner on a warm sunny table',
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
      },
    };

    if (imageBase64 && typeof imageBase64 === 'string') {
      requestPayload.image = {
        imageBytes: imageBase64.replace(/^data:image\/[a-z]+;base64,/, '').slice(0, 15 * 1024 * 1024),
        mimeType: 'image/png',
      };
    }

    const operation = await ai.models.generateVideos(requestPayload);
    res.json({ operationName: operation.name });
  } catch (error: any) {
    console.warn('Veo generation notice: falling back cleanly to preview mode');
    res.status(200).json({
      simulated: true,
      message: 'Video generation requires billing on the Google Cloud project. Preview mode simulated.',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    });
  }
});

// 6. Lyria Music Generation API
app.post('/api/generate-music', async (req, res) => {
  try {
    const ai = getAIClient();
    if (!ai) {
      return res.status(200).json({
        simulated: true,
        message: 'Lyria soundscape preview mode active.',
        audioUrl: 'https://cdn.freesound.org/previews/560/560446_11861866-lq.mp3',
      });
    }

    const promptText = typeof req.body.prompt === 'string' 
      ? req.body.prompt.slice(0, 300) 
      : 'Tranquil acoustic piano and birdsong for mindful daily morning planning';
    
    const responseStream = await ai.models.generateContentStream({
      model: 'lyria-3-clip-preview',
      contents: promptText,
    });

    let audioBase64 = '';
    let mimeType = 'audio/wav';

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
      }
    }

    res.json({ audioBase64, mimeType });
  } catch (error: any) {
    console.warn('Lyria soundscape notice: falling back cleanly to preview mode');
    res.status(200).json({
      simulated: true,
      message: 'Lyria music generation requires a paid key. Preview soundscape generated.',
      audioUrl: 'https://cdn.freesound.org/previews/560/560446_11861866-lq.mp3',
    });
  }
});

// 7. Science Skills Connector: Nature & Bioscience Literature and Wildlife Explorer
// Integrated from science skill (PubMed + UniProt + PDB) for nature journaling and biodiversity
app.get('/api/science/species', async (req, res) => {
  try {
    // Sanitize query to letters, numbers, spaces, and hyphens to prevent query injection
    const rawQuery = String(req.query.q || 'Ursus arctos').slice(0, 80);
    const sanitizedQuery = rawQuery.replace(/[^a-zA-Z0-9\s\-]/g, '').trim() || 'Ursus arctos';

    const response = await fetch(`https://rest.uniprot.org/taxonomy/search?query=${encodeURIComponent(sanitizedQuery)}&format=json&size=5`);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Upstream taxonomy service error' });
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch species taxonomy' });
  }
});

app.get('/api/science/botanical', async (req, res) => {
  try {
    const rawQuery = String(req.query.q || 'Salvia officinalis').slice(0, 80);
    const sanitizedQuery = rawQuery.replace(/[^a-zA-Z0-9\s\-]/g, '').trim() || 'Salvia officinalis';

    const response = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pmc&term=${encodeURIComponent(sanitizedQuery + ' AND botany')}&retmode=json&retmax=5`);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Upstream botanical service error' });
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to query botanical literature' });
  }
});

// Vite middleware in dev / static in prod (with resilient fallback if dist/ does not exist)
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  const distDir = path.resolve(__dirname, 'dist');
  const distIndex = path.resolve(distDir, 'index.html');
  const hasDist = fs.existsSync(distIndex);

  if (process.env.NODE_ENV !== 'production' || !hasDist) {
    if (!hasDist && process.env.NODE_ENV === 'production') {
      console.warn('⚠️ Warning: dist/index.html not found. Falling back to dynamic Vite SPA middleware to prevent ENOENT crash.');
    }
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(distIndex);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EDSER Full-Stack Server running securely at http://0.0.0.0:${PORT}`);
  });
}

startServer();
