
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeAnalysis, InterviewQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeResume = async (base64Data: string, mimeType: string): Promise<ResumeAnalysis> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        },
        {
          text: "Analyze this resume and provide a detailed structured response for ATS scoring and career guidance. Be critical and professional."
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          atsScore: { type: Type.NUMBER },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
          executiveSummary: { type: Type.STRING },
          metrics: {
            type: Type.OBJECT,
            properties: {
              formatting: { type: Type.NUMBER },
              contentQuality: { type: Type.NUMBER },
              atsCompatibility: { type: Type.NUMBER },
              keywordUsage: { type: Type.NUMBER }
            },
            required: ["formatting", "contentQuality", "atsCompatibility", "keywordUsage"]
          },
          recommendedDomain: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              justification: { type: Type.STRING },
              potentialRoles: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "justification", "potentialRoles"]
          }
        },
        required: ["atsScore", "strengths", "weaknesses", "improvements", "executiveSummary", "metrics", "recommendedDomain"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateInterviewQuestions = async (domain: string, difficulty: string, count: number): Promise<InterviewQuestion[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate ${count} interview questions for a ${difficulty} level role in ${domain}. Include a mix of technical and behavioral questions.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            text: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['technical', 'behavioral'] }
          },
          required: ["id", "text", "type"]
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const evaluateFullInterview = async (
  domain: string, 
  qaPairs: { question: string, answer: string }[], 
  snapshots: string[]
): Promise<any> => {
  const parts = [
    { text: `Evaluate this structured interview for the domain: ${domain}. Analyze the text responses for accuracy and knowledge grasp. Also, analyze the attached facial snapshots captured during the answers to provide feedback on confidence, non-verbal communication, and expressions.` },
    { text: JSON.stringify(qaPairs) }
  ];

  // Add a few representative snapshots for visual analysis
  snapshots.slice(-5).forEach(data => {
    parts.push({
      inlineData: {
        data: data,
        mimeType: 'image/jpeg'
      }
    } as any);
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: parts as any },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          accuracy: { type: Type.NUMBER },
          knowledgeGrasp: { type: Type.STRING },
          feedback: { type: Type.STRING },
          expressionAnalysis: { type: Type.STRING }
        },
        required: ["accuracy", "knowledgeGrasp", "feedback", "expressionAnalysis"]
      }
    }
  });
  return JSON.parse(response.text);
};
