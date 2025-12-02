import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- TTS Service ---
// voiceName options: 'Puck' (Playful), 'Charon' (Deep), 'Kore' (Balanced/Female), 'Fenrir' (Deep/Male), 'Zephyr' (Standard)
export const speakText = async (text: string, voiceName: string = 'Kore', retries = 2): Promise<ArrayBuffer | null> => {
  if (!text || text.trim().length === 0) return null;

  let attempt = 0;
  while (attempt <= retries) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: ['AUDIO'], // Use string literal to avoid enum issues
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }, 
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
      }
      return null;
    } catch (error) {
      console.warn(`TTS Warning (Attempt ${attempt + 1}/${retries + 1}):`, error);
      if (attempt === retries) {
        console.error("TTS Failed after retries:", text);
        return null;
      }
      attempt++;
      // Exponential backoff: 1000ms, 2000ms, etc. to prevent network flooding
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }
  return null;
};

// --- Image Generation (Gemini 2.5 Flash Image) ---
export const generateImage = async (prompt: string, size: "1K" | "2K" | "4K" = "1K", aspectRatio: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" = "1:1"): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Switched to 2.5 Flash
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          // imageSize is NOT supported in gemini-2.5-flash-image, so we omit it.
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error: any) {
    // Gracefully handle permission errors (403) or rate limits (429)
    if (error.toString().includes("403") || error.message?.includes("PERMISSION_DENIED")) {
        console.warn("Image Generation Skipped: Permission Denied. Using fallback.");
        return null;
    }
    if (error.toString().includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
        console.warn("Image Generation Skipped: Rate Limit Exceeded (429). Using fallback.");
        return null;
    }
    console.error("Image Gen Error:", error);
    return null; 
  }
};
