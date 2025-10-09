import React, { useRef, useCallback, useState, useEffect } from 'react';
import { RollResult } from '../../pages/DiceGamePage';
import { DiceIcon } from '../icons';

interface DiceDisplayProps {
    rollValue: number;
    isRollOver: boolean;
    gameState: 'idle' | 'rolling' | 'finished';
    lastRoll: RollResult | null;
    history: RollResult[];
    onRollValueChange: (value: number) => void;
}

const HistoryItem: React.FC<{ result: RollResult }> = ({ result }) => (
    <div className={`flex-shrink-0 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${result.win ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
        {result.value.toFixed(2)}
    </div>
);

const GridBackground: React.FC = () => (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 m-auto text-background opacity-20 pointer-events-none">
        <defs>
            <pattern id="smallGrid" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect width="40" height="40" fill="url(#smallGrid)"/>
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
);


const ResultMarker: React.FC<{ result: RollResult }> = ({ result }) => {
    const leftPosition = `clamp(16px, ${result.value}%, calc(100% - 16px))`;

    return (
        <div 
            className="absolute top-0 pointer-events-none transition-opacity duration-300" 
            style={{ left: leftPosition, zIndex: 5 }}
        >
            <div className="relative -translate-x-1/2 animate-drop-in">
                 <div className="relative w-8 h-8 flex items-center justify-center rounded-md shadow-lg" style={{ backgroundColor: result.win ? '#00C17B' : '#F44336' }}>
                    <DiceIcon className="w-5 h-5 text-white" />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 -bottom-1 transform rotate-45" style={{ backgroundColor: result.win ? '#00C17B' : '#F44336' }}></div>
            </div>
             <style>
            {`
                @keyframes drop-in {
                    from {
                        transform: translateY(-20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-drop-in {
                    animation: drop-in 0.3s ease-out forwards;
                    will-change: transform, opacity;
                }
            `}
            </style>
        </div>
    );
};

export const DiceDisplay: React.FC<DiceDisplayProps> = ({ rollValue, isRollOver, gameState, lastRoll, history, onRollValueChange }) => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const numberDisplayRef = useRef<HTMLDivElement>(null);
    // FIX: Initialize useRef with null to provide an initial value as required.
    const animationFrameRef = useRef<number | null>(null);

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
        if (gameState !== 'idle') {
            // Clean up any lingering event listeners if a roll starts mid-drag
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        }

        // Return a cleanup function in case the component unmounts mid-drag
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        }
    }, [gameState, handlePointerMove, handlePointerUp]);


    const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (gameState !== 'idle') return;
        
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const position = event.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (position / rect.width) * 100));
        onRollValueChange(percentage);
        
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    }, [gameState, handlePointerMove, handlePointerUp, onRollValueChange]);

    const sliderPercentage = rollValue;
    
    return (
        <div className="bg-card-bg rounded-lg p-4 flex flex-col border border-outline shadow-soft h-full min-h-[450px]">
            {/* History Bar */}
            <div className="flex items-center space-x-2 pb-3 border-b border-outline">
                <div className="flex-1 min-w-0 flex items-center space-x-2 overflow-x-auto no-scrollbar">
                    {history.map((h, i) => <HistoryItem key={i} result={h} />)}
                </div>
                <button className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-white/10 flex-shrink-0">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0119.5 19.5" /></svg>
                </button>
            </div>
            
            {/* Game Area */}
            <div 
                className="flex-1 flex flex-col items-center justify-center relative"
                // This promotes the component to its own compositing layer,
                // isolating its rendering to prevent layout shifts and leverage GPU acceleration.
                style={{ transform: 'translateZ(0)' }}
            >
                <GridBackground />

                <div className="w-full max-w-6xl relative z-10 px-8">
                    {/* Result Display */}
                    <div className="h-24 flex items-center justify-center">
                        {gameState === 'idle' && <p className="text-lg font-semibold uppercase text-text-muted tracking-wider">Place your bets</p>}
                        {gameState === 'rolling' && (
                            <div ref={numberDisplayRef} className="font-mono font-bold text-6xl text-white tabular-nums">
                                0.00
                            </div>
                        )}
                        <div className={`font-mono font-bold text-6xl tabular-nums transition-all duration-300 transform ${gameState === 'finished' && lastRoll ? 'scale-100 opacity-100' : 'scale-75 opacity-0'} ${lastRoll?.win ? 'text-accent-green' : 'text-red-500'}`}>
                            {lastRoll?.value.toFixed(2)}
                        </div>
                    </div>

                    {/* Slider */}
                    <div className="relative w-full h-12 flex items-center mt-4">

                        {/* Final Result Marker */}
                        {gameState === 'finished' && lastRoll && <ResultMarker result={lastRoll} />}
                        
                        {/* Track */}
                        <div 
                            ref={sliderRef}
                            onPointerDown={handlePointerDown}
                            className={`relative w-full h-2.5 rounded-full bg-gradient-to-r from-red-600 to-red-500 ${gameState === 'idle' ? 'cursor-pointer' : 'cursor-default'}`}
                            role="slider"
                            aria-valuemin={0.01}
                            aria-valuemax={99.99}
                            aria-valuenow={rollValue}
                            aria-label="Set roll value"
                            tabIndex={gameState === 'idle' ? 0 : -1}
                        >
                           <div 
                                className="absolute top-0 left-0 h-full rounded-l-full bg-gradient-to-r from-green-500 to-accent-green"
                                style={{ width: `${!isRollOver ? sliderPercentage : 0}%`}}
                            ></div>
                            <div 
                                className="absolute top-0 right-0 h-full rounded-r-full bg-gradient-to-l from-green-500 to-accent-green"
                                style={{ width: `${isRollOver ? 100 - sliderPercentage : 0}%`}}
                            ></div>
                            
                            {/* Thumb and value display */}
                            <div 
                                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-white shadow-md flex items-center justify-center p-0.5 pointer-events-none"
                                style={{ left: `${sliderPercentage}%`, transform: 'translate(-50%, -50%)' }}
                            >
                                <div className="w-full h-full bg-card-bg rounded-[4px]"></div>
                            </div>
                        </div>
                    </div>

                    {/* Labels */}
                    <div className="relative w-full text-xs text-text-muted mt-2 px-1">
                        <span className="absolute left-0">0</span>
                        <span className="absolute left-1/4 -translate-x-1/2">25</span>
                        <span className="absolute left-1/2 -translate-x-1/2">50</span>
                        <span className="absolute left-3/4 -translate-x-1/2">75</span>
                        <span className="absolute right-0">100</span>
                    </div>
                </div>
            </div>
        </div>
    );
};