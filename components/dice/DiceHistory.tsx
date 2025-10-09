
import React from 'react';
import { RollResult } from '../../pages/DiceGamePage';

const ClockIcon: React.FC = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);

const InfoIcon: React.FC = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);


const HistoryRow: React.FC<{ result: RollResult }> = ({ result }) => {
    return (
        <div className={`grid grid-cols-5 gap-4 items-center px-4 py-2.5 text-sm ${result.win ? 'bg-green-500/5' : 'bg-red-500/5'}`}>
            <div className="font-semibold text-white">{result.value.toFixed(2)}</div>
            <div className="text-text-muted">{result.isRollOver ? '>' : '<'} {result.rollValue.toFixed(2)}</div>
            <div className="text-text-muted">{result.multiplier.toFixed(2)}x</div>
            <div className="text-text-muted text-right">${result.betAmount.toFixed(2)}</div>
            <div className={`font-semibold text-right ${result.win ? 'text-accent-green' : 'text-red-500'}`}>
                {result.win ? `+$${(result.payout - result.betAmount).toFixed(2)}` : `-$${result.betAmount.toFixed(2)}`}
            </div>
        </div>
    )
}

export const DiceHistory: React.FC<{ history: RollResult[] }> = ({ history }) => {
    return (
        <div className="flex flex-col border-t border-outline">
            <div className="flex items-center justify-between px-4 py-2 bg-[#0D1316]">
                <div className="flex items-center space-x-2 text-sm text-text-muted font-semibold">
                    <ClockIcon />
                    <span>History</span>
                </div>
                <button className="flex items-center space-x-2 text-sm text-text-muted font-semibold hover:text-white transition-colors">
                    <InfoIcon />
                    <span>Fairness</span>
                </button>
            </div>
            <div className="grid grid-cols-5 gap-4 text-xs text-text-muted uppercase px-4 py-2 font-semibold border-b border-outline">
                <span>Roll</span>
                <span>Target</span>
                <span>Multiplier</span>
                <span className="text-right">Bet</span>
                <span className="text-right">Profit</span>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar max-h-48">
                {history.length > 0 ? (
                    history.map(roll => <HistoryRow key={roll.id} result={roll} />)
                ) : (
                    <div className="flex items-center justify-center h-full p-8 text-text-muted">
                        Your roll history will appear here.
                    </div>
                )}
            </div>
        </div>
    );
};
