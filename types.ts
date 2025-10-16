import React from 'react';

export interface SidebarNavItem {
  name: string;
  href: string;
  icon: React.FC<{ className?: string }>;
  active?: boolean;
  isDropdown?: boolean;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  balance: number;
  email: string;
  wagered: number;
  games_played: number;
  has_claimed_welcome_bonus: boolean;
}

// FIX: Added missing ProfileLink type definition
export interface ProfileLink {
    name: 'Profile' | 'Statistics' | 'Transactions' | 'Notifications' | 'Settings' | 'Affiliates' | 'Privacy' | 'Log out';
    icon: React.FC<{ className?: string }>;
}

// FIX: Added missing GameState type definition
// General Game State
export type GameState = 'connecting' | 'waiting' | 'running' | 'crashed' | 'resetting';

// FIX: Added missing Crash game type definitions
// Crash Game Specific Types
export interface CrashRound {
    id: string;
    created_at: string;
    status: 'waiting' | 'running' | 'crashed';
    started_at: string | null;
    ended_at: string | null;
    crash_point: number | null;
    server_seed: string | null;
    public_seed: string | null;
}

export interface CrashBet {
    id: string;
    user_id: string;
    round_id: string;
    bet_amount: number;
    cashout_multiplier: number | null;
    profit: number | null;
    auto_cashout_at: number | null;
    profiles: {
        username: string;
        avatar_url: string;
    };
}

export interface CashoutEvent {
    id: string;
    userId: string;
    betAmount: number;
    cashoutMultiplier: number;
    profit: number;
    username: string;
    avatarUrl: string;
}

export interface CrashHistoryItem {
    multiplier: number;
}

// FIX: Added missing Roulette game type definitions
// Roulette Game Specific Types
export type RouletteColor = 'red' | 'green' | 'black';
export type RouletteGameState = 'betting' | 'spinning' | 'ended';

export interface RouletteRound {
    id: string;
    created_at: string;
    status: RouletteGameState;
    spun_at: string | null;
    ended_at: string | null;
    winning_number: number | null;
    server_seed: string | null;
    public_seed: string | null;
}

export interface RouletteBet {
    id: string;
    user_id: string;
    round_id: string;
    bet_amount: number;
    bet_color: RouletteColor;
    profit: number | null;
    profiles: {
        username: string;
        avatar_url: string;
    };
}

export interface RouletteHistoryItem {
    winning_number: number;
}

// FIX: Added missing Rewards type definitions
// Rewards Page Specific Types
export interface RoyaltyRank {
    name: string;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Emerald' | 'Sapphire' | 'Ruby' | 'Diamond' | 'Opal';
    status: 'locked' | 'unlocked' | 'claimed';
}

export interface Game {
  id: string;
  name:string;
  provider: string;
  image: string;
  tags?: string[];
  rtp?: number;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

export interface MinesRoundResult {
    id: string;
    betAmount: number;
    cashedOutAt: number | null; // gems found
    payout: number;
    busted: boolean;
}
