import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RouletteGameState } from '../../types';
import { MutedSoundIcon, InfoCircleIcon, CheckCircleIcon } from '../icons';
import { ROULETTE_ORDER, TILE_WIDTH, TILE_STEP, getNumberColorClass } from '../../lib/rouletteUtils';

interface RouletteSpinnerProps {
    gameState: RouletteGameState | null;
    winningNumber: number | null;
    previousWinningNumber: number;
    countdown: number;
}

const NumberTile: React.FC<{ num: number }> = React.memo(({ num }) => (
    <div className={`w-20 h-20 flex-shrink-0 rounded-lg flex items-center justify-center text-3xl font-bold text-white shadow-md ${getNumberColorClass(num)}`} aria-label={`Number ${num}`}>
        {num}
    </div>
));

const GameStatusDisplay: React.FC<{ gameState: RouletteGameState | null; countdown: number; winningNumber: number | null }> = ({ gameState, countdown, winningNumber }) => {

    switch (gameState) {
        case 'betting':
            const progress = (countdown / 15) * 100;
            return (
                <div className="text-center w-64">
                    <div className="flex justify-between items-baseline mb-1">
                        <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">Spinning in</h2>
                        <p className="font-mono font-bold text-lg text-white">{countdown.toFixed(1)}s</p>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-red-500 rounded-full"
                            style={{
                                width: `${progress}%`,
                                transition: progress > 99.5 || progress < 0.5 ? 'none' : 'width 0.05s linear'
                            }}
                        />
                    </div>
                </div>
            );
        case 'spinning':
            return (
                <div className="text-center bg-black/30 backdrop-blur-sm p-4 rounded-2xl">
                    <p className="text-xl font-bold text-white animate-pulse">Spinning...</p>
                </div>
            );
        case 'ended': {
             if (winningNumber === null) return <div className="h-24"></div>; // Placeholder
            return (
                <div className="text-center flex items-center space-x-4">
                    <p className="text-lg font-semibold text-text-muted">Landed on</p>
                     <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-3xl font-bold text-white ${getNumberColorClass(winningNumber)}`}>
                        {winningNumber}
                    </div>
                </div>
            );
        }
        default:
            return <div className="h-24"></div>; // Placeholder to maintain height
    }
};

const TopArrowMarker: React.FC = () => (
    <div className="absolute top-[-1px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
        <svg width="28" height="16" viewBox="0 0 28 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="markerGradient" x1="0.5" y1="0" x2="0.5" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#CCCCCC" />
                </linearGradient>
                <filter id="markerGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <path d="M14 16L0.343145 2.34315L2.34314 0.343146C3.12419 -0.437903 4.39052 -0.437903 5.17157 0.343146L14 9.17157L22.8284 0.343146C23.6095 -0.437903 24.8758 -0.437903 25.6569 0.343146L27.6569 2.34315L14 16Z" fill="url(#markerGradient)" filter="url(#markerGlow)"/>
        </svg>
    </div>
);


export const RouletteSpinner: React.FC<RouletteSpinnerProps> = ({ gameState, winningNumber, previousWinningNumber, countdown }) => {
    const [reel, setReel] = useState<number[]>([]);
    const [translateX, setTranslateX] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    
    const viewportRef = useRef<HTMLDivElement>(null);
    const snapTimerRef = useRef<number | null>(null);
    const hasSpunForRound = useRef(false);
    const [viewportWidth, setViewportWidth] = useState(0);

    useEffect(() => {
        const handleResize = () => viewportRef.current && setViewportWidth(viewportRef.current.offsetWidth);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    useEffect(() => {
        if (gameState === 'betting') {
            hasSpunForRound.current = false;
        }
    }, [gameState]);

    useEffect(() => {
        const REEL_CYCLES = 60;
        setReel(Array.from({ length: ROULETTE_ORDER.length * REEL_CYCLES }, (_, i) => ROULETTE_ORDER[i % ROULETTE_ORDER.length]));
    }, []);
    
    const getTranslateForIndex = useCallback((index: number): number => {
        if (viewportWidth === 0) return 0;
        const centerOffset = viewportWidth / 2 - TILE_WIDTH / 2;
        const targetPosition = index * TILE_STEP;
        return centerOffset - targetPosition;
    }, [viewportWidth]);

    useEffect(() => {
        if (reel.length === 0 || viewportWidth === 0) return;
        if (snapTimerRef.current) clearTimeout(snapTimerRef.current);

        if (gameState === 'spinning' && winningNumber !== null && !hasSpunForRound.current) {
            hasSpunForRound.current = true;
            
            const targetCycle = 45; 
            const targetIndexInOrder = ROULETTE_ORDER.indexOf(winningNumber);
            if (targetIndexInOrder === -1) return;

            const targetIndex = (targetCycle * ROULETTE_ORDER.length) + targetIndexInOrder;
            
            const finalTranslate = getTranslateForIndex(targetIndex);
            
            setIsAnimating(true);
            setTranslateX(finalTranslate);

            snapTimerRef.current = window.setTimeout(() => {
                 setIsAnimating(false);
            }, 7500);

        } else if (!hasSpunForRound.current) {
            const restingIndexNumber = (gameState === 'ended' && winningNumber !== null) ? winningNumber : previousWinningNumber;
            const restingCycle = 5; 
            const prevWinnerIdx = ROULETTE_ORDER.indexOf(restingIndexNumber);
            if (prevWinnerIdx === -1) return;

            const restingIndex = (restingCycle * ROULETTE_ORDER.length) + prevWinnerIdx;
            
            setIsAnimating(false);
            setTranslateX(getTranslateForIndex(restingIndex));
        }

    }, [gameState, winningNumber, previousWinningNumber, reel, viewportWidth, getTranslateForIndex]);
    
    return (
        <div className="bg-card pt-4 rounded-xl border border-outline relative overflow-hidden shadow-lg bg-gradient-to-b from-[#1A222D] to-[#12181F]">
            <div className="absolute top-4 right-4 flex justify-end items-center z-30">
                <div className="flex items-center space-x-1">
                    <button className="w-8 h-8 rounded-md bg-black/30 text-text-muted hover:text-white transition flex items-center justify-center"><MutedSoundIcon className="w-5 h-5"/></button>
                    <button className="w-8 h-8 rounded-md bg-black/30 text-text-muted hover:text-white transition flex items-center justify-center"><InfoCircleIcon className="w-5 h-5"/></button>
                    <button className="w-8 h-8 rounded-md bg-black/30 text-text-muted hover:text-white transition flex items-center justify-center"><CheckCircleIcon className="w-5 h-5"/></button>
                </div>
            </div>
            
            <div className="h-24 flex items-center justify-center z-20 relative">
                 <GameStatusDisplay gameState={gameState} countdown={countdown} winningNumber={winningNumber} />
            </div>
            
            <div className="w-full h-20 relative mt-4 bg-[#0D1316] shadow-inner-strong">
                <TopArrowMarker />
                <div ref={viewportRef} className="h-full w-full overflow-hidden">
                    <div
                        className="absolute top-0 left-0 flex items-center gap-2"
                        style={{
                            transform: `translate3d(${translateX}px, 0, 0)`,
                            transition: isAnimating
                                ? 'transform 7000ms cubic-bezier(0.25, 1, 0.5, 1)'
                                : 'none',
                            willChange: 'transform'
                        }}
                    >
                        {reel.map((num, index) => <NumberTile key={index} num={num} />)}
                    </div>
                </div>
                
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0D1316] to-transparent pointer-events-none z-10" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0D1316] to-transparent pointer-events-none z-10" />
            </div>
            
            <style>{`
              .shadow-inner-strong {
                  box-shadow: inset 0 4px 8px rgba(0,0,0,0.4), inset 0 -4px 8px rgba(0,0,0,0.4);
              }
            `}</style>
        </div>
    );
};