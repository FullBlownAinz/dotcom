import React, { useState } from 'react';

interface LoadingImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    containerClassName?: string;
}

const LoadingImage: React.FC<LoadingImageProps> = ({ 
    src, 
    alt, 
    className, 
    containerClassName, 
    ...props 
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    return (
        <div className={`relative overflow-hidden bg-[#0A0A0A] ${containerClassName || ''}`}>
             <img
                src={src}
                alt={alt}
                className={`block transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className || ''}`}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                }}
                {...props}
            />
            
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                    <div className="w-12 h-[2px] bg-gray-800">
                         <div className="h-full bg-fba-red animate-loading-bar origin-left" />
                    </div>
                </div>
            )}
            
            {/* Error Overlay */}
            {hasError && (
                 <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#0A0A0A] border border-fba-red/30 p-1 pointer-events-none">
                    <span className="font-mono text-[10px] text-fba-red break-all text-center">ERR</span>
                </div>
            )}
            
             <style>{`
                @keyframes loading-bar {
                    0% { transform: scaleX(0); }
                    50% { transform: scaleX(1); }
                    100% { transform: scaleX(0); transform-origin: right; }
                }
                .animate-loading-bar {
                    animation: loading-bar 1.5s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default LoadingImage;