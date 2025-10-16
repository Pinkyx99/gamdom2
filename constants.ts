import React from 'react';
import { SidebarNavItem, ProfileLink, RoyaltyRank, Game } from './types';
import { HomeIcon, PromotionsIcon, LeaderboardIcon, ChallengesIcon, InstantPayoutIcon, SocialCasinoIcon, SportsIcon, CustomerHelpIcon, FaqIcon, UserCircleIcon, ChartBarIcon, ArrowsRightLeftIcon, BellIcon, CogIcon, UsersIcon, ShieldCheckIcon, ArrowRightOnRectangleIcon, DiceIcon, CrashIcon, RouletteIcon, PlinkoIcon, MinesIcon } from './components/icons';
import { UsdIcon, GoogleIcon } from './components/icons';


export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { name: 'Home', href: '#', icon: HomeIcon, active: true },
  { name: 'Promotions', href: '#', icon: PromotionsIcon },
  { name: 'Leaderboard', href: '#', icon: LeaderboardIcon },
  { name: 'Challenges', href: '#', icon: ChallengesIcon },
  { name: 'Instant Payout', href: '#', icon: InstantPayoutIcon },
  { name: 'Social Casino', href: '#', icon: SocialCasinoIcon, isDropdown: true },
  { name: 'Sports', href: '#', icon: SportsIcon },
];

export const SIDEBAR_BOTTOM_NAV_ITEMS: SidebarNavItem[] = [
  { name: 'Customer Help', href: '#', icon: CustomerHelpIcon },
  { name: 'FAQs', href: '#', icon: FaqIcon },
];

// FIX: Added missing constants for WalletDropdown
// FIX: Replaced JSX with React.createElement to prevent parsing errors in .ts file.
export const CURRENCIES = [
    { code: 'USD', balance: '1,250.50', icon: React.createElement(UsdIcon, { className: "w-6 h-6" }) },
    // Add other currencies like BTC, ETH etc.
];

export const BET_CURRENCIES = [
    { code: 'USD' },
    { code: 'EUR' },
    { code: 'JPY' },
];

// FIX: Added missing constants for WalletModal
// FIX: Replaced JSX with React.createElement to prevent parsing errors in .ts file.
const BtcIcon = () => React.createElement('img', { src: "https://img.icons8.com/color/48/bitcoin--v1.png", alt: "BTC", className: "w-8 h-8" });
const EthIcon = () => React.createElement('img', { src: "https://img.icons8.com/color/48/ethereum.png", alt: "ETH", className: "w-8 h-8" });
const LtcIcon = () => React.createElement('img', { src: "https://img.icons8.com/color/48/litecoin.png", alt: "LTC", className: "w-8 h-8" });
const VisaIcon = () => React.createElement('img', { src: "https://img.icons8.com/color/48/visa.png", alt: "Visa", className: "w-8 h-8" });
const MastercardIcon = () => React.createElement('img', { src: "https://img.icons8.com/color/48/mastercard.png", alt: "Mastercard", className: "w-8 h-8" });
export const PAYMENT_CATEGORIES = [
    {
        title: 'Cryptocurrency',
        methods: [
            { name: 'Bitcoin', icon: React.createElement(BtcIcon), tag: 'Fast', tagColor: 'bg-green-500/20 text-green-300' },
            { name: 'Ethereum', icon: React.createElement(EthIcon) },
            { name: 'Litecoin', icon: React.createElement(LtcIcon) },
        ]
    },
    {
        title: 'Credit / Debit Card',
        methods: [
            { name: 'Visa', icon: React.createElement(VisaIcon) },
            { name: 'Mastercard', icon: React.createElement(MastercardIcon) },
        ]
    }
];

// FIX: Added missing PROFILE_LINKS constant
export const PROFILE_LINKS: ProfileLink[] = [
    { name: 'Profile', icon: UserCircleIcon },
    { name: 'Statistics', icon: ChartBarIcon },
    { name: 'Transactions', icon: ArrowsRightLeftIcon },
    { name: 'Notifications', icon: BellIcon },
    { name: 'Settings', icon: CogIcon },
    { name: 'Affiliates', icon: UsersIcon },
    { name: 'Privacy', icon: ShieldCheckIcon },
    { name: 'Log out', icon: ArrowRightOnRectangleIcon },
];

