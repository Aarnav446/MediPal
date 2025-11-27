export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  rating: number;
  distance: string;
  imageUrl: string;
  available: boolean;
}

export interface AnalysisResult {
  specialist: string;
  match_score: number;
  urgency: 'Low' | 'Medium' | 'High';
  explanation: string;
  recommended_doctors: Doctor[];
}

export interface SymptomInputData {
  text: string;
  image: File | null;
}

export enum AppRoute {
  HOME = '/',
  ANALYZE = '/analyze',
  RESULTS = '/results',
  ABOUT = '/about',
  NOT_FOUND = '/404'
}
