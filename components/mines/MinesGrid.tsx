

import React from 'react';

interface MinesGridProps {
    gridState: ('hidden' | 'gem' | 'mine')[];
    onTileClick: (index: number) => void;
    gameState: 'idle' | 'playing' | 'busted' | 'cashed_out';
}

const Tile: React.FC<{
    state: 'hidden' | 'gem' | 'mine';
    onClick: () => void;
    disabled: boolean;
    isFinished: boolean;
}> = ({ state, onClick, disabled, isFinished }) => {
    
    // Increased rounding for a "smoother" feel
    const baseStyle = "aspect-square rounded-xl flex items-center justify-center transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50";
    
    let content, styles, buttonDisabled = disabled;

    switch (state) {
        case 'gem':
            // New coin image, filling the tile with some padding
            content = <img src="https://i.imgur.com/WAV1sfy.png" alt="Gem" className="w-full h-full object-contain p-2" />;
            styles = "bg-green-500/20 border-2 border-green-500 scale-105 shadow-lg shadow-green-500/20";
            buttonDisabled = true;
            break;
        case 'mine':
            // Bomb image, filling the tile with some padding
            content = <img src="https://i.imgur.com/tmH7NTA.png" alt="Mine" className="w-full h-full object-contain p-2" />;
            styles = "bg-red-500/20 border-2 border-red-500 scale-105 shadow-lg shadow-red-500/20 animate-pulse";
            buttonDisabled = true;
            break;
        case 'hidden':
        default:
            content = <img src="https://i.imgur.com/A6bw8ao.png" alt="Hidden tile" className="w-full h-full object-cover rounded-xl" />;
            // Added white glow on hover
            styles = `p-0 ${disabled ? 'cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]'} ${isFinished ? 'opacity-40' : ''}`;
            break;
    }

    return (
        <button 
            onClick={onClick} 
            disabled={buttonDisabled} 
            className={`${baseStyle} ${styles}`}
            aria-label={state === 'hidden' ? 'Reveal tile' : state}
        >
            {content}
        </button>
    );
}

export const MinesGrid: React.FC<MinesGridProps> = ({ gridState, onTileClick, gameState }) => {
    const isFinished = gameState === 'busted' || gameState === 'cashed_out';
    return (
        // Increased container size and gap to make tiles bigger
        <div className="w-full max-w-lg lg:w-[520px] flex-shrink-0">
            <div className="grid grid-cols-5 gap-3 lg:gap-4 p-3 bg-black/40 backdrop-blur-sm rounded-xl border border-gray-700/50">
                {gridState.map((state, index) => (
                    <Tile 
                        key={index} 
                        state={state} 
                        onClick={() => onTileClick(index)}
                        disabled={gameState !== 'playing' || state !== 'hidden'}
                        isFinished={isFinished}
                    />
                ))}
            </div>
        </div>
    );
};