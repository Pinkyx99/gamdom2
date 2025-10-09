import React from 'react';
import { LAST_WINNERS } from '../constants';
import { Winner } from '../types';

const WinnerCard: React.FC<{ winner: Winner }> = ({ winner }) => (
    <div className="flex-shrink-0 flex items-center space-x-3 bg-card/50 p-2 rounded-lg w-48">
        <img src={winner.avatar} alt={winner.username} className="w-10 h-10 rounded-lg"/>
        <div>
            <p className="text-white font-bold text-sm">{winner.username}</p>
            <p className="text-primary-light font-semibold text-sm">⚡ {winner.amount.toLocaleString()}</p>
        </div>
        <img src={winner.gameIcon} alt="Game icon" className="w-6 h-6 rounded-full ml-auto" />
    </div>
);

export const LastWinners: React.FC = () => {
  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Last Winners</h2>
            <div className="flex items-center space-x-2 text-sm text-text-muted">
                <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span>Live</span>
                </div>
                <button className="hover:text-white">Week</button>
                <button className="hover:text-white">24h</button>
            </div>
        </div>
        <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2">
            {LAST_WINNERS.map(winner => <WinnerCard key={winner.id} winner={winner} />)}
        </div>
    </div>
  );
};
