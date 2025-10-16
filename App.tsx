import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/HeroCarousel';
import { AuthModal } from './components/AuthModal';
import { supabase } from './lib/supabaseClient';
import { Session, Provider } from '@supabase/supabase-js';
import { Profile, ProfileLink } from './types';
import { WalletModal } from './components/WalletModal';
import { OriginalsRow } from './components/OriginalsRow';
import { GameGrid } from './components/GameGrid';
import ProfilePage from './pages/ProfilePage';
import CrashGamePage from './pages/CrashGamePage';
import MinesGamePage from './pages/MinesGamePage';
import RouletteGamePage from './pages/RouletteGamePage';
import DiceGamePage from './pages/DiceGamePage';
import { ChatRail } from './components/ChatRail';
import { TipUserModal } from './components/TipUserModal';
import { UserProfileModal } from './components/UserProfileModal';
import { CogIcon } from './components/icons';

type View = 'home' | 'crash' | 'mines' | 'roulette' | 'dice' | ProfileLink['name'];

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<'signIn' | 'signUp'>('signIn');
  const [currentView, setCurrentView] = useState<View>('home');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [tipRecipient, setTipRecipient] = useState<{ id: string; username: string } | null>(null);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);

  const getProfile = useCallback(async (session: Session) => {
    try {
      const { user } = session;
      const { data, error } = await supabase
        .from('profiles')
        .select(`id, username, avatar_url, balance, wagered, games_played, has_claimed_welcome_bonus`)
        .eq('id', user.id)
        .single();

      if (error) {
        // If the database trigger is set up correctly, this error should not happen for a missing profile.
        // It would indicate a different problem (e.g., network issue, RLS policy).
        throw error;
      }

      if (data) {
        setProfile({ ...data, email: user.email || '' });
      }
    } catch (error) {
      console.log('Error getting profile:', error);
    }
  }, []);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) getProfile(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        getProfile(session);
      } else {
        setProfile(null);
        setCurrentView('home');
      }
    });

    return () => subscription.unsubscribe();
  }, [getProfile]);

  const openAuthModal = (view: 'signIn' | 'signUp') => {
    setAuthView(view);
    setShowAuthModal(true);
  };
  
  const handleOAuthSignIn = async (provider: Provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    if (error) {
        console.error("OAuth sign-in error:", error);
        alert(`OAuth sign-in error: ${error.message}`);
    }
  };

  const handleProfileUpdate = useCallback(() => {
    if (session) getProfile(session);
  }, [session, getProfile]);

  const handleGameSelect = (gameName: string) => {
    const game = gameName.toLowerCase();
    if (game === 'crash' || game === 'mines' || game === 'roulette' || game === 'dice') {
      setCurrentView(game as View);
    }
  };
  
  const getAppBgClass = () => {
    switch(currentView) {
        case 'crash': return 'bg-[#0F1923]';
        case 'mines': return 'bg-background';
        case 'roulette': return 'bg-[#0D1316]';
        case 'dice': return 'bg-[#081018]';
        default: return 'bg-background';
    }
  }

  const renderMainContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <div className="max-w-7xl mx-auto space-y-8">
            <Hero onSignUpClick={() => openAuthModal('signUp')} onGoogleSignInClick={() => handleOAuthSignIn('google')} />
            <OriginalsRow onGameSelect={handleGameSelect} />
            <GameGrid />
          </div>
        );
      case 'crash':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center text-text-muted p-8">
            <CogIcon className="w-24 h-24 text-primary animate-spin-slow" />
            <h1 className="mt-8 text-4xl font-bold text-white">Repairing...</h1>
            <p className="mt-2 max-w-md">The Crash game is currently undergoing maintenance to improve your experience. Please check back later.</p>
          </div>
        );
      case 'mines':
        return <MinesGamePage profile={profile} session={session} onProfileUpdate={handleProfileUpdate} />;
      case 'roulette':
        return <RouletteGamePage 
                    profile={profile}
                    session={session}
                    onProfileUpdate={handleProfileUpdate}
                    onNavigate={() => {}}
                />;
      case 'dice':
        return <DiceGamePage profile={profile} session={session} onProfileUpdate={handleProfileUpdate} />;
      default: // Profile pages
        return (
            <ProfilePage
                profile={profile}
                onProfileUpdate={handleProfileUpdate}
                activePage={currentView}
                setActivePage={(page) => setCurrentView(page)}
            />
        );
    }
  };

  return (
    <div className={`h-screen font-sans text-text-main transition-colors duration-300 ${getAppBgClass()}`}>
      <AuthModal 
        show={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        view={authView}
        setView={setAuthView}
      />
      <WalletModal show={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
      <TipUserModal
        show={!!tipRecipient}
        onClose={() => setTipRecipient(null)}
        recipient={tipRecipient}
        onTipped={handleProfileUpdate}
      />
       <UserProfileModal
        userId={viewingProfileId}
        onClose={() => setViewingProfileId(null)}
        onTipUser={setTipRecipient}
      />

      <div className="flex h-screen">
          <div className="flex-1 min-w-0 flex flex-col">
              <Header
                session={session}
                profile={profile}
                onSignInClick={() => openAuthModal('signIn')}
                onSignUpClick={() => openAuthModal('signUp')}
                onWalletButtonClick={() => setIsWalletModalOpen(true)}
                onNavigate={(page) => setCurrentView(page as View)}
                currentView={currentView}
                onChatToggle={() => setIsChatOpen(true)}
                onProfileUpdate={handleProfileUpdate}
              />
              <main className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-8">
                {renderMainContent()}
              </main>
          </div>
          
          {/* Desktop Chat Rail */}
          <div className="hidden xl:block w-[320px] flex-shrink-0">
            <div className="sticky top-0 h-screen">
                <ChatRail session={session} onTipUser={setTipRecipient} onViewProfile={setViewingProfileId} />
            </div>
          </div>

          {/* Mobile Chat Overlay */}
          <div className={`fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out xl:hidden ${ isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="absolute inset-0 bg-black/50" onClick={() => setIsChatOpen(false)}></div>
              <div className="relative w-[320px] h-full float-right">
                <ChatRail session={session} onClose={() => setIsChatOpen(false)} onTipUser={setTipRecipient} onViewProfile={setViewingProfileId} />
              </div>
          </div>
      </div>
    </div>
  );
};

export default App;