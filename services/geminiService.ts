import { GoogleGenAI, Type, Chat } from "@google/genai";
import { DetailedLawAnalysis, LawSection, LawType } from "../types";

const getAIClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Searches for law sections based on a user query.
 * Returns a structured list of potential matches using JSON Schema.
 */
export const searchLaws = async (query: string): Promise<LawSection[]> => {
  const ai = getAIClient();
  
  const prompt = `
    You are an expert Indian Legal System AI. 
    The user is searching for: "${query}".
    Identify relevant sections from the Indian Penal Code (IPC), Constitution, or CrPC.
    Return a list of the top 3-5 most relevant sections.
    If the user asks about a specific crime (e.g., "murder"), return the relevant section (e.g., 302 IPC).
    Ensure the 'act' field exactly matches one of these strings: "Indian Penal Code", "Code of Criminal Procedure", "Constitution of India", "Other Acts".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sectionNumber: { type: Type.STRING, description: "e.g., '302' or 'Article 14'" },
              act: { type: Type.STRING, description: "The name of the Act" },
              title: { type: Type.STRING, description: "Official title of the section" },
              summary: { type: Type.STRING, description: "Brief 15-word summary" },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["sectionNumber", "act", "title", "summary", "tags"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const rawData = JSON.parse(text);
    // Map to ensure Act enum correctness and add IDs
    return rawData.map((item: any, index: number) => ({
      ...item,
      id: `${item.act}-${item.sectionNumber}-${index}`,
      // Fallback mapping if model hallucinates slight variations
      act: Object.values(LawType).includes(item.act) ? item.act : LawType.OTHER
    }));
  } catch (error) {
    console.error("Error searching laws:", error);
    return [];
  }
};

/**
 * Generates a detailed analysis of a specific section using the Thinking model for accuracy.
 */
export const getSectionDetails = async (sectionNumber: string, act: string): Promise<DetailedLawAnalysis> => {
  const ai = getAIClient();

  const prompt = `
    Provide a comprehensive guide for **${act} ${sectionNumber}**.
    
    Structure the response strictly according to the requested JSON schema.
    1. Legal Text: The actual legal language (briefly).
    2. Simplified Explanation: Explained like I'm 12 years old.
    3. Punishment: Prison term and/or fine (if applicable).
    4. Cognizable: Yes/No/Details.
    5. Bailable: Yes/No/Details.
    6. Key Points: Bullet points of ingredients of the offense.
    7. Example Scenario: A short real-world hypothetical example.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sectionNumber: { type: Type.STRING },
            actName: { type: Type.STRING },
            legalText: { type: Type.STRING },
            simplifiedExplanation: { type: Type.STRING },
            punishment: { type: Type.STRING },
            cognizable: { type: Type.STRING },
            bailable: { type: Type.STRING },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            exampleScenario: { type: Type.STRING }
          },
          required: ["sectionNumber", "actName", "legalText", "simplifiedExplanation", "keyPoints", "exampleScenario"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as DetailedLawAnalysis;

  } catch (error) {
    console.error("Error getting section details:", error);
    throw error;
  }
};

/**
 * Creates a chat session for the Legal Assistant interface.
 */
export const createLegalChatSession = (): Chat => {
  const ai = getAIClient();
  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: "You are NyayaSetu, an AI legal assistant specializing in Indian Law (IPC, CrPC, Constitution, BNS). Provide accurate, helpful, and simplified explanations. Structure your answers with bullet points where appropriate. Always include a disclaimer that you are an AI and this is not professional legal advice.",
    }
  });
};