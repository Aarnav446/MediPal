
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <a href="#/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-medical-400 to-medical-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-medical-200/50 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-slate-900 tracking-tight leading-none">
                MediMatch
              </span>
              <span className="text-xs font-semibold text-medical-600 tracking-widest uppercase">AI Health</span>
            </div>
          </a>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-1">
            <a href="#/" className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-medical-600 transition-all">Home</a>
            <a href="#/about" className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-medical-600 transition-all">About</a>
            
            {(!user || user.role === 'patient') && (
                <a href="#/analyze" className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-medical-600 transition-all">
                    Symptom Checker
                </a>
            )}
            
            {!user && (
              <a href="#/join-doctor" className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-medical-600 transition-all">
                  For Doctors
              </a>
            )}

            {/* Admin Link for Demo Access */}
            <a href="#/admin-dashboard" className="px-4 py-2 text-sm font-medium text-slate-400 rounded-lg hover:bg-slate-50 hover:text-slate-600 transition-all">
                (Admin)
            </a>
          </div>

          {/* Right Action Section */}
          <div className="flex items-center gap-4">
            
            {/* Cart Icon */}
            {(!user || user.role === 'patient') && (
              <a href="#/checkout" className="relative p-2 text-slate-500 hover:text-medical-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                    {cart.length}
                  </span>
                )}
              </a>
            )}

            {user ? (
                <div className="flex items-center gap-4">
                    {user.role === 'doctor' ? (
                        <a href="#/doctor-dashboard" className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors border border-indigo-100">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                           Doctor Dashboard
                        </a>
                    ) : (
                        <a href="#/patient-dashboard" className="hidden md:flex items-center gap-2 px-4 py-2 bg-medical-50 text-medical-700 rounded-lg text-sm font-semibold hover:bg-medical-100 transition-colors border border-medical-100">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                           My Dashboard
                        </a>
                    )}

                    <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>

                    <div className="flex flex-col items-end mr-2">
                        <span className="text-xs text-slate-400 font-medium uppercase">{user.role}</span>
                        <span className="text-sm font-bold text-slate-800 leading-none">{user.name.split(' ')[0]}</span>
                    </div>

                    <button 
                        onClick={logout} 
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                        title="Logout"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    <a href="#/login" className="text-sm font-semibold text-slate-600 hover:text-medical-600 transition-colors">
                        Log In
                    </a>
                    <a href="#/register" className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-full hover:bg-slate-800 transition-all shadow-md hover:shadow-lg">
                        Sign Up
                    </a>
                </div>
            )}
            
             {/* Mobile Menu Icon */}
             <div className="md:hidden ml-2">
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
