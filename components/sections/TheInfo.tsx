import React from 'react';
import RichTextViewer from '../ui/RichTextViewer.tsx';
import { useAdmin } from '../../hooks/useAdmin.ts';

const TheInfo = () => {
    const { siteInfo, loading } = useAdmin();

    if (loading && !siteInfo) {
        return <div className="font-display animate-pulse">LOADING INFO...</div>;
    }
    
    if (!siteInfo) {
        return <div>Error loading content.</div>
    }

    // "NO visible outline/box. The container should size to its content."
    return (
        <div className="w-full h-full overflow-y-auto px-4 py-4 custom-scrollbar flex flex-col items-center outline-none">
            <div className="max-w-2xl w-full text-left [&_.ql-container.ql-snow]:!border-none">
                <RichTextViewer blocks={siteInfo.body_richtext} />
            </div>
        </div>
    );
};

export default TheInfo;