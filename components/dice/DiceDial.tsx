import React, { useRef, useCallback, useEffect, useState } from 'react';
import { RollResult } from '../../pages/DiceGamePage';

interface DiceSliderProps {
    rollValue: number;
    isRollOver: boolean;
    gameState: 'idle' | 'rolling' | 'finished';
    lastRoll: RollResult | null;
    onRollValueChange: (value: number) => void;
    previousRollValue: number;
}

// A component for the animated result marker using the user-provided image
const ResultMarker: React.FC<{ result: RollResult, previousValue: number }> = ({ result, previousValue }) => {
    const [position, setPosition] = useState(previousValue); // Start at previous position

    useEffect(() => {
        // Animate to final position
        const timer = setTimeout(() => {
            setPosition(result.value);
        }, 50); // Small delay to ensure CSS transition is applied
        return () => clearTimeout(timer);
    }, [result.value]);

    const leftPosition = `clamp(32px, ${position}%, calc(100% - 32px))`;

    return (
        <div 
            className="absolute pointer-events-none" 
            style={{ 
                left: leftPosition, 
                // h-12 container (48px) -> slider center at 24px.
                // h-[74px] image -> top = 24px - 74px = -50px.
                top: '-50px', 
                zIndex: 15,
                transition: 'left 1.2s cubic-bezier(0.25, 1, 0.5, 1)'
            }}
        >
            <div className="relative -translate-x-1/2">
                 <img 
                    src="https://i.imgur.com/SjtBAlV.png" 
                    alt="Result Marker" 
                    className="w-16 h-[74px]"
                    style={{
                        filter: result.win 
                            ? 'drop-shadow(0 4px 12px rgba(0, 193, 123, 0.7))' 
                            : 'drop-shadow(0 4px 12px rgba(244, 67, 54, 0.7))'
                    }}
                 />
            </div>
        </div>
    );
};


// Main component, a linear slider display
export const DiceDial: React.FC<DiceSliderProps> = ({ rollValue, isRollOver, gameState, lastRoll, onRollValueChange, previousRollValue }) => {
    const sliderRef = useRef<HTMLDivElement>(null);

    // Dragging logic
    const handlePointerMove = useCallback((event: PointerEvent) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const position = event.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (position / rect.width) * 100));
        onRollValueChange(percentage);
    }, [onRollValueChange]);

    const handlePointerUp = useCallback(() => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
    }, [handlePointerMove]);

    useEffect(() => {
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [handlePointerMove, handlePointerUp]);

    const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (gameState !== 'idle' || !sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const position = event.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (position / rect.width) * 100));
        onRollValueChange(percentage);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    }, [gameState, handlePointerMove, handlePointerUp, onRollValueChange]);

    const sliderPercentage = rollValue;

    return (
        <div 
            className="flex-1 flex flex-col items-center justify-center p-4 relative min-h-[350px] overflow-hidden"
            onPointerDown={handlePointerDown}
        >
            {/* Congratulations Toast */}
            <div className={`absolute top-4 left-4 bg-background px-4 py-2 rounded-md shadow-lg text-white font-semibold text-sm z-20 transition-all duration-500 ${gameState === 'finished' && lastRoll?.win ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                CONGRATULATIONS! YOU WIN!
            </div>
            
            <div className="w-full max-w-2xl relative z-10 px-8">
                 {/* Result Display */}
                <div className="h-28 flex flex-col items-center justify-center">
                    {gameState === 'idle' && !lastRoll && <p className="text-lg font-semibold uppercase text-text-muted tracking-wider animate-fade-in">PLACE YOUR BETS</p>}
                    {gameState === 'rolling' && (
                        <p className="text-xl font-semibold uppercase text-text-muted tracking-wider animate-pulse">
                            Rolling...
                        </p>
                    )}
                    <div className={`text-center transition-all duration-300 transform ${lastRoll && gameState !== 'rolling' ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                        <p className="text-sm font-bold uppercase text-text-muted">YOUR RESULT</p>
                        <p className={`font-mono font-bold text-7xl tabular-nums ${lastRoll?.win ? 'text-accent-green' : 'text-red-500'}`} style={{ textShadow: lastRoll?.win ? '0 0 15px rgba(0, 193, 123, 0.5)' : '0 0 15px rgba(244, 67, 54, 0.5)' }}>
                            {lastRoll?.value.toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Slider */}
                <div className="relative w-full h-12 flex items-center mt-4">
                    {lastRoll && gameState !== 'rolling' && <ResultMarker result={lastRoll} previousValue={previousRollValue} />}
                    
                    <div ref={sliderRef} className={`relative w-full h-2.5 rounded-full bg-red-500 ${gameState === 'idle' ? 'cursor-pointer' : 'cursor-default'}`} role="slider" aria-valuenow={rollValue}>
                       <div 
                            className="absolute top-0 h-full bg-accent-green"
                            style={isRollOver ? 
                                { left: `${sliderPercentage}%`, right: 0, borderRadius: '0 99px 99px 0' } : 
                                { left: 0, width: `${sliderPercentage}%`, borderRadius: '99px 0 0 99px' }
                            }
                        ></div>
                         {/* Slider endpoints */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 border-2 border-red-500 bg-card-bg rounded-sm"></div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 border-2 border-accent-green bg-card-bg rounded-sm"></div>
                    </div>

                    <div className="absolute top-1/2 -translate-y-1/2 pointer-events-none" style={{ left: `${sliderPercentage}%`, zIndex: 10 }}>
                        <div className="relative -translate-x-1/2">
                            <div className="w-8 h-8 bg-[#2d3748] rounded-md flex items-center justify-center p-0.5 shadow-lg border-2 border-outline">
                                <div className="flex flex-col space-y-0.5">
                                    <div className="w-5 h-0.5 bg-text-muted rounded-full"></div>
                                    <div className="w-5 h-0.5 bg-text-muted rounded-full"></div>
                                    <div className="w-5 h-0.5 bg-text-muted rounded-full"></div>
                                </div>
                            </div>
                             <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-[#081018] rounded text-white font-semibold text-xs">
                                {rollValue.toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>
                 <div className="relative w-full text-xs text-text-muted mt-2 px-1">
                 </div>
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};