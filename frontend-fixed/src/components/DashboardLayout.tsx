import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Search, Network, Activity, BarChart3, GitBranch, LogOut, User, Users, Cpu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Dashboard } from './Dashboard';
import { VerificationPortal } from './VerificationPortal';
import { MerkleTreeView } from './MerkleTreeView';
import { WitnessNetwork } from './WitnessNetwork';
import { LiveDataFeed } from './LiveDataFeed';
import { Analytics } from './Analytics';
import { AdminDashboard } from './AdminDashboard';
import { DeviceManagement } from './DeviceManagement';

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const baseTabs = [
    { id: '', label: 'Integrity Dashboard', icon: Shield, path: '/dashboard' },
    { id: 'verify', label: 'Verify Data', icon: Search, path: '/dashboard/verify' },
    { id: 'merkle', label: 'Merkle Tree', icon: GitBranch, path: '/dashboard/merkle' },
    { id: 'witnesses', label: 'Witness Network', icon: Network, path: '/dashboard/witnesses' },
    { id: 'live', label: 'Live Feed', icon: Activity, path: '/dashboard/live' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/dashboard/analytics' },
    { id: 'devices', label: 'My Devices', icon: Cpu, path: '/dashboard/devices' },
  ];

  const adminTabs = user?.role === 'admin' 
    ? [{ id: 'admin', label: 'Farmer Management', icon: Users, path: '/dashboard/admin' }]
    : [];

  const tabs = [...baseTabs, ...adminTabs];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Shield className="size-8 text-emerald-400" />
                <div className="absolute inset-0 bg-emerald-400/20 blur-xl" />
              </div>
              <div>
                <h1 className="text-white">Data Integrity Layer</h1>
                <p className="text-slate-400 text-sm">Tamper-Proof Agricultural IoT</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="size-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-400 text-sm">System Healthy</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
                <User className="size-4 text-slate-400" />
                <div>
                  <p className="text-white text-sm">{user?.name}</p>
                  <p className="text-slate-500 text-xs capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
              >
                <LogOut className="size-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/30 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.path;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap transition-all relative ${
                    isActive
                      ? 'text-emerald-400'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{tab.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/verify" element={<VerificationPortal />} />
          <Route path="/merkle" element={<MerkleTreeView />} />
          <Route path="/witnesses" element={<WitnessNetwork />} />
          <Route path="/live" element={<LiveDataFeed />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/devices" element={<DeviceManagement />} />
          {user?.role === 'admin' && (
            <Route path="/admin" element={<AdminDashboard />} />
          )}
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50 mt-16">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <p>© 2025 DIL System - Blockchain-Free Verification</p>
            <p>Powered by Merkle Trees + Witness Signatures</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
