
import { MOCK_DOCTORS } from '../constants';
import { User, Appointment } from '../types';

declare var alasql: any;

export const initDB = () => {
  // Create a persistent LocalStorage database
  alasql('CREATE LOCALSTORAGE DATABASE IF NOT EXISTS medimatch_db');
  alasql('ATTACH LOCALSTORAGE DATABASE medimatch_db');
  alasql('USE medimatch_db');

  // Initialize Tables if they don't exist
  alasql('CREATE TABLE IF NOT EXISTS users (id INT IDENTITY, name STRING, email STRING, password STRING, role STRING, doctorId STRING)');
  
  // Updated Schema for Appointments
  alasql('CREATE TABLE IF NOT EXISTS appointments (id INT IDENTITY, doctor_id STRING, patient_id INT, patient_name STRING, date STRING, time STRING, type STRING, payment_status STRING, payment_method STRING, amount MONEY, status STRING, condition_summary STRING)');

  // Seed Data only if users table is empty
  const userCount = alasql('SELECT VALUE COUNT(*) FROM users');
  if (userCount === 0) {
    console.log("Seeding Persistent Database...");
    
    // Seed Doctors
    MOCK_DOCTORS.forEach(doc => {
      const email = doc.name.toLowerCase().replace('dr. ', '').replace(' ', '.') + '@medimatch.com';
      alasql('INSERT INTO users (name, email, password, role, doctorId) VALUES (?, ?, ?, ?, ?)', 
        [doc.name, email, 'password', 'doctor', doc.id]);
    });

    // Seed a demo Patient
    alasql('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Demo Patient', 'patient@demo.com', 'password', 'patient']);
      
    console.log("Database Seeded.");
  }
};

export const registerUser = (name: string, email: string, password: string, role: 'patient' | 'doctor') => {
  const exists = alasql('SELECT * FROM users WHERE email = ?', [email]);
  if (exists.length > 0) {
    throw new Error('Email already registered');
  }
  
  const id = alasql('SELECT MAX(id) + 1 as id FROM users')[0].id || 1;
  alasql('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)', 
    [id, name, email, password, role]);
    
  return { id, name, email, role };
};

export const loginUser = (email: string, password: string): User | null => {
  const users = alasql('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
  if (users.length > 0) {
    const u = users[0];
    return { id: u.id, name: u.name, email: u.email, role: u.role, doctorId: u.doctorId };
  }
  return null;
};

// Updated create function to handle detailed booking data
export const createAppointment = (
  doctorId: string, 
  patientId: number, 
  patientName: string, 
  condition: string,
  date: string,
  time: string,
  type: 'online' | 'in-person',
  paymentMethod: 'pay_later' | 'paytm' | 'card' | 'netbanking',
  amount: number
) => {
  const paymentStatus = paymentMethod === 'pay_later' ? 'pending' : 'paid';
  
  alasql('INSERT INTO appointments (doctor_id, patient_id, patient_name, date, time, type, payment_status, payment_method, amount, status, condition_summary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [doctorId, patientId, patientName, date, time, type, paymentStatus, paymentMethod, amount, 'confirmed', condition]);
};

export const updateAppointmentStatus = (appointmentId: number, status: 'confirmed' | 'completed' | 'cancelled') => {
  alasql('UPDATE appointments SET status = ? WHERE id = ?', [status, appointmentId]);
};

export const getDoctorAppointments = (doctorId: string): Appointment[] => {
  return alasql('SELECT * FROM appointments WHERE doctor_id = ? ORDER BY date DESC', [doctorId]);
};

export const getPatientAppointments = (patientId: number): Appointment[] => {
  return alasql('SELECT * FROM appointments WHERE patient_id = ? ORDER BY date DESC', [patientId]);
};

// Initialize on load
try {
    initDB();
} catch (e) {
    console.error("Failed to initialize AlaSQL", e);
}
