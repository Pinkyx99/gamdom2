import React from 'react';
import { ORIGINAL_GAMES } from '../constants';

const OriginalGameCard: React.FC<{ game: typeof ORIGINAL_GAMES[0], onGameSelect: (name: string) => void }> = ({ game, onGameSelect }) => (
    <div className="relative group rounded-xl overflow-hidden cursor-pointer flex-shrink-0 w-48" onClick={() => onGameSelect(game.name)}>
        <img src={game.image} alt={game.name} className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute bottom-3 left-3">
            <h3 className="text-white font-bold text-lg">{game.name}</h3>
            <p className="text-sm text-green-400 font-semibold">{game.rtp}% RTP</p>
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