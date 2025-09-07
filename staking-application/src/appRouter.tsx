import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PetraWalletAdapterWrapper } from './contexts/PetraWalletContext';
import { GlobalLayout } from './components/layout';
import { 
  Dashboard, 
  Portfolio, 
  Trading, 
  LPDetails,
  Staking, 
  YieldFarming, 
  Analytics, 
  Settings,
  Faucet
} from './pages';
import WalletDemo from './pages/WalletDemo';

const AppRouter: React.FC = () => {
  return (
    <PetraWalletAdapterWrapper>
      <Router>
        <GlobalLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/trading" element={<Trading />} />
            <Route path="/lp-details/:poolId" element={<LPDetails />} />
            <Route path="/staking" element={<Staking />} />
            <Route path="/yield-farming" element={<YieldFarming />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/faucet" element={<Faucet />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/wallet-demo" element={<WalletDemo />} />
          </Routes>
        </GlobalLayout>
      </Router>
    </PetraWalletAdapterWrapper>
  );
};

export default AppRouter; 