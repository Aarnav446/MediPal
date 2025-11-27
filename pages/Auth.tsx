import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  navigate: (path: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ navigate }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/'); // Redirect to home/dashboard logic will happen in App.tsx or checking user role
      } else {
        await register(name, email, password, role);
        navigate('/');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Demo credentials helper
  const fillDemo = (type: 'patient' | 'doctor') => {
    if (type === 'patient') {
        setEmail('patient@demo.com');
        setPassword('password');
        setRole('patient');
    } else {
        setEmail('kavita.sharma@medimatch.com');
        setPassword('password');
        setRole('doctor');
    }
    setIsLogin(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-medical-600 p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-medical-100">
            {isLogin ? 'Login to access your dashboard' : 'Join MediMatch AI today'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button 
            className={`flex-1 py-4 text-sm font-medium transition-colors ${isLogin ? 'text-medical-600 border-b-2 border-medical-600 bg-slate-50' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={`flex-1 py-4 text-sm font-medium transition-colors ${!isLogin ? 'text-medical-600 border-b-2 border-medical-600 bg-slate-50' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          
          {/* Role Toggle for Register */}
          {!isLogin && (
             <div className="flex p-1 bg-slate-100 rounded-lg mb-4">
                <button
                    type="button"
                    onClick={() => setRole('patient')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'patient' ? 'bg-white text-medical-600 shadow-sm' : 'text-slate-500'}`}
                >
                    I am a Patient
                </button>
                <button
                    type="button"
                    onClick={() => setRole('doctor')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'doctor' ? 'bg-white text-medical-600 shadow-sm' : 'text-slate-500'}`}
                >
                    I am a Doctor
                </button>
             </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input 
                type="text" 
                required 
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required 
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              required 
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-medical-600 text-white rounded-lg font-bold hover:bg-medical-700 transition-all transform hover:scale-[1.02] shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
          </button>

          {isLogin && (
              <div className="mt-4 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
                  <p className="mb-2 font-semibold">Quick Demo Login:</p>
                  <div className="flex justify-center gap-2">
                      <button type="button" onClick={() => fillDemo('patient')} className="hover:text-medical-600 underline">Patient</button>
                      <span>|</span>
                      <button type="button" onClick={() => fillDemo('doctor')} className="hover:text-medical-600 underline">Doctor (Dr. Kavita)</button>
                  </div>
              </div>
          )}

        </form>
      </div>
    </div>
  );
};

export default AuthPage;