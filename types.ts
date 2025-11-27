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
  recommended_treatment_type?: string; // e.g., "Allopathy", "Ayurveda"
  treatment_reasoning?: string; // Why this modality was chosen
}

export interface SymptomInputData {
  text: string;
  image: File | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'patient' | 'doctor';
  doctorId?: string; // Links a user to a doctor profile if role is doctor
}

export interface Appointment {
  id: number;
  doctor_id: string;
  patient_id: number;
  patient_name: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed';
  condition_summary: string;
}

export enum AppRoute {
  HOME = '/',
  ANALYZE = '/analyze',
  RESULTS = '/results',
  ABOUT = '/about',
  NOT_FOUND = '/404',
  LOGIN = '/login',
  REGISTER = '/register',
  DOCTOR_DASHBOARD = '/doctor-dashboard'
}