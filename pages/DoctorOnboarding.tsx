
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { registerUser, createDoctorProfile, saveCompetencyResult, getDoctorProfile, updateDoctorProfile } from '../services/db';

interface DoctorOnboardingProps {
  navigate: (path: string) => void;
}

interface Question {
  id: string;
  type: 'general' | 'case_study';
  title?: string; // For case studies (e.g. "Patient Case #102")
  vignette?: string; // The practical scenario
  question: string;
  options: string[];
  correct: number;
}

// --- PRACTICAL SCENARIO DATABASE ---

// Sub-Specialty Case Studies (Hard, Practical, Scenario-based)
const SPECIALTY_CASES: Record<string, Question[]> = {
    // DERMATOLOGY CASES
    'Psoriasis': [
        {
            id: 'pso-1',
            type: 'case_study',
            title: 'Refractory Plaque Psoriasis',
            vignette: "A 45-year-old male with severe plaque psoriasis (PASI 22) has failed Methotrexate and narrow-band UVB therapy. He has a history of latent TB (treated). He presents with new onset joint pain in the fingers.",
            question: "Considering his history and new symptoms, which biologic mechanism is most appropriate to initiate next?",
            options: ["TNF-alpha inhibitor (e.g., Adalimumab)", "IL-17A inhibitor (e.g., Secukinumab)", "Systemic Corticosteroids", "Topical Calcipotriene monotherapy"],
            correct: 1 // IL-17 often preferred for psoriatic arthritis + skin, TNF caution with TB history (though treated)
        }
    ],
    'Acne': [
        {
            id: 'acne-1',
            type: 'case_study',
            title: 'Nodulocystic Acne Management',
            vignette: "A 19-year-old female presents with severe nodulocystic acne scarring. She has failed 3 months of Doxycycline and topical retinoids. She mentions feeling 'depressed' about her skin.",
            question: "What is the most definitive management plan, considering the risk of permanent scarring?",
            options: ["Switch to Minocycline", "Oral Isotretinoin with iPLEDGE registration", "Chemical Peels bi-weekly", "Hormonal therapy (Spironolactone) only"],
            correct: 1
        }
    ],
    'Mohs Surgery': [
        {
            id: 'mohs-1',
            type: 'case_study',
            title: 'Nasal Tip Reconstruction',
            vignette: "After Mohs excision of a BCC on the nasal tip, a 1.5cm full-thickness defect involving the alar rim remains. Cartilage is intact.",
            question: "Which closure option offers the best aesthetic outcome while preventing alar notching?",
            options: ["Secondary intention healing", "Full-thickness skin graft", "Bilobed flap", "Primary closure"],
            correct: 2
        }
    ],

    // CARDIOLOGY CASES
    'Heart Failure': [
        {
            id: 'hf-1',
            type: 'case_study',
            title: 'HFrEF Optimization',
            vignette: "A 60-year-old patient with HFrEF (EF 30%) remains symptomatic (NYHA Class III) despite maximum tolerated doses of Beta-blocker and ACE-inhibitor. Potassium is 4.2 mEq/L.",
            question: "What is the most appropriate next step to reduce mortality?",
            options: ["Add Furosemide", "Switch ACE-inhibitor to ARNI (Sacubitril/Valsartan)", "Add Digoxin", "Increase ACE-inhibitor dose beyond target"],
            correct: 1
        }
    ],
    'Interventional Cardiology': [
        {
            id: 'ic-1',
            type: 'case_study',
            title: 'Acute STEMI Management',
            vignette: "Patient arrives with Inferior STEMI (ST elevation II, III, aVF). BP is 80/50 mmHg. Lungs are clear.",
            question: "Which medication is CONTRAINDICATED in the immediate management?",
            options: ["Aspirin", "Nitroglycerin", "Heparin", "IV Fluids"],
            correct: 1 // Nitrates contraindicated in RV infarction (common with Inferior MI) due to preload dependence
        }
    ],

    // ORTHOPEDICS CASES
    'Sports Injuries': [
        {
            id: 'ortho-1',
            type: 'case_study',
            title: 'Knee Instability',
            vignette: "A soccer player felt a 'pop' in the knee while pivoting. Exam shows immediate swelling and a positive Lachman test. X-rays are negative.",
            question: "What is the gold standard for confirming this diagnosis and planning surgery?",
            options: ["CT Scan", "MRI of the Knee", "Diagnostic Arthroscopy", "Ultrasound"],
            correct: 1
        }
    ]
};

