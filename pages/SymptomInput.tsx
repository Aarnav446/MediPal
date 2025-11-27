import React, { useState } from 'react';
import { analyzeSymptomsWithGemini } from '../services/geminiService';
import { AnalysisResult } from '../types';

interface SymptomInputProps {
  setAnalysisResult: (result: AnalysisResult) => void;
  navigate: (path: string) => void;
}

const SymptomInput: React.FC<SymptomInputProps> = ({ setAnalysisResult, navigate }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text && !image) {
      setError('Please provide a description or an image.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await analyzeSymptomsWithGemini(text, image);
      setAnalysisResult(result);
      navigate('/results');
    } catch (err) {
      setError('Analysis failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-medical-600 px-6 py-8 sm:px-10">
          <h2 className="text-2xl font-bold text-white">Symptom Checker</h2>
          <p className="text-medical-100 mt-2">
            Describe what you're feeling. Our AI is ready to help.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
          {/* Text Input */}
          <div>
            <label htmlFor="symptoms" className="block text-sm font-semibold text-slate-700 mb-2">
              Describe your symptoms
            </label>
            <textarea
              id="symptoms"
              rows={5}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-medical-500 focus:ring-2 focus:ring-medical-200 transition-colors text-slate-700 placeholder-slate-400"
              placeholder="E.g., I have a sharp pain in my lower back that gets worse when I bend over..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {/* Image Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Upload a photo (optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg hover:bg-slate-50 transition-colors cursor-pointer relative">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-48 rounded-lg shadow-sm" 
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-slate-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-medical-600 hover:text-medical-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-medical-500">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-sm text-lg font-medium text-white bg-medical-600 hover:bg-medical-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-500 transition-all ${loading ? 'opacity-75 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Symptoms...
                </div>
              ) : (
                'Analyze with AI'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SymptomInput;