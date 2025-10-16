import React from 'react';
import { ORIGINAL_GAMES } from '../constants';

const OriginalGameCard: React.FC<{ game: (typeof ORIGINAL_GAMES)[0], onGameSelect: (name: string) => void }> = ({ game, onGameSelect }) => (
    <div 
      className="card flex-shrink-0 cursor-pointer"
      onClick={() => onGameSelect(game.name)}
    >
        <div className="blob" style={{ backgroundColor: game.blobColor }} />
        <div className="bg">
            <img src={game.image} alt={game.name} className="w-full h-full object-cover"/>
        </div>
    </div>
);


export const OriginalsRow: React.FC<{ onGameSelect: (name: string) => void }> = ({ onGameSelect }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Punt Originals</h2>
                <button className="text-sm font-semibold text-primary hover:text-primary-light">View All</button>
            </div>
            <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2">
                {ORIGINAL_GAMES.map(game => (
                    <OriginalGameCard key={game.name} game={game} onGameSelect={onGameSelect} />
                ))}
            </div>
        </div>
    );
};