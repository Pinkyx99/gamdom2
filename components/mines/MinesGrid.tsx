import React from 'react';
import { FortressIcon, GemIcon, MineIcon } from '../icons';

interface MinesGridProps {
    gridState: ('hidden' | 'gem' | 'mine')[];
    onTileClick: (index: number) => void;
    gameState: 'idle' | 'playing' | 'busted';
}

const Tile: React.FC<{
    state: 'hidden' | 'gem' | 'mine';
    onClick: () => void;
    isRevealed: boolean;
    gameState: MinesGridProps['gameState'];
}> = React.memo(({ state, onClick, isRevealed, gameState }) => {
    
    const isPlaying = gameState === 'playing';
    const isFinished = gameState === 'busted';

    let content = null;
    let baseClasses = 'w-24 h-24 rounded-lg relative transition-all duration-300 ease-in-out transform';
    let buttonDisabled = !isPlaying || isRevealed;

    switch(state) {
        case 'gem':
            baseClasses += ' bg-[#2f4553] scale-105';
            content = <div className="animate-reveal"><GemIcon className="w-12 h-12 text-cyan-300" /></div>;
            break;
        case 'mine':
            baseClasses += ' bg-red-800/60 scale-105';
            content = <div className="animate-reveal"><MineIcon className="w-12 h-12 text-red-400" /></div>;
            break;
        case 'hidden':
        default:
            baseClasses += ' bg-gradient-to-br from-[#404c58] to-[#242c34] shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),inset_0_-2px_4px_rgba(0,0,0,0.2)]';
            content = <FortressIcon className="w-12 h-12 text-[#242c34]" />;
            if (isFinished) {
                baseClasses += ' opacity-50'; // Unrevealed tiles are faded on game end
            } else if (isPlaying) {
                baseClasses += ' cursor-pointer hover:brightness-110 hover:-translate-y-1';
            }
            break;
    }

    return (
        <button onClick={onClick} disabled={buttonDisabled} className={baseClasses} aria-label={`Tile ${state}`}>
            <div className="w-full h-full flex items-center justify-center">
                {content}
            </div>
            <style>{`
                @keyframes reveal {
                    0% { transform: scale(0.5); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-reveal {
                    animation: reveal 0.3s ease-out;
                }
            `}</style>
        </button>
    );
});


export const MinesGrid: React.FC<MinesGridProps> = ({ gridState, onTileClick, gameState }) => {
    return (
        <div className="grid grid-cols-5 gap-3">
            {gridState.map((state, index) => (
                <Tile 
                    key={index}
                    state={state}
                    onClick={() => onTileClick(index)}
                    isRevealed={state !== 'hidden'}
                    gameState={gameState}
                />
            ))}
        </div>
    );
};