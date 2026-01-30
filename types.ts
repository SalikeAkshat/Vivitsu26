
export interface ResumeAnalysis {
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  executiveSummary: string;
  metrics: {
    formatting: number;
    contentQuality: number;
    atsCompatibility: number;
    keywordUsage: number;
  };
  recommendedDomain: {
    title: string;
    justification: string;
    potentialRoles: string[];
  };
}

export interface InterviewQuestion {
  id: number;
  text: string;
  type: 'technical' | 'behavioral';
}

export interface InterviewConfig {
  domain: string;
  difficulty: 'Junior' | 'Mid-Level' | 'Senior' | 'Expert';
  questionCount: number;
}

export interface InterviewResult {
  accuracy: number;
  knowledgeGrasp: string;
  feedback: string;
  expressionAnalysis: string;
}
