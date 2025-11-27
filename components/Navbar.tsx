import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="#/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-medical-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-medical-200 group-hover:scale-105 transition-transform">
              +
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">
              MediMatch <span className="text-medical-500">AI</span>
            </span>
          </a>

          {/* Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#/" className="text-sm font-medium text-slate-600 hover:text-medical-600 transition-colors">Home</a>
            <a href="#/about" className="text-sm font-medium text-slate-600 hover:text-medical-600 transition-colors">About</a>
            
            {user?.role === 'doctor' && (
                <a href="#/doctor-dashboard" className="text-sm font-bold text-medical-700 hover:text-medical-800 transition-colors">
                    Doctor Dashboard
                </a>
            )}

            {user?.role !== 'doctor' && (
                <a 
                href="#/analyze" 
                className="px-4 py-2 text-sm font-medium text-white bg-medical-600 rounded-full hover:bg-medical-700 transition-colors shadow-md hover:shadow-lg"
                >
                Check Symptoms
                </a>
            )}

            {user ? (
                <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
                    <span className="text-sm text-slate-600">Hi, <span className="font-semibold">{user.name}</span></span>
                    <button onClick={logout} className="text-sm font-medium text-slate-400 hover:text-red-500 transition-colors">
                        Logout
                    </button>
                </div>
            ) : (
                <a href="#/login" className="text-sm font-bold text-slate-600 hover:text-medical-600 ml-4">
                    Login / Sign Up
                </a>
            )}
          </div>

          {/* Mobile Menu Icon (simplified) */}
          <div className="md:hidden">
            <button className="text-slate-500 hover:text-medical-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;