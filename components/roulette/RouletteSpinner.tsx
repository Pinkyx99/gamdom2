
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
    const progress = (countdown / 15); // 0 to 1

    switch (gameState) {
        case 'betting':
            return (
                <div className="relative w-48 h-48 flex flex-col items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" className="stroke-current text-white/5" strokeWidth="3" fill="none" />
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            className="stroke-current text-red-500"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={2 * Math.PI * 45}
                            strokeDashoffset={2 * Math.PI * 45 * (1 - progress)}
                            strokeLinecap="round"
                            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.1s linear' }}
                        />
                    </svg>
                    <div className="text-center">
                        <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">Spinning in</h2>
                        <p className="font-display font-bold text-5xl text-white my-1">{countdown.toFixed(1)}s</p>
                    </div>
                </div>
            );
        case 'spinning':
            return (
                <div className="text-center flex flex-col items-center bg-black/30 backdrop-blur-sm p-4 rounded-2xl">
                    <p className="text-xl font-bold text-white">Spinning...</p>
                     <div className="w-48 h-1 bg-white/20 mt-2 rounded-full overflow-hidden">
                        <div className="h-full bg-white/50 animate-spin-progress"></div>
                    </div>
                </div>
            );
        case 'ended': {
             if (winningNumber === null) return <div className="h-48 w-48"></div>; // Placeholder
            return (
                <div className="text-center flex flex-col items-center justify-center">
                    <p className="text-lg font-semibold text-text-muted">Landed on</p>
                     <div className={`w-24 h-24 mt-2 rounded-xl flex items-center justify-center text-6xl font-bold text-white ${getNumberColorClass(winningNumber)}`}>
                        {winningNumber}
                    </div>
                </div>
            );
        }
        default:
            return <div className="h-48 w-48"></div>; // Placeholder to maintain height
    }
};

const TopArrowMarker: React.FC = () => (
    <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
        <svg width="24" height="14" viewBox="0 0 24 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="text-white drop-shadow-lg">
            <path d="M0 0 L24 0 L12 14 Z" />
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
        <div className="bg-card pt-4 rounded-xl border border-outline relative overflow-hidden shadow-lg">
            <div className="absolute top-4 right-4 flex justify-end items-center z-30">
                <div className="flex items-center space-x-1">
                    <button className="w-8 h-8 rounded-md bg-black/30 text-text-muted hover:text-white transition flex items-center justify-center"><MutedSoundIcon className="w-5 h-5"/></button>
                    <button className="w-8 h-8 rounded-md bg-black/30 text-text-muted hover:text-white transition flex items-center justify-center"><InfoCircleIcon className="w-5 h-5"/></button>
                    <button className="w-8 h-8 rounded-md bg-black/30 text-text-muted hover:text-white transition flex items-center justify-center"><CheckCircleIcon className="w-5 h-5"/></button>
                </div>
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                 <GameStatusDisplay gameState={gameState} countdown={countdown} winningNumber={winningNumber} />
            </div>
            
            <div className="w-full h-20 relative mt-16">
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
                
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-card to-transparent pointer-events-none z-10" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-card to-transparent pointer-events-none z-10" />
            </div>
            
            <style>{`
              @keyframes spin-progress-bar-anim {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
              .animate-spin-progress {
                width: 50%;
                animation: spin-progress-bar-anim 1.5s linear infinite;
              }
            `}</style>
        </div>
    );
};
