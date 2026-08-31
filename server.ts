import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Lazy initializer for Google GenAI client
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment. Gemini API calls will fail.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Convert raw 16-bit PCM (sampleRate=24000, mono) to WAV Buffer with standard 44-byte RIFF header
function pcmToWavBuffer(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;
  const wavBuffer = Buffer.alloc(totalSize);

  // RIFF chunk descriptor
  wavBuffer.write('RIFF', 0);
  wavBuffer.writeUInt32LE(totalSize - 8, 4);
  wavBuffer.write('WAVE', 8);

  // fmt sub-chunk
  wavBuffer.write('fmt ', 12);
  wavBuffer.writeUInt32LE(16, 16); // Subchunk1Size for PCM
  wavBuffer.writeUInt16LE(1, 20);  // AudioFormat 1 = PCM
  wavBuffer.writeUInt16LE(numChannels, 22);
  wavBuffer.writeUInt32LE(sampleRate, 24);
  wavBuffer.writeUInt32LE(byteRate, 28);
  wavBuffer.writeUInt16LE(blockAlign, 32);
  wavBuffer.writeUInt16LE(bitsPerSample, 34);

  // data sub-chunk
  wavBuffer.write('data', 36);
  wavBuffer.writeUInt32LE(dataSize, 40);
  pcmBuffer.copy(wavBuffer, 44);

  return wavBuffer;
}

// Estimate word count for target commute minutes (typical speaking rate ~140-150 words per minute)
function getTargetWordCount(commuteMinutes: number): number {
  return Math.max(100, Math.min(3000, Math.round(commuteMinutes * 140)));
}

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: !!process.env.GEMINI_API_KEY });
});

// Fetch article text from URL endpoint
app.post('/api/fetch-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return res.status(400).json({ error: 'Valid URL is required' });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      return res.status(400).json({ error: `Failed to fetch URL: HTTP ${response.status}` });
    }

    const html = await response.text();

    // Extract title from <title> or <h1>
    let title = '';
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].replace(/\s+/g, ' ').trim();
      // Remove trailing site names e.g. "Article - The New York Times"
      title = title.split(/[|\-–—]/)[0].trim();
    }

    // Extract content paragraphs
    const cleanHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '');

    const paragraphMatches = cleanHtml.match(/<p\b[^>]*>([\s\S]*?)<\/p>/gi) || [];
    const paragraphs: string[] = [];

    for (const p of paragraphMatches) {
      const text = p.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (text.length > 50) {
        paragraphs.push(text);
      }
    }

    const extractedContent = paragraphs.slice(0, 15).join('\n\n');

    if (!extractedContent || extractedContent.length < 80) {
      return res.status(422).json({
        error: 'Could not extract substantial article text from this URL. Please paste the text directly.',
        title: title || 'Web Article'
      });
    }

    res.json({
      title: title || 'Extracted Article',
      content: extractedContent,
      source: new URL(url).hostname.replace('www.', '')
    });
  } catch (error: any) {
    console.error('Error fetching URL:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch article from URL' });
  }
});

// Voice sample preview endpoint
app.post('/api/voice-preview', async (req, res) => {
  try {
    const { voiceName = 'Kore' } = req.body;
    const ai = getAIClient();

    const sampleText = voiceName === 'Duo'
      ? `Joe: Welcome to your CommuteCast briefing! Jane: Here is everything you need to know for your drive.`
      : `Good morning! This is your personalized CommuteCast daily news summary.`;

    let ttsResponse;
    if (voiceName === 'Duo') {
      ttsResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text: `TTS the following conversation between Joe and Jane:\nJoe: Welcome to CommuteCast! Let's get right into today's top stories.\nJane: Sounds great, let's roll.` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                { speaker: 'Joe', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
                { speaker: 'Jane', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
              ],
            },
          },
        },
      });
    } else {
      ttsResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text: sampleText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName as any },
            },
          },
        },
      });
    }

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio generated by TTS model' });
    }

    const pcmBuffer = Buffer.from(base64Audio, 'base64');
    const wavBuffer = pcmToWavBuffer(pcmBuffer, 24000, 1, 16);
    const wavBase64 = wavBuffer.toString('base64');

    res.json({
      audioUrl: `data:audio/wav;base64,${wavBase64}`,
    });
  } catch (error: any) {
    console.error('Error generating voice preview:', error);
    res.status(500).json({ error: error.message || 'Failed to generate voice preview' });
  }
});

