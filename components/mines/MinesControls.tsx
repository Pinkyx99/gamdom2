
import React from 'react';
import { Profile } from '../../types';
import { LogoIcon } from '../icons';

interface MinesControlsProps {
    betAmount: number;
    setBetAmount: (amount: number) => void;
    numMines: number;
    setNumMines: (mines: number) => void;
    gameState: 'idle' | 'playing' | 'busted' | 'cashed_out';
    onStartGame: () => void;
    onCashout: () => void;
    profit: number;
    nextProfit: number;
    currentMultiplier: number;
    gemsFound: number;
    onReset: () => void;
    profile: Profile | null;
}

export const MinesControls: React.FC<MinesControlsProps> = ({
    betAmount, setBetAmount, numMines, setNumMines, gameState, onStartGame,
    onCashout, profit, nextProfit, currentMultiplier, gemsFound, onReset, profile
}) => {
    
    const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setBetAmount(parseFloat(val) || 0);
    };
    
    const handleSetBet = (modifier: 'min' | 'half' | 'double' | 'max') => {
        switch(modifier) {
            case 'min': setBetAmount(0.01); break;
            case 'half': setBetAmount(Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)))); break;
            case 'double': setBetAmount(parseFloat((betAmount * 2).toFixed(2))); break;
            case 'max': setBetAmount(profile?.balance ?? 0); break;
        }
    }

    const handleMinesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        if (val >= 1 && val <= 24) setNumMines(val);
    };

    const isIdle = gameState === 'idle';
    const isPlaying = gameState === 'playing';
    const isBusted = gameState === 'busted';
    const isCashedOut = gameState === 'cashed_out';

    const renderActionButton = () => {
        if (isBusted) {
            return (
                <button onClick={onReset} className="w-full py-4 text-center rounded-lg text-lg font-bold bg-[#f44336] text-white transition-transform hover:scale-105 shadow-lg shadow-red-500/30">
                    Busted! Try Again
                </button>
            );
        }
        if (isCashedOut) {
            return (
                <button onClick={onReset} className="w-full py-3 text-center rounded-lg text-lg font-bold bg-accent-green text-white transition-transform hover:scale-105 shadow-lg shadow-green-500/30">
                    <div className="leading-tight">Won ${profit.toFixed(2)}</div>
                    <div className="text-sm font-semibold opacity-90">Play Again</div>
                </button>
            );
        }
        if (isPlaying) {
            return (
                <button onClick={onCashout} disabled={gemsFound === 0} className="w-full py-3 text-center rounded-lg text-lg font-bold bg-yellow-500 text-white transition-transform hover:scale-105 shadow-lg shadow-yellow-500/30 disabled:bg-gray-500 disabled:shadow-none disabled:scale-100 disabled:cursor-not-allowed">
                    <div className="leading-tight">Cashout</div>
                    <div className="text-sm font-semibold opacity-90">${profit.toFixed(2)}</div>
                </button>
            );
        }
        if (isIdle) {
            const insufficientFunds = profile && betAmount > profile.balance;
             if (insufficientFunds) {
                 return (
                    <button disabled className="w-full py-4 text-center rounded-lg text-lg font-bold bg-gray-600 text-white/50 cursor-not-allowed">
                        Insufficient Funds
                    </button>
                 );
             }
            return (
                <button onClick={onStartGame} className="w-full py-4 text-center rounded-lg text-lg font-bold bg-[#15e38a] text-[#0b1016] transition-transform hover:scale-105 shadow-lg shadow-green-500/30">
                    Start playing
                </button>
            );
        }
    };

    return (
        <div className="w-full max-w-sm lg:w-80 bg-[#202a35] p-5 rounded-xl shadow-2xl border border-gray-700/50 flex-shrink-0">
            <div className="flex mb-4">
                <button className="flex-1 py-2 text-center text-white bg-[#3c4a59] rounded-l-md font-semibold">Manual</button>
                <button className="flex-1 py-2 text-center text-gray-400 bg-[#2f3b47] rounded-r-md font-semibold">Auto</button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs text-gray-400 font-medium">Your Bet</label>
                    <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 font-bold">$</span>
                        <input
                            type="number"
                            value={betAmount.toFixed(2)}
                            onChange={handleBetChange}
                            disabled={!isIdle}
                            className="w-full bg-[#2f3b47] text-white font-semibold py-2.5 pl-8 pr-4 rounded-md border border-gray-600/50 focus:ring-2 focus:ring-green-400 focus:outline-none disabled:opacity-50"
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                        {['min', 'half', 'double', 'max'].map((mod) => (
                           <button key={mod} onClick={() => handleSetBet(mod as any)} disabled={!isIdle} className="py-1.5 bg-[#3c4a59] text-gray-300 text-xs font-bold rounded-md hover:bg-gray-600/60 disabled:opacity-50">
                                {mod === 'half' ? '1/2' : mod === 'double' ? 'X2' : mod.toUpperCase()}
                           </button>
                        ))}
                    </div>
                </div>
                
                <div>
                    <div className="flex justify-between items-center">
                        <label className="text-xs text-gray-400 font-medium">Mines</label>
                        <input
                            type="number"
                            value={numMines}
                            onChange={handleMinesChange}
                            min={1} max={24}
                            disabled={!isIdle}
                            className="w-16 bg-[#2f3b47] text-white font-semibold py-1 px-2 text-center rounded-md border border-gray-600/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50"
                        />
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="24"
                        value={numMines}
                        onChange={handleMinesChange}
                        disabled={!isIdle}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer mt-2 accent-green-500 disabled:opacity-50"
                    />
                </div>
                
                {isPlaying && (
                     <div className="bg-[#2f3b47] p-3 rounded-lg text-center space-y-1">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="text-gray-400">Gems found: <span className="text-white font-semibold">{gemsFound}</span></div>
                            <div className="text-gray-400">Multiplier: <span className="text-white font-semibold">{currentMultiplier.toFixed(2)}x</span></div>
                        </div>
                         <div className="text-sm">
                            <span className="text-gray-400">Next tile profit: </span>
                            <span className="text-green-400 font-bold">${(nextProfit - profit).toFixed(2)}</span>
                        </div>
                    </div>
                )}

            </div>

            <div className="mt-6">
                {renderActionButton()}
            </div>
            
            <div className="mt-6 flex items-center space-x-2">
                 <LogoIcon className="h-6 w-6 text-white" />
                 <span className="font-sans font-extrabold text-xl text-white tracking-tighter">Gamboom</span>
            </div>
            
        </div>
    );
};
