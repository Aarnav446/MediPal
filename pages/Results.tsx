import React, { useState } from 'react';
import { AnalysisResult, Doctor } from '../types';

interface ResultsProps {
  result: AnalysisResult | null;
  navigate: (path: string) => void;
}

const Results: React.FC<ResultsProps> = ({ result, navigate }) => {
  // Filters State
  const [minRating, setMinRating] = useState<number>(0);
  const [maxDistance, setMaxDistance] = useState<number>(10);
  
  // Modal State
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'processing' | 'confirmed'>('idle');

  if (!result) {
    // Redirect if no result exists
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
    setSelectedDoctor(doctor);
    setBookingStatus('idle');
    setIsModalOpen(true);
  };

  const confirmBooking = () => {
    setBookingStatus('processing');
    setTimeout(() => {
        setBookingStatus('confirmed');
    }, 1500);
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
          </div>

          <div className="flex flex-col justify-center items-start md:items-center md:border-l md:border-slate-100 md:pl-8">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Urgency Level</span>
            <span className={`px-8 py-3 rounded-full text-2xl font-bold border ${urgencyColor} shadow-sm`}>
              {result.urgency}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-8 flex flex-col sm:flex-row gap-6 items-center">
        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Filter Results:</span>
        
        <div className="flex items-center gap-2">
            <label htmlFor="rating" className="text-sm text-slate-600">Min Rating:</label>
            <select 
                id="rating" 
                value={minRating} 
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="text-sm border-slate-300 rounded-md focus:ring-medical-500 focus:border-medical-500"
            >
                <option value="0">Any</option>
                <option value="4">4.0+</option>
                <option value="4.5">4.5+</option>
                <option value="4.8">4.8+</option>
            </select>
        </div>

        <div className="flex items-center gap-2 flex-grow sm:max-w-xs">
            <label htmlFor="distance" className="text-sm text-slate-600 whitespace-nowrap">Max Distance: {maxDistance}km</label>
            <input 
                type="range" 
                id="distance" 
                min="1" 
                max="20" 
                step="0.5"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-medical-600"
            />
        </div>
      </div>

      {/* Doctor List */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span>Recommended Doctors</span>
            <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Sorted by Match</span>
        </h2>

        {filteredDoctors.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500">No doctors match your filters. Try adjusting the distance or rating.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor: Doctor) => (
                <div key={doctor.id} className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col">
                {/* Match Banner */}
                {doctor.compatibility_score && (
                    <div className={`py-1 px-4 text-xs font-bold text-center tracking-wide uppercase ${doctor.compatibility_score > 90 ? 'bg-medical-100 text-medical-700' : 'bg-slate-100 text-slate-600'}`}>
                        {doctor.compatibility_score}% Match for you
                    </div>
                )}
                
                <div className="p-6 flex-grow">
                    <div className="flex items-start justify-between mb-4">
                        <img src={doctor.imageUrl} alt={doctor.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100" />
                        <span className="flex items-center text-amber-500 font-bold text-sm bg-amber-50 px-2 py-1 rounded-md h-fit">
                            <svg className="w-4 h-4 mr-1 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                            {doctor.rating}
                        </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900">{doctor.name}</h3>
                    <p className="text-medical-600 font-medium text-sm mb-3">{doctor.specialization}</p>
                    
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2 min-h-[2.5em]">{doctor.bio}</p>

                    <div className="flex flex-wrap gap-1 mb-4">
                        {doctor.specialties.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded-sm">
                                {tag}
                            </span>
                        ))}
                    </div>
                    
                    <div className="space-y-1 text-sm text-slate-500 mt-auto pt-4 border-t border-slate-50">
                        <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            {doctor.experience} Experience
                        </div>
                        <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {doctor.distance} away
                        </div>
                    </div>
                </div>
                
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <button 
                        onClick={() => handleBookClick(doctor)}
                        className="w-full py-2 bg-white border border-medical-500 text-medical-600 font-semibold rounded-lg hover:bg-medical-50 transition-colors focus:ring-2 focus:ring-medical-200"
                    >
                        Book Appointment
                    </button>
                </div>
                </div>
            ))}
            </div>
        )}

        <div className="mt-12 text-center">
             <button 
                onClick={() => navigate('/analyze')}
                className="text-medical-600 hover:text-medical-800 font-medium hover:underline"
             >
                Start New Analysis
             </button>
        </div>
      </div>

      {/* Booking Modal */}
      {isModalOpen && selectedDoctor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
            
            {/* Modal Content */}
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative z-10 overflow-hidden animate-fade-in-up">
                
                {bookingStatus === 'confirmed' ? (
                     <div className="p-10 text-center">
                        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Booking Confirmed!</h3>
                        <p className="text-slate-600 mb-8">
                            Your appointment with <span className="font-semibold text-slate-900">{selectedDoctor.name}</span> is set for tomorrow at 10:00 AM.
                        </p>
                        <button onClick={closeModal} className="w-full py-4 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-lg">
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="bg-medical-600 p-8 text-white relative overflow-hidden">
                             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                            <h3 className="text-2xl font-bold relative z-10">Confirm Appointment</h3>
                            <p className="text-medical-100 text-sm mt-2 relative z-10">Please review the details below before proceeding.</p>
                        </div>
                        <div className="p-8">
                            <div className="flex items-start gap-5 mb-8">
                                <img src={selectedDoctor.imageUrl} alt={selectedDoctor.name} className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 shadow-md" />
                                <div>
                                    <h4 className="text-xl font-bold text-slate-800">{selectedDoctor.name}</h4>
                                    <p className="text-medical-600 font-semibold">{selectedDoctor.specialization}</p>
                                    <p className="text-xs text-slate-500 mt-1 flex items-center">
                                       <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                       {selectedDoctor.rating} Rating
                                    </p>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 mb-8 space-y-3 text-sm">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <span className="text-slate-500">Date & Time</span>
                                    <span className="font-semibold text-slate-800">Tomorrow, 10:00 AM</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <span className="text-slate-500">Location</span>
                                    <span className="font-semibold text-slate-800">{selectedDoctor.distance} away</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Consultation Fee</span>
                                    <span className="font-semibold text-slate-800">$50.00</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    onClick={closeModal}
                                    className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmBooking}
                                    disabled={bookingStatus === 'processing'}
                                    className="flex-[2] py-3.5 bg-medical-600 text-white font-semibold rounded-xl hover:bg-medical-700 transition-colors shadow-md hover:shadow-lg flex justify-center items-center"
                                >
                                    {bookingStatus === 'processing' ? (
                                        <div className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Booking...</span>
                                        </div>
                                    ) : (
                                        'Confirm Appointment'
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