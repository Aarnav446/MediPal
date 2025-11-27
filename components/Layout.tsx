import React, { ReactNode } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} MediMatch AI. For demonstration purposes only.</p>
          <p className="mt-2 text-xs text-slate-400">
            Not a real medical device. In case of emergency, call your local emergency number immediately.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;