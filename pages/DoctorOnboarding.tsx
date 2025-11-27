import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { registerUser, createDoctorProfile } from '../services/db';

interface DoctorOnboardingProps {
  navigate: (path: string) => void;
}

// Data Structure for Dynamic Survey and Adaptive Testing
const SPECIALTY_DATA: Record<string, { 
    branches: string[]; 
    questions: { question: string; options: string[]; correct: number }[] 
}> = {
    'Dermatologist': {
        branches: ['Cosmetic Dermatology', 'Pediatric Dermatology', 'Dermatopathology', 'Mohs Surgery', 'Immunodermatology'],
        questions: [
            {
                question: "A 30-year-old patient presents with well-demarcated erythematous plaques with silvery scales on extensor surfaces. Auspitz sign is positive. What is the diagnosis?",
                options: ["Atopic Dermatitis", "Psoriasis Vulgaris", "Lichen Planus", "Pityriasis Rosea"],
                correct: 1
            },
            {
                question: "Which biologic agent targets IL-17A and is highly effective for moderate-to-severe plaque psoriasis?",
                options: ["Etanercept", "Infliximab", "Secukinumab", "Ustekinumab"],
                correct: 2
            },
            {
                question: "A patient presents with a pearly papule with telangiectasias on the nose. Biopsy confirms Basal Cell Carcinoma. What is the gold standard treatment for sensitive areas?",
                options: ["Cryotherapy", "Topical 5-FU", "Mohs Micrographic Surgery", "Radiation Therapy"],
                correct: 2
            }
        ]
    },
    'Cardiologist': {
        branches: ['Interventional Cardiology', 'Electrophysiology', 'Heart Failure & Transplant', 'Nuclear Cardiology', 'Pediatric Cardiology'],
        questions: [
            {
                question: "ECG shows ST-segment elevation in leads II, III, and aVF with reciprocal changes in I and aVL. Which coronary artery is likely occluded?",
                options: ["Left Anterior Descending (LAD)", "Right Coronary Artery (RCA)", "Left Circumflex (LCx)", "Left Main"],
                correct: 1
            },
            {
                question: "A patient with HFrEF (EF 25%) is already on maximal Beta-blocker and ACE-inhibitor therapy but remains symptomatic. What is the next best pharmacological addition?",
                options: ["Digoxin", "SGLT2 Inhibitor (e.g., Empagliflozin)", "Calcium Channel Blocker", "Nitrates"],
                correct: 1
            },
            {
                question: "What is the primary mechanism of action of Class III antiarrhythmic drugs like Amiodarone?",
                options: ["Sodium channel blockade", "Beta-adrenergic blockade", "Potassium channel blockade", "Calcium channel blockade"],
                correct: 2
            }
        ]
    },
    'Orthopedist': {
        branches: ['Sports Medicine', 'Spine Surgery', 'Joint Replacement', 'Hand Surgery', 'Trauma'],
        questions: [
            {
                question: "A 'Bamboo Spine' appearance on radiographic imaging is pathognomonic for which condition?",
                options: ["Rheumatoid Arthritis", "Osteoarthritis", "Ankylosing Spondylitis", "Diffuse Idiopathic Skeletal Hyperostosis"],
                correct: 2
            },
            {
                question: "Positive Lachman test and Anterior Drawer test are indicative of injury to which structure?",
                options: ["Posterior Cruciate Ligament (PCL)", "Anterior Cruciate Ligament (ACL)", "Medial Meniscus", "Lateral Collateral Ligament"],
                correct: 1
            },
            {
                question: "Compartment syndrome is a surgical emergency. Which of the '5 Ps' is typically the latest sign?",
                options: ["Pain out of proportion", "Paresthesia", "Pulselessness", "Pallor"],
                correct: 2
            }
        ]
    },
    'General Practitioner': {
        branches: ['Family Medicine', 'Geriatrics', 'Preventive Medicine', 'Travel Medicine', 'Chronic Disease Management'],
        questions: [
            {
                question: "A 45-year-old male presents with BP 150/95 on two separate occasions. Lifestyle modifications failed. What is the first-line pharmacotherapy?",
                options: ["Beta-blocker", "Clonidine", "ACE Inhibitor or Thiazide Diuretic", "Hydralazine"],
                correct: 2
            },
            {
                question: "Which of the following is the most sensitive and specific test for diagnosing Iron Deficiency Anemia?",
                options: ["Serum Iron", "Total Iron Binding Capacity (TIBC)", "Serum Ferritin", "Hemoglobin"],
                correct: 2
            },
            {
                question: "A patient with Type 2 Diabetes has an eGFR of 45. Which oral hypoglycemic agent should be used with caution or dose-reduced?",
                options: ["Metformin", "Insulin", "Glipizide", "Pioglitazone"],
                correct: 0
            }
        ]
    },
    'Dentist': {
        branches: ['Orthodontics', 'Endodontics', 'Periodontics', 'Oral Surgery', 'Pediatric Dentistry'],
        questions: [
            {
                question: "Which of the following is the most common cause of endodontic failure?",
                options: ["Inadequate obturation", "Perforation", "Missed canal", "Fractured instrument"],
                correct: 0
            },
            {
                question: "What is the primary bacteria associated with dental caries initiation?",
                options: ["Lactobacillus", "Streptococcus mutans", "Porphyromonas gingivalis", "Actinomyces"],
                correct: 1
            },
            {
                question: "Class II malocclusion is characterized by:",
                options: ["Mesiobuccal cusp of upper first molar occluding with buccal groove of lower first molar", "Distobuccal cusp of upper first molar occluding with buccal groove of lower first molar", "Mesiobuccal cusp of upper first molar occluding anterior to buccal groove of lower first molar", "None of the above"],
                correct: 2
            }
        ]
    },
    'Neurologist': {
        branches: ['Epilepsy', 'Stroke Medicine', 'Neuromuscular', 'Movement Disorders', 'Headache Medicine'],
        questions: [
            {
                question: "Which of the following is the acute treatment of choice for an ischemic stroke within 3 hours of onset?",
                options: ["Aspirin", "Heparin", "tPA (Alteplase)", "Warfarin"],
                correct: 2
            },
            {
                question: "Resting tremor, rigidity, bradykinesia, and postural instability are cardinal signs of:",
                options: ["Alzheimer's Disease", "Parkinson's Disease", "Huntington's Disease", "ALS"],
                correct: 1
            },
            {
                question: "Which seizure type involves a brief loss of consciousness without convulsions, common in children?",
                options: ["Tonic-Clonic", "Absence", "Myoclonic", "Atonic"],
                correct: 1
            }
        ]
    },
    'Psychiatrist': {
        branches: ['Addiction Psychiatry', 'Child & Adolescent', 'Forensic Psychiatry', 'Geriatric Psychiatry', 'Psychosomatic Medicine'],
        questions: [
            {
                question: "Which class of medications is the first-line treatment for Major Depressive Disorder?",
                options: ["Benzodiazepines", "MAOIs", "SSRIs", "Tricyclic Antidepressants"],
                correct: 2
            },
            {
                question: "Auditory hallucinations and paranoid delusions are positive symptoms of:",
                options: ["Bipolar Disorder", "Schizophrenia", "Generalized Anxiety Disorder", "Obsessive-Compulsive Disorder"],
                correct: 1
            },
            {
                question: "Lithium is commonly used as a mood stabilizer for:",
                options: ["Major Depression", "Bipolar Disorder", "Panic Disorder", "ADHD"],
                correct: 1
            }
        ]
    }
};

