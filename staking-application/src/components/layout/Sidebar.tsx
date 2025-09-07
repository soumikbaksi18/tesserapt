import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  TrendingUp, 
  Lock, 
  Sprout, 
  BarChart3, 
  Coins,
  Settings,
  Wallet
} from 'lucide-react';
import logo from "../../assets/Tesseraptlogo.png";

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    // { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
    { name: 'Trading', href: '/trading', icon: TrendingUp },
    // { name: 'Staking', href: '/staking', icon: Lock },
    { name: 'Yield Farming', href: '/yield-farming', icon: Sprout },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Faucet', href: '/faucet', icon: Coins },
    { name: 'Wallet Demo', href: '/wallet-demo', icon: Wallet },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="w-64 glass-strong backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-[var(--border-glass)]">
        <img 
          src={logo} 
          alt="App Logo" 
          className="w-48 mt-16"
        />
      </div>
      
      {/* Navigation */}
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border-r-2 border-[var(--accent-cyan)]'
                      : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
