
import { Doctor } from './types';

export const MOCK_DOCTORS: Doctor[] = [
  // Dermatologists
  {
    id: '1',
    name: 'Dr. Kavita Sharma',
    specialization: 'Dermatologist',
    experience: '12 years',
    rating: 4.8,
    distance: '2.1 km',
    imageUrl: 'https://picsum.photos/100/100?random=1',
    available: true,
    bio: 'Expert in treating complex skin conditions, acne scarring, and cosmetic dermatology with a patient-first approach.',
    specialties: ['Acne', 'Eczema', 'Cosmetic Procedures'],
    verified: true
  },
  {
    id: '2',
    name: 'Dr. Aman Sethi',
    specialization: 'Dermatologist',
    experience: '8 years',
    rating: 4.6,
    distance: '3.5 km',
    imageUrl: 'https://picsum.photos/100/100?random=2',
    available: true,
    bio: 'Focused on pediatric dermatology and allergic skin reactions. passionate about early detection of skin issues.',
    specialties: ['Pediatric Dermatology', 'Allergies', 'Psoriasis'],
    verified: true
  },
  
  // Cardiologists
  {
    id: '3',
    name: 'Dr. Sarah Jenkins',
    specialization: 'Cardiologist',
    experience: '15 years',
    rating: 4.9,
    distance: '5.2 km',
    imageUrl: 'https://picsum.photos/100/100?random=3',
    available: false,
    bio: 'Renowned cardiologist specializing in preventative care and managing chronic heart conditions.',
    specialties: ['Hypertension', 'Preventative Care', 'Heart Failure'],
    verified: true
  },
  {
    id: '10',
    name: 'Dr. Raj Malhotra',
    specialization: 'Cardiologist',
    experience: '22 years',
    rating: 4.9,
    distance: '4.1 km',
    imageUrl: 'https://picsum.photos/100/100?random=10',
    available: true,
    bio: 'Senior consultant with extensive experience in interventional cardiology and angiography.',
    specialties: ['Interventional Cardiology', 'Angioplasty', 'Arrhythmia'],
    verified: true
  },

  // General Practitioners
  {
    id: '4',
    name: 'Dr. James Wilson',
    specialization: 'General Practitioner',
    experience: '20 years',
    rating: 4.7,
    distance: '1.0 km',
    imageUrl: 'https://picsum.photos/100/100?random=4',
    available: true,
    bio: 'Dedicated family physician providing comprehensive primary care for patients of all ages.',
    specialties: ['Family Medicine', 'Flu & Cold', 'Vaccinations'],
    verified: true
  },
  {
    id: '9',
    name: 'Dr. Emily White',
    specialization: 'General Practitioner',
    experience: '6 years',
    rating: 4.6,
    distance: '1.5 km',
    imageUrl: 'https://picsum.photos/100/100?random=9',
    available: true,
    bio: 'Holistic approach to general health with a focus on nutrition and lifestyle management.',
    specialties: ['Nutrition', 'Lifestyle Medicine', 'Women\'s Health'],
    verified: false
  },
  
  // Orthopedists
  {
    id: '5',
    name: 'Dr. Reena Patel',
    specialization: 'Orthopedist',
    experience: '10 years',
    rating: 4.7,
    distance: '4.0 km',
    imageUrl: 'https://picsum.photos/100/100?random=5',
    available: true,
    bio: 'Specialist in sports injuries and minimally invasive joint replacement surgeries.',
    specialties: ['Sports Injuries', 'Joint Replacement', 'Arthroscopy'],
    verified: true
  },
  {
    id: '15',
    name: 'Dr. Thomas Anderson',
    specialization: 'Orthopedist',
    experience: '14 years',
    rating: 4.8,
    distance: '6.2 km',
    imageUrl: 'https://picsum.photos/100/100?random=15',
    available: true,
    bio: 'Expert in spinal disorders and rehabilitation therapies for chronic back pain.',
    specialties: ['Spine Health', 'Rehabilitation', 'Trauma'],
    verified: true
  },
  
  // Neurologists
  {
    id: '6',
    name: 'Dr. Michael Chang',
    specialization: 'Neurologist',
    experience: '18 years',
    rating: 4.9,
    distance: '8.5 km',
    imageUrl: 'https://picsum.photos/100/100?random=6',
    available: true,
    bio: 'Leading neurologist treating migraines, epilepsy, and neurodegenerative disorders.',
    specialties: ['Migraines', 'Epilepsy', 'Stroke Recovery'],
    verified: true
  },
  
  // Pediatricians
  {
    id: '7',
    name: 'Dr. Linda Foster',
    specialization: 'Pediatrician',
    experience: '9 years',
    rating: 4.8,
    distance: '2.8 km',
    imageUrl: 'https://picsum.photos/100/100?random=7',
    available: true,
    bio: 'Compassionate care for infants, children, and adolescents. Expert in developmental milestones.',
    specialties: ['Newborn Care', 'Adolescent Health', 'Immunizations'],
    verified: true
  },
  
  // Ophthalmologists
  {
    id: '8',
    name: 'Dr. Robert Chen',
    specialization: 'Ophthalmologist',
    experience: '14 years',
    rating: 4.5,
    distance: '6.1 km',
    imageUrl: 'https://picsum.photos/100/100?random=8',
    available: true,
    bio: 'Specializing in cataract surgery, glaucoma treatment, and corrective laser eye surgery.',
    specialties: ['Cataract Surgery', 'Glaucoma', 'LASIK'],
    verified: false
  },

  // Dentists
  {
    id: '11',
    name: 'Dr. Lisa Wong',
    specialization: 'Dentist',
    experience: '7 years',
    rating: 4.8,
    distance: '1.8 km',
    imageUrl: 'https://picsum.photos/100/100?random=11',
    available: true,
    bio: 'Gentle dentistry focusing on cosmetic smiles, veneers, and pain-free root canals.',
    specialties: ['Cosmetic Dentistry', 'Root Canals', 'Teeth Whitening'],
    verified: true
  },
  {
    id: '12',
    name: 'Dr. David Miller',
    specialization: 'Dentist',
    experience: '15 years',
    rating: 4.7,
    distance: '3.2 km',
    imageUrl: 'https://picsum.photos/100/100?random=12',
    available: true,
    bio: 'Experienced in oral surgery, implants, and complete family dental care.',
    specialties: ['Oral Surgery', 'Implants', 'Orthodontics'],
    verified: true
  },

  // Psychiatrists
  {
    id: '13',
    name: 'Dr. Susan Black',
    specialization: 'Psychiatrist',
    experience: '11 years',
    rating: 4.9,
    distance: '5.5 km',
    imageUrl: 'https://picsum.photos/100/100?random=13',
    available: true,
    bio: 'Holistic mental health care treating anxiety, depression, and stress-related disorders.',
    specialties: ['Anxiety', 'Depression', 'CBT'],
    verified: true
  },

  // ENT
  {
    id: '14',
    name: 'Dr. Pradeep Kumar',
    specialization: 'ENT Specialist',
    experience: '13 years',
    rating: 4.6,
    distance: '2.9 km',
    imageUrl: 'https://picsum.photos/100/100?random=14',
    available: true,
    bio: 'Expert in sinus disorders, sleep apnea solutions, and pediatric ear infections.',
    specialties: ['Sinusitis', 'Sleep Apnea', 'Hearing Loss'],
    verified: true
  },
];

export const VALID_SPECIALIZATIONS = [
  'Dermatologist',
  'Cardiologist',
  'General Practitioner',
  'Orthopedist',
  'Neurologist',
  'Pediatrician',
  'Ophthalmologist',
  'Dentist',
  'Psychiatrist',
  'ENT Specialist'
];
