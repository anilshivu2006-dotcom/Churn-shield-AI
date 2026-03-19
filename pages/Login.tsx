import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel p-8 md:p-12 rounded-xl w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-red to-transparent"></div>
        
        <h2 className="text-3xl font-bold mb-8 text-white">Sign In</h2>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <div className="bg-[#333] rounded overflow-hidden group focus-within:bg-[#454545] transition-colors">
                <input 
                  type="email" 
                  placeholder="Email or phone number" 
                  className="w-full bg-transparent border-none text-white px-5 py-4 focus:ring-0 outline-none placeholder-gray-400"
                  defaultValue="admin@churnshield.com"
                />
            </div>
          </div>
          
          <div>
             <div className="bg-[#333] rounded overflow-hidden group focus-within:bg-[#454545] transition-colors">
                <input 
                  type="password" 
                  placeholder="Password" 
                  className="w-full bg-transparent border-none text-white px-5 py-4 focus:ring-0 outline-none placeholder-gray-400"
                  defaultValue="password"
                />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-red hover:bg-red-700 text-white font-bold py-4 rounded transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>

          <div className="flex justify-between items-center text-sm text-gray-400 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded bg-gray-700 border-none text-brand-red focus:ring-0" />
              Remember me
            </label>
            <a href="#" className="hover:underline">Need help?</a>
          </div>
        </form>

        <div className="mt-8 text-gray-500 text-sm">
          New to ChurnShield? <a href="#" className="text-white hover:underline ml-1">Sign up now</a>.
        </div>
      </div>
    </div>
  );
};

export default Login;