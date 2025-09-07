import React from 'react';
import { User, Shield, Bell, Palette, Globe, CreditCard } from 'lucide-react';

const colors = {
  primary: '#00E6FF',   // Neon Cyan
  secondary: '#2D5BFF', // Royal Blue
  light: '#E6EDF7',     // Soft White-Blue
  muted: '#9BB0CE',     // Muted Blue-Gray
  border: '#1E2742',    // Subtle Navy Border
};

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ color: colors.light }}>
          Settings
        </h1>
      </div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="glass p-6 rounded-xl border" style={{ borderColor: colors.border }}>
          <div className="flex items-center mb-4">
            <User className="w-6 h-6 mr-3" style={{ color: colors.secondary }} />
            <h3 className="text-lg font-semibold" style={{ color: colors.light }}>Profile</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
                Display Name
              </label>
              <input
                type="text"
                placeholder="Enter display name"
                className="w-full px-3 py-2 glass border rounded-lg focus:outline-none"
                style={{
                  borderColor: colors.border,
                  color: colors.light,
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
                Email
              </label>
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full px-3 py-2 glass border rounded-lg focus:outline-none"
                style={{
                  borderColor: colors.border,
                  color: colors.light,
                }}
              />
            </div>
            <button
              className="w-full px-4 py-2 font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-[rgba(0,230,255,0.35)]"
              style={{ backgroundColor: colors.primary, color: '#04060F' }}
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="glass p-6 rounded-xl border" style={{ borderColor: colors.border }}>
          <div className="flex items-center mb-4">
            <Shield className="w-6 h-6 mr-3" style={{ color: '#19F0A8' }} />
            <h3 className="text-lg font-semibold" style={{ color: colors.light }}>Security</h3>
          </div>
          <div className="space-y-4">
            {['Change Password', 'Two-Factor Authentication', 'Connected Wallets'].map((item) => (
              <button
                key={item}
                className="w-full text-left p-3 glass-hover border rounded-lg transition-all duration-200 group"
                style={{ borderColor: colors.border }}
              >
                <div
                  className="font-medium group-hover:text-[var(--accent-cyan)]"
                  style={{ color: colors.light }}
                >
                  {item}
                </div>
                <div className="text-sm" style={{ color: colors.muted }}>
                  {item === 'Change Password' && 'Update your account password'}
                  {item === 'Two-Factor Authentication' && 'Enable 2FA for extra security'}
                  {item === 'Connected Wallets' && 'Manage your connected wallets'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="glass p-6 rounded-xl border" style={{ borderColor: colors.border }}>
          <div className="flex items-center mb-4">
            <Bell className="w-6 h-6 mr-3" style={{ color: colors.primary }} />
            <h3 className="text-lg font-semibold" style={{ color: colors.light }}>Notifications</h3>
          </div>
          <div className="space-y-4">
            {['Price Alerts', 'Transaction Notifications', 'News & Updates'].map((label) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: colors.muted }}>
                  {label}
                </span>
                <button
                  className="w-12 h-6 rounded-full relative"
                  style={{ backgroundColor: `${colors.primary}20` }}
                >
                  <div
                    className="w-4 h-4 rounded-full absolute left-1 top-1 transition-transform"
                    style={{ backgroundColor: colors.primary }}
                  ></div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="glass p-6 rounded-xl border" style={{ borderColor: colors.border }}>
          <div className="flex items-center mb-4">
            <Palette className="w-6 h-6 mr-3" style={{ color: colors.secondary }} />
            <h3 className="text-lg font-semibold" style={{ color: colors.light }}>Appearance</h3>
          </div>
          <div className="space-y-4">
            {['Theme', 'Language'].map((label) => (
              <div key={label}>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
                  {label}
                </label>
                <select
                  className="w-full px-3 py-2 glass border rounded-lg focus:outline-none"
                  style={{
                    borderColor: colors.border,
                    color: colors.light,
                    backgroundColor: 'transparent',
                  }}
                >
                  {label === 'Theme' ? (
                    <>
                      <option>Light</option>
                      <option>Dark</option>
                      <option>System</option>
                    </>
                  ) : (
                    <>
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </>
                  )}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="glass p-6 rounded-xl border" style={{ borderColor: colors.border }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.light }}>
          Advanced Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            className="text-left p-3 glass-hover border rounded-lg transition-all duration-200 group"
            style={{ borderColor: colors.border }}
          >
            <div className="flex items-center">
              <Globe className="w-5 h-5 mr-3 group-hover:text-[var(--accent-cyan)]" style={{ color: colors.muted }} />
              <div>
                <div className="font-medium group-hover:text-[var(--accent-cyan)]" style={{ color: colors.light }}>
                  Network Settings
                </div>
                <div className="text-sm" style={{ color: colors.muted }}>Configure blockchain networks</div>
              </div>
            </div>
          </button>
          <button
            className="text-left p-3 glass-hover border rounded-lg transition-all duration-200 group"
            style={{ borderColor: colors.border }}
          >
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 mr-3 group-hover:text-[var(--accent-cyan)]" style={{ color: colors.muted }} />
              <div>
                <div className="font-medium group-hover:text-[var(--accent-cyan)]" style={{ color: colors.light }}>
                  Payment Methods
                </div>
                <div className="text-sm" style={{ color: colors.muted }}>Manage payment options</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