// General Specialty Questions (Base Competence)
const GENERAL_SPECIALTY_QUESTIONS: Record<string, Question[]> = {
    'Dermatologist': [
        {
            id: 'derm-gen-1',
            type: 'general',
            question: "A patient presents with a pearly papule with telangiectasias on the forehead. What is the most likely diagnosis?",
            options: ["Squamous Cell Carcinoma", "Basal Cell Carcinoma", "Seborrheic Keratosis", "Melanoma"],
            correct: 1
        },
        {
            id: 'derm-gen-2',
            type: 'general',
            question: "Which sign is pathognomonic for Pemphigus Vulgaris?",
            options: ["Auspitz Sign", "Nikolsky Sign", "Darier's Sign", "Koebner Phenomenon"],
            correct: 1
        }
    ],
    'Cardiologist': [
        {
            id: 'cardio-gen-1',
            type: 'general',
            question: "Which murmur is best heard at the apex and radiates to the axilla?",
            options: ["Aortic Stenosis", "Mitral Regurgitation", "Tricuspid Regurgitation", "Aortic Regurgitation"],
            correct: 1
        },
        {
            id: 'cardio-gen-2',
            type: 'general',
            question: "First-line anti-hypertensive for a diabetic patient with proteinuria?",
            options: ["Beta Blocker", "ACE Inhibitor", "Calcium Channel Blocker", "Diuretic"],
            correct: 1
        }
    ],
    'Orthopedist': [
        {
            id: 'ortho-gen-1',
            type: 'general',
            question: "Which nerve is compressed in Carpal Tunnel Syndrome?",
            options: ["Ulnar", "Radial", "Median", "Musculocutaneous"],
            correct: 2
        }
    ]
};

const BASE_MEDICAL_QUESTIONS: Question[] = [
    {
        id: 'base-1',
        type: 'general',
        question: "A patient develops urticaria and wheezing 5 minutes after an injection. First line treatment?",
        options: ["IV Corticosteroids", "IM Epinephrine", "Oral Antihistamines", "Albuterol Nebulizer"],
        correct: 1
    }
];

// Configuration for Dropdowns
const SPECIALTY_OPTIONS: Record<string, string[]> = {
    'Dermatologist': ['Psoriasis', 'Acne', 'Mohs Surgery', 'Cosmetic Dermatology', 'Pediatric Dermatology'],
    'Cardiologist': ['Heart Failure', 'Interventional Cardiology', 'Electrophysiology', 'Preventative'],
    'Orthopedist': ['Sports Injuries', 'Spine', 'Joint Replacement', 'Trauma'],
    'General Practitioner': ['Family Medicine', 'Geriatrics', 'Nutrition'],
    'Neurologist': ['Epilepsy', 'Stroke', 'Migraine', 'Movement Disorders'],
    'Psychiatrist': ['Addiction', 'Child & Adolescent', 'Forensic'],
    'Pediatrician': ['Neonatology', 'Developmental', 'Critical Care'],
    'Ophthalmologist': ['Retina', 'Cornea', 'Glaucoma'],
    'Dentist': ['Orthodontics', 'Oral Surgery', 'Endodontics'],
    'ENT Specialist': ['Rhinology', 'Otology', 'Head & Neck Surgery']
};