// FIX: Added missing constants for Rewards pages
export const REWARDS_HERO_SLIDES = [
    { preTitle: 'Daily', title: 'Rakeback', subtitle: 'Claim your rakeback every day!', imageUrl: 'https://i.imgur.com/L4pP31z.png', textColor: 'text-white' },
    { preTitle: 'Weekly', title: 'Cashback', subtitle: 'Get a percentage of your losses back every week.', imageUrl: 'https://i.imgur.com/fO2Iq3a.jpeg', textColor: 'text-white' },
    { preTitle: 'Monthly', title: 'Bonus', subtitle: 'A big bonus awaits you every month.', imageUrl: 'https://i.imgur.com/uQfWDbw.jpeg', textColor: 'text-white' },
];

export const CLAIMABLE_REWARDS = [
    { title: 'Daily Rakeback', timeLeft: '14:35:12', reward: '$ 1.25', claimable: true, imageUrl: 'https://i.imgur.com/OqVfUkw.png' },
    { title: 'Weekly Cashback', timeLeft: '3d 12h', reward: '$ 12.50', claimable: false, imageUrl: 'https://i.imgur.com/G5Sy5yL.png' },
    { title: 'Monthly Bonus', timeLeft: '21d 8h', reward: '$ 50.00', claimable: false, imageUrl: 'https://i.imgur.com/4lXAn4g.png' },
];

export const ROYALTY_RANKS: RoyaltyRank[] = [
    { name: 'Bronze I', tier: 'Bronze', status: 'claimed' },
    { name: 'Bronze II', tier: 'Bronze', status: 'unlocked' },
    { name: 'Bronze III', tier: 'Bronze', status: 'locked' },
    { name: 'Silver I', tier: 'Silver', status: 'locked' },
    { name: 'Silver II', tier: 'Silver', status: 'locked' },
    { name: 'Gold I', tier: 'Gold', status: 'locked' },
];

export const ORIGINAL_GAMES = [
  { name: 'Mines', image: 'https://i.imgur.com/sIuPZZB.png', rtp: 99 },
  { name: 'Crash', image: 'https://i.imgur.com/zFhctcn.png', rtp: 99 },
  { name: 'Roulette', image: 'https://i.imgur.com/RRzhtn4.png', rtp: 97.3 },
  { name: 'Dice', image: 'https://i.imgur.com/wuiuvtG.png', rtp: 99 },
  { name: 'Plinko', image: 'https://i.imgur.com/4lXAn4g.png', rtp: 99 },
];

export const GAMES: Game[] = [
  { id: '1', name: 'Gates of Olympus', provider: 'Pragmatic Play', image: 'https://i.imgur.com/wiCzOFG.png', tags: ['New', 'Popular'] },
  { id: '2', name: 'Sweet Bonanza', provider: 'Pragmatic Play', image: 'https://i.imgur.com/OqVfUkw.png' },
  { id: '3', name: 'The Dog House', provider: 'Pragmatic Play', image: 'https://i.imgur.com/G5Sy5yL.png' },
  { id: '4', name: 'Wanted Dead or a Wild', provider: 'Hacksaw Gaming', image: 'https://i.imgur.com/zX0q2aU.jpeg' },
  { id: '5', name: 'Book of Dead', provider: 'Play\'n GO', image: 'https://i.imgur.com/kYqU9Qc.jpeg' },
  { id: '6', name: 'Razor Shark', provider: 'Push Gaming', image: 'https://i.imgur.com/uQfWDbw.jpeg' },
  { id: '7', name: 'Money Train 2', provider: 'Relax Gaming', image: 'https://i.imgur.com/L4pP31z.png' },
  { id: '8', name: 'Jammin\' Jars 2', provider: 'Push Gaming', image: 'https://i.imgur.com/fO2Iq3a.jpeg' },
];