// Step 1: Generate customized script with chapters using gemini-3.7-flash
app.post('/api/generate-script', async (req, res) => {
  try {
    const { articles, preferences } = req.body;

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return res.status(400).json({ error: 'At least one article is required' });
    }

    const ai = getAIClient();
    const commuteMinutes = preferences?.commuteMinutes || 5;
    const targetWords = getTargetWordCount(commuteMinutes);
    const style = preferences?.style || 'npr';
    const listenerName = preferences?.listenerName ? preferences.listenerName.trim() : '';
    const weatherCity = preferences?.includeWeatherIntro && preferences?.weatherCity ? preferences.weatherCity.trim() : '';

    let stylePrompt = '';
    switch (style) {
      case 'executive':
        stylePrompt = `Tone: Executive, crisp, high-signal, zero fluff. Highlight bottom-line impacts, numbers, and strategic takeaways.`;
        break;
      case 'cohost':
        stylePrompt = `Format: A dynamic, two-host morning podcast show between 'Alex' (witty, curious, energetic) and 'Jordan' (analytical, grounded, articulate). Every section must be written as spoken dialog formatted as "Alex: ..." and "Jordan: ...". They should bounce ideas, ask natural follow-ups, and keep the commuter engaged!`;
        break;
      case 'chill':
        stylePrompt = `Tone: Warm, relaxed, conversational, like talking with a smart friend over coffee. Accessible analogies, clear explanations, calm cadence.`;
        break;
      case 'deepdive':
        stylePrompt = `Tone: Analytical and comprehensive. Dive into underlying causes, market ripples, technological mechanics, and what happens next.`;
        break;
      case 'npr':
      default:
        stylePrompt = `Tone: Polished public radio broadcast (NPR Morning Edition / BBC style). Balanced, authoritative, smooth natural transitions between stories.`;
        break;
    }

    const articlesText = articles.map((a: any, i: number) => `
[ARTICLE ${i + 1}]
Title: ${a.title}
Source: ${a.source || 'News'}
Category: ${a.category || 'General'}
Content:
${a.content}
`).join('\n---\n');

    const prompt = `You are the lead executive producer and host of CommuteCast, an award-winning personalized audio news digest tailored specifically for a listener's daily commute.

Listener Details:
- Commute duration: ${commuteMinutes} minutes (Target total script length: approximately ${targetWords} words total).
${listenerName ? `- Listener name: ${listenerName}` : ''}
${weatherCity ? `- Listener city for a brief opening greeting: ${weatherCity}` : ''}
- Delivery Style: ${stylePrompt}

Articles to synthesize:
${articlesText}

Requirements:
1. Write a complete, broadcast-ready audio script designed to be spoken aloud naturally.
2. Structure the script into distinct chapters:
   - "intro": Warm opening, brief overview of what's coming up today, tailored for the commute.
   - One chapter per major story or combined related topic with an engaging chapter title.
   - "outro": Quick recap of key takeaways, motivating sign-off for the day.
3. If the style is 'cohost', format EVERY spoken paragraph with "Alex: [text]" or "Jordan: [text]" consistently.
4. For each chapter, provide:
   - title: Catchy chapter headline
   - scriptText: Spoken broadcast script
   - bulletPoints: 2-3 concise key takeaways for visual read-along
   - estimatedSeconds: Estimated speaking time in seconds (calculated at ~2.5 words per second)
5. Also provide an overarching summary array of 3-5 key global takeaways across the entire briefing.
6. Provide a punchy, professional episode title (e.g. "Morning Transit Digest: AI Chips, Rate Shifts & City Transit").`;

    const scriptResponse = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            briefingTitle: { type: Type.STRING },
            targetDurationMinutes: { type: Type.NUMBER },
            overallKeyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  scriptText: { type: Type.STRING },
                  bulletPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  estimatedSeconds: { type: Type.NUMBER },
                },
                required: ['id', 'title', 'scriptText', 'bulletPoints', 'estimatedSeconds'],
              },
            },
          },
          required: ['briefingTitle', 'targetDurationMinutes', 'overallKeyTakeaways', 'chapters'],
        },
      },
    });

    const textOutput = scriptResponse.text;
    if (!textOutput) {
      throw new Error('Gemini model did not return script text');
    }

    const scriptData = JSON.parse(textOutput);
    res.json(scriptData);
  } catch (error: any) {
    console.error('Error generating script:', error);
    res.status(500).json({ error: error.message || 'Failed to generate audio script' });
  }
});

