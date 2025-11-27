export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  rating: number;
  distance: string;
  imageUrl: string;
  available: boolean;
  bio: string;
  specialties: string[];
  compatibility_score?: number; // Calculated score based on symptom match
}

export interface AnalysisResult {
  specialist: string;
  match_score: number; // Confidence in the specialization choice
  urgency: 'Low' | 'Medium' | 'High';
  explanation: string;
  potential_conditions: string[]; // List of suspected diseases/conditions
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