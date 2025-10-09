import React, { useRef } from 'react';
import { ROYALTY_RANKS } from '../../constants';
import { RankCard } from './RankCard';

export const RoyaltyUp: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.offsetWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-3xl font-bold font-display text-white">Royalty Up</h2>
                <p className="text-sm text-text-muted mt-1">Level up and increase your rewards</p>
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={() => handleScroll('left')} className="h-8 w-8 rounded-full bg-card-bg/80 flex items-center justify-center text-text-muted hover:bg-white/10 hover:text-white transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg></button>
                <button onClick={() => handleScroll('right')} className="h-8 w-8 rounded-full bg-card-bg/80 flex items-center justify-center text-text-muted hover:bg-white/10 hover:text-white transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg></button>
            </div>
      </div>
       <div ref={scrollContainerRef} className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
            {ROYALTY_RANKS.map(rank => (
                <div key={rank.name} className="flex-shrink-0 w-40">
                    <RankCard rank={rank} />
                </div>
            ))}
        </div>
    </div>
  );
};