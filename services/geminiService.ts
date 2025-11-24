
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AnalysisData } from '../types';
import { fileToBase64 } from "../utils/fileUtils";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        evaluation: {
            type: Type.OBJECT,
            properties: {
                rating: { type: Type.INTEGER, description: "Gesamtwertung on a scale of 1-100." },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Detailed positive aspects of the song (atmosphere, vocals, instrumentation, etc.)." },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Detailed potential areas for improvement or critique." },
                detailedRatings: {
                    type: Type.OBJECT,
                    properties: {
                        melody: { type: Type.INTEGER, description: "Rating for Melody on a scale of 1-10." },
                        rhythm: { type: Type.INTEGER, description: "Rating for Rhythm/Groove on a scale of 1-10." },
                        vocals: { type: Type.INTEGER, description: "Rating for Vocals/Performance on a scale of 1-10." },
                        production: { type: Type.INTEGER, description: "Rating for Production/Sound Quality on a scale of 1-10." },
                        originality: { type: Type.INTEGER, description: "Rating for Originality/Creativity on a scale of 1-10." },
                        atmosphere: { type: Type.INTEGER, description: "Rating for Atmosphere/Mood on a scale of 1-10." }
                    },
                    required: ["melody", "rhythm", "vocals", "production", "originality", "atmosphere"]
                }
            },
            required: ["rating", "strengths", "weaknesses", "detailedRatings"]
        },
        soundcloudDetails: {
            type: Type.OBJECT,
            properties: {
                primaryGenre: { type: Type.STRING, description: "The most fitting primary genre." },
                secondaryGenre: { type: Type.STRING, description: "A suitable secondary genre." },
                tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A very comprehensive and extensive list of relevant tags (at least 15-20 tags). Include genres, sub-genres, moods, instruments, themes, artist, title, language, and similar artists if applicable." },
                descriptionDE: { type: Type.STRING, description: "Engaging descriptive paragraph in German (approx. 3-5 sentences), including relevant hashtags." },
                descriptionEN: { type: Type.STRING, description: "Engaging descriptive paragraph in English (approx. 3-5 sentences), including relevant hashtags." },
                previewStartTime: { type: Type.INTEGER, description: "The start time in SECONDS for a preview sample (e.g., a highlight or the chorus of the song)." },
                similarArtists: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List exactly 3-5 famous artists or bands that sound similar to this track." }
            },
            required: ["primaryGenre", "secondaryGenre", "tags", "descriptionDE", "descriptionEN", "previewStartTime", "similarArtists"]
        },
        coverArtPrompts: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Generate TWO (2) distinct and creative prompts for a Text-to-Image AI. IMPORTANT: Each prompt MUST explicitly instruct the AI to include the text '${artistName} - ${songTitle}' on the cover art. Specify mood, genre aesthetic, visual concepts, color palette, and art style."
        },
        promotionMaterial: {
            type: Type.OBJECT,
            properties: {
                instagramPost: { type: Type.STRING, description: "An engaging Instagram post text to promote the song. Include emojis and relevant hashtags." },
                twitterPost: { type: Type.STRING, description: "A short, catchy tweet (under 280 characters) to announce the new song." },
                behindTheSong: { type: Type.STRING, description: "A short, creative paragraph inventing a possible story or inspiration behind the song, suitable for a blog or website." },
                instagramReelPrompts: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Generate an array of EXACTLY FOUR (4) detailed, independent video prompts for a 20-second Instagram Reel (4 scenes of 5 seconds each). Each prompt should describe a visually engaging scene in 9:16 portrait format, matching the mood of the song's preview snippet. The prompts must be self-contained and ready for a Text-to-Video AI."
                },
                spotifyPitch: { type: Type.STRING, description: "A persuasive pitch for Spotify playlist curators (approx. 150-200 words) highlighting the mood, genre fit, and key elements. Return an empty string if not explicitly requested." },
            },
            required: ["instagramPost", "twitterPost", "behindTheSong", "instagramReelPrompts", "spotifyPitch"]
        }
    },
    required: ["evaluation", "soundcloudDetails", "coverArtPrompts", "promotionMaterial"]
};

