import React, { useState, useEffect } from 'react';
import { getContract } from '../utils/web3';
import { MessageSquare, CheckCircle, XCircle, FileText, Send, Scale } from 'lucide-react';

export default function CaseDetails({ caseId, account, isJudge, onBack }) {
    const [caseInfo, setCaseInfo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const contract = getContract();

    const loadCaseData = async () => {
        try {
            setLoading(true);
            if (!contract) return;

            const result = await contract.methods.getCase(caseId).call();
            setCaseInfo({
                caseId: Number(result.caseId_),
                description: result.description,
                advocate1: result.advocate1.toLowerCase(),
                advocate2: result.advocate2.toLowerCase(),
                judge: result.judge.toLowerCase(),
                isResolved: result.isResolved,
                resolution: result.resolution,
                judgeApprovals: Number(result.judgeApprovals),
                judgeRejections: Number(result.judgeRejections)
            });

            const msgs = await contract.methods.getMessages(caseId).call();
            setMessages(msgs);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to load case data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCaseData();
    }, [caseId, contract]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage) return;
        setActionLoading(true);
        try {
            await contract.methods.sendMessage(caseId, newMessage, "no-hash").send({ from: account });
            setNewMessage('');
            loadCaseData();
        } catch (err) {
            console.error(err);
            setError('Failed to send message. Make sure the case is open and you are assigned.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleApprove = async () => {
        setActionLoading(true);
        try {
            await contract.methods.judgeApprove(caseId).send({ from: account });
            loadCaseData();
        } catch (err) {
            console.error(err);
            setError('Failed to approve the case.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        setActionLoading(true);
        try {
            await contract.methods.judgeReject(caseId).send({ from: account });
            loadCaseData();
        } catch (err) {
            console.error(err);
            setError('Failed to reject the case.');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="py-12 flex justify-center"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div></div>;
    if (!caseInfo) return null;

    const isAssignedToCase =
        account.toLowerCase() === caseInfo.judge ||
        account.toLowerCase() === caseInfo.advocate1 ||
        account.toLowerCase() === caseInfo.advocate2;

    const canMessage = !caseInfo.isResolved && isAssignedToCase && caseInfo.judge !== '0x0000000000000000000000000000000000000000' && (caseInfo.advocate1 !== '0x0000000000000000000000000000000000000000' && caseInfo.advocate2 !== '0x0000000000000000000000000000000000000000');

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="text-blue-400 text-sm hover:underline mb-4">← Back to Dashboard</button>

            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Case Header Info */}
            <div className="glass-card p-6 rounded-2xl border-t-4 border-t-blue-500">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold font-mono">Case #{caseInfo.caseId}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${caseInfo.isResolved ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'}`}>
                        {caseInfo.isResolved ? caseInfo.resolution || 'Resolved' : 'Active'}
                    </span>
                </div>
                <p className="text-slate-300 mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                    {caseInfo.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-mono text-slate-400 bg-slate-800/30 p-4 rounded-xl">
                    <div>
                        <span className="block text-slate-500 text-xs mb-1 uppercase tracking-wider">Judge</span>
                        <span className={account.toLowerCase() === caseInfo.judge ? "text-green-400 font-bold" : ""}>
                            {caseInfo.judge !== '0x0000000000000000000000000000000000000000' ? `${caseInfo.judge.slice(0, 6)}...${caseInfo.judge.slice(-4)}` : 'Unassigned'}
                        </span>
                    </div>
                    <div>
                        <span className="block text-slate-500 text-xs mb-1 uppercase tracking-wider">Advocate 1</span>
                        <span className={account.toLowerCase() === caseInfo.advocate1 ? "text-purple-400 font-bold" : ""}>
                            {caseInfo.advocate1 !== '0x0000000000000000000000000000000000000000' ? `${caseInfo.advocate1.slice(0, 6)}...${caseInfo.advocate1.slice(-4)}` : 'Unassigned'}
                        </span>
                    </div>
                    <div>
                        <span className="block text-slate-500 text-xs mb-1 uppercase tracking-wider">Advocate 2</span>
                        <span className={account.toLowerCase() === caseInfo.advocate2 ? "text-purple-400 font-bold" : ""}>
                            {caseInfo.advocate2 !== '0x0000000000000000000000000000000000000000' ? `${caseInfo.advocate2.slice(0, 6)}...${caseInfo.advocate2.slice(-4)}` : 'Unassigned'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Judge Action Panel */}
            {isJudge && !caseInfo.isResolved && (
                <div className="glass-card p-6 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between border border-green-500/20 bg-green-500/5">
                    <div>
                        <h3 className="font-semibold text-green-400 flex items-center gap-2 mb-1"><Scale size={18} /> Judge Options</h3>
                        <p className="text-xs text-slate-400">Provide final verdict. Once decided, the case will be closed.</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                        <button onClick={handleApprove} disabled={actionLoading} className="flex-1 md:flex-none px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                            <CheckCircle size={16} /> Approve Case
                        </button>
                        <button onClick={handleReject} disabled={actionLoading} className="flex-1 md:flex-none px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                            <XCircle size={16} /> Reject Case
                        </button>
                    </div>
                </div>
            )}

            {/* Debates & Messages */}
            <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-[500px]">
                <div className="p-4 border-b border-slate-700/50 bg-slate-800/80 flex items-center gap-2">
                    <MessageSquare size={18} className="text-blue-400" />
                    <h3 className="font-semibold">Debate Transcript</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-500 text-sm">No messages submitted yet.</div>
                    ) : (
                        messages.map((m, idx) => {
                            const isMine = m.sender.toLowerCase() === account.toLowerCase();
                            let roleStr = "Unknown";
                            if (m.sender.toLowerCase() === caseInfo.judge) roleStr = "Judge";
                            if (m.sender.toLowerCase() === caseInfo.advocate1) roleStr = "Advocate 1";
                            if (m.sender.toLowerCase() === caseInfo.advocate2) roleStr = "Advocate 2";

                            return (
                                <div key={idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} w-full`}>
                                    <div className="text-xs text-slate-500 mb-1 px-1">
                                        <span className="font-semibold text-slate-400">{roleStr}</span> • <span className="font-mono text-[10px]">{m.sender.slice(0, 6)}...</span>
                                    </div>
                                    <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${isMine ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-700 text-slate-200 rounded-tl-sm'}`}>
                                        {m.text}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Message Input */}
                {canMessage ? (
                    <form onClick={(e) => e.stopPropagation()} onSubmit={handleSendMessage} className="p-4 border-t border-slate-700/50 bg-slate-800/50 flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Enter your argument or debate message..."
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                            required
                        />
                        <button disabled={actionLoading} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center disabled:opacity-50">
                            <Send size={18} />
                        </button>
                    </form>
                ) : (
                    <div className="p-4 border-t border-slate-700/50 bg-slate-900/80 text-center text-xs text-slate-500">
                        {caseInfo.isResolved ? 'Case is resolved. Messaging disabled.' : 'Waiting for judge and both advocates to be assigned before messaging can begin.'}
                    </div>
                )}
            </div>
        </div>
    );
}
