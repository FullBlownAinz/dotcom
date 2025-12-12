import React, { useState } from 'react';
import { HatchTile } from '../ui/HatchTile.tsx';
import RichTextViewer from '../ui/RichTextViewer.tsx';
import { useAdmin } from '../../hooks/useAdmin.ts';

const TheScrl = () => {
    const { posts, loading } = useAdmin();
    const [openPostId, setOpenPostId] = useState<string | null>(null);

    const handleTogglePost = (postId: string) => {
        setOpenPostId(current => (current === postId ? null : postId));
    };
    
    const livePosts = posts.filter(p => !p.hidden);

    if (loading && livePosts.length === 0) {
        return <div className="font-display animate-pulse">LOADING SCRL...</div>;
    }

    return (
        <div className="w-full h-full overflow-y-auto px-4 py-4 custom-scrollbar">
            <h1 className="font-display text-2xl text-center uppercase mb-4">THE.SCRL</h1>
            
            <div>
                {livePosts.map(post => (
                    <div key={post.id} id={post.id}>
                        <HatchTile
                            item={post}
                            isOpen={openPostId === post.id}
                            onToggle={() => handleTogglePost(post.id)}
                        >
                            <div className="space-y-6">
                                <RichTextViewer blocks={post.body_richtext} />
                                {post.external_links && post.external_links.length > 0 && (
                                    <div>
                                        <h4 className="font-display uppercase border-b-2 border-fba-white/50 mb-3 pb-2">Links</h4>
                                        <ul className="space-y-2">
                                            {post.external_links.map((link, i) => (
                                                <li key={i}>
                                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-fba-white hover:underline font-mono">
                                                        {link.label}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </HatchTile>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TheScrl;