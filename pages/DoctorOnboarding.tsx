
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { registerUser, createDoctorProfile, saveCompetencyResult } from '../services/db';

interface DoctorOnboardingProps {
  navigate: (path: string) => void;
}

// Adaptive Question Structure
interface Question {
    question: string;
    options: string[];
    correct: number;
}

interface SpecialtyData {
    branches: string[];
    standardQuestions: Question[];
    hardQuestions: Question[];
}

const SPECIALTY_DATA: Record<string, SpecialtyData> = {
    'Dermatologist': {
        branches: ['Cosmetic Dermatology', 'Pediatric Dermatology', 'Dermatopathology', 'Mohs Surgery'],
        standardQuestions: [
            { question: "What is the primary lesion of psoriasis?", options: ["Vesicle", "Plaque", "Pustule", "Nodule"], correct: 1 },
            { question: "Which condition is associated with a 'herald patch'?", options: ["Pityriasis Rosea", "Eczema", "Tinea Corporis", "Lupus"], correct: 0 },
            { question: "First-line treatment for mild acne vulgaris?", options: ["Oral Isotretinoin", "Topical Retinoids", "Systemic Steroids", "IV Antibiotics"], correct: 1 }
        ],
        hardQuestions: [
            { question: "Which biologic agent targets IL-17A?", options: ["Etanercept", "Infliximab", "Secukinumab", "Ustekinumab"], correct: 2 },
            { question: "In Pemphigus Vulgaris, antibodies are directed against:", options: ["Desmoglein 3", "Hemidesmosomes", "Basement Membrane", "Collagen VII"], correct: 0 },
            { question: "Histopathology showing 'coronoid lamella' is diagnostic of:", options: ["Porokeratosis", "Lichen Planus", "Psoriasis", "Granuloma Annulare"], correct: 0 }
        ]
    },
    'Cardiologist': {
        branches: ['Interventional', 'Electrophysiology', 'Heart Failure', 'Pediatric'],
        standardQuestions: [
            { question: "Common symptom of stable angina?", options: ["Pleuritic pain", "Exertional chest pain", "Sharp stabbing pain", "Palpitations only"], correct: 1 },
            { question: "First-line drug for hypertension in non-black population?", options: ["ACE Inhibitor", "Hydralazine", "Clonidine", "Doxazosin"], correct: 0 },
            { question: "ECG feature of Atrial Fibrillation?", options: ["Sawtooth waves", "Irregularly Irregular rhythm", "Delta wave", "ST elevation"], correct: 1 }
        ],
        hardQuestions: [
            { question: "Mechanism of action of Sacubitril?", options: ["Neprilysin Inhibitor", "ACE Inhibitor", "ARB", "Beta Blocker"], correct: 0 },
            { question: "Criteria for wide complex tachycardia diagnosis (Brugada)?", options: ["Absence of RS in precordial leads", "Fusion beats", "AV dissociation", "All of the above"], correct: 3 },
            { question: "Correct anticoagulation target (INR) for mechanical mitral valve?", options: ["2.0 - 3.0", "2.5 - 3.5", "1.5 - 2.0", "3.0 - 4.0"], correct: 1 }
        ]
    },
    // Add generic fallback structure for others for demo completeness
    'General Practitioner': {
        branches: ['Family Medicine', 'Geriatrics', 'Preventive'],
        standardQuestions: [
            { question: "Normal fasting blood glucose range?", options: ["100-125", "70-99", "< 70", "> 126"], correct: 1 },
            { question: "Treatment for Strep Throat?", options: ["Amoxicillin", "Aspirin", "Ibuprofen only", "Antivirals"], correct: 0 },
            { question: "BMI range for obesity?", options: ["18-24", "25-29", "30+", "40+"], correct: 2 }
        ],
        hardQuestions: [
            { question: "Diagnosis of Hashimoto's thyroiditis is confirmed by:", options: ["Anti-TPO antibodies", "Low TSH", "High T3", "Ultrasound only"], correct: 0 },
            { question: "CURB-65 score 'C' stands for:", options: ["Cough", "Confusion", "Cyanosis", "Creatinine"], correct: 1 },
            { question: "Drug of choice for trigeminal neuralgia?", options: ["Carbamazepine", "Ibuprofen", "Morphine", "Paracetamol"], correct: 0 }
        ]
    }
};

