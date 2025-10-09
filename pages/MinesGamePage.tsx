

import React, { useState, useCallback, useMemo } from 'react';
import { Profile } from '../types';
import { Session } from '@supabase/supabase-js';
import { MinesControls } from '../components/mines/MinesControls';
import { MinesGrid } from '../components/mines/MinesGrid';
import { MinesSoundIcon, MinesSpeedIcon, MinesHistoryIcon, MinesTimerIcon, MinesHelpIcon } from '../components/mines/MinesIcons';
import { supabase } from '../lib/supabaseClient';

// --- Provably Fair Helper Functions ---

// 1. SHA256 Hex Hasher
async function sha256Hex(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 2. Hex to Uint32 Array for RNG seed
function hexToUint32Array(hex: string): Uint32Array {
    const u32s = new Uint32Array(8);
    for (let i = 0; i < 8; i++) {
        u32s[i] = parseInt(hex.substring(i * 8, (i + 1) * 8), 16);
    }
    return u32s;
}

// 3. Xorshift32 RNG
function makeXorshift32(seedArray: Uint32Array) {
    let state = [...seedArray];
    return function() {
        let t = state[0];
        t ^= t << 11;
        t ^= t >> 8;
        state[0] = state[1];
        state[1] = state[2];
        state[2] = state[3];
        t ^= state[3];
        t ^= state[3] >> 19;
        state[3] = t;
        return (state[3] & 0xFFFFFFFF) / 0x100000000;
    };
}

// 4. Seeded Fisher-Yates Shuffle
function seededShuffle<T>(arr: T[], rng: () => number): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}


// --- Multiplier Calculation ---
function calculateMultiplier(gemsFound: number, numMines: number): number {
    if (gemsFound === 0) return 1.0;

    const C = 25;
    const M = numMines;
    const HOUSE_EDGE = 0.01;
    let payout = 1.0;

    for (let i = 1; i <= gemsFound; i++) {
        // Payout for step i = (Total Tiles Left) / (Safe Tiles Left)
        const stepPayout = (C - (i - 1)) / (C - M - (i - 1));
        payout *= stepPayout;
    }
    
    // Apply house edge to the final fair payout
    const multiplier = payout * (1 - HOUSE_EDGE);
    
    // Round to 4 decimal places for display
    return parseFloat(multiplier.toFixed(4));
}


interface MinesGamePageProps {
    profile: Profile | null;
    session: Session | null;
    onProfileUpdate: () => void;
}


