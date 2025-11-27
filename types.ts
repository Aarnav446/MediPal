
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
  verified: boolean; // Verification status based on uploaded documents
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
  role: 'patient' | 'doctor' | 'admin';
  doctorId?: string; // Links a user to a doctor profile if role is doctor
  verified?: boolean;
}

export interface Appointment {
  id: number;
  doctor_id: string;
  patient_id: number;
  patient_name: string;
  date: string; // ISO Date string
  time: string; // "10:00"
  type: 'online' | 'in-person';
  payment_status: 'paid' | 'pending';
  payment_method: 'pay_later' | 'paytm' | 'card' | 'netbanking';
  amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  condition_summary: string;
}

export interface CartItem {
  id: string; // unique cart item id
  doctor: Doctor;
  date: string;
  time: string;
  type: 'online' | 'in-person';
  fee: number;
  condition: string;
}

export interface VerificationRequest {
  id: number;
  doctor_id: string;
  doctor_name: string;
  status: 'pending' | 'approved' | 'rejected';
  date_requested: string;
  documents: {
    license: string;
    degree: string;
    certs: string;
  };
}

export interface CompetencyResult {
  id: number;
  doctor_id: string;
  specialty: string;
  score: number;
  level: 'standard' | 'advanced';
  status: 'pass' | 'fail';
  date_taken: string;
}

export enum AppRoute {
  HOME = '/',
  ANALYZE = '/analyze',
  RESULTS = '/results',
  ABOUT = '/about',
  NOT_FOUND = '/404',
  LOGIN = '/login',
  REGISTER = '/register',
  DOCTOR_DASHBOARD = '/doctor-dashboard',
  PATIENT_DASHBOARD = '/patient-dashboard',
  ADMIN_DASHBOARD = '/admin-dashboard',
  DOCTOR_ONBOARDING = '/join-doctor',
  CHECKOUT = '/checkout'
}
