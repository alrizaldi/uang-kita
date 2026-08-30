'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/context/SessionContext';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Menu, X, Settings } from 'lucide-react'; // Import icons for the mobile menu

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { session } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // State for mobile menu toggle

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-indigo-600">
                  UangKita
                </Link>
              </div>
              
              {/* Desktop Navigation - Hidden on small screens */}
              <nav className="hidden md:ml-6 md:flex md:space-x-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  Dashboard
                </Link>
                <Link
                  href="/transactions"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  Transactions
                </Link>
                <Link
                  href="/accounts"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  Accounts
                </Link>
                <Link
                  href="/budgets"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  Budgets
                </Link>
                <Link
                  href="/goals"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  Goals
                </Link>
                <Link
                  href="/settings"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  <Settings className="h-4 w-4 mr-1" /> Settings
                </Link>
              </nav>
            </div>
            
            {/* Mobile menu button - Only shown on small screens */}
            <div className="flex md:hidden items-center">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                aria-controls="mobile-menu"
                aria-expanded="false"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
              
              {/* User info on mobile */}
              {session && (
                <div className="ml-4 flex items-center md:hidden">
                  <span className="text-sm text-gray-700 truncate max-w-[100px]">
                    {session.user.email?.split('@')[0]}
                  </span>
                </div>
              )}
            </div>
            
            {/* Desktop User Info - Hidden on small screens */}
            <div className="hidden md:flex md:items-center md:ml-6">
              {session ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700 truncate max-w-xs">
                    Hi, {session.user.email?.split('@')[0]}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="text-sm text-gray-700">
                  <Link href="/auth" className="hover:text-gray-900 font-medium">
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile menu, show/hide based on menu state */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1 md:hidden px-2">
            <Link
              href="/dashboard"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
              onClick={() => setMobileMenuOpen(false)} // Close menu after clicking
            >
              Dashboard
            </Link>
            <Link
              href="/transactions"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Transactions
            </Link>
            <Link
              href="/accounts"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Accounts
            </Link>
            <Link
              href="/budgets"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Budgets
            </Link>
            <Link
              href="/goals"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Goals
            </Link>
            <Link
              href="/settings"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings className="h-4 w-4 mr-1 inline" /> Settings
            </Link>
            {session && (
              <button 
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false); // Close menu after logging out
                }}
                className="w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50 hover:border-red-300"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-8 border-t">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} UangKita Family Finance Manager
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;