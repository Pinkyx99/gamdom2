import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LogoIcon, SteamIcon, TelegramIcon } from './icons';
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
        redirectTo: 'https://gamdom2.vercel.app',
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
      // FIX: Type '"steam"' is not assignable to type 'Provider'. Casting to Provider to bypass type error.
      { name: 'Steam', icon: <SteamIcon className="w-5 h-5"/>, providerKey: 'steam' as Provider },
      // FIX: Type '"telegram"' is not assignable to type 'Provider'. Casting to Provider to bypass type error.
      { name: 'Telegram', icon: <TelegramIcon className="w-5 h-5"/>, providerKey: 'telegram' as Provider },
  ];

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-backdrop" onClick={onClose}>
      <div 
        className="bg-card w-full max-w-4xl min-h-[600px] rounded-2xl flex overflow-hidden shadow-2xl border border-outline modal-content"
        onClick={e => e.stopPropagation()}
      >
        {/* Decorative Left Panel */}
        <div 
            className="hidden md:block w-1/3 bg-background p-8 relative overflow-hidden"
            style={{
                backgroundImage: 'url(https://i.imgur.com/BLxw7CY.png)',
                backgroundPosition: 'center',
                backgroundSize: '140%',
                backgroundRepeat: 'no-repeat',
            }}
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
            <hr className="flex-grow border-t border-outline"/>
            <span className="mx-4 text-xs font-semibold text-text-muted">OR</span>
            <hr className="flex-grow border-t border-outline"/>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => handleOAuthSignIn('google')} className="flex items-center justify-center space-x-3 bg-[#4285F4] text-white font-semibold py-2.5 rounded-md transition-opacity hover:opacity-90">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                <span>Continue with Google</span>
            </button>
            {socialProviders.map(p => (
                <button key={p.providerKey} onClick={() => handleOAuthSignIn(p.providerKey)} className="flex items-center justify-center space-x-3 bg-background border border-outline text-text-muted font-semibold py-2.5 rounded-md transition-colors hover:bg-white/5 hover:text-white">
                    {p.icon}
                    <span>{p.name}</span>
                </button>
            ))}
          </div>

          <p className="text-center text-sm text-text-muted mt-6">
            {view === 'signIn' ? "Don't have an account?" : "Already have an account?"}
            <button onClick={() => setView(view === 'signIn' ? 'signUp' : 'signIn')} className="font-semibold text-accent-green hover:underline ml-1">
              {view === 'signIn' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};