

import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LogoIcon, SteamIcon, GoogleIcon, TelegramIcon } from './icons';
import { Provider } from '@supabase/supabase-js';

interface AuthModalProps {
  show: boolean;
  onClose: () => void;
  view: 'signIn' | 'signUp';
  setView: (view: 'signIn' | 'signUp') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ show, onClose, view, setView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        if (view === 'signUp') {
            if (!username) {
                setError("Username is required.");
                setLoading(false);
                return;
            }
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username,
                        avatar_url: `https://picsum.photos/seed/${username}/40/40` // Default avatar
                    }
                }
            });
            if (signUpError) throw signUpError;
            // Optionally, show a "check your email" message
            onClose();

        } else { // 'signIn'
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (signInError) throw signInError;
            onClose();
        }
    } catch (err: any) {
        setError(err.error_description || err.message);
    } finally {
        setLoading(false);
    }
  };
  
  const handleOAuthSignIn = async (provider: Provider) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        // The redirectTo URL should be configured in your Supabase project's auth settings.
        // It defaults to the current page URL.
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // On success, the browser will redirect, so no need to set loading to false.
  };

  // FIX: Changed `JSX.Element` to `React.ReactElement` to resolve the 'Cannot find namespace JSX' error. `React.ReactElement` is a valid type provided by the React import.
  const socialProviders: { name: string; icon: React.ReactElement; providerKey: Provider }[] = [
      { name: 'Steam', icon: <SteamIcon className="w-5 h-5"/>, providerKey: 'steam' },
      { name: 'Google', icon: <GoogleIcon className="w-5 h-5"/>, providerKey: 'google' },
      { name: 'Telegram', icon: <TelegramIcon className="w-5 h-5"/>, providerKey: 'telegram' },
  ];

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-card-bg w-full max-w-4xl min-h-[600px] rounded-2xl flex overflow-hidden shadow-2xl border border-outline"
        onClick={e => e.stopPropagation()}
      >
        {/* Decorative Left Panel */}
        <div 
            className="hidden md:block w-1/3 bg-background p-8 relative overflow-hidden bg-cover bg-center"
            style={{backgroundImage: 'url(https://gamdom.com/build/side-image.3af9ab482b.396.png)'}}
        >
        </div>

        {/* Auth Form */}
        <div className="w-full md:w-2/3 p-6 sm:p-8 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-6">
             <div className="flex items-center space-x-2">
                <LogoIcon className="h-8 w-8 text-white" />
                <h2 className="text-2xl font-bold text-white">{view === 'signIn' ? 'Sign In' : 'Create Account'}</h2>
             </div>
            <button onClick={onClose} className="p-2 text-text-muted hover:text-white" aria-label="Close">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

            {error && <p className="bg-red-500/20 text-red-400 text-sm p-3 rounded-md mb-4">{error}</p>}

          <form onSubmit={handleAuth} className="space-y-4">
            {view === 'signUp' && (
                <div>
                    <label className="text-sm font-medium text-text-muted" htmlFor="email">Email</label>
                    <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-background border border-outline rounded-md p-3 mt-1 text-sm focus:ring-1 focus:ring-accent-green focus:outline-none"/>
                </div>
            )}
            <div>
              <label className="text-sm font-medium text-text-muted" htmlFor="username">{view === 'signIn' ? 'Username or Email' : 'Username'}</label>
              <input id="username" type={view === 'signIn' ? 'text' : 'text'} value={view === 'signIn' ? email : username} onChange={e => view === 'signIn' ? setEmail(e.target.value) : setUsername(e.target.value)} required className="w-full bg-background border border-outline rounded-md p-3 mt-1 text-sm focus:ring-1 focus:ring-accent-green focus:outline-none"/>
            </div>
            <div>
              <label className="text-sm font-medium text-text-muted" htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-background border border-outline rounded-md p-3 mt-1 text-sm focus:ring-1 focus:ring-accent-green focus:outline-none"/>
            </div>

            <div className="flex justify-between items-center text-sm">
                <label className="flex items-center space-x-2 text-text-muted cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded bg-background border-outline text-accent-green focus:ring-accent-green"/>
                    <span>Remember me</span>
                </label>
                <a href="#" className="text-accent-green hover:underline">Forgot your password?</a>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-accent-green text-white font-semibold py-3 rounded-md transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Processing...' : (view === 'signIn' ? 'Start Playing' : 'Create Account')}
            </button>
          </form>
          
          <div className="flex items-center my-6">
            <hr className="flex-grow border-outline" />
            <span className="mx-4 text-xs text-text-muted">OR</span>
            <hr className="flex-grow border-outline" />
          </div>

            <div className="grid grid-cols-3 gap-4">
                {socialProviders.map(provider => (
                     <button 
                        key={provider.name}
                        type="button"
                        onClick={() => handleOAuthSignIn(provider.providerKey)}
                        disabled={loading}
                        className="flex items-center justify-center space-x-2 bg-background p-3 rounded-md border border-outline hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {provider.icon}
                        <span className="text-sm font-medium text-white">{provider.name}</span>
                    </button>
                ))}
            </div>
            
          <p className="text-center text-sm text-text-muted mt-6">
            {view === 'signIn' ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setView(view === 'signIn' ? 'signUp' : 'signIn')} className="font-semibold text-accent-green hover:underline">
              {view === 'signIn' ? 'Sign up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
