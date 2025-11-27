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
    You are MediMatch AI, a highly advanced and compassionate medical triage assistant. 
    Analyze the user's symptoms provided in the text (and image if provided).
    
    Your goal is to:
    1. Identify the most likely medical specialization needed.
    2. Assign a confidence score (0-100) indicating how certain you are about this specialization.
    3. Determine the urgency level (Low, Medium, or High).
    4. Provide a detailed, empathetic, and personalized explanation.
       - Address the user directly ("You mentioned...").
       - Explain *why* their specific symptoms lead to this conclusion.
       - If an image is provided, reference visible features (e.g., "The redness and swelling in the image suggests...").
    5. List 1-3 potential medical conditions (diseases or issues) that matches these symptoms (e.g., "Eczema", "Migraine", "Hypertension").
    
    The 'specialist' field MUST be one of the following strings exactly:
    ${JSON.stringify(VALID_SPECIALIZATIONS)}
    
    If the symptoms are vague or don't match a specific specialist, default to "General Practitioner".
    If the situation seems life-threatening (e.g., chest pain, difficulty breathing, severe bleeding, signs of stroke/heart attack), YOU MUST set urgency to "High".
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      specialist: { type: Type.STRING },
      match_score: { type: Type.INTEGER },
      urgency: { type: Type.STRING },
      explanation: { type: Type.STRING },
      potential_conditions: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
    required: ["specialist", "match_score", "urgency", "explanation", "potential_conditions"],
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

    // Enforce strong warning for High Urgency
    let explanation = aiResult.explanation;
    if (urgency === 'High') {
        const warningPrefix = "CRITICAL WARNING: Based on your symptoms, IMMEDIATE medical attention is recommended. Please call emergency services (911) or proceed to the nearest Emergency Room right away. ";
        // Prepend warning if not already present in some form
        if (!explanation.toLowerCase().includes("emergency services") && !explanation.toLowerCase().includes("call 911")) {
            explanation = warningPrefix + "\n\n" + explanation;
        }
    }

    // Post-processing: Match with mock database
    const specialistStr = aiResult.specialist ? aiResult.specialist.trim() : "General Practitioner";
    const conditions: string[] = aiResult.potential_conditions || [];

    // 1. Filter by Specialization
    let matchedDoctors = MOCK_DOCTORS.filter(
      (doc) => doc.specialization.toLowerCase() === specialistStr.toLowerCase()
    );

    // Fallback: If no specific specialist found in mock DB, show GPs
    if (matchedDoctors.length === 0) {
      matchedDoctors = MOCK_DOCTORS.filter(
        (doc) => doc.specialization === 'General Practitioner'
      );
    }

    // 2. Calculate Compatibility Score for each doctor
    // Score based on: Base AI confidence + Overlap between doctor specialties and identified conditions
    const scoredDoctors = matchedDoctors.map(doc => {
      let score = aiResult.match_score; 
      
      // Bonus points for keyword matches in specialties or bio
      let matches = 0;
      const docText = (doc.specialties.join(' ') + ' ' + doc.bio).toLowerCase();
      
      conditions.forEach(cond => {
        if (docText.includes(cond.toLowerCase())) {
          matches += 1;
        }
      });
      
      // Add 5 points per match, but don't exceed 99
      const finalScore = Math.min(99, score + (matches * 5));
      
      return { ...doc, compatibility_score: finalScore };
    });

    // 3. Sort by Compatibility Score (Descending)
    scoredDoctors.sort((a, b) => (b.compatibility_score || 0) - (a.compatibility_score || 0));

    // Limit to top 3
    const recommendedDoctors = scoredDoctors.slice(0, 3);

    return {
      specialist: specialistStr,
      match_score: aiResult.match_score,
      urgency: urgency,
      explanation: explanation,
      potential_conditions: conditions,
      recommended_doctors: recommendedDoctors,
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback for demo purposes
    return {
      specialist: "General Practitioner",
      match_score: 50,
      urgency: "Low",
      explanation: "We encountered an error analyzing your symptoms. Please consult a General Practitioner directly. (Error: " + (error as Error).message + ")",
      potential_conditions: [],
      recommended_doctors: MOCK_DOCTORS.filter(d => d.specialization === 'General Practitioner').slice(0,3).map(d => ({...d, compatibility_score: 50}))
    };
  }
};