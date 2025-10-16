import React from 'react';
import { GoogleIcon } from './icons';

interface HeroProps {
    onSignUpClick: () => void;
    onGoogleSignInClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSignUpClick, onGoogleSignInClick }) => {
    return (
        <div className="relative rounded-2xl p-6 lg:p-8 flex flex-col justify-between min-h-[450px] bg-cover" style={{backgroundImage: 'url(https://i.imgur.com/KRgJFwR.png)', backgroundPosition: 'center 30%'}}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent rounded-2xl"></div>
            
            <div className="relative z-10">
                {/* This empty div is kept to maintain the flexbox structure but the content has been removed. */}
            </div>

            <div className="relative z-10 flex justify-start items-end">
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
            </div>
        </div>
    );
};
