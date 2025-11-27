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
        if (user.role !== 'doctor') return <NotFound />; // Or access denied page
        return <DoctorDashboard />;
    }

    if (path === '/' || path === '') {
      // If doctor logs in and goes home, maybe suggest dashboard?
      return <Landing />;
    } else if (path === '/analyze') {
      return <SymptomInput setAnalysisResult={setAnalysisResult} navigate={navigate} />;
    } else if (path === '/results') {
      return <Results result={analysisResult} navigate={navigate} />;
    } else if (path === '/about') {
      return <About />;
    } else if (path === '/login' || path === '/register') {
      // Redirect to home if already logged in
      if (user) {
         if (user.role === 'doctor') return <DoctorDashboard />;
         return <Landing />; 
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