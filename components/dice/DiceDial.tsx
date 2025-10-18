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

const ResultIndicator: React.FC<{ result: RollResult, previousValue: number }> = ({ result, previousValue }) => {
    const [position, setPosition] = useState(previousValue);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPosition(result.value);
        }, 50);
        return () => clearTimeout(timer);
    }, [result.value]);

    const leftPosition = `clamp(16px, ${position}%, calc(100% - 16px))`;

    return (
        <div
            className="absolute top-1/2 pointer-events-none"
            style={{
                left: leftPosition,
                zIndex: 15,
                transition: 'left 1.2s cubic-bezier(0.25, 1, 0.5, 1)',
                willChange: 'left',
            }}
        >
            <div className="relative -translate-x-1/2 -translate-y-1/2">
                <div className={`w-0.5 h-14 ${result.win ? 'bg-accent-green' : 'bg-red-500'}`} />
                <div
                    className={`absolute -top-5 left-1/2 -translate-x-1/2 rounded-md px-2 py-0.5 text-sm font-bold text-white shadow-lg ${result.win ? 'bg-accent-green' : 'bg-red-500'}`}
                >
                    {result.value.toFixed(2)}
                </div>
            </div>
        </div>
    );
};

export const DiceDial: React.FC<DiceSliderProps> = ({ rollValue, isRollOver, gameState, lastRoll, onRollValueChange, previousRollValue }) => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const numberDisplayRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number>();

    // Number animation during rolling
    useEffect(() => {
        const animate = () => {
            if (numberDisplayRef.current) {
                numberDisplayRef.current.textContent = (Math.random() * 100).toFixed(2);
            }
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        if (gameState === 'rolling') {
            animationFrameRef.current = requestAnimationFrame(animate);
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [gameState]);


    // Dragging logic
    const handlePointerMove = useCallback((event: PointerEvent) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const position = event.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (position / rect.width) * 100));
        onRollValueChange(percentage);
    }, [onRollValueChange]);

    const handlePointerUp = useCallback(() => {
        document.body.style.cursor = 'default';
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
        document.body.style.cursor = 'grabbing';
        const rect = sliderRef.current.getBoundingClientRect();
        const position = event.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (position / rect.width) * 100));
        onRollValueChange(percentage);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    }, [gameState, handlePointerMove, handlePointerUp, onRollValueChange]);

    const sliderPercentage = rollValue;

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative min-h-[350px] overflow-hidden">
            <div
                className="w-full max-w-2xl relative z-10 flex flex-col items-center justify-center"
                onPointerDown={handlePointerDown}
            >
                {/* Main Result Display */}
                <div className="h-28 flex items-center justify-center">
                    {gameState === 'idle' && (
                        <div className={`font-mono font-bold text-7xl tabular-nums text-text-muted transition-opacity duration-300 ${lastRoll ? 'opacity-0' : 'opacity-100'}`}>
                            0.00
                        </div>
                    )}
                    {gameState === 'rolling' && (
                        <div ref={numberDisplayRef} className="font-mono font-bold text-7xl text-white tabular-nums">
                            0.00
                        </div>
                    )}
                    <div className={`font-mono font-bold text-7xl tabular-nums transition-all duration-300 transform ${gameState === 'finished' && lastRoll ? 'scale-100 opacity-100' : 'scale-75 opacity-0'} ${lastRoll?.win ? 'text-accent-green' : 'text-red-500'}`}
                         style={{ textShadow: lastRoll?.win ? '0 0 20px rgba(100, 255, 218, 0.4)' : '0 0 20px rgba(239, 68, 68, 0.4)' }}>
                        {lastRoll?.value.toFixed(2)}
                    </div>
                </div>

                {/* Slider */}
                <div className="relative w-full h-12 flex items-center mt-8">
                    {lastRoll && gameState !== 'rolling' && <ResultIndicator result={lastRoll} previousValue={previousRollValue} />}

                    <div
                        ref={sliderRef}
                        className={`relative w-full h-4 rounded-full bg-red-500/20 border-2 border-red-500/30 ${gameState === 'idle' ? 'cursor-grabbing' : 'cursor-default'}`}
                        role="slider"
                        aria-valuenow={rollValue}
                    >
                        <div
                            className="absolute top-0 h-full bg-accent-green/20 border-2 border-accent-green/30"
                            style={isRollOver ?
                                { left: `${sliderPercentage}%`, right: '-2px', borderRadius: '0 99px 99px 0' } :
                                { left: '-2px', width: `${sliderPercentage}%`, borderRadius: '99px 0 0 99px' }
                            }
                        ></div>
                    </div>

                    <div
                        className="absolute top-1/2 pointer-events-none"
                        style={{ left: `clamp(8px, ${sliderPercentage}%, calc(100% - 8px))`, zIndex: 10 }}
                    >
                        <div className="relative -translate-x-1/2 -translate-y-1/2">
                            <div className="w-1 h-8 bg-white rounded-full shadow-lg" />
                            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#081018] rounded-md text-white font-semibold text-sm shadow-md border border-outline">
                                {rollValue.toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ticks */}
                <div className="relative w-full text-xs text-text-muted mt-2 px-1 h-4">
                    {[0, 25, 50, 75, 100].map(val => (
                        <div key={val} className="absolute -translate-x-1/2" style={{ left: `${val}%`}}>
                           <div className="w-0.5 h-1.5 bg-text-muted/50" />
                           <span className="absolute top-2 left-1/2 -translate-x-1/2">{val}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};