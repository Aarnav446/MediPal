import { MOCK_DOCTORS } from '../constants';
import { User, Appointment, Doctor } from '../types';

declare var alasql: any;

export const initDB = () => {
  // Create a persistent LocalStorage database
  alasql('CREATE LOCALSTORAGE DATABASE IF NOT EXISTS medimatch_db');
  alasql('ATTACH LOCALSTORAGE DATABASE medimatch_db');
  alasql('USE medimatch_db');

  // Initialize Tables if they don't exist
  alasql('CREATE TABLE IF NOT EXISTS users (id INT IDENTITY, name STRING, email STRING, password STRING, role STRING, doctorId STRING, verified BOOLEAN)');
  
  // Doctors Profile Table (For searching and matching)
  alasql('CREATE TABLE IF NOT EXISTS doctors (id STRING, name STRING, specialization STRING, experience STRING, rating NUMBER, distance STRING, imageUrl STRING, available BOOLEAN, bio STRING, specialties STRING, verified BOOLEAN, compatibility_score NUMBER)');

  // Appointments Table
  alasql('CREATE TABLE IF NOT EXISTS appointments (id INT IDENTITY, doctor_id STRING, patient_id INT, patient_name STRING, date STRING, time STRING, type STRING, payment_status STRING, payment_method STRING, amount MONEY, status STRING, condition_summary STRING)');

  // Doctor Settings Table
  alasql('CREATE TABLE IF NOT EXISTS doctor_settings (doctor_id STRING, consultation_modes STRING, time_slots STRING)');

  // CLEANUP: Remove dummy data requested by user
  alasql('DELETE FROM doctors WHERE name LIKE "%John Doe%" OR name LIKE "%Aarnav%"');
  alasql('DELETE FROM users WHERE name LIKE "%John Doe%" OR name LIKE "%Aarnav%"');

  // Seed Data only if users table is empty
  const userCount = alasql('SELECT VALUE COUNT(*) FROM users');
  if (userCount === 0) {
    console.log("Seeding Persistent Database...");
    
    // Seed Doctors into Users and Doctors tables
    MOCK_DOCTORS.forEach(doc => {
      const email = doc.name.toLowerCase().replace('dr. ', '').replace(' ', '.') + '@medimatch.com';
      
      // Add to Users
      alasql('INSERT INTO users (name, email, password, role, doctorId, verified) VALUES (?, ?, ?, ?, ?, ?)', 
        [doc.name, email, 'password', 'doctor', doc.id, doc.verified]);
      
      // Add to Doctors
      alasql('INSERT INTO doctors VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [doc.id, doc.name, doc.specialization, doc.experience, doc.rating, doc.distance, doc.imageUrl, doc.available, doc.bio, JSON.stringify(doc.specialties), doc.verified, 0]);

      // Default Settings
      alasql('INSERT INTO doctor_settings (doctor_id, consultation_modes, time_slots) VALUES (?, ?, ?)',
        [doc.id, JSON.stringify({ online: true, clinic: true }), JSON.stringify(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'])]);
    });

    // Seed a demo Patient
    alasql('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Demo Patient', 'patient@demo.com', 'password', 'patient']);
      
    console.log("Database Seeded.");
  }
};

// Retrieve all doctors from the DB for the AI service
export const getAllDoctors = (): Doctor[] => {
    const docs = alasql('SELECT * FROM doctors');
    return docs.map((d: any) => ({
        ...d,
        specialties: JSON.parse(d.specialties || '[]')
    }));
};

export const getDoctorProfile = (doctorId: string): Doctor | null => {
    const res = alasql('SELECT * FROM doctors WHERE id = ?', [doctorId]);
    if (res.length > 0) {
        return {
            ...res[0],
            specialties: JSON.parse(res[0].specialties || '[]')
        };
    }
    return null;
};

export const createDoctorProfile = (doc: Partial<Doctor>) => {
    // Generate simple defaults for fields not provided in onboarding
    const newDoc = {
        id: doc.id || Date.now().toString(),
        name: doc.name || 'Unknown Doctor',
        specialization: doc.specialization || 'General Practitioner',
        experience: doc.experience || '1 Year',
        rating: doc.rating || 5.0, // New doctors start with high rating or 0
        distance: doc.distance || '3.5 km', // Mock distance
        imageUrl: doc.imageUrl || `https://ui-avatars.com/api/?name=${doc.name}&background=0D9488&color=fff`,
        available: true,
        bio: doc.bio || 'New specialist joining MediMatch AI.',
        specialties: JSON.stringify(doc.specialties || [doc.specialization]),
        verified: doc.verified || false,
        compatibility_score: 0
    };

    alasql('INSERT INTO doctors VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newDoc.id, newDoc.name, newDoc.specialization, newDoc.experience, newDoc.rating, newDoc.distance, newDoc.imageUrl, newDoc.available, newDoc.bio, newDoc.specialties, newDoc.verified, newDoc.compatibility_score]);
        
    return newDoc.id;
};

export const updateDoctorProfile = (doctorId: string, updates: Partial<Doctor>) => {
    if (updates.bio !== undefined) {
        alasql('UPDATE doctors SET bio = ? WHERE id = ?', [updates.bio, doctorId]);
    }
    if (updates.verified !== undefined) {
        alasql('UPDATE doctors SET verified = ? WHERE id = ?', [updates.verified, doctorId]);
    }
    // Add other fields as needed
};

export const registerUser = (name: string, email: string, password: string, role: 'patient' | 'doctor', verified: boolean = false, doctorId?: string) => {
  const exists = alasql('SELECT * FROM users WHERE email = ?', [email]);
  if (exists.length > 0) {
    throw new Error('Email already registered');
  }
  
  const id = alasql('SELECT MAX(id) + 1 as id FROM users')[0].id || 1;
  alasql('INSERT INTO users (id, name, email, password, role, doctorId, verified) VALUES (?, ?, ?, ?, ?, ?, ?)', 
    [id, name, email, password, role, doctorId, verified]);
    
  return { id, name, email, role, doctorId, verified };
};

export const loginUser = (email: string, password: string): User | null => {
  const users = alasql('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
  if (users.length > 0) {
    const u = users[0];
    return { id: u.id, name: u.name, email: u.email, role: u.role, doctorId: u.doctorId, verified: u.verified };
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

export const saveDoctorSettings = (doctorId: string, modes: {online: boolean, clinic: boolean}, timeSlots: string[]) => {
  const existing = alasql('SELECT * FROM doctor_settings WHERE doctor_id = ?', [doctorId]);
  if (existing.length > 0) {
      alasql('UPDATE doctor_settings SET consultation_modes = ?, time_slots = ? WHERE doctor_id = ?',
        [JSON.stringify(modes), JSON.stringify(timeSlots), doctorId]);
  } else {
      alasql('INSERT INTO doctor_settings (doctor_id, consultation_modes, time_slots) VALUES (?, ?, ?)',
        [doctorId, JSON.stringify(modes), JSON.stringify(timeSlots)]);
  }
};

export const getDoctorSettings = (doctorId: string) => {
    const res = alasql('SELECT * FROM doctor_settings WHERE doctor_id = ?', [doctorId]);
    if (res.length > 0) {
        return {
            modes: JSON.parse(res[0].consultation_modes || '{"online": true, "clinic": true}'),
            timeSlots: JSON.parse(res[0].time_slots || '[]')
        };
    }
    return { modes: {online: true, clinic: true}, timeSlots: [] };
};

// Initialize on load
try {
    initDB();
} catch (e) {
    console.error("Failed to initialize AlaSQL", e);
}