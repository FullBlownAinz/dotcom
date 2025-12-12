import React from 'react';
import { useAdmin } from '../../hooks/useAdmin.ts';

const TheApps = () => {
    const { apps, loading } = useAdmin();
    
    const liveApps = apps.filter(a => !a.hidden);

    if (loading && liveApps.length === 0) {
        return <div className="font-display animate-pulse">LOADING APPS...</div>;
    }

    return (
        <div className="w-full h-full overflow-y-auto px-4 py-4 custom-scrollbar">
            <h1 className="font-display text-2xl text-center uppercase mb-4">THE.APPS</h1>
            <div className="space-y-8 max-w-2xl mx-auto">
                {liveApps.map(app => (
                    <div key={app.id} id={app.id} className="flex items-start gap-6 bg-[#0A0A0A] p-6 border border-gray-800">
                        <img src={app.icon_url} alt={`${app.name} icon`} className="w-16 h-16 sm:w-24 sm:h-24 object-cover flex-shrink-0" />
                        <div className="flex-grow">
                            <h2 className="font-display uppercase text-xl">{app.name}</h2>
                            <p className="text-gray-400 my-2 text-sm">{app.short_desc}</p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {app.links.map((link, i) => (
                                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="bg-fba-red/80 hover:bg-fba-red text-white text-xs font-mono uppercase px-3 py-2 rounded-sm transition-colors">
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TheApps;