// Step 2: Synthesize TTS Audio using gemini-3.1-flash-tts-preview
app.post('/api/generate-tts', async (req, res) => {
  try {
    const { chapters, voice = 'Kore', style = 'npr', briefingTitle = 'CommuteCast Briefing' } = req.body;

    if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
      return res.status(400).json({ error: 'Chapters array is required' });
    }

    const ai = getAIClient();
    const pcmBuffers: Buffer[] = [];
    const enrichedChapters: any[] = [];
    let cumulativeSeconds = 0;

    // Process chapters sequentially to build high quality continuous audio and compute precise timestamps
    for (let i = 0; i < chapters.length; i++) {
      const chap = chapters[i];
      const script = (chap.scriptText || '').trim();
      if (!script) continue;

      let ttsResponse;

      if (voice === 'Duo' || style === 'cohost') {
        // Multi-speaker TTS using Alex and Jordan
        const formattedPrompt = `TTS the following conversation between Alex and Jordan:\n${script}`;
        ttsResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-tts-preview',
          contents: [{ parts: [{ text: formattedPrompt }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              multiSpeakerVoiceConfig: {
                speakerVoiceConfigs: [
                  { speaker: 'Alex', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
                  { speaker: 'Jordan', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                ],
              },
            },
          },
        });
      } else {
        // Single speaker TTS
        const voiceName = ['Kore', 'Puck', 'Fenrir', 'Zephyr', 'Charon'].includes(voice) ? voice : 'Kore';
        ttsResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-tts-preview',
          contents: [{ parts: [{ text: script }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voiceName as any },
              },
            },
          },
        });
      }

      const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        console.warn(`Warning: No audio data returned for chapter ${i}: ${chap.title}`);
        continue;
      }

      const chapterPcm = Buffer.from(base64Audio, 'base64');
      pcmBuffers.push(chapterPcm);

      // 24000 samples/sec * 1 channel * 2 bytes/sample = 48,000 bytes per second
      const chapterDurationSeconds = chapterPcm.length / 48000;
      const startTime = cumulativeSeconds;
      const endTime = cumulativeSeconds + chapterDurationSeconds;
      cumulativeSeconds = endTime;

      enrichedChapters.push({
        ...chap,
        startTimeSeconds: Math.round(startTime * 10) / 10,
        endTimeSeconds: Math.round(endTime * 10) / 10,
        actualSeconds: Math.round(chapterDurationSeconds * 10) / 10,
      });

      // Add a small 0.4s silence pause between chapters (0.4s * 48000 = 19200 bytes)
      if (i < chapters.length - 1) {
        const silenceBytes = Math.round(0.4 * 48000);
        // ensure even byte length for 16-bit alignment
        const alignedSilence = silenceBytes % 2 === 0 ? silenceBytes : silenceBytes + 1;
        const silenceBuffer = Buffer.alloc(alignedSilence);
        pcmBuffers.push(silenceBuffer);
        cumulativeSeconds += alignedSilence / 48000;
      }
    }

    if (pcmBuffers.length === 0) {
      return res.status(500).json({ error: 'Failed to synthesize audio for any chapter' });
    }

    const fullPcmBuffer = Buffer.concat(pcmBuffers);
    const wavBuffer = pcmToWavBuffer(fullPcmBuffer, 24000, 1, 16);
    const wavBase64 = wavBuffer.toString('base64');

    const totalSeconds = Math.round(fullPcmBuffer.length / 48000);

    res.json({
      audioUrl: `data:audio/wav;base64,${wavBase64}`,
      totalDurationSeconds: totalSeconds,
      chapters: enrichedChapters,
    });
  } catch (error: any) {
    console.error('Error generating TTS:', error);
    res.status(500).json({ error: error.message || 'Failed to synthesize speech audio' });
  }
});

