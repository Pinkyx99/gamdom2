import React from 'react';
import { GoogleIcon } from './icons';

const SmallGameCard: React.FC<{ name: string, image: string, active?: boolean }> = ({ name, image, active }) => (
    <div className={`relative rounded-xl overflow-hidden cursor-pointer flex-shrink-0 w-28 h-36 ${active ? 'ring-2 ring-primary shadow-glow-primary' : ''}`}>
        <img src={image} alt={name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <p className="absolute bottom-2 left-2 right-2 text-white font-bold text-sm leading-tight uppercase">{name}</p>
    </div>
);

interface HeroProps {
    onSignUpClick: () => void;
    onGoogleSignInClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSignUpClick, onGoogleSignInClick }) => {
    const games = [
        { name: 'Release the Kraken', image: 'https://i.imgur.com/N0lFc8l.jpeg', active: false },
        { name: 'Twilight Princess', image: 'https://i.imgur.com/nxsDFGh.jpeg', active: true },
        { name: 'Book of Cats', image: 'https://i.imgur.com/H2vXi9M.jpeg', active: false },
        { name: 'Badge Blitz', image: 'https://i.imgur.com/9uZRo6a.jpeg', active: false },
    ];

    return (
        <div className="relative rounded-2xl p-6 lg:p-8 flex flex-col justify-between min-h-[450px] bg-cover bg-top" style={{backgroundImage: 'url(https://i.imgur.com/wiCzOFG.png)'}}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent rounded-2xl"></div>
            
            <div className="relative z-10">
                {/* Top section: User info & Big Win tag */}
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-black/50 p-1.5 pr-4 rounded-full">
                        <img src="https://i.imgur.com/L4pP31z.png" alt="VTRAIN83 avatar" className="w-8 h-8 rounded-full" />
                        <div>
                            <p className="text-white font-bold text-sm">VTRAIN83</p>
                            <p className="text-primary-light font-bold text-sm">⚡ 40,000</p>
                        </div>
                    </div>
                    <div className="bg-pink-500/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                        <span>💰</span>
                        <span>Big Win</span>
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex justify-between items-end">
                {/* Left section: Game Info & CTA */}
                <div>
                    <h1 className="text-5xl lg:text-6xl font-black text-white" style={{textShadow: '0 4px 15px rgba(0,0,0,0.5)'}}>
                        Gates of Olympus
                    </h1>
                    <div className="flex items-center space-x-2 mt-3 text-text-muted font-medium">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span>2.4k players play now</span>
                    </div>
                    <div className="mt-6 flex items-center space-x-4">
                        <button 
                            onClick={onSignUpClick}
                            className="bg-white hover:bg-gray-200 text-black font-semibold px-6 py-3 rounded-lg text-sm transition"
                        >
                            Sign Up Now
                        </button>
                        <span className="text-text-muted">or join with</span>
                        <button onClick={onGoogleSignInClick} className="w-10 h-10 flex items-center justify-center bg-card rounded-full hover:bg-card/70">
                            <GoogleIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>

                {/* Right section: Game Carousel */}
                <div className="hidden lg:flex items-center space-x-4">
                    <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-transform hover:scale-110">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    {games.map((game, index) => (
                        <SmallGameCard key={index} {...game} />
                    ))}
                    <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-transform hover:scale-110">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};