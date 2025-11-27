
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  navigate: (path: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ navigate }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  
  // Verification State
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingUser, setPendingUser] = useState<{name: string, email: string, pass: string, role: 'patient'|'doctor'} | null>(null);

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
        
        // Handle explicit admin redirect
        if (email.toLowerCase() === 'admin@gmail.com') {
            navigate('/admin-dashboard');
        } else {
            navigate('/'); 
        }

      } else {
        // Start verification flow
        setPendingUser({ name, email, pass: password, role });
        setLoading(false);
        setShowVerification(true);
      }
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      
      // Simulate code check (accept '123456')
      if (verificationCode === '123456') {
          try {
              if (pendingUser) {
                  await register(pendingUser.name, pendingUser.email, pendingUser.pass, pendingUser.role);
                  navigate('/');
              }
          } catch (err) {
              setError((err as Error).message);
              setShowVerification(false);
          } finally {
              setLoading(false);
          }
      } else {
          setError("Invalid verification code. Use 123456 for demo.");
          setLoading(false);
      }
  };

  // Demo credentials helper
  const fillDemo = (type: 'patient' | 'doctor' | 'admin') => {
    if (type === 'patient') {
        setEmail('patient@demo.com');
        setPassword('password');
        setRole('patient');
    } else if (type === 'doctor') {
        setEmail('kavita.sharma@medimatch.com');
        setPassword('password');
        setRole('doctor');
    } else {
        setEmail('admin@gmail.com');
        setPassword('password');
    }
    setIsLogin(true);
  };

  // Verification Modal
  if (showVerification) {
      return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center animate-fade-in">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify your Email</h2>
                <p className="text-slate-500 mb-6">We've sent a 6-digit code to <strong>{pendingUser?.email}</strong>. Please enter it below.</p>
                
                <form onSubmit={handleVerify}>
                    <input 
                        type="text" 
                        maxLength={6}
                        className="w-full text-center text-3xl font-bold tracking-widest px-4 py-4 border-2 border-slate-300 rounded-lg focus:border-medical-600 focus:outline-none mb-6"
                        placeholder="000000"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                    />
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 bg-medical-600 text-white rounded-lg font-bold hover:bg-medical-700 shadow-lg"
                    >
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>
                    <div className="mt-4">
                        <span className="text-slate-400 text-sm">Didn't receive code? </span>
                        <button type="button" className="text-medical-600 font-bold text-sm hover:underline">Resend</button>
                    </div>
                    <div className="mt-6 border-t pt-4">
                         <button type="button" onClick={() => setShowVerification(false)} className="text-slate-400 hover:text-slate-600 text-sm">Cancel</button>
                    </div>
                </form>
                <div className="mt-4 bg-yellow-50 text-yellow-800 text-xs p-2 rounded">
                    Demo Hint: Enter code <b>123456</b>
                </div>
            </div>
        </div>
      );
  }

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
                      <button type="button" onClick={() => fillDemo('doctor')} className="hover:text-medical-600 underline">Doctor (Kavita)</button>
                      <span>|</span>
                      <button type="button" onClick={() => fillDemo('admin')} className="hover:text-medical-600 underline">Admin</button>
                  </div>
              </div>
          )}

        </form>
      </div>
    </div>
  );
};

export default AuthPage;
