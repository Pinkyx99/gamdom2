
import React, { useState } from 'react';
import { CURRENCIES, BET_CURRENCIES } from '../constants';

interface WalletDropdownProps {
  show: boolean;
}

export const WalletDropdown: React.FC<WalletDropdownProps> = ({ show }) => {
    const [selectedBetCurrency, setSelectedBetCurrency] = useState('USD');
    
    if (!show) {
        return null;
    }

    return (
        <div className="absolute top-full right-0 mt-2 w-80 bg-card-bg border border-outline rounded-lg shadow-2xl z-40 p-1">
            <div className="p-3">
                {CURRENCIES.map(currency => (
                    <div key={currency.code} className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-white/5">
                        <div className="flex items-center space-x-3">
                            {currency.icon}
                            <span className="text-sm font-medium text-white">{currency.code}</span>
                        </div>
                        <span className="text-sm text-text-muted">{currency.balance}</span>
                    </div>
                ))}
            </div>
            
            <div className="border-t border-outline p-3">
                <h4 className="text-xs font-semibold text-text-muted uppercase mb-3">Bet Currency</h4>
                <div className="grid grid-cols-3 gap-2">
                    {BET_CURRENCIES.map(currency => (
                        <label key={currency.code} className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="bet-currency"
                                value={currency.code}
                                checked={selectedBetCurrency === currency.code}
                                onChange={() => setSelectedBetCurrency(currency.code)}
                                className="hidden"
                            />
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selectedBetCurrency === currency.code ? 'border-accent-green bg-accent-green' : 'border-text-muted'}`}>
                                {selectedBetCurrency === currency.code && <div className="w-1.5 h-1.5 bg-card-bg rounded-full"></div>}
                            </div>
                            <span className={`text-sm ${selectedBetCurrency === currency.code ? 'text-white' : 'text-text-muted'}`}>{currency.code}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};