const DoctorOnboarding: React.FC<DoctorOnboardingProps> = ({ navigate }) => {
  const { login, user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialty: '',
    subSpecialties: [] as string[],
    clinicAddress: '',
    consultationType: 'both'
  });

  // Quiz State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number>(0);

  // Check for existing doctor session to enable "Update Mode"
  useEffect(() => {
      if (user && user.role === 'doctor' && user.doctorId) {
          setIsUpdateMode(true);
          const profile = getDoctorProfile(user.doctorId);
          if (profile) {
              setFormData(prev => ({
                  ...prev,
                  name: profile.name,
                  email: user.email,
                  specialty: profile.specialization,
                  subSpecialties: profile.specialties.filter(s => s !== profile.specialization), 
              }));
          }
      }
  }, [user]);

  // GENERATE ADAPTIVE TEST
  useEffect(() => {
    let pool: Question[] = [];

    // 1. Add General Specialty Questions
    if (formData.specialty && GENERAL_SPECIALTY_QUESTIONS[formData.specialty]) {
        pool = [...GENERAL_SPECIALTY_QUESTIONS[formData.specialty]];
    } else {
        pool = [...BASE_MEDICAL_QUESTIONS];
    }

    // 2. Add Practical Case Studies based on Sub-Specialties
    // This is the "Hard/Practical" adaptation
    formData.subSpecialties.forEach(sub => {
        if (SPECIALTY_CASES[sub]) {
            pool.push(...SPECIALTY_CASES[sub]);
        }
    });

    // If pool is too small, pad with generic medical logic questions (Mock logic)
    if (pool.length < 3) {
        pool.push(...BASE_MEDICAL_QUESTIONS);
    }
    
    setQuestions(pool);
    setAnswers(new Array(pool.length).fill(-1));
  }, [formData.specialty, formData.subSpecialties]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'specialty') {
        setFormData(prev => ({ ...prev, specialty: e.target.value, subSpecialties: [] }));
    }
  };

  const toggleSubSpecialty = (branch: string) => {
      if (formData.subSpecialties.includes(branch)) {
          setFormData(prev => ({ ...prev, subSpecialties: prev.subSpecialties.filter(b => b !== branch) }));
      } else {
          setFormData(prev => ({ ...prev, subSpecialties: [...prev.subSpecialties, branch] }));
      }
  };

  const handleAnswerSelect = (qIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const submitTest = () => {
    let correctCount = 0;
    answers.forEach((ans, idx) => {
      if (questions[idx] && ans === questions[idx].correct) correctCount++;
    });
    
    const percentage = (correctCount / questions.length) * 100;
    setScore(percentage);
    setStep(4);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
        const allSpecialties = [formData.specialty, ...formData.subSpecialties];
        // Generate a rich bio based on the proven competencies
        const bio = `Specialist in ${formData.specialty}. Clinical focus includes: ${formData.subSpecialties.join(', ') || 'General Practice'}. Certified via MediMatch Competency Assessment.`;

        // Determine Level based on difficulty of questions answered
        const hasAdvancedQuestions = questions.some(q => q.type === 'case_study');
        const level = hasAdvancedQuestions ? 'advanced' : 'standard';

        if (isUpdateMode && user?.doctorId) {
            updateDoctorProfile(user.doctorId, {
                specialization: formData.specialty,
                specialties: allSpecialties,
                bio: bio
            });
            saveCompetencyResult(user.doctorId, formData.specialty, score, level);
            alert("Profile & Competency Updated!");
            navigate('/doctor-dashboard');
        } else {
            const doctorId = createDoctorProfile({
                name: formData.name,
                specialization: formData.specialty,
                bio: bio,
                specialties: allSpecialties, 
                verified: false 
            });
            
            saveCompetencyResult(doctorId, formData.specialty, score, level);
            registerUser(formData.name, formData.email, formData.password, 'doctor', false, doctorId);
            await login(formData.email, formData.password);
            navigate('/doctor-dashboard');
        }
    } catch (e) {
        setError("Registration failed. Email might already be in use.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {isUpdateMode ? 'Update Professional Profile' : 'Doctor Application'}
        </h1>
        <p className="text-slate-500">
            {isUpdateMode 
                ? 'Update your expertise to receive better patient matches.' 
                : 'Join our network of elite specialists.'}
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-center gap-4 mb-10 text-sm font-semibold">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-medical-600' : 'text-slate-400'}`}>
              <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center border-current">1</span>
              <span>Profile & Survey</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-200"></div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-medical-600' : 'text-slate-400'}`}>
              <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center border-current">2</span>
              <span>Logistics</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-200"></div>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-medical-600' : 'text-slate-400'}`}>
              <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center border-current">3</span>
              <span>Practical Exam</span>
          </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">

        {/* STEP 1: Survey */}
        {step === 1 && (
            <div className="space-y-6 animate-fade-in">
                {!isUpdateMode && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                            <input name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none" placeholder="Dr. Jane Doe" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                            <input name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none" placeholder="doctor@hospital.com" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none" />
                        </div>
                    </div>
                )}
                
                <div className="border-t border-slate-100 pt-6">
                     <label className="block text-lg font-bold text-slate-800 mb-1">Primary Specialization</label>
                     <p className="text-sm text-slate-500 mb-4">Select your board-certified specialty.</p>
                     <select name="specialty" value={formData.specialty} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 font-medium">
                         <option value="">Select Specialty...</option>
                         {Object.keys(SPECIALTY_OPTIONS).map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                </div>

                {/* Dynamic Sub-Specialty Survey */}
                {formData.specialty && SPECIALTY_OPTIONS[formData.specialty] ? (
                    <div className="bg-medical-50 p-6 rounded-xl border border-medical-100 animate-fade-in">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 bg-medical-100 text-medical-600 rounded-lg">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            </div>
                            <div>
                                <h3 className="text-md font-bold text-medical-900">Clinical Focus Survey</h3>
                                <p className="text-sm text-medical-700">Check all that apply. Your practical exam will adapt to include case studies for these specific areas.</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {SPECIALTY_OPTIONS[formData.specialty].map((branch) => (
                                <label key={branch} className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${formData.subSpecialties.includes(branch) ? 'bg-white border-medical-500 shadow-md ring-1 ring-medical-500' : 'bg-white/50 border-slate-200 hover:bg-white'}`}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.subSpecialties.includes(branch) ? 'bg-medical-600 border-medical-600 text-white' : 'border-slate-300'}`}>
                                        {formData.subSpecialties.includes(branch) && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={formData.subSpecialties.includes(branch)}
                                        onChange={() => toggleSubSpecialty(branch)}
                                        className="sr-only"
                                    />
                                    <span className="font-medium text-slate-800">{branch}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ) : null}

                <div className="flex justify-end pt-6">
                    <button 
                        onClick={() => {
                            if (!formData.name && !isUpdateMode) {
                                setError("Please fill all required fields.");
                            } else if (!formData.specialty) {
                                setError("Please select a specialty.");
                            } else {
                                setError("");
                                setStep(isUpdateMode ? 3 : 2); 
                            }
                        }} 
                        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg transition-transform hover:-translate-y-0.5"
                    >
                        Continue
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
            </div>
        )}

        {/* STEP 2: Logistics */}
        {step === 2 && !isUpdateMode && (
             <div className="space-y-6 animate-fade-in max-w-lg mx-auto">
                 <h2 className="text-xl font-bold text-slate-900">Practice Details</h2>
                 
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Clinic Address</label>
                    <input name="clinicAddress" value={formData.clinicAddress} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none" placeholder="123 Medical Plaza..." />
                 </div>
                 
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">Consultation Availability</label>
                    <div className="grid grid-cols-3 gap-4">
                        {['online', 'clinic', 'both'].map(mode => (
                            <label key={mode} className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer capitalize transition-all ${formData.consultationType === mode ? 'bg-medical-50 border-medical-500 text-medical-800 ring-1 ring-medical-500' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                <input type="radio" name="consultationType" value={mode} checked={formData.consultationType === mode} onChange={handleInputChange} className="sr-only" />
                                <span className="font-bold">{mode}</span>
                            </label>
                        ))}
                    </div>
                 </div>

                 <div className="flex justify-between pt-8">
                    <button onClick={() => setStep(1)} className="px-6 py-3 text-slate-500 font-medium hover:text-slate-800">Back</button>
                    <button onClick={() => setStep(3)} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg">Start Exam</button>
                </div>
             </div>
        )}

        {/* STEP 3: PRACTICAL EXAM */}
        {step === 3 && (
            <div className="animate-fade-in">
                <div className="bg-slate-900 text-white p-6 rounded-xl mb-8 shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold mb-1">Competency Assessment</h2>
                            <p className="text-slate-300 text-sm">
                                Adaptive Test: {formData.specialty} 
                                {formData.subSpecialties.length > 0 && ` + ${formData.subSpecialties.join(', ')}`}
                            </p>
                        </div>
                        <div className="bg-white/10 px-3 py-1 rounded text-xs font-mono">
                            Q: {questions.length} | Est. Time: 5m
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {questions.map((q, qIdx) => (
                        <div key={q.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            {/* Header for Case Studies */}
                            {q.type === 'case_study' && (
                                <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    <span className="font-bold text-amber-800 text-sm uppercase tracking-wide">
                                        {q.title || "Clinical Scenario"}
                                    </span>
                                </div>
                            )}

                            <div className="p-6">
                                {/* Vignette for scenarios */}
                                {q.vignette && (
                                    <div className="mb-6 p-4 bg-slate-50 rounded-lg border-l-4 border-slate-400 text-slate-700 italic text-sm leading-relaxed">
                                        "{q.vignette}"
                                    </div>
                                )}

                                <p className="font-bold text-lg text-slate-900 mb-6">
                                    <span className="text-slate-400 mr-2">{qIdx + 1}.</span>
                                    {q.question}
                                </p>

                                <div className="grid grid-cols-1 gap-3">
                                    {q.options.map((opt, oIdx) => (
                                        <label 
                                            key={oIdx} 
                                            className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                                                answers[qIdx] === oIdx 
                                                ? 'bg-medical-50 border-medical-500 ring-1 ring-medical-500' 
                                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 ${
                                                answers[qIdx] === oIdx ? 'border-medical-600 bg-medical-600 text-white' : 'border-slate-300'
                                            }`}>
                                                {answers[qIdx] === oIdx && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                            </div>
                                            <input 
                                                type="radio" 
                                                name={`q-${qIdx}`} 
                                                checked={answers[qIdx] === oIdx}
                                                onChange={() => handleAnswerSelect(qIdx, oIdx)}
                                                className="sr-only"
                                            />
                                            <span className={`text-sm ${answers[qIdx] === oIdx ? 'font-bold text-medical-900' : 'text-slate-700'}`}>{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-10 pb-6">
                    <button 
                        onClick={submitTest}
                        disabled={answers.includes(-1)}
                        className="px-10 py-4 bg-medical-600 text-white text-lg rounded-xl font-bold hover:bg-medical-700 shadow-xl disabled:opacity-50 disabled:shadow-none transition-all transform hover:-translate-y-1"
                    >
                        Submit Assessment
                    </button>
                </div>
                {answers.includes(-1) && (
                    <p className="text-center text-slate-400 text-sm">Please answer all questions to proceed.</p>
                )}
            </div>
        )}

        {/* STEP 4: Results */}
        {step === 4 && (
             <div className="text-center animate-fade-in py-12">
                 <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${score >= 70 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {score >= 70 ? (
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                 </div>
                 
                 <h2 className="text-3xl font-bold text-slate-900 mb-2">
                     {score >= 70 ? 'Competency Verified' : 'Assessment Failed'}
                 </h2>
                 <p className="text-slate-500 mb-8 max-w-md mx-auto">
                     {score >= 70 
                        ? `You achieved a score of ${Math.round(score)}%. Your profile will be badged as verified for the selected specialties.`
                        : "You did not meet the required threshold for these specialties. You may try again later."}
                 </p>
                 
                 {score >= 70 ? (
                     <button 
                        onClick={handleFinalSubmit} 
                        disabled={loading}
                        className="w-full max-w-sm mx-auto py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg flex items-center justify-center gap-2"
                     >
                         {loading && <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                         {isUpdateMode ? 'Save Profile Updates' : 'Go to Dashboard'}
                     </button>
                 ) : (
                     <button onClick={() => { setStep(1); setScore(0); }} className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">
                         Retry Assessment
                     </button>
                 )}
             </div>
        )}
      </div>
    </div>
  );
};

export default DoctorOnboarding;
