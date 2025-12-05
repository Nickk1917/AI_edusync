import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Flashcard, QuizQuestion } from "../types";

// Initialize the client
// CRITICAL: The API key is assumed to be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Generate structured study notes from text or file content.
 */
export const generateNotes = async (
  text: string,
  fileData?: { data: string; mimeType: string }
): Promise<string> => {
  try {
    const parts: any[] = [];
    
    if (fileData) {
      parts.push({
        inlineData: {
          data: fileData.data,
          mimeType: fileData.mimeType,
        },
      });
    }

    if (text) {
      parts.push({ text: `Source material context: ${text}` });
    }

    parts.push({
      text: `
      You are an expert study assistant. 
      Analyze the provided material (text and/or file) and create comprehensive, structured study notes in Markdown format.
      
      CRITICAL INSTRUCTION: Keep points concise and short. Use bullet points heavily. Avoid long paragraphs.
      
      Structure the output as follows:
      # [Title of the Topic]
      
      ## Important Points
      - Provide a comprehensive list of bullet points covering the most critical takeaways.
      - Keep each bullet point short (1-2 sentences maximum).
      - Extract the core message and key facts into these points.

      ## Key Concepts
      - **Concept Name**: Short definition and explanation.
      
      ## Detailed Notes
      Break down the main sections of the content with clear headers and bullet points.
      - Use nested bullets for sub-points.
      - Focus on brevity and clarity.
      
      ## Important Formulas / Key Dates / Figures
      (If applicable, list them here)
      
      ## Glossary
      - **Term**: Definition.
      
      Use bolding for emphasis. Keep it clean and easy to read.
      `
    });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
    });

    return response.text || "Failed to generate notes.";
  } catch (error) {
    console.error("Error generating notes:", error);
    throw new Error("Failed to generate notes. Please try again.");
  }
};

/**
 * Generate Flashcards from the generated notes.
 */
export const generateFlashcards = async (notes: string): Promise<Flashcard[]> => {
  try {
    const prompt = `
      Based on the following study notes, create 10-15 high-quality flashcards for studying.
      Each card should have a clear question/term on the 'front' and a concise answer/explanation on the 'back'.
      
      Notes:
      ${notes.substring(0, 20000)} 
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING },
              back: { type: Type.STRING },
            },
            required: ["front", "back"],
          },
        },
      },
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((item: any, index: number) => ({
      id: `fc-${Date.now()}-${index}`,
      front: item.front,
      back: item.back,
      status: 'new',
    }));
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw new Error("Failed to generate flashcards.");
  }
};

/**
 * Generate a Quiz from the generated notes.
 */
export const generateQuiz = async (notes: string): Promise<QuizQuestion[]> => {
  try {
    const prompt = `
      Based on the following study notes, create a multiple-choice quiz with 10 questions.
      Provide 4 options for each question.
      
      Notes:
      ${notes.substring(0, 20000)}
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctAnswerIndex: { type: Type.INTEGER, description: "Index of the correct option (0-3)" },
              explanation: { type: Type.STRING, description: "Why this answer is correct" },
            },
            required: ["question", "options", "correctAnswerIndex", "explanation"],
          },
        },
      },
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((item: any, index: number) => ({
      id: `qz-${Date.now()}-${index}`,
      question: item.question,
      options: item.options,
      correctAnswerIndex: item.correctAnswerIndex,
      explanation: item.explanation,
    }));
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz.");
  }
};