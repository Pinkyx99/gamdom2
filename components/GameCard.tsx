import React from 'react';
import { Game } from '../types';

interface GameCardProps {
    game: Game;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
    return (
        <div className="group relative rounded-xl overflow-hidden cursor-pointer transition-transform duration-300 hover:-translate-y-1.5">
            <img src={game.image} alt={game.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h3 className="text-white font-bold text-lg">{game.name}</h3>
                <p className="text-sm text-text-muted">{game.provider}</p>
            </div>
        </div>
    );
};