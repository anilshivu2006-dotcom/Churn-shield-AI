import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, BarChart3, Users, Zap, ArrowRight, Lock } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-red/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full relative z-10">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-red to-red-900 rounded-lg flex items-center justify-center font-bold text-white shadow-lg border border-white/10">CS</div>
            <span className="text-2xl font-bold tracking-wider text-white">CHURN<span className="text-brand-red">SHIELD</span></span>
        </div>
        <Link to="/login" className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition-all backdrop-blur-md flex items-center gap-2">
          <Lock size={16} /> Sign In
        </Link>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs font-bold tracking-widest uppercase mb-8 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-brand-red"></span> AI-Powered Retention v2.0
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-white drop-shadow-2xl">
          PREDICT <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red via-red-500 to-white animate-gradient-x">RETENTION</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mb-12 leading-relaxed">
          Stop guessing. Start knowing. Our deep learning engine identifies at-risk customers 
          <span className="text-white font-bold"> before they leave</span>.
        </p>
        
        <div className="flex flex-col md:flex-row gap-6">
            <Link to="/login" className="group px-8 py-4 bg-brand-red hover:bg-red-600 text-white text-lg font-bold rounded-lg flex items-center gap-3 transition-all shadow-[0_0_40px_rgba(229,9,20,0.4)] hover:shadow-[0_0_60px_rgba(229,9,20,0.6)] transform hover:-translate-y-1">
            <Zap className="text-white fill-current" />
            Launch Console
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-8 py-4 bg-transparent border border-white/20 hover:bg-white/5 text-white text-lg font-bold rounded-lg transition-all">
                View Documentation
            </button>
        </div>
      </div>

      {/* Features Stripe */}
      <div className="py-24 border-t border-white/5 bg-black/60 backdrop-blur-lg relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
              { icon: BarChart3, title: 'Real-time Analytics', desc: 'Monitor active subscribers and revenue at risk instantly.' },
              { icon: Shield, title: 'Prediction Engine', desc: '98% accuracy in forecasting customer churn probability.' },
              { icon: Users, title: 'Automated Actions', desc: 'Deploy retention campaigns automatically via API.' }
          ].map((feature, i) => (
            <div key={i} className="p-8 glass-panel rounded-2xl border border-white/5 hover:border-brand-red/30 transition-all group hover:-translate-y-2 duration-300">
                <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-red/20 transition-colors">
                    <feature.icon className="text-gray-300 group-hover:text-brand-red transition-colors" size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
      
      <footer className="p-8 text-center border-t border-white/5 bg-black text-gray-600 text-sm relative z-10">
        <div className="flex justify-center items-center gap-8 mb-4">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Status</a>
        </div>
        © 2024 ChurnShield AI. Built for the future of SaaS.
      </footer>
    </div>
  );
};

export default Landing;