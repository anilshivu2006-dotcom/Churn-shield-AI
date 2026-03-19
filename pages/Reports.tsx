import React, { useState } from 'react';
import { FileText, Download, Printer, Plus, Calendar, BarChart2, ShieldAlert, Check, Loader2 } from 'lucide-react';

interface Report {
    id: string;
    title: string;
    type: 'Executive' | 'Risk Analysis' | 'Campaign ROI';
    date: string;
    status: 'Ready' | 'Generating';
    size: string;
}

const Reports: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([
        { id: 'R-1024', title: 'Monthly Churn Forecast - Oct 2024', type: 'Executive', date: 'Oct 01, 2024', status: 'Ready', size: '2.4 MB' },
        { id: 'R-1023', title: 'Q3 Retention Campaign Performance', type: 'Campaign ROI', date: 'Sep 30, 2024', status: 'Ready', size: '4.1 MB' },
        { id: 'R-1022', title: 'High Risk Customer Segment Analysis', type: 'Risk Analysis', date: 'Sep 28, 2024', status: 'Ready', size: '1.8 MB' },
        { id: 'R-1021', title: 'Weekly Churn Digest', type: 'Executive', date: 'Sep 24, 2024', status: 'Ready', size: '0.9 MB' },
        { id: 'R-1020', title: 'Competitor Impact Study', type: 'Executive', date: 'Sep 15, 2024', status: 'Ready', size: '3.2 MB' },
    ]);

    const [isGenerating, setIsGenerating] = useState(false);

    const generateReport = () => {
        setIsGenerating(true);
        const newReport: Report = {
            id: `R-${Math.floor(Math.random() * 10000)}`,
            title: 'On-Demand Risk Assessment',
            type: 'Risk Analysis',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'Generating',
            size: '...'
        };
        
        setReports([newReport, ...reports]);

        // Simulate backend generation
        setTimeout(() => {
            setReports(prev => prev.map(r => 
                r.id === newReport.id ? { ...r, status: 'Ready', size: '1.5 MB' } : r
            ));
            setIsGenerating(false);
        }, 3000);
    };

    return (
        <div className="space-y-8 animate-fade-in">
             {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <FileText className="text-brand-red" /> Intelligence Reports
                    </h2>
                    <p className="text-gray-400">Executive summaries and deep-dive analysis documents.</p>
                </div>
                <button 
                    onClick={generateReport}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-red hover:bg-red-700 rounded-lg text-white font-bold transition-all shadow-[0_0_20px_rgba(229,9,20,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    {isGenerating ? 'Compiling Data...' : 'Generate New Report'}
                </button>
            </div>

            {/* Report Types Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-xl border border-white/10 relative overflow-hidden group hover:border-brand-red/30 transition-colors cursor-pointer">
                    <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <BarChart2 size={100} />
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-500 mb-4">
                        <BarChart2 size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Executive Summaries</h3>
                    <p className="text-gray-400 text-sm">High-level KPIs, churn trends, and monthly revenue impact forecasts.</p>
                </div>

                <div className="glass-panel p-6 rounded-xl border border-white/10 relative overflow-hidden group hover:border-brand-red/30 transition-colors cursor-pointer">
                    <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ShieldAlert size={100} />
                    </div>
                    <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center text-red-500 mb-4">
                        <ShieldAlert size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Risk Audits</h3>
                    <p className="text-gray-400 text-sm">Detailed lists of high-probability churners and key risk factors.</p>
                </div>

                 <div className="glass-panel p-6 rounded-xl border border-white/10 relative overflow-hidden group hover:border-brand-red/30 transition-colors cursor-pointer">
                    <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Check size={100} />
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center text-green-500 mb-4">
                        <Check size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Campaign ROI</h3>
                    <p className="text-gray-400 text-sm">Performance tracking of retention emails, discounts, and offers.</p>
                </div>
            </div>

            {/* Reports List */}
            <div className="glass-panel rounded-xl overflow-hidden border border-white/10">
                <div className="px-6 py-4 border-b border-white/10 bg-black/40 flex justify-between items-center">
                    <h3 className="font-bold text-white">Recent Documents</h3>
                    <div className="flex gap-2 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-white/5 rounded cursor-pointer hover:text-white">All</span>
                        <span className="px-2 py-1 bg-white/5 rounded cursor-pointer hover:text-white">Executive</span>
                        <span className="px-2 py-1 bg-white/5 rounded cursor-pointer hover:text-white">Analysis</span>
                    </div>
                </div>
                
                <div className="divide-y divide-white/5">
                    {reports.map((report) => (
                        <div key={report.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-zinc-900 rounded-lg border border-white/5 text-gray-400 group-hover:text-brand-red group-hover:border-brand-red/30 transition-colors">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium group-hover:text-brand-red transition-colors">{report.title}</h4>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {report.date}</span>
                                        <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                        <span>{report.type}</span>
                                        <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                        <span>{report.size}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {report.status === 'Generating' ? (
                                    <span className="text-xs font-mono text-brand-red animate-pulse">GENERATING...</span>
                                ) : (
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors" title="Print">
                                            <Printer size={18} />
                                        </button>
                                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium text-white flex items-center gap-2 transition-colors">
                                            <Download size={16} /> Download
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default Reports;