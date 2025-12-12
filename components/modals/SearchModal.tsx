import React, { useState, useMemo, useEffect, useRef } from 'react';
import Portal from '../ui/Portal.tsx';
import { X, Search as SearchIcon, ArrowRight } from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin.ts';
import Input from '../ui/Input.tsx';

interface SearchModalProps {
    onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ onClose }) => {
    const { posts, merch, apps } = useAdmin();
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus input on mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const results = useMemo(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();

        const foundPosts = posts
            .filter(p => !p.hidden && (p.title.toLowerCase().includes(q) || JSON.stringify(p.body_richtext).toLowerCase().includes(q)))
            .map(p => ({ ...p, type: 'POST', sortDate: p.created_at }));

        const foundMerch = merch
            .filter(m => !m.hidden && (m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)))
            .map(m => ({ ...m, title: m.name, type: 'MERCH', sortDate: m.created_at }));

        const foundApps = apps
            .filter(a => !a.hidden && (a.name.toLowerCase().includes(q) || a.short_desc.toLowerCase().includes(q)))
            .map(a => ({ ...a, title: a.name, type: 'APP', sortDate: a.created_at }));

        // Combine and sort by relevance or date (simple sort here)
        return [...foundPosts, ...foundMerch, ...foundApps];
    }, [query, posts, merch, apps]);

    const handleNavigate = (id: string) => {
        onClose();
        // Allow modal to close and DOM to settle
        setTimeout(() => {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    };

    return (
        <Portal>
            <div 
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
                onClick={onClose}
            >
                <div 
                    className="bg-[#0A0A0A] border-2 border-fba-red w-[90vw] md:w-[60vw] h-[60vh] flex flex-col shadow-2xl relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center gap-4 p-4 border-b border-gray-800">
                        <SearchIcon className="text-fba-red" size={24} />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="SEARCH SYSTEM..."
                            className="bg-transparent border-none focus:ring-0 text-fba-white font-display uppercase text-lg w-full placeholder-gray-600"
                        />
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Results */}
                    <div className="flex-grow overflow-y-auto custom-scrollbar p-4">
                        {query.trim() === '' ? (
                            <div className="h-full flex items-center justify-center text-gray-600 font-mono uppercase text-sm">
                                Enter query to search database
                            </div>
                        ) : results.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-600 font-mono uppercase text-sm">
                                No results found
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {results.map((item) => (
                                    <button
                                        key={`${item.type}-${item.id}`}
                                        onClick={() => handleNavigate(item.id)}
                                        className="w-full text-left p-4 bg-black/50 border border-gray-800 hover:border-fba-red hover:bg-gray-900 transition-all group flex items-center justify-between"
                                    >
                                        <div>
                                            <span className="text-xs text-fba-red font-mono mb-1 block">{item.type}</span>
                                            <h3 className="font-display uppercase text-fba-white">{item.title}</h3>
                                        </div>
                                        <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity text-fba-red" size={20} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Footer stats */}
                    <div className="p-2 border-t border-gray-800 bg-black text-[10px] text-gray-500 font-mono text-right uppercase">
                        {results.length} RESULTS FOUND
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default SearchModal;