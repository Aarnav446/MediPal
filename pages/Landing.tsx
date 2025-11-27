import React from 'react';

const Landing: React.FC = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-medical-100 rounded-full blur-3xl opacity-50 -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8 animate-fade-in-up">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-medical-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-medical-500"></span>
          </span>
          <span className="text-sm font-medium text-slate-600">AI-Powered Health Triage</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
          Find the Right <span className="text-medical-600">Specialist</span> <br className="hidden md:block"/> Instantly.
        </h1>
        
        <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-600 mb-10">
          Describe your symptoms in your own words, or upload a photo. 
          Our AI analyzes your condition and matches you with top-rated local specialists in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="#/analyze" 
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all duration-200 bg-medical-600 rounded-full hover:bg-medical-700 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-600"
          >
            Start Symptom Check
            <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a 
            href="#/about" 
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-700 transition-all duration-200 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:text-medical-600 focus:outline-none"
          >
            How it Works
          </a>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Analysis</h3>
            <p className="text-slate-600">Advanced NLP understands your natural language description of symptoms.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-medical-100 text-medical-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Visual Diagnosis</h3>
            <p className="text-slate-600">Upload photos of visible symptoms like rashes for more accurate triage.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Local Matching</h3>
            <p className="text-slate-600">Instantly connect with the best rated doctors in your vicinity.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;