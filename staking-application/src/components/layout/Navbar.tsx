import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import PetraWalletSelector from '../PetraWalletSelector';

const Navbar: React.FC = () => {

  return (
    <header className="glass border-b border-[var(--border-glass)] px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
            <input
              type="text"
              placeholder="Search tokens, protocols..."
              className="pl-10 pr-4 py-2 bg-white/5 border border-[var(--border-glass)] rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)] 
                         focus:border-[var(--accent-cyan)] w-80 text-[var(--text-primary)] 
                         placeholder-[var(--text-muted)] backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors glass-hover rounded-lg">
            <Bell className="w-5 h-5" />
          </button>

          <PetraWalletSelector />

          {/* Profile */}
          <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors glass-hover rounded-lg">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
