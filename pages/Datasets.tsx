import React, { useEffect, useState } from 'react';
import { getAllCustomers, retrainModel } from '../services/churnService';
import { Customer } from '../types';
import { Database, Download, RefreshCw, FileSpreadsheet, Server, CheckCircle } from 'lucide-react';
import { Loader } from '../components/ui/Loader';
import { useCurrency } from '../context/CurrencyContext';

const Datasets: React.FC = () => {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    getAllCustomers().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const handleRetrain = async () => {
    setRetraining(true);
    try {
        const res = await retrainModel();
        alert(`Model successfully retrained. Accuracy: ${(res.accuracy * 100).toFixed(1)}%`);
    } catch (err) {
        alert("Failed to retrain model. Please upload a dataset first.");
    } finally {
        setRetraining(false);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader /></div>;

  return (
    <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-6">
            <div>
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Database className="text-brand-red" /> Data Lake
                </h2>
                <p className="text-gray-400">Manage training datasets and model parameters.</p>
            </div>
            <div className="flex gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors border border-white/10">
                    <Download size={16} /> Export CSV
                </button>
                <button 
                    onClick={handleRetrain}
                    disabled={retraining}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-red hover:bg-red-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={16} className={retraining ? "animate-spin" : ""} />
                    {retraining ? "Retraining..." : "Retrain Model"}
                </button>
            </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-white/10 flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-500">
                    <FileSpreadsheet size={20} />
                </div>
                <div>
                    <div className="text-xs text-gray-500 uppercase font-bold">Total Records</div>
                    <div className="text-xl font-bold text-white">{data.length}</div>
                </div>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-white/10 flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-500">
                    <Server size={20} />
                </div>
                <div>
                    <div className="text-xs text-gray-500 uppercase font-bold">Size</div>
                    <div className="text-xl font-bold text-white">45.2 KB</div>
                </div>
            </div>
             <div className="glass-panel p-4 rounded-xl border border-white/10 flex items-center gap-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center text-green-500">
                    <CheckCircle size={20} />
                </div>
                <div>
                    <div className="text-xs text-gray-500 uppercase font-bold">Data Quality</div>
                    <div className="text-xl font-bold text-white">99.8%</div>
                </div>
            </div>
             <div className="glass-panel p-4 rounded-xl border border-white/10 flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-red/20 rounded-lg flex items-center justify-center text-brand-red">
                    <RefreshCw size={20} />
                </div>
                <div>
                    <div className="text-xs text-gray-500 uppercase font-bold">Last Update</div>
                    <div className="text-xl font-bold text-white">2m ago</div>
                </div>
            </div>
        </div>

        {/* Data Grid */}
        <div className="glass-panel rounded-xl overflow-hidden border border-white/10">
            <div className="px-6 py-4 border-b border-white/10 bg-black/40">
                <h3 className="font-mono text-sm text-gray-400">SOURCE: telecom_churn_v2.csv</h3>
            </div>
            <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-left border-collapse text-sm font-mono">
                    <thead className="sticky top-0 bg-[#0a0a0a] z-10">
                        <tr className="text-gray-500 border-b border-white/10">
                            <th className="p-4 font-normal">ID</th>
                            <th className="p-4 font-normal">Tenure</th>
                            <th className="p-4 font-normal">Monthly</th>
                            <th className="p-4 font-normal">Contract</th>
                            <th className="p-4 font-normal">Issue</th>
                            <th className="p-4 font-normal">Plan</th>
                            <th className="p-4 font-normal">LTV</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {data.map((row) => (
                            <tr key={row.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 text-brand-red">{row.id}</td>
                                <td className="p-4 text-gray-300">{row.tenureMonths}</td>
                                <td className="p-4 text-gray-300">{formatCurrency(row.monthlyBill)}</td>
                                <td className="p-4 text-gray-300">{row.contract}</td>
                                <td className="p-4">
                                    <span className={row.paymentIssue ? "text-red-500" : "text-green-500 opacity-50"}>
                                        {String(row.paymentIssue)}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-300">{row.plan}</td>
                                <td className="p-4 text-gray-300">{formatCurrency(row.totalSpend)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default Datasets;