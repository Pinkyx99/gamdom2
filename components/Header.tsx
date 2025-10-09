import React from 'react';
import { SearchIcon, Logo, ChatBubbleIcon } from './icons';
import { Session } from '@supabase/supabase-js';
import { Profile, ProfileLink } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Wallet } from './Wallet';
import { ProfileDropdown } from './ProfileDropdown';

interface HeaderProps {
    session: Session | null;
    profile: Profile | null;
    onSignInClick: () => void;
    onSignUpClick: () => void;
    onWalletButtonClick: () => void;
    onNavigate: (page: ProfileLink['name'] | 'home') => void;
    currentView: string;
    onChatToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ session, profile, onSignInClick, onSignUpClick, onWalletButtonClick, onNavigate, currentView, onChatToggle }) => {
  return (
    <header className="flex-shrink-0">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left Side: Logo or Search */}
          {currentView !== 'home' ? (
            <button onClick={() => onNavigate('home')} aria-label="Go to homepage">
              <Logo />
            </button>
          ) : (
             <div className="relative w-full max-w-sm">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <SearchIcon className="w-5 h-5 text-text-muted" />
              </div>
              <input
                type="search"
                placeholder="Search games"
                className="w-full bg-sidebar/80 border border-border-color rounded-lg py-2.5 pl-10 pr-4 text-sm placeholder-text-muted focus:ring-2 focus:ring-primary focus:outline-none transition"
              />
            </div>
          )}

          {/* Right Side: Auth/Profile & Mobile Chat Toggle */}
          <div className="flex items-center space-x-2">
            {session && profile ? (
              <>
                <Wallet onWalletButtonClick={onWalletButtonClick} balance={profile.balance} />
                <ProfileDropdown 
                    profile={profile} 
                    onNavigate={onNavigate} 
                    onLogout={async () => { await supabase.auth.signOut(); }} 
                />
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onSignInClick}
                  className="px-6 py-2.5 rounded-lg text-white font-semibold text-sm transition bg-card hover:bg-card/70 border border-border-color"
                >
                  Log in
                </button>
                <button
                  onClick={onSignUpClick}
                  className="bg-primary hover:bg-primary-light text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition"
                >
                  Sign up
                </button>
              </div>
            )}
            
            <button onClick={onChatToggle} className="xl:hidden p-2 rounded-md text-text-muted hover:text-white hover:bg-white/10 transition-colors">
                <ChatBubbleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};