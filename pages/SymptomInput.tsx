import React, { useState } from 'react';
import { analyzeSymptomsWithGemini } from '../services/geminiService';
import { AnalysisResult } from '../types';

interface SymptomInputProps {
  setAnalysisResult: (result: AnalysisResult) => void;
  navigate: (path: string) => void;
}

type ImageStatus = 'idle' | 'uploading' | 'processing' | 'ready' | 'error';

const SymptomInput: React.FC<SymptomInputProps> = ({ setAnalysisResult, navigate }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageStatus, setImageStatus] = useState<ImageStatus>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageStatus('uploading');
      setError('');
      
      // Step 1: Simulate Upload
      setTimeout(() => {
        setImageStatus('processing');
        
        // Step 2: Read and Process
        const reader = new FileReader();
        reader.onloadend = () => {
          // Simulate a brief processing/validation step
          setTimeout(() => {
            setImage(file);
            setImagePreview(reader.result as string);
            setImageStatus('ready');
          }, 800);
        };
        reader.onerror = () => {
          setError('Failed to process image');
          setImageStatus('error');
        };
        reader.readAsDataURL(file);
      }, 600);
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

  const renderImageState = () => {
    switch (imageStatus) {
      case 'uploading':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-bounce mb-3 text-medical-500">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
            <p className="text-sm font-medium text-slate-600">Uploading image...</p>
          </div>
        );
      case 'processing':
        return (
           <div className="flex flex-col items-center justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-medical-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm font-medium text-slate-600">Analyzing image quality...</p>
          </div>
        );
      case 'ready':
        return (
          <div className="relative inline-block animate-fade-in">
            <img 
              src={imagePreview!} 
              alt="Preview" 
              className="max-h-48 rounded-lg shadow-sm border border-slate-200" 
            />
            <div className="absolute top-2 right-2 flex gap-2">
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow font-bold tracking-wide flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  READY
                </span>
                <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    setImage(null);
                    setImagePreview(null);
                    setImageStatus('idle');
                }}
                className="bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"
                >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center py-8 text-red-500">
             <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             <p className="text-sm">Error processing image</p>
             <button onClick={() => setImageStatus('idle')} className="text-xs underline mt-2">Try Again</button>
          </div>
        );
      default: // idle
        return (
          <>
            <svg className="mx-auto h-12 w-12 text-slate-400 group-hover:text-medical-400 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48">
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
        );
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
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-all relative ${imageStatus === 'idle' ? 'border-slate-300 hover:bg-slate-50 hover:border-medical-300' : 'border-medical-200 bg-slate-50'}`}>
              <div className="space-y-1 text-center w-full">
                {renderImageState()}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 animate-fade-in flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {error}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || imageStatus === 'uploading' || imageStatus === 'processing'}
              className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-md text-lg font-medium text-white bg-medical-600 hover:bg-medical-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-500 transition-all ${loading || imageStatus === 'uploading' || imageStatus === 'processing' ? 'opacity-75 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Running AI Analysis...
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