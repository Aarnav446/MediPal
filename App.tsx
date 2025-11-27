
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import SymptomInput from './pages/SymptomInput';
import Results from './pages/Results';
import About from './pages/About';
import NotFound from './pages/NotFound';
import AuthPage from './pages/Auth';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DoctorOnboarding from './pages/DoctorOnboarding';
import Checkout from './pages/Checkout';
import { AnalysisResult } from './types';

const AppContent: React.FC = () => {
  const [route, setRoute] = useState<string>(window.location.hash || '#/');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => { window.location.hash = `#${path}`; };

  const renderContent = () => {
    const path = route.replace('#', '');

    if (path === '/doctor-dashboard') return user?.role === 'doctor' ? <DoctorDashboard /> : <AuthPage navigate={navigate} />;
    if (path === '/patient-dashboard') return user?.role === 'patient' ? <PatientDashboard /> : <AuthPage navigate={navigate} />;
    if (path === '/admin-dashboard') return <AdminDashboard />; // Open for demo

    if (path === '/' || path === '') {
      if (user?.role === 'doctor') return <DoctorDashboard />;
      if (user?.role === 'patient') return <PatientDashboard />;
      return <Landing />;
    }
    
    if (path === '/analyze') return <SymptomInput setAnalysisResult={setAnalysisResult} navigate={navigate} />;
    if (path === '/results') return <Results result={analysisResult} navigate={navigate} />;
    if (path === '/about') return <About />;
    if (path === '/join-doctor') return <DoctorOnboarding navigate={navigate} />;
    if (path === '/checkout') return <Checkout navigate={navigate} />;
    if (path === '/login' || path === '/register') return <AuthPage navigate={navigate} />;

    return <NotFound />;
  };

  return <Layout>{renderContent()}</Layout>;
};

const App: React.FC = () => {
    return (
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
    );
}

export default App;
