import React from 'react';
import { AnalysisResult, Doctor } from '../types';

interface ResultsProps {
  result: AnalysisResult | null;
  navigate: (path: string) => void;
}

const Results: React.FC<ResultsProps> = ({ result, navigate }) => {
  if (!result) {
    // Redirect if no result exists (user landed here directly)
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      {/* Header / Summary */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Analysis Results</h1>
        
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Recommended Specialist</h2>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-extrabold text-medical-700">{result.specialist}</span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium text-sm border border-slate-200">
                {result.match_score}% Match
              </span>
            </div>
            <div className="pt-2">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Analysis</h3>
                <p className="text-slate-700 leading-relaxed text-lg">{result.explanation}</p>
            </div>
          </div>

          <div className="flex flex-col justify-center items-start md:items-center md:border-l md:border-slate-100 md:pl-8">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Urgency Level</span>
            <span className={`px-6 py-2 rounded-full text-xl font-bold border ${urgencyColor}`}>
              {result.urgency}
            </span>
            {result.urgency === 'High' && (
                <p className="mt-4 text-xs text-red-600 text-center max-w-xs font-medium">
                    Please seek immediate medical attention or call emergency services.
                </p>
            )}
          </div>
        </div>
      </div>

      {/* Doctor List */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span>Recommended Doctors</span>
            <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Nearby</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {result.recommended_doctors.map((doctor: Doctor) => (
            <div key={doctor.id} className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
              <div className="p-6 flex-grow">
                <div className="flex items-start justify-between mb-4">
                    <img src={doctor.imageUrl} alt={doctor.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100" />
                    <span className="flex items-center text-amber-500 font-bold text-sm bg-amber-50 px-2 py-1 rounded-md">
                        <svg className="w-4 h-4 mr-1 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        {doctor.rating}
                    </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900">{doctor.name}</h3>
                <p className="text-medical-600 font-medium text-sm mb-2">{doctor.specialization}</p>
                
                <div className="space-y-1 text-sm text-slate-500 mb-4">
                    <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {doctor.experience} Experience
                    </div>
                    <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {doctor.distance} away
                    </div>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <button className="w-full py-2 bg-white border border-medical-500 text-medical-600 font-semibold rounded-lg hover:bg-medical-50 transition-colors">
                      Book Appointment
                  </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
             <button 
                onClick={() => navigate('/analyze')}
                className="text-medical-600 hover:text-medical-800 font-medium hover:underline"
             >
                Start New Analysis
             </button>
        </div>
      </div>
    </div>
  );
};

export default Results;