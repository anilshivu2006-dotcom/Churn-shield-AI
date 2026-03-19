import React, { useState, useEffect } from 'react';
import { searchCustomers, predictChurnForCustomer } from '../services/churnService';
import { Customer, ChurnPrediction } from '../types';
import { Search, ChevronRight, Zap, Activity, Users, Check, TrendingDown, Eye, Tv, Mail, Tag, ThumbsUp, ArrowLeft } from 'lucide-react';
import { Loader } from '../components/ui/Loader';
import { useCurrency } from '../context/CurrencyContext';

const SinglePrediction: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [prediction, setPrediction] = useState<ChurnPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [actionTaken, setActionTaken] = useState<string | null>(null);
  const { formatCurrency } = useCurrency();
  
  // Animation state for the score
  const [displayedScore, setDisplayedScore] = useState(0);

  // Load initial data
  useEffect(() => {
    handleSearch(null); 
  }, []);

  // Animate score when prediction arrives
  useEffect(() => {
    if (prediction) {
      setDisplayedScore(0);
      let start = 0;
      const end = prediction.churnProbability;
      const duration = 1000;
      const incrementTime = 10;
      const step = end / (duration / incrementTime);

      const timer = setInterval(() => {
        start += step;
        if (start >= end) {
          setDisplayedScore(end);
          clearInterval(timer);
        } else {
          setDisplayedScore(Math.floor(start));
        }
      }, incrementTime);
      return () => clearInterval(timer);
    }
  }, [prediction]);

  const handleSearch = async (e: React.FormEvent | null) => {
    if (e) e.preventDefault();
    setLoading(true);
    const data = await searchCustomers(query);
    setResults(data);
    setLoading(false);
    if (e) {
      setSelectedCustomer(null);
      setPrediction(null);
    }
  };

  const handleSelectCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setAnalyzing(true);
    setActionTaken(null);
    try {
        const pred = await predictChurnForCustomer(customer.id);
        setPrediction(pred);
    } catch (err) {
        alert("Failed to analyze customer.");
        setSelectedCustomer(null);
    } finally {
        setAnalyzing(false);
    }
  };

  const executeAction = () => {
    setActionTaken("Re-Engagement Campaign");
    setTimeout(() => setActionTaken(null), 3000);
  };
  
  const getRiskColorClasses = (score: number) => {
    if (score >= 66) return 'text-brand-red border-brand-red bg-red-500/10 shadow-[0_0_20px_rgba(229,9,20,0.2)]';
    if (score >= 33) return 'text-yellow-500 border-yellow-500 bg-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,0.2)]';
    return 'text-green-500 border-green-500 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.2)]';
  };

  const getStrokeColor = (score: number) => {
    if (score >= 66) return '#E50914';
    if (score >= 33) return '#eab308';
    return '#22c55e';
  };

  // Gauge constants
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 20;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight flex items-center gap-2">
            <Activity className="text-brand-red animate-pulse" /> Prediction Engine
          </h2>
          <p className="text-gray-400">Select a customer node to initiate behavioral inference.</p>
        </div>
        
        {/* Search Bar */}
        <div className="w-full md:w-96 group">
          <div className="absolute inset-y-0 -inset-x-4 bg-brand-red/20 blur-xl opacity-0 group-hover:opacity-20 transition-opacity rounded-full"></div>
          <form onSubmit={handleSearch} className="relative z-10">
            <input
              type="text"
              placeholder="Search Customer ID..."
              className="w-full bg-black/60 border border-white/20 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all placeholder-gray-600 shadow-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-brand-red transition-colors" size={20} />
          </form>
        </div>
      </div>

      {analyzing ? (
        <div className="h-96 flex flex-col items-center justify-center glass-panel rounded-xl border border-white/10 relative overflow-hidden">
           <div className="absolute inset-0 bg-brand-red/5 animate-pulse"></div>
           <Loader />
           <h3 className="mt-8 text-2xl font-bold text-white tracking-widest uppercase">Analyzing</h3>
           <p className="text-brand-red font-mono mt-2">Processing {selectedCustomer?.id} data points...</p>
           <div className="mt-8 w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
             <div className="h-full bg-brand-red w-1/2 animate-[shimmer_1s_infinite_linear]"></div>
           </div>
        </div>
      ) : selectedCustomer && prediction ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          
          {/* Back Button */}
          <div className="lg:col-span-12">
            <button 
                type="button"
                onClick={() => { setSelectedCustomer(null); setPrediction(null); setActionTaken(null); }}
                className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer relative z-50"
            >
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-brand-red group-hover:border-brand-red group-hover:text-white transition-all shadow-lg">
                    <ArrowLeft size={18} />
                </div>
                <span className="text-sm font-semibold tracking-wide">Return to Database</span>
            </button>
          </div>

          {/* Left Column: Churn Gauge & Profile */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Holographic Gauge Card - UPDATED */}
            <div className="glass-panel p-8 rounded-2xl border border-white/10 relative overflow-hidden group flex flex-col items-center justify-center min-h-[400px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/20 blur-[60px] rounded-full pointer-events-none"></div>
                
                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-[0.2em] mb-8 text-center z-10">Churn Probability</h3>
                
                <div className="relative flex items-center justify-center">
                     {/* Glow effect behind */}
                     <div className={`absolute inset-0 blur-2xl rounded-full scale-90 transition-colors duration-1000 ${prediction.churnProbability >= 66 ? 'bg-brand-red/20' : prediction.churnProbability >= 33 ? 'bg-yellow-500/20' : 'bg-green-500/20'}`}></div>
                     
                     <svg className="w-64 h-64 transform -rotate-90 overflow-visible" viewBox="0 0 256 256">
                        {/* Background Track */}
                        <circle cx="128" cy="128" r={radius} stroke="#1a1a1a" strokeWidth={strokeWidth} fill="transparent" strokeLinecap="round" />
                        {/* Progress */}
                        <circle cx="128" cy="128" r={radius}
                            stroke={getStrokeColor(prediction.churnProbability)}
                            strokeWidth={strokeWidth}
                            fill="transparent" 
                            strokeDasharray={circumference} 
                            strokeDashoffset={circumference - (circumference * displayedScore) / 100} 
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                            style={{ filter: `drop-shadow(0 0 10px ${getStrokeColor(prediction.churnProbability)}80)` }}
                        />
                    </svg>
                    
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-7xl font-black text-white tracking-tighter drop-shadow-2xl flex items-start leading-none">
                            {displayedScore}<span className="text-3xl text-gray-500 mt-1 ml-1 font-bold">%</span>
                        </span>
                        <div className={`mt-4 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all duration-300 ${getRiskColorClasses(prediction.churnProbability)}`}>
                            {prediction.riskLevel} Risk
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Passport */}
            <div className="glass-panel p-0 rounded-2xl border border-white/10 overflow-hidden">
               <div className="p-6 bg-gradient-to-b from-white/5 to-transparent">
                   <div className="flex items-center gap-4">
                     <div className="relative">
                        <img src={selectedCustomer.avatarUrl} className="w-16 h-16 rounded-full border-2 border-white/10 shadow-xl" alt="Avatar" />
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#141414] ${selectedCustomer.paymentIssue ? 'bg-red-500' : 'bg-green-500'}`}></div>
                     </div>
                     <div>
                       <h3 className="text-xl font-bold text-white">{selectedCustomer.name}</h3>
                       <p className="text-gray-500 text-xs font-mono">{selectedCustomer.id}</p>
                     </div>
                   </div>
               </div>
               
               <div className="p-6 space-y-4 pt-2">
                 <div className="grid grid-cols-2 gap-3">
                     <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                        <div className="text-xs text-gray-500 mb-1">Monthly Bill</div>
                        <div className="text-white font-mono font-bold">{formatCurrency(selectedCustomer.monthlyBill)}</div>
                     </div>
                     <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                        <div className="text-xs text-gray-500 mb-1">Lifetime Value</div>
                        <div className="text-white font-mono font-bold text-brand-red">{formatCurrency(selectedCustomer.totalSpend)}</div>
                     </div>
                 </div>
                 
                 <div className="flex justify-between items-center py-3 border-t border-white/5">
                    <span className="text-sm text-gray-400">Current Plan</span>
                    <span className="text-sm font-bold text-white bg-white/10 px-2 py-0.5 rounded">{selectedCustomer.contract}</span>
                 </div>
                  <div className="flex justify-between items-center py-3 border-t border-white/5">
                    <span className="text-sm text-gray-400">Tenure</span>
                    <span className="text-sm font-bold text-white">{selectedCustomer.tenureMonths} Months</span>
                 </div>
               </div>
            </div>
          </div>

          {/* Right Column: High Churn Risk Insights (Redesigned) */}
          <div className="lg:col-span-8 space-y-8">
             <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-300">High Churn Risk Insights</h3>
                <div className="h-px bg-white/10 flex-1"></div>
                <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse"></div>
            </div>

            {/* Main Insights Card */}
            <div className="relative rounded-3xl overflow-hidden p-8 border border-white/10 shadow-[0_0_50px_rgba(229,9,20,0.1)] group">
                {/* Nebula Background */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-color-dodge"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#2a0a0a] via-[#141414] to-black opacity-95"></div>
                <div className="absolute right-0 top-0 w-2/3 h-full bg-gradient-to-l from-brand-red/10 to-transparent pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-8">
                             <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center border border-white/20 shadow-lg">
                                <Users className="text-gray-300" size={28} />
                             </div>
                             <div>
                                <h4 className="text-xl font-bold text-white leading-tight">Overall User Group Behavior <br/> Indicated High Churn Risk</h4>
                             </div>
                        </div>

                        <div className="space-y-5">
                            <div className="flex gap-4 items-start group/item">
                                <div className="mt-1 bg-brand-red rounded-full p-0.5 flex-shrink-0 shadow-[0_0_10px_rgba(229,9,20,0.5)]">
                                    <Check size={12} className="text-white" strokeWidth={3} />
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed group-hover/item:text-white transition-colors">
                                    Users disengaged after completing <span className="text-white font-bold">Stranger Things</span>.
                                </p>
                            </div>
                            <div className="flex gap-4 items-start group/item">
                                <div className="mt-0.5 bg-white/5 rounded-md p-1 flex-shrink-0 border border-white/10">
                                    <TrendingDown size={14} className="text-gray-400" />
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed group-hover/item:text-white transition-colors">
                                    Engagement dropped by <span className="text-brand-red font-bold text-base">35%</span> after last completed series.
                                </p>
                            </div>
                             <div className="flex gap-4 items-start group/item">
                                <div className="mt-0.5 bg-white/5 rounded-md p-1 flex-shrink-0 border border-white/10">
                                    <Eye size={14} className="text-gray-400" />
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed group-hover/item:text-white transition-colors">
                                    Frequency of browsing decreased by <span className="text-brand-red font-bold text-base">27%</span>.
                                </p>
                            </div>
                             <div className="flex gap-4 items-start group/item">
                                <div className="mt-0.5 bg-white/5 rounded-md p-1 flex-shrink-0 border border-white/10">
                                    <Tv size={14} className="text-gray-400" />
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed group-hover/item:text-white transition-colors">
                                    Spike in competitor streaming service activity detected.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Visuals */}
                    <div className="w-full md:w-72 flex flex-col justify-between pt-4">
                         <div className="flex flex-col items-end mb-6">
                            <div className="flex -space-x-3 mb-2">
                                {[1,2,3,4].map(i => (
                                    <img key={i} src={`https://i.pravatar.cc/150?u=group_${i}`} className="w-10 h-10 rounded-full border-2 border-[#1a0a0a] shadow-lg" alt="" />
                                ))}
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mr-1">Seating 4</span>
                         </div>
                         
                         <div className="relative rounded-lg overflow-hidden border border-white/20 shadow-2xl group cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop" className="w-full h-32 object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" alt="Stranger Things" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                             <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                <div className="w-2 h-2 bg-brand-red rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold text-white tracking-wide">LAST WATCHED</span>
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Recommendations Section */}
            <div>
                <h4 className="text-gray-400 mb-5 text-sm font-medium">Recommend similar dark, sci-fi series</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                        { title: 'MANIFEST', img: 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?auto=format&fit=crop&q=80&w=600' },
                        { title: 'DARK', img: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?auto=format&fit=crop&q=80&w=600' },
                        { title: 'THE OA', img: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=600' },
                        { title: 'dark tourist', img: 'https://images.unsplash.com/photo-1455620611406-966ca68105b2?auto=format&fit=crop&q=80&w=600' }
                    ].map((item, i) => (
                        <div key={i} className="aspect-[2/3] relative rounded-lg overflow-hidden group cursor-pointer border border-white/10 hover:border-brand-red transition-all shadow-lg hover:shadow-[0_0_20px_rgba(229,9,20,0.3)] hover:-translate-y-1 duration-300">
                            <img src={item.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" alt={item.title} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 group-hover:opacity-80 transition-opacity"></div>
                            <div className="absolute bottom-4 left-0 right-0 text-center px-2">
                                <span className="text-white font-black text-lg uppercase tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none">{item.title}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={executeAction}
                    className="w-full py-5 bg-gradient-to-r from-red-900 via-[#E50914] to-red-900 hover:from-red-800 hover:to-red-800 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(229,9,20,0.3)] hover:shadow-[0_0_50px_rgba(229,9,20,0.5)] transition-all transform hover:scale-[1.01] active:scale-[0.99] uppercase tracking-widest text-sm flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                    <span className="relative z-10">Send Re-Engagement Emails</span>
                </button>
            </div>

            {/* Retention Strategies List (New) */}
            <div className="bg-[#0f0f0f] rounded-2xl border border-white/10 p-6 shadow-2xl">
                <h4 className="text-gray-400 mb-4 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    Retention Strategies <div className="h-px bg-white/10 flex-1"></div>
                </h4>
                <div className="space-y-4">
                     {/* Strategy 1 */}
                     <div className="flex items-center gap-4 group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors" onClick={() => setActionTaken('Email Campaign')}>
                         <div className="w-12 h-12 rounded-lg bg-[#2a1a1a] border border-red-500/20 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(220,38,38,0.1)]">
                             <Mail size={20} />
                         </div>
                         <div className="flex-1">
                             <h5 className="text-white font-bold group-hover:text-red-400 transition-colors">Email Campaign</h5>
                             <p className="text-gray-500 text-sm">We Miss You message to re-engage the customer</p>
                         </div>
                         <div className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                             <ChevronRight className="text-gray-500" size={18} />
                         </div>
                     </div>
                     
                     {/* Divider */}
                     <div className="h-px bg-white/5 w-full mx-auto"></div>

                     {/* Strategy 2 */}
                     <div className="flex items-center gap-4 group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors" onClick={() => setActionTaken('Personalized Discounts')}>
                         <div className="w-12 h-12 rounded-lg bg-[#2a2010] border border-orange-500/20 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(234,88,12,0.1)]">
                             <Tag size={20} />
                         </div>
                         <div className="flex-1">
                             <h5 className="text-white font-bold group-hover:text-orange-400 transition-colors">Personalized Discounts</h5>
                             <p className="text-gray-500 text-sm">Exclusive discounts suggested</p>
                         </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                             <ChevronRight className="text-gray-500" size={18} />
                         </div>
                     </div>

                     {/* Divider */}
                     <div className="h-px bg-white/5 w-full mx-auto"></div>

                     {/* Strategy 3 */}
                     <div className="flex items-center gap-4 group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors" onClick={() => setActionTaken('Content Recommendations')}>
                         <div className="w-12 h-12 rounded-lg bg-[#1a202a] border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                             <ThumbsUp size={20} />
                         </div>
                         <div className="flex-1">
                             <h5 className="text-white font-bold group-hover:text-blue-400 transition-colors">Content Recommendations</h5>
                             <p className="text-gray-500 text-sm">Suggest trending shows</p>
                         </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                             <ChevronRight className="text-gray-500" size={18} />
                         </div>
                     </div>
                </div>
            </div>

          </div>
        </div>
      ) : (
        /* Customer Selection Table */
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/40 border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="p-5 font-semibold">Customer Identity</th>
                  <th className="p-5 font-semibold">Plan Details</th>
                  <th className="p-5 font-semibold">Monthly</th>
                  <th className="p-5 font-semibold">Tenure</th>
                  <th className="p-5 font-semibold text-center">Payment Status</th>
                  <th className="p-5 font-semibold text-right">Prediction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {results.map((customer) => (
                  <tr key={customer.id} className="hover:bg-white/[0.03] transition-colors group cursor-pointer" onClick={() => handleSelectCustomer(customer)}>
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                            <img src={customer.avatarUrl} alt="" className="w-10 h-10 rounded-full bg-zinc-800 object-cover" />
                            <div className="absolute inset-0 rounded-full ring-2 ring-white/10 group-hover:ring-brand-red/50 transition-all"></div>
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-brand-red transition-colors">{customer.name}</div>
                          <div className="text-xs text-gray-500 font-mono">{customer.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`px-2.5 py-1 rounded text-xs font-medium border ${
                        customer.contract === 'Monthly' 
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' 
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {customer.contract}
                      </span>
                    </td>
                    <td className="p-5 text-gray-300 font-mono text-sm">{formatCurrency(customer.monthlyBill)}</td>
                    <td className="p-5">
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gray-500" style={{ width: `${Math.min(customer.tenureMonths, 100)}%` }}></div>
                            </div>
                            <span className="text-xs text-gray-500">{customer.tenureMonths}m</span>
                        </div>
                    </td>
                    <td className="p-5 text-center">
                        {customer.paymentIssue ? (
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                                <Zap size={12} /> Issue
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
                                <Check size={12} /> No Issues
                            </div>
                        )}
                    </td>
                    <td className="p-5 text-right">
                      <button 
                        className="bg-white/5 hover:bg-brand-red hover:text-white text-gray-300 text-xs font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2 ml-auto"
                      >
                        Analyze <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {results.length === 0 && !loading && (
                <div className="p-12 text-center text-gray-500">
                    <p className="text-lg">No customers matching query found.</p>
                    <p className="text-sm mt-2">Try searching for "Monthly" or specific ID.</p>
                </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {actionTaken && (
          <div className="fixed bottom-10 right-10 z-50 animate-[slideIn_0.5s_ease-out]">
              <div className="bg-[#141414] border-l-4 border-brand-red text-white px-6 py-4 rounded-r shadow-[0_0_50px_rgba(0,0,0,0.8)] flex items-center gap-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-red/10 to-transparent pointer-events-none"></div>
                  <div className="bg-brand-red rounded-full p-1">
                    <Check size={20} className="text-white" />
                  </div>
                  <div>
                      <p className="font-bold text-sm uppercase tracking-wide">Action Initiated</p>
                      <p className="text-sm text-gray-400 mt-0.5">"{actionTaken}" has been queued.</p>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default SinglePrediction;