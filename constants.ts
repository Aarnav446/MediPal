import { Doctor } from './types';

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Kavita Sharma',
    specialization: 'Dermatologist',
    experience: '12 years',
    rating: 4.8,
    distance: '2.1 km',
    imageUrl: 'https://picsum.photos/100/100?random=1',
    available: true
  },
  {
    id: '2',
    name: 'Dr. Aman Sethi',
    specialization: 'Dermatologist',
    experience: '8 years',
    rating: 4.6,
    distance: '3.5 km',
    imageUrl: 'https://picsum.photos/100/100?random=2',
    available: true
  },
  {
    id: '3',
    name: 'Dr. Sarah Jenkins',
    specialization: 'Cardiologist',
    experience: '15 years',
    rating: 4.9,
    distance: '5.2 km',
    imageUrl: 'https://picsum.photos/100/100?random=3',
    available: false
  },
  {
    id: '4',
    name: 'Dr. James Wilson',
    specialization: 'General Practitioner',
    experience: '20 years',
    rating: 4.7,
    distance: '1.0 km',
    imageUrl: 'https://picsum.photos/100/100?random=4',
    available: true
  },
  {
    id: '5',
    name: 'Dr. Reena Patel',
    specialization: 'Orthopedist',
    experience: '10 years',
    rating: 4.7,
    distance: '4.0 km',
    imageUrl: 'https://picsum.photos/100/100?random=5',
    available: true
  },
  {
    id: '6',
    name: 'Dr. Michael Chang',
    specialization: 'Neurologist',
    experience: '18 years',
    rating: 4.9,
    distance: '8.5 km',
    imageUrl: 'https://picsum.photos/100/100?random=6',
    available: true
  },
  {
    id: '7',
    name: 'Dr. Linda Foster',
    specialization: 'Pediatrician',
    experience: '9 years',
    rating: 4.8,
    distance: '2.8 km',
    imageUrl: 'https://picsum.photos/100/100?random=7',
    available: true
  },
  {
    id: '8',
    name: 'Dr. Robert Chen',
    specialization: 'Ophthalmologist',
    experience: '14 years',
    rating: 4.5,
    distance: '6.1 km',
    imageUrl: 'https://picsum.photos/100/100?random=8',
    available: true
  },
  {
    id: '9',
    name: 'Dr. Emily White',
    specialization: 'General Practitioner',
    experience: '6 years',
    rating: 4.6,
    distance: '1.5 km',
    imageUrl: 'https://picsum.photos/100/100?random=9',
    available: true
  }
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
