import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface MashupInstructions {
  bpmA: number;
  bpmB: number;
  keyA: string;
  keyB: string;
  playbackRateA: number;
  playbackRateB: number;
  energyStartA: number; // in seconds, when the main beat starts
  energyStartB: number; // in seconds, when the vocals/main melody starts
  sectionLabelA: string; // e.g. "Main Drop", "Intro"
  sectionLabelB: string; // e.g. "Hook", "Verse 1"
  mashupReason: string;
  eqSettings: {
    lowA: number; // gain in dB
    midA: number;
    highA: number;
    lowB: number;
    midB: number;
    highB: number;
  };
}

export async function analyzeMashup(trackA: { title: string, artist: string }, trackB: { title: string, artist: string }): Promise<MashupInstructions | null> {
  try {
    const prompt = `You are an AI DJ and Music Producer. 
    Analyze the following two tracks and provide instructions for a perfect mashup:
    Track A (Base/Instrumental Focus): "${trackA.title}" by "${trackA.artist}"
    Track B (Vocals/Melody Focus): "${trackB.title}" by "${trackB.artist}"

    Your goal is to align their "Hook" or "Energy Centers" perfectly WITHOUT DISTORTING speed.
    
    1. Estimate their individual BPM and Keys.
    2. MANDATORY: Set playbackRateA and playbackRateB to exactly 1.0 to preserve audio quality.
    3. Identify the "Best Sample Section" (e.g., 'Verse 1', 'Chorus/Middle', 'Intro') for both tracks.
    4. For Track A (Base), identify the exact timestamp (seconds) where that section starts (energyStartA).
    5. For Track B (Melody), identify the exact timestamp (seconds) where that section starts (energyStartB).
    6. Ensure that when played together from these offsets, the first few bars align musically.
    7. Suggest EQ settings to blend these specific sections.
    8. Provide a creative "Mashup Reason".

    Return the data as a structured JSON object.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bpmA: { type: Type.NUMBER },
            bpmB: { type: Type.NUMBER },
            keyA: { type: Type.STRING },
            keyB: { type: Type.STRING },
            playbackRateA: { type: Type.NUMBER },
            playbackRateB: { type: Type.NUMBER },
            energyStartA: { type: Type.NUMBER, description: "Seconds into the song where beats start" },
            energyStartB: { type: Type.NUMBER, description: "Seconds into the song where vocals start" },
            sectionLabelA: { type: Type.STRING, description: "Descriptive label for the selected section in Track A" },
          sectionLabelB: { type: Type.STRING, description: "Descriptive label for the selected section in Track B" },
          mashupReason: { type: Type.STRING },
            eqSettings: {
              type: Type.OBJECT,
              properties: {
                lowA: { type: Type.NUMBER },
                midA: { type: Type.NUMBER },
                highA: { type: Type.NUMBER },
                lowB: { type: Type.NUMBER },
                midB: { type: Type.NUMBER },
                highB: { type: Type.NUMBER }
              },
              required: ["lowA", "midA", "highA", "lowB", "midB", "highB"]
            }
          },
          required: ["bpmA", "bpmB", "playbackRateA", "playbackRateB", "energyStartA", "energyStartB", "mashupReason", "eqSettings"]
        }
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini mashup analysis failed:", error);
    return null;
  }
}
