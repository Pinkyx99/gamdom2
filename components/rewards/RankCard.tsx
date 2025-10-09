import React from 'react';
import { RoyaltyRank } from '../../types';
import { RankIcon, LockIcon } from '../icons';

interface RankCardProps {
    rank: RoyaltyRank;
}

const tierGlowColors: { [key: string]: string } = {
    Bronze: 'shadow-[0_0_20px_rgba(217,164,119,0.5)]',
    Silver: 'shadow-[0_0_20px_rgba(230,232,235,0.5)]',
    Gold: 'shadow-[0_0_20px_rgba(255,215,0,0.5)]',
    Emerald: 'shadow-[0_0_20px_rgba(80,200,120,0.5)]',
    Sapphire: 'shadow-[0_0_20px_rgba(15,82,186,0.5)]',
    Ruby: 'shadow-[0_0_20px_rgba(224,17,95,0.5)]',
    Diamond: 'shadow-[0_0_20px_rgba(185,242,255,0.5)]',
    Opal: 'shadow-[0_0_20px_rgba(173,255,47,0.5)]',
};


export const RankCard: React.FC<RankCardProps> = ({ rank }) => {
    const isLocked = rank.status === 'locked';
    const isUnlocked = rank.status === 'unlocked';
    const isClaimed = rank.status === 'claimed';

    return (
        <div className={`bg-card-bg border border-outline rounded-xl p-4 flex flex-col items-center text-center transition-all duration-300 ${isUnlocked ? tierGlowColors[rank.tier] : ''} ${isLocked ? 'opacity-70' : ''}`}>
            <div className="relative mb-4">
                <RankIcon tier={rank.tier} className="w-24 h-auto" />
                {isLocked && (
                    <div className="absolute top-1 right-1 bg-background/50 backdrop-blur-sm rounded-full p-1">
                        <LockIcon className="w-4 h-4 text-text-muted" />
                    </div>
                )}
            </div>
            
            <div className="flex-grow flex flex-col justify-center items-center">
                <h4 className="font-bold text-white text-sm leading-tight">{rank.name}</h4>
                <p className="text-xs text-text-muted mb-4">Reward</p>
            </div>

            <button
                disabled={!isUnlocked}
                className="w-full mt-auto py-2.5 rounded-md font-semibold text-sm transition-colors text-white disabled:bg-[#2A3341] disabled:text-text-muted/60 disabled:cursor-not-allowed bg-accent-green hover:bg-secondary-green"
            >
                {isClaimed ? 'Claimed' : 'Claim Reward'}
            </button>
        </div>
    );
};