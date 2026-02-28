import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import JudgeDashboard from './pages/JudgeDashboard';
import LawyerDashboard from './pages/LawyerDashboard';

function App() {
  const [account, setAccount] = useState('');
  const [role, setRole] = useState(''); // 'admin', 'judge', 'lawyer'

  useEffect(() => {
    // Optionally listen for MetaMask account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          // A rough reset, prompting re-login or automatic role re-eval could be handled.
          // We'll reset role to force re-login for simplicity.
          setAccount(accounts[0]);
          setRole('');
        } else {
          setAccount('');
          setRole('');
        }
      });
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Login setAccount={setAccount} setRole={setRole} account={account} role={role} />} />

          <Route path="/admin" element={role === 'admin' ? <AdminDashboard account={account} /> : <Navigate to="/" />} />
          <Route path="/judge" element={role === 'judge' ? <JudgeDashboard account={account} /> : <Navigate to="/" />} />
          <Route path="/lawyer" element={role === 'lawyer' ? <LawyerDashboard account={account} /> : <Navigate to="/" />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
