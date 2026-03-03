import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { CaseData, CaseType } from "../types";

// Vite menggunakan import.meta.env untuk variabel lingkungan
// Pastikan VITE_FIREBASE_API_KEY sudah diset di Vercel/file .env
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_FIREBASE_API_KEY);

export async function generateCaseDetails(caseNumber: string, type: CaseType): Promise<Partial<CaseData>> {
  try {
    // Menggunakan model 1.5 Flash yang cepat dan efisien untuk ekstraksi data JSON
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            classification: { 
              type: SchemaType.STRING, 
              description: "Klasifikasi perkara (misal: Cerai Gugat, Cerai Talak, Dispensasi Nikah)" 
            },
            parties: { 
              type: SchemaType.STRING, 
              description: "Pihak yang terlibat (misal: Penggugat vs Tergugat atau Nama Pemohon)" 
            },
            decisionDate: { 
              type: SchemaType.STRING, 
              description: "Tanggal putusan dalam format ISO" 
            },
            bhtDate: { 
              type: SchemaType.STRING, 
              description: "Tanggal Berkekuatan Hukum Tetap (BHT), hanya jika jenisnya Gugatan" 
            }
          },
          required: ["classification", "parties", "decisionDate"]
        }
      }
    });

    const prompt = `Generate realistic Indonesian Religious Court (Pengadilan Agama) metadata for Case Number: ${caseNumber} and Type: ${type}. Make it professional and accurate to Indonesian legal standards.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return JSON.parse(text || '{}');
  } catch (error) {
    console.error("Gemini service error:", error);
    return {};
  }
}
