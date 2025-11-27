import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import SymptomInput from './pages/SymptomInput';
import Results from './pages/Results';
import About from './pages/About';
import NotFound from './pages/NotFound';
import AuthPage from './pages/Auth';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import { AnalysisResult } from './types';

const AppContent: React.FC = () => {
  const [route, setRoute] = useState<string>(window.location.hash || '#/');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = `#${path}`;
  };

  const renderContent = () => {
    const path = route.replace('#', '');

    // Doctor Route Guard
    if (path === '/doctor-dashboard') {
        if (!user) return <AuthPage navigate={navigate} />;
        if (user.role !== 'doctor') return <NotFound />; 
        return <DoctorDashboard />;
    }

    // Patient Dashboard Route Guard
    if (path === '/patient-dashboard') {
        if (!user) return <AuthPage navigate={navigate} />;
        if (user.role !== 'patient') return <NotFound />; 
        return <PatientDashboard />;
    }

    if (path === '/' || path === '') {
      if (user && user.role === 'doctor') return <DoctorDashboard />; // Redirect doctor to dash on home
      if (user && user.role === 'patient') return <PatientDashboard />; // Redirect patient to dash on home
      return <Landing />;
    } else if (path === '/analyze') {
      return <SymptomInput setAnalysisResult={setAnalysisResult} navigate={navigate} />;
    } else if (path === '/results') {
      return <Results result={analysisResult} navigate={navigate} />;
    } else if (path === '/about') {
      return <About />;
    } else if (path === '/login' || path === '/register') {
      // Redirect to dash if already logged in
      if (user) {
         if (user.role === 'doctor') return <DoctorDashboard />;
         return <PatientDashboard />; 
      }
      return <AuthPage navigate={navigate} />;
    } else {
      return <NotFound />;
    }
  };

  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;