const MinesGamePage: React.FC<MinesGamePageProps> = ({ profile, session, onProfileUpdate }) => {
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'busted' | 'cashed_out'>('idle');
    const [betAmount, setBetAmount] = useState(0.01);
    const [numMines, setNumMines] = useState(3);
    const [gridState, setGridState] = useState<( 'hidden' | 'gem' | 'mine' )[]>(Array(25).fill('hidden'));
    const [mineLocations, setMineLocations] = useState<Set<number>>(new Set());
    const [revealedTiles, setRevealedTiles] = useState<Set<number>>(new Set());
    const [gemsFound, setGemsFound] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [shake, setShake] = useState(false);

    const currentMultiplier = useMemo(() => calculateMultiplier(gemsFound, numMines), [gemsFound, numMines]);
    const profit = useMemo(() => betAmount * currentMultiplier, [betAmount, currentMultiplier]);
    const nextGemMultiplier = useMemo(() => calculateMultiplier(gemsFound + 1, numMines), [gemsFound, numMines]);
    const nextProfit = useMemo(() => betAmount * nextGemMultiplier, [betAmount, nextGemMultiplier]);
    
    const resetGame = useCallback((isNewGame = true) => {
        setGameState('idle');
        setGemsFound(0);
        setRevealedTiles(new Set());
        if(isNewGame){
            setGridState(Array(25).fill('hidden'));
            setMineLocations(new Set());
        }
    }, []);

    const handleStartGame = useCallback(async () => {
        if (gameState !== 'idle') return;
        if (!session || !profile || betAmount > profile.balance) {
            setError("Insufficient funds.");
            return;
        }
        
        const { data, error: rpcError } = await supabase.rpc('place_mines_bet', { bet_amount_in: betAmount });

        if (rpcError || (data && !data.success)) {
            setError(data?.message || rpcError?.message || "Failed to place bet.");
            return;
        }

        if (session) {
            const { error: rpcError } = await supabase.rpc('increment_games_played', { p_user_id: session.user.id });
            if (rpcError) {
                // This is a non-critical error, so we just log it and don't block the user.
                console.error("Error incrementing games_played for Mines:", rpcError.message);
            }
        }

        onProfileUpdate();
        resetGame(true);
        
        // --- Provably Fair Mine Placement ---
        const serverSeed = Math.random().toString(36).substring(2);
        const clientSeed = 'fixed-client-seed-for-demo';
        const nonce = 1;

        const hashSeed = `${serverSeed}:${clientSeed}:${nonce}`;
        const hashHex = await sha256Hex(hashSeed);
        const seedArray = hexToUint32Array(hashHex);
        const rng = makeXorshift32(seedArray);

        const cells = Array.from({ length: 25 }, (_, i) => i);
        const shuffledCells = seededShuffle(cells, rng);
        const newMineLocations = new Set<number>(shuffledCells.slice(0, numMines));
        
        setMineLocations(newMineLocations);
        setGameState('playing');
    }, [numMines, gameState, resetGame, betAmount, profile, onProfileUpdate, session]);
    
    const showFinalGrid = useCallback((hitMineIndex?: number) => {
         const finalGrid = Array(25).fill('hidden').map((_, i) => {
            if (mineLocations.has(i)) {
                return 'mine';
            }
            if (revealedTiles.has(i)) {
                return 'gem';
            }
            return 'hidden';
        });

        if(typeof hitMineIndex === 'number') {
            finalGrid[hitMineIndex] = 'mine';
        }

        setGridState(finalGrid);
    }, [mineLocations, revealedTiles])

    const handleTileClick = useCallback((index: number) => {
        if (gameState !== 'playing' || revealedTiles.has(index)) return;

        const newRevealedTiles = new Set(revealedTiles);
        newRevealedTiles.add(index);
        
        const newGridState = [...gridState];

        if (mineLocations.has(index)) {
            setGameState('busted');
            setShake(true);
            setTimeout(() => setShake(false), 500); // Animation duration
            showFinalGrid(index);
        } else {
            setRevealedTiles(newRevealedTiles);
            newGridState[index] = 'gem';
            setGemsFound(prev => prev + 1);
            setGridState(newGridState);
        }

    }, [gameState, mineLocations, gridState, revealedTiles, showFinalGrid]);

    const handleCashout = useCallback(async () => {
        if (gameState !== 'playing' || gemsFound === 0) return;

        const { error: rpcError } = await supabase.rpc('cashout_mines_game', { profit_in: profit });

        if (rpcError) {
             setError(rpcError.message || "Cashout failed.");
             return;
        }

        onProfileUpdate();
        setGameState('cashed_out');
        showFinalGrid();
    }, [gameState, gemsFound, profit, showFinalGrid, onProfileUpdate]);
    
    return (
        <div className={`flex-1 flex flex-col bg-cover bg-center ${shake ? 'animate-shake' : ''}`} style={{ backgroundImage: "url('https://gamdom.com/_proxied/games/mines/background-large.c5ce2650525728772697.webp')" }}>
            <div className="flex items-center justify-between p-4 z-10">
                <h1 className="font-display text-5xl font-bold text-green-400" style={{ fontFamily: "'Poppins', sans-serif", textShadow: '0 0 15px rgba(26, 227, 138, 0.8), 0 0 5px rgba(255,255,255,0.5)'}}>Mines</h1>
                <div className="flex items-center space-x-2">
                    {[<MinesSoundIcon />, <MinesSpeedIcon />, <MinesHistoryIcon />, <MinesTimerIcon />, <MinesHelpIcon />].map((icon, i) => (
                        <button key={i} className="w-9 h-9 bg-black/40 backdrop-blur-sm rounded-md flex items-center justify-center text-gray-400 hover:text-white hover:bg-black/60 transition-colors border border-white/10">
                            {icon}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-4 lg:p-8 -mt-16">
                 <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-center">
                    <MinesControls
                        betAmount={betAmount}
                        setBetAmount={setBetAmount}
                        numMines={numMines}
                        setNumMines={setNumMines}
                        gameState={gameState}
                        onStartGame={handleStartGame}
                        onCashout={handleCashout}
                        profit={profit}
                        nextProfit={nextProfit}
                        currentMultiplier={currentMultiplier}
                        gemsFound={gemsFound}
                        onReset={() => resetGame(true)}
                        profile={profile}
                    />
                    <MinesGrid
                        gridState={gridState}
                        onTileClick={handleTileClick}
                        gameState={gameState}
                    />
                </div>
            </div>
            <style>{`
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }
                .animate-shake {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                }
            `}</style>
        </div>
    );
};
export default MinesGamePage;