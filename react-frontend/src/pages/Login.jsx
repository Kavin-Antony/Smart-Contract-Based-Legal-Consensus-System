import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initWeb3 } from '../utils/web3';
import { Scale, LogIn, AlertCircle } from 'lucide-react';

export default function Login({ setAccount, setRole, account, role }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [adminViewAddress, setAdminViewAddress] = useState('');
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchAdminAddress = async () => {
            try {
                // Connect to Ganache directly for read-only via HTTP
                const Web3 = (await import('web3')).default;
                const Artifact = (await import('../utils/LawConsensus.json')).default;

                const readOnlyWeb3 = new Web3("http://127.0.0.1:7545");
                const networkId = await readOnlyWeb3.eth.net.getId();
                const deployedNetwork = Artifact.networks[networkId];

                if (deployedNetwork) {
                    const contract = new readOnlyWeb3.eth.Contract(Artifact.abi, deployedNetwork.address);
                    const admin = await contract.methods.admin().call();
                    setAdminViewAddress(admin);
                }
            } catch (err) {
                console.error("Failed to pre-fetch admin address:", err);
            }
        };
        fetchAdminAddress();
    }, []);

    const connectWallet = async () => {
        setLoading(true);
        setError('');

        try {
            const { web3, contract, success, error: web3Error } = await initWeb3();
            if (!success) {
                setError(web3Error || 'Failed to connect to MetaMask');
                setLoading(false);
                return;
            }

            const accounts = await web3.eth.getAccounts();
            if (accounts.length === 0) {
                setError('No active account found in MetaMask');
                setLoading(false);
                return;
            }

            const currentAccount = accounts[0];
            setAccount(currentAccount);

            // Determine Role
            let adminAddress = '';
            let isJudge = false;
            let isLawyerAssigned = false;

            try {
                adminAddress = await contract.methods.admin().call();
                isJudge = await contract.methods.judges(currentAccount).call();

                // Check if user is an assigned lawyer in any active case
                const caseCount = await contract.methods.caseCounter().call();
                for (let i = 1; i <= Number(caseCount); i++) {
                    const caseData = await contract.methods.getCase(i).call();
                    if (
                        caseData.advocate1.toLowerCase() === currentAccount.toLowerCase() ||
                        caseData.advocate2.toLowerCase() === currentAccount.toLowerCase()
                    ) {
                        isLawyerAssigned = true;
                        break;
                    }
                }
            } catch (err) {
                console.error("Contract call failed:", err);
                setError('Failed to query contract data. Are you connected to the correct local Ganache network where Truffle deployed the contract?');
                setLoading(false);
                return;
            }

            let determinedRole = '';
            if (currentAccount.toLowerCase() === adminAddress.toLowerCase()) {
                determinedRole = 'admin';
            } else if (isJudge) {
                determinedRole = 'judge';
            } else if (isLawyerAssigned) {
                determinedRole = 'lawyer';
            } else {
                setError('Your account is not registered. Please ask the Admin to assign you as a Judge or Lawyer for a case.');
                setLoading(false);
                return;
            }

            setRole(determinedRole);

            if (determinedRole === 'admin') navigate('/admin');
            else if (determinedRole === 'judge') navigate('/judge');
            else navigate('/lawyer');

        } catch (err) {
            console.error(err);
            setError('An error occurred during login. Please ensure Ganache and MetaMask are configured properly.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="glass-card w-full max-w-md p-8 rounded-2xl relative overflow-hidden">
                {/* Abstract shapes for aesthetics */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                        <Scale size={32} />
                    </div>

                    <h1 className="text-3xl font-bold mb-2 tracking-tight text-center">Legal Consensus</h1>
                    <p className="text-slate-400 mb-8 text-center text-sm">Decentralized Trust via Smart Contracts</p>

                    {error && (
                        <div className="w-full mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 text-sm">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    <button
                        onClick={connectWallet}
                        disabled={loading}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                                Connect MetaMask
                            </>
                        )}
                    </button>

                    <div className="mt-8 text-xs text-slate-500 text-center space-y-1">
                        <p>Admin, Judge, and Lawyer access is strictly</p>
                        <p>managed by cryptographic signatures.</p>
                        {adminViewAddress && (
                            <div className="mt-4 pt-4 border-t border-slate-700/50">
                                <p className="text-slate-400 mb-1">Contract Admin Address (for local testing):</p>
                                <p className="font-mono text-[10px] break-all bg-slate-800/50 px-2 py-1 rounded text-blue-300 border border-slate-700">{adminViewAddress}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
