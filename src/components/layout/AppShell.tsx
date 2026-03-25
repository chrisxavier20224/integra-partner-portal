/**
 * AppShell — layout wrapper with header and nav
 */

import React from 'react';
import { LogOut, Send, Clock, User } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  agentName: string;
  agentEmail: string;
  currentPage: 'submit' | 'history' | 'profile';
  onNavigate: (page: 'submit' | 'history' | 'profile') => void;
  onLogout: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  agentName,
  agentEmail,
  currentPage,
  onNavigate,
  onLogout,
}) => {
  const navItems = [
    { id: 'submit' as const, label: 'New Opportunity', icon: Send },
    { id: 'history' as const, label: 'My Submissions', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-integra-light">
      {/* Header */}
      <header className="bg-integra-navy text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-integra-blue rounded-lg flex items-center justify-center font-bold text-sm text-white">
                IN
              </div>
              <div>
                <h1 className="text-base font-semibold leading-tight">Integra Networks</h1>
                <p className="text-xs text-gray-400 leading-tight">Partner Portal</p>
              </div>
            </div>

            {/* Nav */}
            <nav className="hidden sm:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${currentPage === item.id
                      ? 'bg-white bg-opacity-15 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
                    }
                  `}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* User / Logout */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium leading-tight">{agentName}</p>
                <p className="text-xs text-gray-400 leading-tight">{agentEmail}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white hover:bg-opacity-10 transition-colors"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          <div className="sm:hidden flex gap-1 pb-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${currentPage === item.id
                    ? 'bg-white bg-opacity-15 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }
                `}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 py-6 border-t border-gray-200 bg-white">
        &copy; {new Date().getFullYear()} Integra Networks Ltd. All rights reserved.
      </footer>
    </div>
  );
};
