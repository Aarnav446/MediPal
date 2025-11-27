import { GoogleGenAI, Type } from "@google/genai";
import { Doctor, AnalysisResult } from '../types';
import { MOCK_DOCTORS, VALID_SPECIALIZATIONS } from '../constants';

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Content = base64Data.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeSymptomsWithGemini = async (
  symptomText: string,
  imageFile: File | null
): Promise<AnalysisResult> => {
  
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are MediMatch AI, an advanced medical triage assistant. 
    Analyze the user's symptoms provided in the text (and image if provided).
    
    Your goal is to:
    1. Identify the most likely medical specialization needed.
    2. Assign a match score (0-100) indicating confidence in this specialization.
    3. Determine the urgency level (Low, Medium, or High).
    4. Provide a brief, empathetic explanation of why this conclusion was reached.
    
    The 'specialist' field MUST be one of the following strings exactly:
    ${JSON.stringify(VALID_SPECIALIZATIONS)}
    
    If the symptoms are vague or don't match a specific specialist, default to "General Practitioner".
    If the situation seems life-threatening (e.g., chest pain, difficulty breathing, severe bleeding), set urgency to "High" and advise calling emergency services in the explanation.
  `;

  // Simplified schema to ensure robust JSON generation
  const schema = {
    type: Type.OBJECT,
    properties: {
      specialist: { type: Type.STRING },
      match_score: { type: Type.INTEGER },
      urgency: { type: Type.STRING },
      explanation: { type: Type.STRING },
    },
    required: ["specialist", "match_score", "urgency", "explanation"],
  };

  try {
    const parts: any[] = [{ text: prompt }];

    if (imageFile) {
      const imagePart = await fileToGenerativePart(imageFile);
      parts.push(imagePart);
    }
    
    parts.push({ text: `\n\nUser Symptoms: "${symptomText}"` });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.2, 
      },
    });

    if (!response.text) {
      throw new Error("No response received from AI");
    }

    // Sanitize response: remove markdown code blocks if present
    let cleanText = response.text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const aiResult = JSON.parse(cleanText);

    // Validate Urgency
    let urgency: 'Low' | 'Medium' | 'High' = 'Low';
    if (['Low', 'Medium', 'High'].includes(aiResult.urgency)) {
        urgency = aiResult.urgency;
    }

    // Post-processing: Match with mock database
    // We filter the local database based on the AI's determined specialization
    let matchedDoctors = MOCK_DOCTORS.filter(
      (doc) => doc.specialization === aiResult.specialist
    );

    // Fallback: If no specific specialist found in mock DB, show GPs
    if (matchedDoctors.length === 0) {
      matchedDoctors = MOCK_DOCTORS.filter(
        (doc) => doc.specialization === 'General Practitioner'
      );
    }

    // Limit to top 3
    const recommendedDoctors = matchedDoctors.slice(0, 3);

    return {
      specialist: aiResult.specialist,
      match_score: aiResult.match_score,
      urgency: urgency,
      explanation: aiResult.explanation,
      recommended_doctors: recommendedDoctors,
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback for demo purposes if API fails or quota exceeded
    return {
      specialist: "General Practitioner",
      match_score: 50,
      urgency: "Low",
      explanation: "We encountered an error analyzing your symptoms. Please consult a General Practitioner directly. (Error: " + (error as Error).message + ")",
      recommended_doctors: MOCK_DOCTORS.filter(d => d.specialization === 'General Practitioner').slice(0,3)
    };
  }
};