// Step 3: All-in-one generate endpoint for instant 1-click execution
app.post('/api/generate-full-briefing', async (req, res) => {
  try {
    const { articles, preferences } = req.body;

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return res.status(400).json({ error: 'At least one article is required' });
    }

    const ai = getAIClient();
    const commuteMinutes = preferences?.commuteMinutes || 5;
    const targetWords = getTargetWordCount(commuteMinutes);
    const style = preferences?.style || 'npr';
    const voice = preferences?.voice || 'Kore';
    const listenerName = preferences?.listenerName ? preferences.listenerName.trim() : '';
    const weatherCity = preferences?.includeWeatherIntro && preferences?.weatherCity ? preferences.weatherCity.trim() : '';

    let stylePrompt = '';
    switch (style) {
      case 'executive':
        stylePrompt = `Tone: Executive, crisp, high-signal, zero fluff. Highlight bottom-line impacts, key statistics, and strategic implications.`;
        break;
      case 'cohost':
        stylePrompt = `Format: A lively, engaging two-host morning podcast between 'Alex' (witty, curious) and 'Jordan' (sharp, analytical). Format every line as "Alex: ..." and "Jordan: ...". They should bounce observations, react, and explain stories conversationally.`;
        break;
      case 'chill':
        stylePrompt = `Tone: Warm, conversational, and accessible. Like a friendly chat over morning coffee. Smooth transitions and clear real-world examples.`;
        break;
      case 'deepdive':
        stylePrompt = `Tone: In-depth investigative broadcast. Explores why this matters, systemic ripples, background context, and what to watch next.`;
        break;
      case 'npr':
      default:
        stylePrompt = `Tone: Premium public radio broadcast (like NPR Morning Edition). Balanced, insightful, and authoritative with seamless story transitions.`;
        break;
    }

    const articlesText = articles.map((a: any, i: number) => `
[ARTICLE ${i + 1}]
Title: ${a.title}
Source: ${a.source || 'News'}
Category: ${a.category || 'General'}
Content:
${a.content}
`).join('\n---\n');

    const prompt = `You are the executive producer of CommuteCast, generating a personalized audio news summary for a daily commute.

Parameters:
- Target commute length: ${commuteMinutes} minutes (approx. ${targetWords} words total).
${listenerName ? `- Listener name: ${listenerName}` : ''}
${weatherCity ? `- Listener city for morning commute greeting: ${weatherCity}` : ''}
- Style: ${stylePrompt}

Articles:
${articlesText}

Create a structured script divided into:
1. intro: Engaging greeting, brief preview of today's topics.
2. 2-4 story chapters covering the news topics concisely.
3. outro: Short takeaway recap and sendoff.

Return JSON with:
- briefingTitle: string
- targetDurationMinutes: number
- overallKeyTakeaways: array of strings (3-5 items)
- chapters: array of { id, title, scriptText, bulletPoints: string[], estimatedSeconds: number }`;

    const scriptGen = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            briefingTitle: { type: Type.STRING },
            targetDurationMinutes: { type: Type.NUMBER },
            overallKeyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  scriptText: { type: Type.STRING },
                  bulletPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  estimatedSeconds: { type: Type.NUMBER },
                },
                required: ['id', 'title', 'scriptText', 'bulletPoints', 'estimatedSeconds'],
              },
            },
          },
          required: ['briefingTitle', 'targetDurationMinutes', 'overallKeyTakeaways', 'chapters'],
        },
      },
    });

    const scriptJson = JSON.parse(scriptGen.text || '{}');
    const rawChapters = scriptJson.chapters || [];

    // Synthesize TTS for each chapter
    const pcmBuffers: Buffer[] = [];
    const finalChapters: any[] = [];
    let cumulativeSeconds = 0;

    for (let i = 0; i < rawChapters.length; i++) {
      const chap = rawChapters[i];
      const script = (chap.scriptText || '').trim();
      if (!script) continue;

      let ttsResponse;
      if (voice === 'Duo' || style === 'cohost') {
        const formattedPrompt = `TTS the following conversation between Alex and Jordan:\n${script}`;
        ttsResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-tts-preview',
          contents: [{ parts: [{ text: formattedPrompt }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              multiSpeakerVoiceConfig: {
                speakerVoiceConfigs: [
                  { speaker: 'Alex', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
                  { speaker: 'Jordan', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                ],
              },
            },
          },
        });
      } else {
        const voiceName = ['Kore', 'Puck', 'Fenrir', 'Zephyr', 'Charon'].includes(voice) ? voice : 'Kore';
        ttsResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-tts-preview',
          contents: [{ parts: [{ text: script }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voiceName as any },
              },
            },
          },
        });
      }

      const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const chapterPcm = Buffer.from(base64Audio, 'base64');
        pcmBuffers.push(chapterPcm);

        const duration = chapterPcm.length / 48000;
        const start = cumulativeSeconds;
        const end = cumulativeSeconds + duration;
        cumulativeSeconds = end;

        finalChapters.push({
          ...chap,
          startTimeSeconds: Math.round(start * 10) / 10,
          endTimeSeconds: Math.round(end * 10) / 10,
          actualSeconds: Math.round(duration * 10) / 10,
        });

        // Inter-chapter pause (0.35s)
        if (i < rawChapters.length - 1) {
          const silenceBytes = Math.round(0.35 * 48000);
          const alignedSilence = silenceBytes % 2 === 0 ? silenceBytes : silenceBytes + 1;
          pcmBuffers.push(Buffer.alloc(alignedSilence));
          cumulativeSeconds += alignedSilence / 48000;
        }
      }
    }

    const fullPcmBuffer = Buffer.concat(pcmBuffers);
    const wavBuffer = pcmToWavBuffer(fullPcmBuffer, 24000, 1, 16);
    const wavBase64 = wavBuffer.toString('base64');

    const totalSeconds = Math.round(fullPcmBuffer.length / 48000);
    const fullScript = finalChapters.map(c => `[${c.title}]\n${c.scriptText}`).join('\n\n');

    const completeBriefing = {
      id: 'briefing-' + Date.now(),
      title: scriptJson.briefingTitle || 'Daily Commute Briefing',
      createdAt: new Date().toISOString(),
      targetDurationMinutes: commuteMinutes,
      actualDurationSeconds: totalSeconds,
      style,
      voice,
      fullScript,
      chapters: finalChapters,
      audioDataUrl: `data:audio/wav;base64,${wavBase64}`,
      keyTakeaways: scriptJson.overallKeyTakeaways || [],
      articleCount: articles.length,
    };

    res.json(completeBriefing);
  } catch (error: any) {
    console.error('Error generating full briefing:', error);
    res.status(500).json({ error: error.message || 'Failed to generate personalized commute briefing' });
  }
});

// Vite Middleware integration for development / production serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CommuteCast server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
