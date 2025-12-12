import React, { useState } from 'react';
import Portal from '../ui/Portal.tsx';
import Input from '../ui/Input.tsx';
import Button from '../ui/Button.tsx';
import { X } from 'lucide-react';

interface EditTickerModalProps {
    initialText: string;
    initialSpeed: number;
    onClose: () => void;
    onSave: (text: string, speed: number) => void;
}

const EditTickerModal: React.FC<EditTickerModalProps> = ({ initialText, initialSpeed, onClose, onSave }) => {
    const [text, setText] = useState(initialText);
    const [speed, setSpeed] = useState(initialSpeed);

    const handleSave = () => {
        onSave(text, Number(speed));
        onClose();
    };

    return (
        <Portal>
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="bg-[#0A0A0A] border-2 border-gray-800 p-6 w-full max-w-lg text-fba-white relative mt-32"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-display text-lg uppercase">Edit Ticker</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <Input
                            id="ticker-text"
                            label="Ticker Text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Enter announcement text..."
                        />
                        
                        <div>
                            <label htmlFor="ticker-speed" className="font-display text-sm text-gray-400 mb-2 block flex justify-between">
                                <span>Speed (Duration)</span>
                                <span>{speed}s</span>
                            </label>
                            <input 
                                id="ticker-speed"
                                type="range" 
                                min="5" 
                                max="250" 
                                step="1"
                                value={speed} 
                                onChange={(e) => setSpeed(Number(e.target.value))}
                                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-fba-red"
                            />
                            <div className="flex justify-between text-[10px] text-gray-500 mt-1 uppercase font-mono">
                                <span>Fast (5s)</span>
                                <span>Slow (250s)</span>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500">
                            This text will scroll horizontally below the header. Leave empty to hide.
                            Font used: VT323 (8-bit style).
                        </p>
                    </div>

                    <div className="pt-6 flex justify-end gap-4">
                        <Button onClick={onClose} variant="secondary">Cancel</Button>
                        <Button onClick={handleSave}>Save</Button>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default EditTickerModal;