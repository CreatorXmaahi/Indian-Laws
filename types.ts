export enum LawType {
  IPC = 'Indian Penal Code',
  CRPC = 'Code of Criminal Procedure',
  CONSTITUTION = 'Constitution of India',
  OTHER = 'Other Acts'
}

export interface LawSection {
  id: string;
  sectionNumber: string;
  act: LawType;
  title: string;
  summary: string; // A short 1-sentence summary for the card
  tags: string[];
}

export interface DetailedLawAnalysis {
  sectionNumber: string;
  actName: string;
  legalText: string;
  simplifiedExplanation: string;
  punishment?: string;
  cognizable?: string;
  bailable?: string;
  keyPoints: string[];
  exampleScenario: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}
