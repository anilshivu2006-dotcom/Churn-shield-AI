import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { fetchDashboardMetrics, uploadDataset } from '../services/churnService';
import { DashboardMetrics } from '../types';
import { TrendingUp, TrendingDown, IndianRupee, Users, AlertTriangle, Activity, Upload } from 'lucide-react';
import { Loader } from '../components/ui/Loader';
import { useCurrency } from '../context/CurrencyContext';

const formatNumber = (num: number) => {
  return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num;
};

const getChurnRateColorClass = (rate: number) => {
  if (rate > 20) return 'text-brand-red drop-shadow-[0_0_10px_rgba(229,9,20,0.5)]';
  if (rate > 10) return 'text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]';
  return 'text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]';
};

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { formatCurrency } = useCurrency();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const res = await uploadDataset(file);
        const data = await fetchDashboardMetrics();
        setMetrics(data);
        alert(`Successfully uploaded ${file.name}. Model accuracy: ${(res.accuracy * 100).toFixed(1)}%`);
      } catch (err) {
        alert("Failed to upload dataset or train model.");
      } finally {
        setUploading(false);
      }
    }
  };

  useEffect(() => {
    fetchDashboardMetrics().then(data => {
      setMetrics(data);
      setLoading(false);
    });
  }, []);

  if (loading || !metrics) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
             Executive Dashboard
          </h2>
          <p className="text-gray-400">Real-time churn monitoring and risk analysis.</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="text-sm text-gray-500 font-mono">LIVE DATA STREAM • UPDATED JUST NOW</div>
          <div>
            <input 
              type="file" 
              id="dashboard-upload" 
              className="hidden" 
              accept=".csv,.xlsx,.xls" 
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <label 
              htmlFor="dashboard-upload"
              className={`flex items-center justify-center gap-2 px-4 py-2 bg-brand-red hover:bg-red-700 shadow-[0_0_15px_rgba(229,9,20,0.3)] hover:shadow-[0_0_20px_rgba(229,9,20,0.5)] rounded-lg text-sm font-bold transition-all border border-transparent cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <Upload size={16} className={uploading ? "animate-bounce" : ""} /> 
              {uploading ? "Uploading..." : "Upload Dataset"}
            </label>
          </div>
        </div>
      </header>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-brand-red/30 transition-colors">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle size={80} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-brand-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Churn Rate</p>
          <div className="mt-2 flex items-baseline gap-3 relative z-10">
            <h3 className={`text-5xl font-black tracking-tighter ${getChurnRateColorClass(metrics ? metrics.currentChurnRate : 0)}`}>
                {metrics ? metrics.currentChurnRate : 0}<span className="text-2xl text-gray-500 ml-1">%</span>
            </h3>
            <span className="text-brand-red text-sm flex items-center font-bold bg-brand-red/10 px-2 py-1 rounded">
              <TrendingUp size={14} className="mr-1" /> +1.2%
            </span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-yellow-500/30 transition-colors">
           <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <IndianRupee size={80} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Revenue at Risk</p>
          <div className="mt-2 flex items-baseline gap-3 relative z-10">
            <h3 className="text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                {formatCurrency(metrics ? metrics.revenueAtRisk : 0, true)}
            </h3>
             <span className="text-yellow-500 text-sm font-bold bg-yellow-500/10 px-2 py-1 rounded">Monthly</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-green-500/30 transition-colors">
           <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={80} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Active Subs</p>
          <div className="mt-2 flex items-baseline gap-3 relative z-10">
            <h3 className="text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                {formatNumber(metrics ? metrics.activeSubscribers : 0)}
            </h3>
            <span className="text-green-500 text-sm flex items-center font-bold bg-green-500/10 px-2 py-1 rounded">
              <TrendingDown size={14} className="mr-1" /> Stable
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        {/* Trend Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col border border-white/10 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6 relative z-10">
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <Activity size={18} className="text-brand-red" /> 6-Month Churn Trend
             </h3>
             <select className="bg-black/30 border border-white/10 text-xs text-gray-300 rounded px-2 py-1 outline-none focus:border-brand-red">
                 <option>All Regions</option>
                 <option>North America</option>
                 <option>Europe</option>
             </select>
          </div>
          
          <div className="flex-1 w-full min-h-0 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.churnTrend}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E50914" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#E50914" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#525252" tick={{fill: '#6b7280', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#525252" tick={{fill: '#6b7280', fontSize: 12}} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(20, 20, 20, 0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', backdropFilter: 'blur(4px)' }}
                  itemStyle={{ color: '#E50914' }}
                  cursor={{ stroke: '#E50914', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#E50914" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorRate)" 
                    style={{ filter: 'drop-shadow(0 0 10px rgba(229, 9, 20, 0.4))' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col border border-white/10">
          <h3 className="text-lg font-bold text-white mb-2">Customer Health</h3>
          <div className="flex-1 w-full min-h-0 relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.riskDistribution}
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={5}
                  >
                    {metrics.riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0 0 8px ${entry.color}40)` }} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ backgroundColor: '#141414', border: '1px solid #333', borderRadius: '8px' }}
                  />
                </PieChart>
             </ResponsiveContainer>
             {/* Center Text */}
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black text-white">{formatNumber(metrics ? metrics.activeSubscribers : 0)}</span>
                <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">Total Subs</span>
             </div>
          </div>
          <div className="mt-4 space-y-3">
            {metrics.riskDistribution.map(item => (
              <div key={item.name} className="flex items-center justify-between text-sm p-2 rounded hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-[0_0_8px]" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }}></div>
                  <span className="text-gray-300 font-medium">{item.name}</span>
                </div>
                <span className="font-mono text-white font-bold">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Retention Strategies Bar */}
       <div className="glass-panel p-8 rounded-2xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-6">Retention Campaign Efficiency</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {['Discount Offers', 'Curated Emails', 'Push Notifications'].map((strategy, i) => (
               <div key={i} className="space-y-3">
                  <div className="flex justify-between text-sm">
                      <span className="text-gray-300 font-medium">{strategy}</span>
                      <span className="text-white font-bold">{60 + i * 12}%</span>
                  </div>
                  <div className="h-3 w-full bg-gray-900 rounded-full overflow-hidden border border-white/5">
                     <div 
                        className="h-full bg-gradient-to-r from-brand-red/50 to-brand-red shadow-[0_0_10px_rgba(229,9,20,0.4)]" 
                        style={{ width: `${60 + i * 12}%`, transition: 'width 1s ease-out' }}
                     ></div>
                  </div>
               </div>
             ))}
          </div>
       </div>

    </div>
  );
};

export default Dashboard;