import React from 'react';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">About MediMatch AI</h1>
        
        <div className="prose prose-slate prose-lg text-slate-600">
          <p className="lead">
            MediMatch AI leverages advanced Generative AI to bridge the gap between patient symptoms and specialist care.
          </p>
          
          <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">How it works</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Input:</strong> You describe your symptoms in plain text or upload an image of a visible condition.</li>
            <li><strong>Processing:</strong> Google's Gemini 2.5 Flash model analyzes the data, using medical knowledge to infer possible conditions and urgency.</li>
            <li><strong>Matching:</strong> The system identifies the correct medical specialization (e.g., Dermatologist, Cardiologist) and cross-references it with our database of providers.</li>
            <li><strong>Result:</strong> You receive a triaged report and a list of local, highly-rated specialists.</li>
          </ul>

          <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">Privacy & Ethics</h3>
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-800">
              <strong>Data Privacy:</strong> Analysis is performed statelessly. We do not store your personal health information after the session ends.
            </p>
            <p className="text-sm text-blue-800 mt-3">
              <strong>Ethical AI:</strong> This tool is an assistant, not a doctor. It uses probabilistic modeling to suggest specializations. It does not provide definitive medical diagnoses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;