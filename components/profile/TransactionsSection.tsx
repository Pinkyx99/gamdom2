import React, { useState } from 'react';
import { SectionShell } from './shared/SectionShell';

export const TransactionsSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState('All');
    const tabs = ['All', 'Deposits', 'Withdraws', 'Tips'];
    
    const transactions = [
        { type: 'Tip Received', amount: 4.00, date: '9/22/2025, 3:29:06 PM', status: 'Success' },
        { type: 'Tip Received', amount: 1.97, date: '9/22/2025, 2:56:31 PM', status: 'Success' },
        { type: 'Deposit', amount: 10.00, date: '9/22/2025, 11:22:27 AM', status: 'Pending' },
        { type: 'Tip Received', amount: 1.00, date: '9/21/2025, 5:37:46 PM', status: 'Success' },
        { type: 'Tip Received', amount: 1.00, date: '9/21/2025, 5:27:15 PM', status: 'Success' },
    ];

    const statusColor = {
        'Success': 'text-accent-green',
        'Pending': 'text-yellow-400',
        'Failed': 'text-red-500',
    };

    return (
        <SectionShell title="Transactions">
            <div className="flex items-center border-b border-outline mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? 'text-white border-b-2 border-accent-green' : 'text-text-muted hover:text-white'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="space-y-2">
                {transactions.map((tx, index) => (
                    <div key={index} className="grid grid-cols-4 items-center p-3 rounded-lg hover:bg-white/5 cursor-pointer">
                        <div className="col-span-2">
                            <p className="font-semibold text-white">${tx.amount.toFixed(2)}</p>
                            <p className="text-xs text-text-muted">{tx.type}</p>
                        </div>
                        <p className="text-sm text-text-muted justify-self-start">{tx.date}</p>
                        <div className="flex items-center space-x-2 justify-self-end">
                            <span className={`text-sm font-semibold ${statusColor[tx.status as keyof typeof statusColor]}`}>{tx.status}</span>
                            <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="flex justify-center items-center space-x-2 mt-8">
                <button className="h-8 w-8 rounded-full bg-card-bg/80 flex items-center justify-center text-text-muted"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg></button>
                <button className="h-8 w-8 rounded-md bg-accent-green text-white font-bold text-sm">1</button>
                <button className="h-8 w-8 rounded-md bg-background text-text-muted font-bold text-sm">2</button>
                <button className="h-8 w-8 rounded-full bg-card-bg/80 flex items-center justify-center text-text-muted"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg></button>
            </div>
        </SectionShell>
    );
};
