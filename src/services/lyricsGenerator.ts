import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateLyrics(title: string, artist: string, duration: number) {
  try {
    const prompt = `Find and generate the EXACT synchronized lyrics for the song "${title}" by "${artist}". 
    The song duration is exactly ${duration} seconds.
    
    CRITICAL: 
    1. The timestamps MUST be perfectly aligned with the actual audio file which is ${duration} seconds long.
    2. Start the first lyric at the exact second the vocals begin.
    3. Include 15-20 lines to ensure a dense, high-accuracy experience.
    4. You MUST search for the specific version of this song to ensure timing accuracy.
    
    Format the response as an array of objects with 'time' (number in seconds) and 'text' (string).
    Return ONLY JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [
          { googleSearch: {} }
        ],
        toolConfig: { includeServerSideToolInvocations: true },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.INTEGER },
              text: { type: Type.STRING }
            },
            required: ["time", "text"]
          }
        }
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini lyric generation failed:", error);
    return null;
  }
}
