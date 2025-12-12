import React, { useState } from 'react';
import Portal from '../ui/Portal.tsx';
import Button from '../ui/Button.tsx';
import { X } from 'lucide-react';
import { SiteSettings } from '../../types/index.ts';

interface EditOverlayModalProps {
    settings: SiteSettings['overlay_animation'];
    onClose: () => void;
    onSave: (overlay: SiteSettings['overlay_animation']) => void;
}

const EditOverlayModal: React.FC<EditOverlayModalProps> = ({ settings, onClose, onSave }) => {
    const [enabled, setEnabled] = useState(settings?.enabled || false);
    const [type, setType] = useState<'snow' | 'leaves' | 'confetti'>(settings?.type || 'snow');

    const handleSave = () => {
        onSave({ enabled, type });
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
                        <h2 className="font-display text-lg uppercase">Overlay Animation</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 border border-gray-800 p-4 bg-black/50">
                            <input
                                type="checkbox"
                                id="overlay-enabled"
                                checked={enabled}
                                onChange={(e) => setEnabled(e.target.checked)}
                                className="w-5 h-5 accent-fba-red"
                            />
                            <label htmlFor="overlay-enabled" className="font-display uppercase text-sm cursor-pointer select-none">
                                Enable Animation
                            </label>
                        </div>

                        <div>
                            <label className="font-display text-sm text-gray-400 mb-2 block">Effect Type</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setType('snow')}
                                    className={`p-3 border text-center uppercase text-xs font-bold transition-colors ${type === 'snow' ? 'bg-fba-red text-white border-fba-red' : 'bg-black border-gray-700 text-gray-400 hover:border-gray-500'}`}
                                >
                                    Snow
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('leaves')}
                                    className={`p-3 border text-center uppercase text-xs font-bold transition-colors ${type === 'leaves' ? 'bg-fba-red text-white border-fba-red' : 'bg-black border-gray-700 text-gray-400 hover:border-gray-500'}`}
                                >
                                    Leaves
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('confetti')}
                                    className={`p-3 border text-center uppercase text-xs font-bold transition-colors ${type === 'confetti' ? 'bg-fba-red text-white border-fba-red' : 'bg-black border-gray-700 text-gray-400 hover:border-gray-500'}`}
                                >
                                    Confetti
                                </button>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500">
                            This animation will appear over the entire site. Interactions underneath will still work.
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

export default EditOverlayModal;