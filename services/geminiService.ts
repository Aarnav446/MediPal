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
    You are MediMatch AI, a highly advanced medical triage assistant. 
    Analyze the user's symptoms provided in the text (and image if provided).
    
    Your goal is to:
    1. Identify the most likely medical specialization needed.
    2. Assign a confidence score (0-100) indicating how certain you are about this specialization.
    3. Determine the urgency level (Low, Medium, or High).
    4. Provide a detailed, empathetic, and personalized explanation.
    5. List 1-3 potential medical conditions (diseases or issues) that match these symptoms (e.g., "Psoriasis", "Migraine", "Hypertension"). BE VERY SPECIFIC with disease names.
    6. Determine the "Best Proper Curable Type". Which medical system (Allopathy, Ayurveda, Homeopathy, Surgery, Physiotherapy) provides the most definitive and fastest CURE for this specific condition based on medical consensus?
    7. Provide a reasoning for this treatment choice, focusing on "how to cure it best and faster".

    The 'specialist' field MUST be one of the following strings exactly:
    ${JSON.stringify(VALID_SPECIALIZATIONS)}
    
    If the symptoms are vague or don't match a specific specialist, default to "General Practitioner".
    If the situation seems life-threatening (e.g., chest pain, difficulty breathing, severe bleeding), YOU MUST set urgency to "High".
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
      },
      recommended_treatment_type: { type: Type.STRING },
      treatment_reasoning: { type: Type.STRING }
    },
    required: ["specialist", "match_score", "urgency", "explanation", "potential_conditions", "recommended_treatment_type", "treatment_reasoning"],
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
      // We significantly boost the weight (20 points) for specific disease matches 
      // to ensure experts in that specific field (e.g., Psoriasis) bubble to the top.
      let matches = 0;
      const docText = (doc.specialties.join(' ') + ' ' + doc.bio).toLowerCase();
      
      conditions.forEach(cond => {
        if (docText.includes(cond.toLowerCase())) {
          matches += 1;
        }
      });
      
      // Add 20 points per match (aggressive weighting for experts), cap at 99
      const finalScore = Math.min(99, score + (matches * 20));
      
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
      recommended_treatment_type: aiResult.recommended_treatment_type,
      treatment_reasoning: aiResult.treatment_reasoning
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
      recommended_doctors: MOCK_DOCTORS.filter(d => d.specialization === 'General Practitioner').slice(0,3).map(d => ({...d, compatibility_score: 50})),
      recommended_treatment_type: "Consultation",
      treatment_reasoning: "Please consult a doctor for a proper treatment plan."
    };
  }
};