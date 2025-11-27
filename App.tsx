import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import SymptomInput from './pages/SymptomInput';
import Results from './pages/Results';
import About from './pages/About';
import NotFound from './pages/NotFound';
import { AnalysisResult } from './types';

const App: React.FC = () => {
  // Simple Hash Router Implementation
  const [route, setRoute] = useState<string>(window.location.hash || '#/');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

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
    // Normalize route (remove #)
    const path = route.replace('#', '');

    if (path === '/' || path === '') {
      return <Landing />;
    } else if (path === '/analyze') {
      return <SymptomInput setAnalysisResult={setAnalysisResult} navigate={navigate} />;
    } else if (path === '/results') {
      return <Results result={analysisResult} navigate={navigate} />;
    } else if (path === '/about') {
      return <About />;
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

export default App;