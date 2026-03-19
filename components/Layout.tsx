import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, LogOut, Activity, Database } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isPublicPage = location.pathname === '/' || location.pathname === '/login';

  const isActive = (path: string) => {
    return location.pathname === path 
      ? 'text-brand-red border-r-2 border-brand-red bg-white/5' 
      : 'text-gray-400 hover:text-white hover:bg-white/5';
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      
      {/* Dynamic Background matching reference image */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Deep dark red/purple nebula gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#450a0a] via-[#0f0f0f] to-black opacity-80" />
        
        {/* Simulated Stars */}
        <div className="absolute top-10 left-20 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse" />
        <div className="absolute top-40 right-40 w-1 h-1 bg-white rounded-full opacity-40 animate-pulse delay-700" />
        <div className="absolute bottom-20 left-1/3 w-1 h-1 bg-white rounded-full opacity-50 animate-pulse delay-300" />
        
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>

      {!isPublicPage && (
        <aside className="w-64 flex-shrink-0 border-r border-white/10 bg-black/40 backdrop-blur-md flex flex-col relative z-20">
          <div className="p-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-red to-red-900 rounded flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(229,9,20,0.6)] text-white">
                  CS
              </div>
            <h1 className="text-xl font-bold tracking-wide text-white">CHURN<span className="text-brand-red">SHIELD</span></h1>
          </div>

          <nav className="flex-1 mt-6 px-3 space-y-2">
            <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all ${isActive('/dashboard')}`}>
              <LayoutDashboard size={20} />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link to="/predict" className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all ${isActive('/predict')}`}>
              <Activity size={20} />
              <span className="font-medium">Prediction Engine</span>
            </Link>
             <Link to="/datasets" className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all ${isActive('/datasets')}`}>
              <Database size={20} />
              <span className="font-medium">Datasets</span>
            </Link>
             <Link to="/reports" className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all ${isActive('/reports')}`}>
              <FileText size={20} />
              <span className="font-medium">Reports</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-white/10">
             <Link to="/" className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-brand-red transition-colors w-full mt-2">
              <LogOut size={20} />
              <span>Sign Out</span>
            </Link>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className={`${!isPublicPage ? 'p-8 max-w-7xl mx-auto' : 'w-full h-full'}`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;