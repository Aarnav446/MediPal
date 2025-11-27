import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { registerUser, createDoctorProfile } from '../services/db';

interface DoctorOnboardingProps {
  navigate: (path: string) => void;
}

const QUESTIONS = [
  {
    question: "A patient presents with elevated TSH and low T4. What is the most likely diagnosis?",
    options: ["Hyperthyroidism", "Hypothyroidism", "Hashimoto's Thyroiditis", "Grave's Disease"],
    correct: 1
  },
  {
    question: "Which of the following is the first-line treatment for anaphylaxis?",
    options: ["Antihistamines", "Corticosteroids", "Epinephrine", "Albuterol"],
    correct: 2
  },
  {
    question: "A 45-year-old male complains of crushing chest pain radiating to the left arm. What is the immediate priority?",
    options: ["Perform EKG", "Administer Aspirin", "Check Blood Pressure", "Call Emergency Services / Cath Lab Prep"],
    correct: 3
  },
  {
    question: "What is the primary mechanism of action of ACE inhibitors?",
    options: ["Beta-adrenergic blockade", "Calcium channel blockade", "Inhibition of Angiotensin I to II conversion", "Diuresis"],
    correct: 2
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
    clinicAddress: '',
    consultationType: 'both', // both, online, clinic
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
  const [answers, setAnswers] = useState<number[]>(new Array(QUESTIONS.length).fill(-1));
  const [score, setScore] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      if (ans === QUESTIONS[idx].correct) correctCount++;
    });
    
    // Strict pass: need 100% or close to it for "Hard Test"
    const finalScore = (correctCount / QUESTIONS.length) * 100;
    setScore(finalScore);

    if (finalScore >= 75) {
       // Passed
       setTimeout(() => setStep(4), 1500);
    } else {
       setError("You did not meet the required competency score (75%) to join our platform.");
    }
  };

  const handleFinalRegister = async () => {
    setLoading(true);
    try {
        // 1. Create a Doctor Profile in the DB so they are searchable
        // We use the ID returned here to link the User account
        const doctorId = createDoctorProfile({
            name: formData.name,
            specialization: formData.specialty,
            bio: `${formData.specialty} specializing in modern treatments. Clinic located at ${formData.clinicAddress}.`,
            specialties: [formData.specialty, 'General Health'], // Simple default
            verified: true, // Auto-verify since they passed the quiz/doc upload simulation
            experience: '1 Year' // Default for new signups
        });

        // 2. Register User Account linked to the Doctor Profile
        registerUser(formData.name, formData.email, formData.password, 'doctor', true, doctorId);
        
        // 3. Auto Login
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
            <span className={`text-sm font-bold ${step >= 1 ? 'text-medical-600' : 'text-slate-400'}`}>Profile & Docs</span>
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

        {/* STEP 1: Personal Info & Documents */}
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
                <div>
                     <label className="block text-sm font-medium text-slate-700">Primary Specialization</label>
                     <select name="specialty" value={formData.specialty} onChange={handleInputChange} className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-medical-500 focus:border-medical-500">
                         <option value="">Select Specialty</option>
                         <option value="Dermatologist">Dermatologist</option>
                         <option value="Cardiologist">Cardiologist</option>
                         <option value="General Practitioner">General Practitioner</option>
                         <option value="Dentist">Dentist</option>
                         <option value="Orthopedist">Orthopedist</option>
                         <option value="Pediatrician">Pediatrician</option>
                         <option value="Neurologist">Neurologist</option>
                         <option value="Psychiatrist">Psychiatrist</option>
                     </select>
                </div>
                
                {/* File Uploads */}
                <div className="space-y-3 pt-4 border-t border-slate-100 mt-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Professional Verification</h3>
                    <p className="text-xs text-slate-500 mb-4">Upload PDF or Image. Used for backend verification.</p>
                    
                    <div className="grid grid-cols-1 gap-4">
                        <div className={`p-4 border-2 border-dashed rounded-lg transition-colors ${docs.license ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                            <label className="flex justify-between items-center cursor-pointer">
                                <div>
                                    <span className="block text-sm font-bold text-slate-700">Medical License (Required)</span>
                                    {docs.license && <span className="text-xs text-green-600 font-medium">{docs.license.name}</span>}
                                </div>
                                <input type="file" onChange={(e) => handleFileChange(e, 'license')} className="hidden"/>
                                <span className={`px-3 py-1 rounded text-xs font-bold ${docs.license ? 'bg-green-200 text-green-800' : 'bg-slate-200 text-slate-600'}`}>
                                    {docs.license ? 'Uploaded' : 'Upload'}
                                </span>
                            </label>
                        </div>

                        <div className={`p-4 border-2 border-dashed rounded-lg transition-colors ${docs.degree ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                            <label className="flex justify-between items-center cursor-pointer">
                                <div>
                                    <span className="block text-sm font-bold text-slate-700">Medical Degree (Required)</span>
                                    {docs.degree && <span className="text-xs text-green-600 font-medium">{docs.degree.name}</span>}
                                </div>
                                <input type="file" onChange={(e) => handleFileChange(e, 'degree')} className="hidden"/>
                                <span className={`px-3 py-1 rounded text-xs font-bold ${docs.degree ? 'bg-green-200 text-green-800' : 'bg-slate-200 text-slate-600'}`}>
                                    {docs.degree ? 'Uploaded' : 'Upload'}
                                </span>
                            </label>
                        </div>

                        <div className={`p-4 border-2 border-dashed rounded-lg transition-colors ${docs.certs ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                            <label className="flex justify-between items-center cursor-pointer">
                                <div>
                                    <span className="block text-sm font-bold text-slate-700">Certificates / Awards</span>
                                    {docs.certs && <span className="text-xs text-green-600 font-medium">{docs.certs.name}</span>}
                                </div>
                                <input type="file" onChange={(e) => handleFileChange(e, 'certs')} className="hidden"/>
                                <span className={`px-3 py-1 rounded text-xs font-bold ${docs.certs ? 'bg-green-200 text-green-800' : 'bg-slate-200 text-slate-600'}`}>
                                    {docs.certs ? 'Uploaded' : 'Upload'}
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button 
                        onClick={() => {
                            if (!docs.license || !docs.degree || !formData.name || !formData.email) {
                                setError("Please fill all required fields and upload valid documents.");
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
                            <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.818v6.364a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            <span className="text-sm font-bold">Online Only</span>
                        </label>
                        <label className={`flex flex-col items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.consultationType === 'clinic' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white hover:bg-slate-50'}`}>
                            <input type="radio" name="consultationType" value="clinic" checked={formData.consultationType === 'clinic'} onChange={handleInputChange} className="sr-only" />
                            <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            <span className="text-sm font-bold">Clinic Only</span>
                        </label>
                        <label className={`flex flex-col items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.consultationType === 'both' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white hover:bg-slate-50'}`}>
                            <input type="radio" name="consultationType" value="both" checked={formData.consultationType === 'both'} onChange={handleInputChange} className="sr-only" />
                            <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
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

        {/* STEP 3: Competency Test */}
        {step === 3 && (
            <div className="animate-fade-in">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                             <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm leading-5 font-bold text-red-800">
                                Advanced Competency Assessment
                            </h3>
                            <div className="mt-2 text-sm leading-5 text-red-700">
                                <p>
                                    To maintain our platform's high standards, you must pass this difficult test with a score of <strong>75% or higher</strong>. Failure will reject your application.
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
                        {QUESTIONS.map((q, qIdx) => (
                            <div key={qIdx} className="bg-slate-50 p-5 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                                <p className="font-bold text-slate-800 mb-3 text-lg">{qIdx + 1}. {q.question}</p>
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
                 <h2 className="text-3xl font-extrabold text-slate-900 mb-2">You Passed!</h2>
                 <p className="text-lg text-slate-600 mb-8">
                     Your score: <span className="font-bold text-green-600 text-2xl">{score}%</span>. 
                     <br/>You are now a Verified Specialist on MediMatch AI.
                 </p>
                 
                 <div className="bg-slate-50 p-6 rounded-xl max-w-sm mx-auto text-left mb-8 text-sm text-slate-600 border border-slate-200 shadow-inner">
                     <p className="mb-2"><strong className="text-slate-800">Name:</strong> {formData.name}</p>
                     <p className="mb-2"><strong className="text-slate-800">Specialty:</strong> {formData.specialty}</p>
                     <p className="mb-2"><strong className="text-slate-800">Mode:</strong> <span className="capitalize">{formData.consultationType}</span></p>
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