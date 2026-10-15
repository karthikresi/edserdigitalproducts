import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI SDK with required telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. Multi-turn Gemini Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, modelChoice = 'gemini-3.8-flash', systemPrompt } = req.body;
    
    // Choose model safely: gemini-3.8-flash (standard), gemini-3.1-flash-lite (fast)
    const validModel = modelChoice === 'gemini-3.1-flash-lite' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';

    const systemInstruction = systemPrompt || 
      'You are EDSER AI Assistant, a friendly and thoughtful specialist in mindful daily planning, digital organization spreadsheets, and screen-free creative activities for children. Provide helpful, calm, practical answers with elegant formatting.';

    const contents = Array.isArray(messages) ? messages : [{ role: 'user', parts: [{ text: req.body.prompt || 'Hello' }] }];

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
    console.error('Chat error:', error);
    res.status(500).json({ error: error?.message || 'Chat generation failed' });
  }
});

// 2. Audio Transcription Endpoint using gemini-3.5-transcribe
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioData, mimeType = 'audio/webm' } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: 'Missing audioData' });
    }

    const audioPart = {
      inlineData: {
        mimeType,
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
    console.error('Transcribe error:', error);
    res.status(500).json({ error: error?.message || 'Transcription failed' });
  }
});

// 3. Google Search Grounding Endpoint using gemini-3.8-flash
app.post('/api/search-grounding', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt required' });

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
    console.error('Search grounding error:', error);
    res.status(500).json({ error: error?.message || 'Search grounding failed' });
  }
});

// 4. Google Maps Grounding Endpoint using gemini-3.8-flash
app.post('/api/maps-grounding', async (req, res) => {
  try {
    const { query, latitude, longitude } = req.body;
    if (!query) return res.status(400).json({ error: 'Query required' });

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
    console.error('Maps grounding error:', error);
    res.status(500).json({ error: error?.message || 'Maps grounding failed' });
  }
});

// 5. Veo Video Generation API (text-to-video & image-to-video)
app.post('/api/generate-video', async (req, res) => {
  try {
    const { prompt, imageBase64, aspectRatio = '16:9' } = req.body;
    
    // Attempt Veo generation
    const requestPayload: any = {
      model: 'veo-3.1-lite-generate-preview',
      prompt: prompt || 'A gentle breeze flipping pages of an undated aesthetic planner on a warm sunny table',
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
      },
    };

    if (imageBase64) {
      requestPayload.image = {
        imageBytes: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
        mimeType: 'image/png',
      };
    }

    const operation = await ai.models.generateVideos(requestPayload);
    res.json({ operationName: operation.name });
  } catch (error: any) {
    // If user has not enabled a paid key, explain cleanly without crashing
    console.warn('Veo generation note:', error?.message);
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
    const { prompt = 'Tranquil acoustic piano and birdsong for mindful daily morning planning' } = req.body;
    
    const responseStream = await ai.models.generateContentStream({
      model: 'lyria-3-clip-preview',
      contents: prompt,
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
    console.warn('Lyria generation note:', error?.message);
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
    const query = String(req.query.q || 'Ursus arctos'); // Default brown bear for National Parks
    const response = await fetch(`https://rest.uniprot.org/taxonomy/search?query=${encodeURIComponent(query)}&format=json&size=5`);
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch species taxonomy' });
  }
});

app.get('/api/science/botanical', async (req, res) => {
  try {
    const query = String(req.query.q || 'Salvia officinalis'); // Sage sprigs
    const response = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pmc&term=${encodeURIComponent(query + ' AND botany')}&retmode=json&retmax=5`);
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to query botanical literature' });
  }
});

// Vite middleware in dev / static in prod
const PORT = 3000;
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EDSER Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
