import React, { useState } from 'react';
import { AnalysisResult, Doctor } from '../types';
import { useAuth } from '../context/AuthContext';
import { createAppointment } from '../services/db';

interface ResultsProps {
  result: AnalysisResult | null;
  navigate: (path: string) => void;
}

const Results: React.FC<ResultsProps> = ({ result, navigate }) => {
  const { user } = useAuth();
  
  // Filters State
  const [minRating, setMinRating] = useState<number>(0);
  const [maxDistance, setMaxDistance] = useState<number>(50); // Default larger distance
  
  // Modal State
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'processing' | 'confirmed' | 'error'>('idle');
  const [bookingMessage, setBookingMessage] = useState('');

  if (!result) {
    React.useEffect(() => {
        navigate('/analyze');
    }, [navigate]);
    return null;
  }

  const urgencyColor = {
    Low: 'bg-green-100 text-green-800 border-green-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    High: 'bg-red-100 text-red-800 border-red-200',
  }[result.urgency];

  const handleBookClick = (doctor: Doctor) => {
    if (!user) {
        // Force login if not authenticated
        if(confirm("You must be logged in to book an appointment. Go to Login?")) {
            navigate('/login');
        }
        return;
    }
    setSelectedDoctor(doctor);
    setBookingStatus('idle');
    setIsModalOpen(true);
  };

  const confirmBooking = async () => {
    if (!selectedDoctor || !user) return;
    
    setBookingStatus('processing');
    try {
        // Simulate network
        await new Promise(r => setTimeout(r, 1000));
        
        // Write to DB
        createAppointment(
            selectedDoctor.id, 
            user.id, 
            user.name, 
            result.potential_conditions.join(', ') || result.explanation.substring(0, 50) + "..."
        );

        setBookingStatus('confirmed');
    } catch (e) {
        console.error(e);
        setBookingStatus('error');
        setBookingMessage("Failed to book appointment.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
  };

  // Filter Logic
  const filteredDoctors = result.recommended_doctors.filter(doctor => {
    const dist = parseFloat(doctor.distance.replace(' km', ''));
    return doctor.rating >= minRating && dist <= maxDistance;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 animate-fade-in relative">
      
      {/* High Urgency Prominent Banner */}
      {result.urgency === 'High' && (
        <div className="mb-8 bg-red-600 rounded-xl shadow-xl p-6 text-white flex flex-col md:flex-row items-start md:items-center gap-6 animate-pulse border-2 border-red-700">
            <div className="bg-white/20 p-3 rounded-full flex-shrink-0">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <div>
                <h2 className="text-2xl font-bold uppercase tracking-wide">Emergency Warning</h2>
                <p className="font-medium mt-1 text-red-50 text-lg">
                    Your symptoms suggest a potentially life-threatening condition. 
                    <br className="hidden md:block" />
                    <span className="font-bold text-white underline decoration-2 underline-offset-2">Please call emergency services (911) immediately</span> or proceed to the nearest emergency room.
                </p>
            </div>
        </div>
      )}

      {/* Header / Summary */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Analysis Results</h1>
        
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Recommended Specialist</h2>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-extrabold text-medical-700">{result.specialist}</span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium text-sm border border-slate-200">
                  {result.match_score}% Confidence
                </span>
              </div>
            </div>

            {/* Potential Conditions */}
            {result.potential_conditions && result.potential_conditions.length > 0 && (
               <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Potential Conditions</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.potential_conditions.map((cond, idx) => (
                      <span key={idx} className="px-3 py-1 bg-amber-50 text-amber-800 text-sm font-medium rounded-md border border-amber-100">
                        {cond}
                      </span>
                    ))}
                  </div>
               </div>
            )}

            <div className="pt-2">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Analysis</h3>
                <p className="text-slate-700 leading-relaxed text-lg bg-slate-50 p-4 rounded-lg border border-slate-100 whitespace-pre-wrap">
                  {result.explanation}
                </p>
            </div>
            
            {/* Treatment Recommendation Section */}
            {result.recommended_treatment_type && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
                    <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wider mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        Treatment Approach
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-3">
                         <span className="px-3 py-1 bg-blue-600 text-white font-bold rounded shadow-sm text-sm">
                            {result.recommended_treatment_type}
                         </span>
                         <span className="text-sm text-blue-900 italic">Recommended for best/fastest results</span>
                    </div>
                    <p className="text-blue-800 text-sm leading-relaxed">
                        {result.treatment_reasoning}
                    </p>
                </div>
            )}
          </div>

          <div className="flex flex-col justify-center items-start md:items-center md:border-l md:border-slate-100 md:pl-8">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Urgency Level</span>
            <span className={`px-8 py-3 rounded-full text-2xl font-bold border ${urgencyColor} shadow-sm`}>
              {result.urgency}
            </span>
            <div className="mt-8 bg-slate-50 p-4 rounded-lg text-sm text-slate-500">
                <p className="font-semibold mb-1">Disclaimer</p>
                MediMatch AI is a tool. Always consult a real doctor.
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Matched Doctors</h2>
        <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600 font-medium">Min Rating:</label>
                <select 
                    value={minRating} 
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="border border-slate-300 rounded-md text-sm py-1 px-2 focus:ring-medical-500 focus:border-medical-500"
                >
                    <option value="0">Any</option>
                    <option value="4">4.0+</option>
                    <option value="4.5">4.5+</option>
                    <option value="4.8">4.8+</option>
                </select>
            </div>
            <div className="flex items-center gap-2">
                 <label className="text-sm text-slate-600 font-medium">Max Dist:</label>
                 <select
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(Number(e.target.value))}
                    className="border border-slate-300 rounded-md text-sm py-1 px-2 focus:ring-medical-500 focus:border-medical-500"
                 >
                     <option value="50">Any</option>
                     <option value="2">2 km</option>
                     <option value="5">5 km</option>
                     <option value="10">10 km</option>
                 </select>
            </div>
        </div>
      </div>

      {/* Doctor List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="p-6 flex-grow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <img 
                      src={doctor.imageUrl} 
                      alt={doctor.name} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-slate-50 mr-4 shadow-sm"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{doctor.name}</h3>
                      <p className="text-medical-600 font-medium text-sm">{doctor.specialization}</p>
                    </div>
                  </div>
                  {doctor.compatibility_score && (
                      <div className="flex flex-col items-end">
                         <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                             doctor.compatibility_score > 85 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                         }`}>
                             {doctor.compatibility_score}% Match
                         </span>
                      </div>
                  )}
                </div>

                <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                    {doctor.bio}
                </p>

                {/* Specialties Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {doctor.specialties.map((spec, i) => (
                        <span key={i} className="text-xs bg-slate-50 text-slate-600 px-2 py-1 rounded border border-slate-100">
                            {spec}
                        </span>
                    ))}
                </div>

                <div className="flex items-center justify-between text-sm text-slate-500 mt-auto">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-bold text-slate-700">{doctor.rating}</span>
                    <span className="mx-1">•</span>
                    <span>{doctor.experience}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {doctor.distance}
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
                <button 
                  onClick={() => handleBookClick(doctor)}
                  className="w-full bg-medical-600 text-white py-2 rounded-lg font-medium hover:bg-medical-700 transition-colors shadow-sm"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <p className="text-slate-500">No doctors found matching your filters.</p>
            <button 
                onClick={() => { setMinRating(0); setMaxDistance(50); }}
                className="mt-2 text-medical-600 font-medium hover:underline"
            >
                Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {isModalOpen && selectedDoctor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                
                {bookingStatus === 'confirmed' ? (
                     <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h3>
                        <p className="text-slate-600 mb-6">
                            You have successfully booked an appointment with <span className="font-semibold">{selectedDoctor.name}</span>.
                            <br/><br/>
                            This will appear in the doctor's dashboard.
                        </p>
                        <button 
                            onClick={closeModal}
                            className="w-full py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="bg-medical-600 p-6 text-white">
                            <h3 className="text-xl font-bold">Confirm Appointment</h3>
                            <p className="text-medical-100 text-sm mt-1">Please review details before booking.</p>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center mb-6">
                                <img src={selectedDoctor.imageUrl} alt={selectedDoctor.name} className="w-16 h-16 rounded-full border-2 border-slate-100 shadow-sm mr-4" />
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900">{selectedDoctor.name}</h4>
                                    <p className="text-medical-600 font-medium">{selectedDoctor.specialization}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Patient</span>
                                    <span className="font-medium text-slate-800">{user?.name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Date</span>
                                    <span className="font-medium text-slate-800">Tomorrow, 10:00 AM</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Location</span>
                                    <span className="font-medium text-slate-800">{selectedDoctor.distance} away</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Consultation Fee</span>
                                    <span className="font-medium text-slate-800">$50.00</span>
                                </div>
                            </div>

                            {bookingStatus === 'error' && (
                                <div className="mb-4 text-center text-red-600 text-sm">
                                    {bookingMessage}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button 
                                    onClick={closeModal}
                                    className="flex-1 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmBooking}
                                    disabled={bookingStatus === 'processing'}
                                    className="flex-1 py-3 bg-medical-600 text-white font-semibold rounded-xl hover:bg-medical-700 transition-colors shadow-md disabled:opacity-70 flex justify-center items-center"
                                >
                                    {bookingStatus === 'processing' ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        'Confirm Booking'
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Results;