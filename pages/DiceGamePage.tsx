
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Profile } from '../types';
import { Session } from '@supabase/supabase-js';
import { DiceControls } from '../components/dice/DiceControls';
import { DiceDial } from '../components/dice/DiceDial';
import { supabase } from '../lib/supabaseClient';
import { DiceInfo } from '../components/dice/DiceInfo';

export interface RollResult {
    id: string;
    value: number;
    win: boolean;
    betAmount: number;
    payout: number;
    multiplier: number;
    isRollOver: boolean;
    rollValue: number;
    createdAt: string;
}

const HOUSE_EDGE = 0.01; // 1%

// Define helper components for the top history bar
const HistoryItem: React.FC<{ result: RollResult }> = ({ result }) => (
    <div className={`flex-shrink-0 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${result.win ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
        {result.value.toFixed(2)}
    </div>
);

const HistoryRefreshIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0119.5 19.5" />
    </svg>
);


const DiceGamePage: React.FC<{
    profile: Profile | null;
    session: Session | null;
    onProfileUpdate: () => void;
}> = ({ profile, session, onProfileUpdate }) => {
    const [betAmount, setBetAmount] = useState(1.00);
    const [rollValue, setRollValue] = useState(50.5);
    const [isRollOver, setIsRollOver] = useState(true);
    const [gameState, setGameState] = useState<'idle' | 'rolling' | 'finished'>('idle');
    const [history, setHistory] = useState<RollResult[]>([]);
    const [lastRoll, setLastRoll] = useState<RollResult | null>(null);
    const [previousRollValue, setPreviousRollValue] = useState<number>(50); // Start at center
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const { winChance, multiplier } = useMemo(() => {
        let chance: number;
        if (isRollOver) {
            chance = 100 - rollValue;
        } else {
            chance = rollValue;
        }
        chance = Math.max(0.01, Math.min(99.99, chance));

        const mult = (100 * (1 - HOUSE_EDGE)) / chance;
        return {
            winChance: chance,
            multiplier: Math.min(9900, Math.max(1.0102, mult)),
        };
    }, [rollValue, isRollOver]);
    
    const profitOnWin = useMemo(() => betAmount * (multiplier - 1), [betAmount, multiplier]);

    const handleRollValueChange = useCallback((newValue: number) => {
        const clampedValue = Math.max(0.01, Math.min(99.99, newValue));
        setRollValue(clampedValue);
    }, []);

    const handleMultiplierChange = useCallback((newMultiplier: number) => {
        const clampedMultiplier = Math.max(1.0102, Math.min(9900, newMultiplier));
        const newWinChance = (100 * (1 - HOUSE_EDGE)) / clampedMultiplier;
        
        if (isRollOver) {
            setRollValue(100 - newWinChance);
        } else {
            setRollValue(newWinChance);
        }
    }, [isRollOver]);
    
    const handleRollDice = useCallback(async () => {
        if (gameState !== 'idle' || !session || !profile) {
            if (!session) setError("Please sign in to play.");
            return;
        }
        if (betAmount <= 0) {
            setError("Bet amount must be greater than zero.");
            return;
        }
        if (profile.balance < betAmount) {
            setError("Insufficient funds.");
            return;
        }
        
        setError(null);
        setGameState('rolling');
        setLastRoll(null); // Clear previous result immediately

        try {
            // Step 1: Debit balance and update wagered amount
            const { error: debitError } = await supabase
                .from('profiles')
                .update({ 
                    balance: (Number(profile.balance) || 0) - betAmount,
                    wagered: (Number(profile.wagered) || 0) + betAmount,
                })
                .eq('id', session.user.id);
            if (debitError) throw new Error(debitError.message);
            
            // Step 2: Increment games played via a secure RPC call
            const { error: rpcError } = await supabase.rpc('increment_games_played', { p_user_id: session.user.id });
            if (rpcError) {
                // Non-critical error, log it but let the game proceed
                console.error("Failed to increment games_played for Dice:", rpcError.message);
            }

            onProfileUpdate();

            await new Promise(resolve => setTimeout(resolve, 100));

            const resultValue = parseFloat((Math.random() * 100).toFixed(2));
            const win = isRollOver ? resultValue > rollValue : resultValue < rollValue;
            const payout = win ? betAmount * multiplier : 0;

            if (win) {
                // Fetch the latest balance before adding the payout to prevent race conditions
                const { data: currentProfile, error: fetchError } = await supabase.from('profiles').select('balance').eq('id', session.user.id).single();
                if (fetchError) throw new Error(fetchError.message);
                if (!currentProfile) throw new Error("Could not find user profile to update balance.");

                const newBalance = (Number(currentProfile.balance) || 0) + payout;
                const { error: payoutError } = await supabase
                    .from('profiles')
                    .update({ balance: newBalance })
                    .eq('id', session.user.id);
                
                if (payoutError) throw new Error(payoutError.message);
            }

            const result: RollResult = {
                id: crypto.randomUUID(),
                value: resultValue,
                win,
                betAmount,
                payout,
                multiplier,
                isRollOver,
                rollValue,
                createdAt: new Date().toISOString(),
            };

            setLastRoll(result);
            setHistory(prev => [result, ...prev].slice(0, 50));
            setGameState('finished');
            onProfileUpdate();

        } catch (e: any) {
            setError(e.message || "An error occurred.");
            setGameState('idle');
            onProfileUpdate();
        }
    }, [gameState, isRollOver, rollValue, betAmount, multiplier, session, profile, onProfileUpdate]);


    useEffect(() => {
        if (gameState === 'finished') {
            const timer = setTimeout(() => {
                setGameState('idle');
                if (lastRoll) {
                    setPreviousRollValue(lastRoll.value); // Set the previous value for the *next* roll
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [gameState, lastRoll]);

    return (
        <div className="flex flex-col flex-1 bg-[#081018] font-sans">
            <div className="bg-[#0D1316] border-b border-outline flex-shrink-0">
                <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 flex items-center space-x-2 p-2 overflow-x-auto no-scrollbar">
                    {history.map((item, index) => (
                        <HistoryItem key={item.id || index} result={item} />
                    ))}
                    <button className="flex-shrink-0 ml-2 p-1.5 rounded text-gray-500 hover:text-white hover:bg-white/10">
                        <HistoryRefreshIcon />
                    </button>
                </div>
            </div>
            <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 py-4 lg:py-6 flex-1 flex flex-col justify-center">
                <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-6">
                    <DiceControls
                        betAmount={betAmount}
                        setBetAmount={setBetAmount}
                        rollValue={rollValue}
                        onRollValueChange={handleRollValueChange}
                        multiplier={multiplier}
                        onMultiplierChange={handleMultiplierChange}
                        winChance={winChance}
                        profitOnWin={profitOnWin}
                        isRollOver={isRollOver}
                        setIsRollOver={setIsRollOver}
                        onRollDice={handleRollDice}
                        gameState={gameState}
                        error={error}
                        profile={profile}
                    />
                    <div className="bg-card-bg rounded-lg border border-outline shadow-soft flex flex-col min-h-[500px] lg:min-h-0">
                        <DiceDial
                            rollValue={rollValue}
                            isRollOver={isRollOver}
                            gameState={gameState}
                            lastRoll={lastRoll}
                            onRollValueChange={handleRollValueChange}
                            previousRollValue={previousRollValue}
                        />
                    </div>
                </div>
            </div>
            <DiceInfo />
        </div>
    );
};

export default DiceGamePage;
