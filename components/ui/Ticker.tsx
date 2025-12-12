import React from 'react';

interface TickerProps {
    text: string;
    speed?: number;
}

const Ticker: React.FC<TickerProps> = ({ text, speed = 20 }) => {
    if (!text) return null;

    return (
        <div className="w-full bg-fba-black border-b border-gray-800 overflow-hidden h-10 flex items-center relative z-20">
            <div 
                className="whitespace-nowrap animate-marquee"
                style={{ 
                    animationDuration: `${speed}s`,
                    animationDelay: '5s'
                }}
            >
                <span className="text-fba-white uppercase font-['VT323'] text-xl tracking-widest px-4 leading-[2.5rem]">
                    {text}
                </span>
            </div>
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    display: inline-block;
                    padding-left: 100%; /* Start from right */
                    animation-name: marquee;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }
            `}</style>
        </div>
    );
};

export default Ticker;