import React, { useState, useEffect } from 'react';
import { getContract } from '../utils/web3';
import { Scale, Search, RefreshCw, LogOut } from 'lucide-react';
import CaseDetails from '../components/CaseDetails';

export default function JudgeDashboard({ account }) {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCaseId, setSelectedCaseId] = useState(null);

    const contract = getContract();

    const loadMyCases = async () => {
        try {
            setLoading(true);
            if (!contract) return;

            const counter = await contract.methods.caseCounter().call();
            const loadedCases = [];

            for (let i = 1; i <= Number(counter); i++) {
                const result = await contract.methods.getCase(i).call();
                // Check if judge is assigned to this case
                if (result.judge.toLowerCase() === account.toLowerCase()) {
                    loadedCases.push({
                        caseId: Number(result.caseId_),
                        description: result.description,
                        isResolved: result.isResolved,
                        resolution: result.resolution
                    });
                }
            }
            setCases(loadedCases);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to load your assigned cases.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMyCases();
    }, [contract, account]);

    if (selectedCaseId) {
        return (
            <div className="min-h-screen p-6 md:p-12 text-slate-100 max-w-5xl mx-auto">
                <CaseDetails
                    caseId={selectedCaseId}
                    account={account}
                    isJudge={true}
                    onBack={() => setSelectedCaseId(null)}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 md:p-12 text-slate-100">
            <div className="max-w-7xl mx-auto space-y-8">

                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-700/50 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3"><Scale className="text-green-400" /> Judge Dashboard</h1>
                        <p className="text-slate-400 mt-1 text-sm">Account: <span className="font-mono bg-slate-800/80 px-2 py-0.5 rounded text-green-300">{account}</span></p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={loadMyCases} className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-sm font-medium rounded-xl flex items-center gap-2 border border-slate-700 transition-colors">
                            <RefreshCw size={16} /> Refresh
                        </button>
                        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-xl flex items-center gap-2 border border-red-500/20 transition-colors">
                            <LogOut size={16} /> Disconnect
                        </button>
                    </div>
                </header>

                {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="glass-card p-6 rounded-2xl overflow-hidden mt-8">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 border-b border-slate-700/50 pb-4"><Search size={20} className="text-green-400" /> My Presiding Cases</h2>

                    {loading ? (
                        <div className="py-12 flex justify-center"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div></div>
                    ) : cases.length === 0 ? (
                        <div className="py-16 text-center text-slate-500 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                            <p className="text-lg mb-2">No active cases</p>
                            <p className="text-sm">You have not been assigned to preside over any cases yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cases.map((c) => (
                                <div
                                    key={c.caseId}
                                    onClick={() => setSelectedCaseId(c.caseId)}
                                    className="bg-slate-800/50 border border-slate-700/50 hover:border-green-500/50 hover:bg-slate-800 transition-all cursor-pointer p-5 rounded-2xl group flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-lg font-bold font-mono text-green-300 group-hover:text-green-400 transition-colors">#{c.caseId}</span>
                                            <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${c.isResolved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                                {c.isResolved ? 'Closed' : 'Active'}
                                            </span>
                                        </div>
                                        <p className="text-slate-300 text-sm line-clamp-3 mb-4">{c.description}</p>
                                    </div>
                                    <div className="pt-4 border-t border-slate-700/50 text-right text-xs text-blue-400 font-medium group-hover:text-blue-300 transition-colors flex items-center justify-end gap-1">
                                        Open Case Details <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
