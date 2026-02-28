import React, { useState, useEffect } from 'react';
import { getContract } from '../utils/web3';
import { PlusCircle, Search, Users, Scale, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminDashboard({ account }) {
    const [cases, setCases] = useState([]);
    const [availableAccounts, setAvailableAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Forms
    const [newCaseDesc, setNewCaseDesc] = useState('');
    const [judgeAddress, setJudgeAddress] = useState('');
    const [judgeCaseId, setJudgeCaseId] = useState('');
    const [advocateAddress, setAdvocateAddress] = useState('');
    const [advocateCaseId, setAdvocateCaseId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const contract = getContract();

    const loadCases = async () => {
        try {
            setLoading(true);
            if (!contract) return;

            const counter = await contract.methods.caseCounter().call();
            const loadedCases = [];

            for (let i = 1; i <= Number(counter); i++) {
                const result = await contract.methods.getCase(i).call();
                loadedCases.push({
                    caseId: Number(result.caseId_),
                    description: result.description,
                    advocate1: result.advocate1,
                    advocate2: result.advocate2,
                    judge: result.judge,
                    isResolved: result.isResolved,
                    resolution: result.resolution,
                    judgeApprovals: Number(result.judgeApprovals),
                    judgeRejections: Number(result.judgeRejections)
                });
            }
            setCases(loadedCases);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to load cases.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadAccounts = async () => {
            try {
                // Connect to Ganache directly to fetch ALL local accounts
                const Web3 = (await import('web3')).default;
                const readOnlyWeb3 = new Web3("http://127.0.0.1:7545");
                const ganacheAccounts = await readOnlyWeb3.eth.getAccounts();
                setAvailableAccounts(ganacheAccounts.filter(a => a.toLowerCase() !== account.toLowerCase()));
            } catch (err) {
                console.error("Failed to load Ganache accounts", err);
            }
        };
        loadAccounts();
        loadCases();
    }, [contract, account]);

    const handleSubmitCase = async (e) => {
        e.preventDefault();
        if (!newCaseDesc) return;
        setIsSubmitting(true);
        try {
            await contract.methods.submitCase(newCaseDesc).send({ from: account });
            setNewCaseDesc('');
            loadCases();
        } catch (err) {
            console.error(err);
            setError('Failed to submit case.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddJudge = async (e) => {
        e.preventDefault();
        if (!judgeAddress || !judgeCaseId) return;
        setIsSubmitting(true);
        try {
            // Check if the judge is already an advocate for this case
            const caseData = await contract.methods.getCase(Number(judgeCaseId)).call();
            if (caseData.advocate1.toLowerCase() === judgeAddress.toLowerCase() ||
                caseData.advocate2.toLowerCase() === judgeAddress.toLowerCase()) {
                setError('This user is already an Advocate for this case. You cannot assign them as a Judge.');
                return;
            }

            await contract.methods.addJudge(judgeAddress, Number(judgeCaseId)).send({ from: account });
            setJudgeAddress('');
            setJudgeCaseId('');
            loadCases();
        } catch (err) {
            console.error(err);
            setError('Failed to add judge. Ensure case ID is valid and judge not already assigned.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddAdvocate = async (e) => {
        e.preventDefault();
        if (!advocateAddress || !advocateCaseId) return;
        setIsSubmitting(true);
        try {
            const caseData = await contract.methods.getCase(Number(advocateCaseId)).call();

            // Check if user is the judge of the case
            if (caseData.judge.toLowerCase() === advocateAddress.toLowerCase()) {
                setError('This user is the Judge for this case. You cannot assign them as an Advocate.');
                return;
            }

            // Check for duplicate advocate assignment
            if (caseData.advocate1.toLowerCase() === advocateAddress.toLowerCase() ||
                caseData.advocate2.toLowerCase() === advocateAddress.toLowerCase()) {
                setError('This lawyer is already assigned to this case. Please select a different lawyer.');
                return;
            }

            await contract.methods.addAdvocate(advocateAddress, Number(advocateCaseId)).send({ from: account });
            setAdvocateAddress('');
            setAdvocateCaseId('');
            loadCases();
        } catch (err) {
            console.error(err);
            setError('Failed to add advocate. Ensure the case is valid and max 2 advocates assigned.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-12 text-slate-100">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-700/50 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3"><Scale className="text-blue-500" /> Admin Dashboard</h1>
                        <p className="text-slate-400 mt-1 text-sm">Connected Address: <span className="font-mono bg-slate-800/80 px-2 py-0.5 rounded text-blue-300">{account}</span></p>
                    </div>
                    <button onClick={loadCases} className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-sm font-medium rounded-xl flex items-center gap-2 border border-slate-700 transition-colors">
                        <RefreshCw size={16} /> Refresh Data
                    </button>
                </header>

                {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Submit Case Card */}
                    <div className="glass-card p-6 rounded-2xl">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><PlusCircle size={20} className="text-blue-400" /> New Case</h2>
                        <form onSubmit={handleSubmitCase} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Case Description</label>
                                <textarea
                                    value={newCaseDesc}
                                    onChange={(e) => setNewCaseDesc(e.target.value)}
                                    placeholder="Enter details..."
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 transition-colors h-24 resize-none"
                                    required
                                />
                            </div>
                            <button disabled={isSubmitting} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                                Submit Case
                            </button>
                        </form>
                    </div>

                    {/* Add Judge Card */}
                    <div className="glass-card p-6 rounded-2xl">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Scale size={20} className="text-green-400" /> Assign Judge</h2>
                        <form onSubmit={handleAddJudge} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Case ID</label>
                                <input
                                    type="number"
                                    value={judgeCaseId}
                                    onChange={(e) => setJudgeCaseId(e.target.value)}
                                    placeholder="e.g. 1"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-green-500 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Judge Public Key</label>
                                <select
                                    value={judgeAddress}
                                    onChange={(e) => setJudgeAddress(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm font-mono focus:outline-none focus:border-green-500 transition-colors"
                                    required
                                >
                                    <option value="" disabled>Select a Judge</option>
                                    {availableAccounts.map(acc => (
                                        <option key={acc} value={acc}>{acc}</option>
                                    ))}
                                </select>
                            </div>
                            <button disabled={isSubmitting} className="w-full py-2.5 bg-green-600/90 hover:bg-green-500 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                                Assign Judge
                            </button>
                        </form>
                    </div>

                    {/* Add Advocate Card */}
                    <div className="glass-card p-6 rounded-2xl">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Users size={20} className="text-purple-400" /> Assign Lawyer</h2>
                        <form onSubmit={handleAddAdvocate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Case ID</label>
                                <input
                                    type="number"
                                    value={advocateCaseId}
                                    onChange={(e) => setAdvocateCaseId(e.target.value)}
                                    placeholder="e.g. 1"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Lawyer Public Key</label>
                                <select
                                    value={advocateAddress}
                                    onChange={(e) => setAdvocateAddress(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm font-mono focus:outline-none focus:border-purple-500 transition-colors"
                                    required
                                >
                                    <option value="" disabled>Select a Lawyer</option>
                                    {availableAccounts.map(acc => (
                                        <option key={acc} value={acc}>{acc}</option>
                                    ))}
                                </select>
                            </div>
                            <button disabled={isSubmitting} className="w-full py-2.5 bg-purple-600/90 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                                Assign Lawyer
                            </button>
                        </form>
                    </div>

                </div>

                {/* All Cases List */}
                <div className="glass-card p-6 rounded-2xl overflow-hidden mt-8">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 border-b border-slate-700/50 pb-4"><Search size={20} className="text-slate-400" /> All Cases Registry</h2>

                    {loading ? (
                        <div className="py-12 flex justify-center"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div></div>
                    ) : cases.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 text-sm">No cases found in the registry.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-slate-800/50 text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3 font-medium rounded-tl-lg">ID</th>
                                        <th className="px-4 py-3 font-medium">Description</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Judge</th>
                                        <th className="px-4 py-3 font-medium">Advocate 1</th>
                                        <th className="px-4 py-3 font-medium rounded-tr-lg">Advocate 2</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {cases.map((c) => (
                                        <tr key={c.caseId} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-4 py-4 font-bold text-white">#{c.caseId}</td>
                                            <td className="px-4 py-4 truncate max-w-[200px]" title={c.description}>{c.description}</td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.isResolved ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'}`}>
                                                    {c.isResolved ? c.resolution || 'Resolved' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 font-mono text-xs text-slate-400">
                                                {c.judge !== '0x0000000000000000000000000000000000000000' ? (
                                                    <span className="text-blue-300">{c.judge.slice(0, 6)}...{c.judge.slice(-4)}</span>
                                                ) : <span className="text-slate-600">Unassigned</span>}
                                            </td>
                                            <td className="px-4 py-4 font-mono text-xs text-slate-400">
                                                {c.advocate1 !== '0x0000000000000000000000000000000000000000' ? (
                                                    <span className="text-purple-300">{c.advocate1.slice(0, 6)}...{c.advocate1.slice(-4)}</span>
                                                ) : <span className="text-slate-600">Unassigned</span>}
                                            </td>
                                            <td className="px-4 py-4 font-mono text-xs text-slate-400">
                                                {c.advocate2 !== '0x0000000000000000000000000000000000000000' ? (
                                                    <span className="text-purple-300">{c.advocate2.slice(0, 6)}...{c.advocate2.slice(-4)}</span>
                                                ) : <span className="text-slate-600">Unassigned</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
