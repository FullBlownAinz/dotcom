import React, { useState } from 'react';
import { Settings, Search } from 'lucide-react';
import Button from '../ui/Button.tsx';
import { useEditMode } from '../../hooks/useEditMode.ts';
import Input from '../ui/Input.tsx';
import toast from 'react-hot-toast';
import { useAdmin } from '../../hooks/useAdmin.ts';
import SearchModal from '../modals/SearchModal.tsx';

export const Header = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { setEditMode } = useEditMode();
  const { session, login, logout } = useAdmin();

  // State for the login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      // Trim whitespace to prevent copy-paste errors
      const cleanEmail = email.trim();
      console.log(`Attempting login for: ${cleanEmail}`);
      
      await login(cleanEmail, password);
      
      // Success is handled by the auth state change
      setIsPanelOpen(false);
      toast.success('Login successful! Entering Edit Mode...');
      setEditMode(true);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || 'Login failed. Check credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsPanelOpen(false);
  };
  
  const handleEnterEditMode = () => {
    setEditMode(true);
    setIsPanelOpen(false);
  }

  const renderPanelContent = () => {
    if (session) {
      return (
        <div className="space-y-2">
            <Button onClick={handleEnterEditMode} fullWidth>
                Enter Edit Mode
            </Button>
            <Button onClick={handleLogout} variant="secondary" fullWidth>
                Logout
            </Button>
        </div>
      );
    }
    
    // Not logged in, show login form
    return (
        <form onSubmit={handleLogin} className="space-y-4">
        <Input
            id="admin-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
        />
        <Input
            id="admin-password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
        />
        <Button type="submit" fullWidth disabled={isLoggingIn}>
            {isLoggingIn ? 'Logging in...' : 'Login'}
        </Button>
    </form>
    );
  };


  return (
    <>
      <header className="h-16 bg-fba-black z-30 flex-shrink-0 flex items-center justify-center px-4 relative border-b-2 border-gray-900">
        
        {/* Search Icon (Left) */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-full text-gray-500 bg-transparent hover:text-fba-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-fba-black focus:ring-fba-red transition-colors"
              aria-label="Search"
            >
              <Search size={24} />
            </button>
        </div>

        <div className="flex-1 flex justify-center">
            <svg viewBox="0 0 100 40" className="h-8" aria-label="FBA Logo">
              <rect width="100" height="40" fill="var(--fba-red)" />
              <text 
                x="50%" 
                y="50%" 
                dominantBaseline="middle" 
                textAnchor="middle" 
                fill="var(--fba-white)" 
                fontSize="30" 
                fontWeight="bold" 
                fontFamily='"Press Start 2P", monospace'
                dy=".1em"
              >
                FBA
              </text>
            </svg>
        </div>

        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="relative">
            <button 
              onClick={() => setIsPanelOpen(p => !p)}
              className="p-2 rounded-full bg-transparent hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-fba-black focus:ring-fba-red transition-colors"
              style={{ color: '#333333' }}
              aria-label="Toggle settings panel"
            >
              <Settings size={24} />
            </button>
            {isPanelOpen && (
              <div className="absolute top-full right-0 mt-2 bg-[#0A0A0A] border-2 border-gray-800 p-4 w-72 z-50">
                {renderPanelContent()}
              </div>
            )}
          </div>
        </div>
      </header>

      {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}
    </>
  );
};