const GENERIC_QUESTIONS: SpecialtyData = {
    branches: ['General'],
    standardQuestions: [
        { question: "Basic Life Support ratio of compressions to breaths?", options: ["15:2", "30:2", "10:1", "5:1"], correct: 1 },
        { question: "Normal resting heart rate for adults?", options: ["40-60", "60-100", "100-120", "120+"], correct: 1 },
        { question: "Sign of severe dehydration?", options: ["Thirst", "Dry mouth", "Hypotension", "Yellow urine"], correct: 2 }
    ],
    hardQuestions: [
        { question: "Which is NOT a cause of anion gap metabolic acidosis?", options: ["Methanol", "Uremia", "Diarrhea", "Diabetic Ketoacidosis"], correct: 2 },
        { question: "Half-life of Adenosine?", options: ["< 10 seconds", "1 minute", "5 minutes", "1 hour"], correct: 0 },
        { question: "Treatment for tension pneumothorax?", options: ["Needle decompression", "Antibiotics", "Intubation", "Observation"], correct: 0 }
    ]
};

const DoctorOnboarding: React.FC<DoctorOnboardingProps> = ({ navigate }) => {
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Data
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', specialty: '', 
    subSpecialties: [] as string[], clinicAddress: '',
    consultationType: 'both'
  });

  // Adaptive Quiz State
  const [quizLevel, setQuizLevel] = useState<'standard' | 'hard'>('standard');
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [passedStandard, setPassedStandard] = useState(false);
  const [remediation, setRemediation] = useState(false);

  // Update questions based on specialty and level
  useEffect(() => {
    const data = SPECIALTY_DATA[formData.specialty] || GENERIC_QUESTIONS;
    const questions = quizLevel === 'standard' ? data.standardQuestions : data.hardQuestions;
    setCurrentQuestions(questions);
    setAnswers(new Array(questions.length).fill(-1));
  }, [formData.specialty, quizLevel]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'specialty') {
        setFormData(prev => ({ ...prev, specialty: e.target.value, subSpecialties: [] }));
    }
  };

  const toggleSubSpecialty = (branch: string) => {
      setFormData(prev => ({
          ...prev,
          subSpecialties: prev.subSpecialties.includes(branch) 
             ? prev.subSpecialties.filter(b => b !== branch)
             : [...prev.subSpecialties, branch]
      }));
  };

  const submitQuiz = () => {
    let correctCount = 0;
    answers.forEach((ans, idx) => {
      if (ans === currentQuestions[idx].correct) correctCount++;
    });
    
    const calculatedScore = (correctCount / currentQuestions.length) * 100;
    setScore(calculatedScore);

    if (quizLevel === 'standard') {
        if (calculatedScore >= 66) {
            setPassedStandard(true);
        } else {
            setRemediation(true);
        }
    } else {
        // Hard test submitted
        setTimeout(() => setStep(4), 1000);
    }
  };

  const proceedToHard = () => {
      setQuizLevel('hard');
      setScore(null); // reset score for new UI
  };

  const skipHard = () => {
      setStep(4);
  };

  const handleFinalRegister = async () => {
    setLoading(true);
    try {
        const doctorId = createDoctorProfile({
            name: formData.name,
            specialization: formData.specialty,
            bio: `${formData.specialty} focusing on ${formData.subSpecialties.join(', ') || 'General Care'}. Located at ${formData.clinicAddress}.`,
            specialties: [formData.specialty, ...formData.subSpecialties], 
            verified: false, // Must be verified by admin
        });

        // Save Test Results
        saveCompetencyResult(doctorId, formData.specialty, score || 100, quizLevel, 'pass');

        await registerUser(formData.name, formData.email, formData.password, 'doctor', false, doctorId);
        await login(formData.email, formData.password);
        navigate('/doctor-dashboard');
    } catch (e) {
        setError("Registration failed. Email might already be in use.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-medical-500 transition-all duration-500" style={{ width: `${(step/4)*100}%` }}></div>
        </div>
        <p className="text-right text-xs text-slate-400 mt-1">Step {step} of 4</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Specialist Onboarding</h1>

        {/* STEP 1 */}
        {step === 1 && (
            <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                    <input name="name" value={formData.name} onChange={handleInputChange} className="border p-3 rounded-lg" placeholder="Dr. Full Name" />
                    <input name="email" value={formData.email} onChange={handleInputChange} className="border p-3 rounded-lg" placeholder="Email Address" />
                </div>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full border p-3 rounded-lg" placeholder="Password" />
                
                <select name="specialty" value={formData.specialty} onChange={handleInputChange} className="w-full border p-3 rounded-lg bg-white">
                     <option value="">Select Primary Specialization</option>
                     {Object.keys(SPECIALTY_DATA).map(s => <option key={s} value={s}>{s}</option>)}
                     <option value="Orthopedist">Orthopedist</option>
                     <option value="Dentist">Dentist</option>
                     <option value="Neurologist">Neurologist</option>
                     <option value="Psychiatrist">Psychiatrist</option>
                </select>

                {/* VISIBLE SURVEY */}
                {formData.specialty && (
                    <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 mt-4 animate-fade-in">
                        <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wide mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            Clinical Survey: {formData.specialty} Focus
                        </h3>
                        <p className="text-xs text-indigo-700 mb-4">Select your sub-specialties to be matched with specific patient cases.</p>
                        <div className="grid grid-cols-2 gap-3">
                            {(SPECIALTY_DATA[formData.specialty]?.branches || GENERIC_QUESTIONS.branches).map((branch) => (
                                <label key={branch} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${formData.subSpecialties.includes(branch) ? 'bg-white border-indigo-500 shadow-sm' : 'bg-white/50 border-transparent hover:bg-white'}`}>
                                    <input type="checkbox" checked={formData.subSpecialties.includes(branch)} onChange={() => toggleSubSpecialty(branch)} className="text-indigo-600 rounded" />
                                    <span className="text-sm font-medium text-slate-700">{branch}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button onClick={() => formData.specialty ? setStep(2) : setError('Select specialty')} className="px-6 py-2 bg-medical-600 text-white rounded-lg font-bold">Next Step</button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
        )}

        {/* STEP 2: Simple Practice Info */}
        {step === 2 && (
             <div className="space-y-4 animate-fade-in">
                 <input name="clinicAddress" value={formData.clinicAddress} onChange={handleInputChange} className="w-full border p-3 rounded-lg" placeholder="Clinic Address" />
                 <div className="flex justify-between pt-4">
                    <button onClick={() => setStep(1)} className="text-slate-500">Back</button>
                    <button onClick={() => setStep(3)} className="px-6 py-2 bg-medical-600 text-white rounded-lg font-bold">Start Assessment</button>
                </div>
             </div>
        )}

        {/* STEP 3: Adaptive Test */}
        {step === 3 && (
            <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">
                        {quizLevel === 'standard' ? 'Standard Competency' : 'Advanced Board Exam'}
                    </h2>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${quizLevel === 'standard' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                        {quizLevel === 'standard' ? 'Level 1' : 'Level 2 (Hard)'}
                    </span>
                </div>

                {!passedStandard && !remediation && (
                    <div className="space-y-6">
                        {currentQuestions.map((q, qIdx) => (
                            <div key={qIdx} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <p className="font-bold text-slate-800 mb-3">{q.question}</p>
                                <div className="space-y-2">
                                    {q.options.map((opt, oIdx) => (
                                        <label key={oIdx} className="flex items-center space-x-3 cursor-pointer">
                                            <input type="radio" name={`q-${qIdx}`} checked={answers[qIdx] === oIdx} onChange={() => {
                                                const newAns = [...answers]; newAns[qIdx] = oIdx; setAnswers(newAns);
                                            }} />
                                            <span className="text-sm text-slate-700">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button onClick={submitQuiz} className="w-full py-3 bg-medical-600 text-white rounded-lg font-bold mt-4">Submit Answers</button>
                    </div>
                )}

                {/* Remediation View */}
                {remediation && (
                    <div className="text-center py-8">
                        <div className="text-red-500 text-5xl mb-4">⚠️</div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Competency Check Failed</h3>
                        <p className="text-slate-600 mb-6">You did not meet the requirement. Please review {formData.specialty} guidelines.</p>
                        <button onClick={() => { setRemediation(false); setStep(1); }} className="text-medical-600 font-bold underline">Restart Application</button>
                    </div>
                )}

                {/* Adaptive Success View */}
                {passedStandard && quizLevel === 'standard' && (
                    <div className="text-center py-8 bg-green-50 rounded-xl border border-green-100">
                        <div className="text-green-500 text-5xl mb-4">✓</div>
                        <h3 className="text-xl font-bold text-green-800 mb-2">Standard Competency Verified!</h3>
                        <p className="text-green-700 mb-6">Score: {Math.round(score || 0)}%. You qualify for the Advanced Specialist Badge.</p>
                        <div className="flex gap-4 justify-center">
                            <button onClick={skipHard} className="px-6 py-2 border border-green-200 text-green-700 rounded-lg">Skip & Register</button>
                            <button onClick={proceedToHard} className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold shadow-lg hover:bg-green-700">Take Advanced Test</button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* STEP 4: Complete */}
        {step === 4 && (
             <div className="text-center py-8">
                 <h2 className="text-2xl font-bold mb-4">Ready to Join?</h2>
                 <p className="mb-6 text-slate-600">Your profile and test results will be created.</p>
                 <button onClick={handleFinalRegister} disabled={loading} className="w-full py-4 bg-medical-600 text-white rounded-xl font-bold shadow-lg">
                     {loading ? 'Creating Dashboard...' : 'Create Doctor Profile'}
                 </button>
             </div>
        )}

      </div>
    </div>
  );
};

export default DoctorOnboarding;
