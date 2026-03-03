
import { GoogleGenAI, Type } from "@google/genai";
import { CaseData, CaseType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateCaseDetails(caseNumber: string, type: CaseType): Promise<Partial<CaseData>> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate realistic Indonesian court case metadata for Case Number: ${caseNumber} and Type: ${type}. 
      Make it look professional. Return as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            classification: { type: Type.STRING, description: "Classification of the case" },
            parties: { type: Type.STRING, description: "Parties involved (e.g. A vs B or Single Name)" },
            decisionDate: { type: Type.STRING, description: "ISO date of decision" },
            bhtDate: { type: Type.STRING, description: "ISO date of final legal force, only if Gugatan" }
          },
          required: ["classification", "parties", "decisionDate"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini service error:", error);
    return {};
  }
}
