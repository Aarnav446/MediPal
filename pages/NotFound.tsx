import React from 'react';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-extrabold text-medical-200">404</h1>
      <h2 className="text-2xl font-bold text-slate-800 mt-4">Page Not Found</h2>
      <p className="text-slate-500 mt-2">The page you are looking for doesn't exist or has been moved.</p>
      <a href="#/" className="mt-8 px-6 py-3 bg-medical-600 text-white rounded-full font-medium hover:bg-medical-700 transition-colors">
        Go Back Home
      </a>
    </div>
  );
};

export default NotFound;