export const analyzeTrack = async (
  audioFile: File,
  artistName: string,
  songTitle: string,
  specificRequest: string,
  includeSpotifyPitch: boolean
): Promise<AnalysisData> => {
  const base64Audio = await fileToBase64(audioFile);
  const audioMimeType = audioFile.type;

  const prompt = `
    You are a professional music analyst and A&R expert. Your task is to analyze a music track and generate detailed, structured metadata for distribution and promotion. You must provide your output in a valid JSON format, strictly adhering to the provided schema.

    Track Details:
    - Artist: ${artistName}
    - Title: ${songTitle}
    - User's Specific Request: ${specificRequest || 'None'}
    - Include Spotify Pitch: ${includeSpotifyPitch ? 'YES' : 'NO'}

    Instructions:
    1.  Listen to the entire audio track carefully.
    2.  Provide a comprehensive evaluation: 
        - A main rating from 1-100.
        - Detailed strengths and weaknesses, mentioning specific musical elements.
        - Specific ratings from 1-10 for: Melody, Rhythm, Vocals, Production, Originality, and Atmosphere.
    3.  Generate SoundCloud metadata: 
        - Identify genres.
        - Create a rich list of 15-20+ tags.
        - Write compelling descriptions in German and English.
        - Determine the best start time in SECONDS for a preview sample.
        - **Identify 3-5 similar sounding artists ("Sounds Like").**
    4.  Create TWO highly detailed and distinctively different creative prompts for a Text-to-Image AI for cover art. 
        - **CRITICAL:** The prompts MUST explicitly instruct the AI to include the text "${artistName}" and "${songTitle}" on the cover art.
        - Avoid cliches.
    5.  Generate promotional content: 
        - An Instagram post.
        - A short Twitter/X post.
        - A "Behind the Song" narrative.
        - A concept for a 20-second Instagram Reel (4 scenes x 5s).
        - **Spotify Pitch**: If "Include Spotify Pitch" is YES, write a compelling pitch.
    6.  If the user made a specific request, incorporate the answer into the relevant section of your analysis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: {
          parts: [
              { text: prompt },
              {
                  inlineData: {
                      data: base64Audio,
                      mimeType: audioMimeType
                  }
              }
          ]
      },
      config: {
          responseMimeType: 'application/json',
          responseSchema: analysisSchema,
      }
    });

    const jsonText = response.text.trim();
    const result: AnalysisData = JSON.parse(jsonText);
    return result;
  } catch (error) {
    console.error("Error calling Gemini API for analysis:", error);
    throw new Error("Failed to get analysis from AI. The model may have returned an invalid response.");
  }
};

export const regenerateCoverArtPrompt = async (
  originalPrompt: string,
  artistName: string,
  songTitle: string
): Promise<string> => {
  const prompt = `
    You are a creative assistant for generating AI image prompts.
    Your task is to take an existing image prompt for a song's cover art and create a new, distinct variation.

    Artist: ${artistName}
    Song Title: ${songTitle}

    Original Prompt:
    "${originalPrompt}"

    Instructions:
    1. Analyze the original prompt's core ideas, mood, and style.
    2. Generate a NEW prompt that captures the essence of the song but explores a DIFFERENT visual concept, art style, or perspective.
    3. **MANDATORY:** The new prompt MUST explicitly instruct the AI to include the text "${artistName}" and "${songTitle}" visible on the cover art.
    4. DO NOT simply rephrase the original prompt. Create a genuinely fresh alternative.
    5. Output ONLY the new prompt text, with no extra explanations or quotation marks around it.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API for prompt regeneration:", error);
    throw new Error("Failed to regenerate prompt from AI.");
  }
};

export const refineCoverArtPrompt = async (
  originalPrompt: string,
  instructions: string,
  artistName: string,
  songTitle: string
): Promise<string> => {
  const prompt = `
    You are a creative assistant. The user wants to refine an existing AI image prompt for a music cover art.

    Artist: ${artistName}
    Song Title: ${songTitle}

    Original Prompt:
    "${originalPrompt}"

    User's Request for Improvement:
    "${instructions}"

    Task:
    Rewrite the prompt to incorporate the user's request perfectly.
    **MANDATORY:** Ensure the prompt explicitly asks for the text "${artistName}" and "${songTitle}" to be visible on the cover.
    Ensure the prompt remains descriptive and suitable for a high-quality Text-to-Image model.
    Output ONLY the new prompt text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API for prompt refinement:", error);
    // Fallback: just append instructions to prompt if AI fails
    return `${originalPrompt}. ${instructions}. Text on cover: ${artistName} - ${songTitle}`; 
  }
};

export const generateSingleCoverArt = async (prompt: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => !!p.inlineData);

        if (imagePart && imagePart.inlineData) {
            const base64ImageBytes: string = imagePart.inlineData.data;
            return `data:image/png;base64,${base64ImageBytes}`;
        } else {
            console.warn("AI did not return an image for the prompt.");
            return null;
        }
    } catch (error) {
        console.error("Error calling Gemini API for image generation:", error);
        return null;
    }
};

export const generateCoverArts = async (prompts: string[]): Promise<(string | null)[]> => {
    const imagePromises = prompts.map(prompt => generateSingleCoverArt(prompt));
    const results = await Promise.allSettled(imagePromises);
    
    return results.map(result => {
        if (result.status === 'fulfilled') {
            return result.value;
        }
        console.error('Image generation failed for a prompt:', result.reason);
        return null;
    });
};