// Fallback for types not explicitly defined above
const GENERIC_QUESTIONS = [
    {
        question: "What is the first step in Basic Life Support (BLS) for an unresponsive adult?",
        options: ["Check pulse", "Start compressions", "Check responsiveness / Call for help", "Give rescue breaths"],
        correct: 2
    },
    {
        question: "Which medication is contraindicated in a patient with a history of anaphylaxis to Penicillin?",
        options: ["Azithromycin", "Amoxicillin", "Doxycycline", "Vancomycin"],
        correct: 1
    },
    {
        question: "Identify the normal range for Hemoglobin A1c in a non-diabetic adult.",
        options: ["< 5.7%", "5.7% - 6.4%", "> 6.5%", "> 8.0%"],
        correct: 0
    }
];

const DoctorOnboarding: React.FC<DoctorOnboardingProps> = ({ navigate }) => {
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialty: '',
    subSpecialties: [] as string[], // NEW: Specific branches
    clinicAddress: '',
    consultationType: 'both',
    onlineFee: 35,
    clinicFee: 50,
  });

  // Documents
  const [docs, setDocs] = useState<{license: File | null, degree: File | null, certs: File | null}>({
    license: null,
    degree: null,
    certs: null
  });

  // Quiz State
  const [currentQuestions, setCurrentQuestions] = useState(GENERIC_QUESTIONS);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);

  // Update questions when specialty changes
  useEffect(() => {
    if (formData.specialty && SPECIALTY_DATA[formData.specialty]) {
        setCurrentQuestions(SPECIALTY_DATA[formData.specialty].questions);
    } else {
        setCurrentQuestions(GENERIC_QUESTIONS);
    }
    // Reset answers
    setAnswers(new Array(3).fill(-1));
  }, [formData.specialty]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Reset sub-specialties if main specialty changes
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'license' | 'degree' | 'certs') => {
      if (e.target.files && e.target.files[0]) {
          setDocs(prev => ({ ...prev, [type]: e.target.files![0] }));
      }
  };

  const handleQuizChange = (qIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const submitQuiz = () => {
    // Calculate Score
    let correctCount = 0;
    answers.forEach((ans, idx) => {
      if (ans === currentQuestions[idx].correct) correctCount++;
    });
    
    // Strict pass: 100% required for "Hard" test, or at least 2/3
    const finalScore = (correctCount / currentQuestions.length) * 100;
    setScore(finalScore);

    if (finalScore >= 66) {
       // Passed
       setTimeout(() => setStep(4), 1500);
    } else {
       setError("You did not meet the required competency score to join our platform. These questions are critical for accurate matching.");
    }
  };

  const handleFinalRegister = async () => {
    setLoading(true);
    try {
        // Combine main specialty with sub-specialties for the profile
        const allSpecialties = [formData.specialty, ...formData.subSpecialties];

        const doctorId = createDoctorProfile({
            name: formData.name,
            specialization: formData.specialty,
            bio: `${formData.specialty} specializing in ${formData.subSpecialties.join(', ') || 'General Care'}. Clinic located at ${formData.clinicAddress}.`,
            specialties: allSpecialties, 
            verified: true,
            experience: '1 Year' 
        });

        registerUser(formData.name, formData.email, formData.password, 'doctor', true, doctorId);
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
      
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
            <span className={`text-sm font-bold ${step >= 1 ? 'text-medical-600' : 'text-slate-400'}`}>Profile & Branches</span>
            <span className={`text-sm font-bold ${step >= 2 ? 'text-medical-600' : 'text-slate-400'}`}>Practice Info</span>
            <span className={`text-sm font-bold ${step >= 3 ? 'text-medical-600' : 'text-slate-400'}`}>Competency Test</span>
            <span className={`text-sm font-bold ${step >= 4 ? 'text-medical-600' : 'text-slate-400'}`}>Review</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full">
            <div className="h-full bg-medical-500 rounded-full transition-all duration-500" style={{ width: `${(step/4)*100}%` }}></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Join as a Specialist</h1>

        {/* STEP 1: Personal Info & Survey */}
        {step === 1 && (
            <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Full Name (Dr.)</label>
                        <input name="name" value={formData.name} onChange={handleInputChange} className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-medical-500 focus:border-medical-500" placeholder="Dr. Jane Doe" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Email</label>
                        <input name="email" value={formData.email} onChange={handleInputChange} className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-medical-500 focus:border-medical-500" placeholder="doctor@clinic.com" />
                    </div>
                </div>
                <div>
                     <label className="block text-sm font-medium text-slate-700">Password</label>
                     <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-medical-500 focus:border-medical-500" />
                </div>
                
                {/* Specialty Selection */}
                <div className="pt-2">
                     <label className="block text-sm font-bold text-slate-800">Primary Specialization</label>
                     <select name="specialty" value={formData.specialty} onChange={handleInputChange} className="w-full mt-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-medical-500 focus:border-medical-500 bg-white">
                         <option value="">Select Specialty</option>
                         <option value="Dermatologist">Dermatologist</option>
                         <option value="Cardiologist">Cardiologist</option>
                         <option value="Orthopedist">Orthopedist</option>
                         <option value="General Practitioner">General Practitioner</option>
                         <option value="Dentist">Dentist</option>
                         <option value="Neurologist">Neurologist</option>
                         <option value="Psychiatrist">Psychiatrist</option>
                     </select>
                </div>

                {/* Dynamic Sub-Specialty Survey */}
                {formData.specialty && SPECIALTY_DATA[formData.specialty] ? (
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mt-4 animate-fade-in">
                        <h3 className="text-sm font-bold text-medical-800 uppercase tracking-wide mb-3">
                            Specialized Focus (Survey)
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">
                            Select the specific branches you specialize in. This helps our AI match you with the right patients.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {SPECIALTY_DATA[formData.specialty].branches.map((branch) => (
                                <label key={branch} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${formData.subSpecialties.includes(branch) ? 'bg-medical-100 border-medical-400 text-medical-900' : 'bg-white border-slate-200 text-slate-600 hover:border-medical-300'}`}>
                                    <input 
                                        type="checkbox" 
                                        checked={formData.subSpecialties.includes(branch)}
                                        onChange={() => toggleSubSpecialty(branch)}
                                        className="w-4 h-4 text-medical-600 rounded focus:ring-medical-500"
                                    />
                                    <span className="text-sm font-medium">{branch}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ) : formData.specialty ? (
                    <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
                        Standard competency test will be applied for {formData.specialty}.
                    </div>
                ) : null}
                
                {/* File Uploads */}
                <div className="space-y-3 pt-6 border-t border-slate-100 mt-6">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Verification Documents</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div className={`p-4 border-2 border-dashed rounded-lg transition-colors ${docs.license ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                            <label className="flex justify-between items-center cursor-pointer">
                                <div>
                                    <span className="block text-sm font-bold text-slate-700">Medical License</span>
                                    {docs.license && <span className="text-xs text-green-600 font-medium">{docs.license.name}</span>}
                                </div>
                                <input type="file" onChange={(e) => handleFileChange(e, 'license')} className="hidden" accept=".pdf,.jpg,.png"/>
                                <span className={`px-3 py-1 rounded text-xs font-bold ${docs.license ? 'bg-green-200 text-green-800' : 'bg-slate-200 text-slate-600'}`}>
                                    {docs.license ? 'Uploaded' : 'Upload'}
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button 
                        onClick={() => {
                            if (!docs.license || !formData.name || !formData.email || !formData.specialty) {
                                setError("Please fill all required fields, select a specialty, and upload license.");
                            } else {
                                setError("");
                                setStep(2);
                            }
                        }} 
                        className="px-6 py-2 bg-medical-600 text-white rounded-lg font-bold hover:bg-medical-700 shadow-md"
                    >
                        Next: Practice Info
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
            </div>
        )}

        {/* STEP 2: Practice Info */}
        {step === 2 && (
             <div className="space-y-4 animate-fade-in">
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Clinic Address</label>
                    <input name="clinicAddress" value={formData.clinicAddress} onChange={handleInputChange} className="w-full mt-1 px-4 py-2 border rounded-lg" placeholder="123 Health St, Medical City" />
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Consultation Mode & Availability</label>
                    <div className="grid grid-cols-3 gap-4">
                        <label className={`flex flex-col items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.consultationType === 'online' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white hover:bg-slate-50'}`}>
                            <input type="radio" name="consultationType" value="online" checked={formData.consultationType === 'online'} onChange={handleInputChange} className="sr-only" />
                            <span className="text-sm font-bold">Online Only</span>
                        </label>
                        <label className={`flex flex-col items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.consultationType === 'clinic' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white hover:bg-slate-50'}`}>
                            <input type="radio" name="consultationType" value="clinic" checked={formData.consultationType === 'clinic'} onChange={handleInputChange} className="sr-only" />
                            <span className="text-sm font-bold">Clinic Only</span>
                        </label>
                        <label className={`flex flex-col items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.consultationType === 'both' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white hover:bg-slate-50'}`}>
                            <input type="radio" name="consultationType" value="both" checked={formData.consultationType === 'both'} onChange={handleInputChange} className="sr-only" />
                            <span className="text-sm font-bold">Both</span>
                        </label>
                    </div>
                 </div>

                 <div className="flex justify-between pt-4">
                    <button onClick={() => setStep(1)} className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 font-medium">Back</button>
                    <button onClick={() => setStep(3)} className="px-6 py-2 bg-medical-600 text-white rounded-lg font-bold hover:bg-medical-700 shadow-md">Next: Competency Test</button>
                </div>
             </div>
        )}

        {/* STEP 3: Adaptive Competency Test */}
        {step === 3 && (
            <div className="animate-fade-in">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                             <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm leading-5 font-bold text-red-800">
                                Clinical Competency Assessment: <span className="underline">{formData.specialty}</span>
                            </h3>
                            <div className="mt-2 text-sm leading-5 text-red-700">
                                <p>
                                    Based on your selection, answer the following clinical case studies. 
                                    These are designed to verify your expertise in {formData.specialty}.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6 border border-red-200 font-medium">
                        {error}
                        <button onClick={() => { setError(''); setStep(1); }} className="block mt-2 text-sm underline font-bold">Restart Application</button>
                    </div>
                )}
                
                {!error && (
                    <div className="space-y-6">
                        {currentQuestions.map((q, qIdx) => (
                            <div key={qIdx} className="bg-slate-50 p-5 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                                <p className="font-bold text-slate-800 mb-3 text-lg leading-snug">{qIdx + 1}. {q.question}</p>
                                <div className="space-y-2">
                                    {q.options.map((opt, oIdx) => (
                                        <label key={oIdx} className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border transition-all ${answers[qIdx] === oIdx ? 'bg-medical-50 border-medical-500' : 'bg-white border-transparent hover:bg-slate-100'}`}>
                                            <input 
                                                type="radio" 
                                                name={`q-${qIdx}`} 
                                                checked={answers[qIdx] === oIdx}
                                                onChange={() => handleQuizChange(qIdx, oIdx)}
                                                className="text-medical-600 focus:ring-medical-500 w-4 h-4"
                                            />
                                            <span className={`text-sm ${answers[qIdx] === oIdx ? 'text-medical-900 font-semibold' : 'text-slate-700'}`}>{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                         <div className="flex justify-between pt-6 border-t border-slate-100">
                            <button onClick={() => setStep(2)} className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 font-medium">Back</button>
                            <button 
                                onClick={submitQuiz} 
                                disabled={answers.includes(-1)}
                                className="px-8 py-3 bg-medical-600 text-white rounded-lg font-bold hover:bg-medical-700 shadow-lg disabled:opacity-50 disabled:shadow-none transition-all transform hover:-translate-y-0.5"
                            >
                                Submit Assessment
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* STEP 4: Success & Register */}
        {step === 4 && (
             <div className="text-center animate-fade-in py-8">
                 <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                 </div>
                 <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Verification Successful!</h2>
                 <p className="text-lg text-slate-600 mb-8">
                     Your clinical score: <span className="font-bold text-green-600 text-2xl">{Math.round(score || 0)}%</span>. 
                     <br/>You are now a Verified Specialist on MediMatch AI.
                 </p>
                 
                 <div className="bg-slate-50 p-6 rounded-xl max-w-sm mx-auto text-left mb-8 text-sm text-slate-600 border border-slate-200 shadow-inner">
                     <p className="mb-2"><strong className="text-slate-800">Name:</strong> {formData.name}</p>
                     <p className="mb-2"><strong className="text-slate-800">Specialty:</strong> {formData.specialty}</p>
                     <p className="mb-2"><strong className="text-slate-800">Focus Areas:</strong> {formData.subSpecialties.join(', ') || 'General'}</p>
                     <p><strong className="text-slate-800">Status:</strong> <span className="text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full text-xs">VERIFIED</span></p>
                 </div>

                 <button 
                    onClick={handleFinalRegister} 
                    disabled={loading}
                    className="w-full max-w-sm mx-auto py-4 bg-medical-600 text-white rounded-xl font-bold hover:bg-medical-700 shadow-lg hover:shadow-xl transition-all"
                 >
                     {loading ? 'Creating Dashboard...' : 'Go to Doctor Dashboard'}
                 </button>
             </div>
        )}

      </div>
    </div>
  );
};

export default DoctorOnboarding;