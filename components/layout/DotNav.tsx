import React, { useState } from 'react';

interface Section {
  id: string;
  name: string;
}

interface DotNavProps {
  sections: Section[];
  activeSection: string;
  onNavigate: (id: string) => void;
}

export const DotNav: React.FC<DotNavProps> = ({ sections, activeSection, onNavigate }) => {
  const [revealedDotId, setRevealedDotId] = useState<string | null>(null);

  const handleClick = (id: string) => {
    // If the clicked dot is already revealed, navigate and collapse it.
    if (revealedDotId === id) {
      onNavigate(id);
      setRevealedDotId(null);
    } else {
      // Otherwise, just reveal the clicked dot.
      setRevealedDotId(id);
    }
  };

  return (
    <nav className="flex flex-col items-center justify-center px-4" aria-label="Page sections">
      <ul className="space-y-20">
        {sections.map((section, index) => {
          const isRevealed = revealedDotId === section.id;
          const isActive = activeSection === section.id;

          return (
            // The LI is the positioning anchor for the absolute button.
            // A placeholder div is used to maintain its size in the layout flow.
            <li key={section.id} className={`relative ${isRevealed ? 'z-20' : 'z-10'}`}>
              
              {/* This placeholder maintains the vertical spacing of the list */}
              <div className="w-3 h-3" aria-hidden="true" />

              <button
                onClick={() => handleClick(section.id)}
                className={`
                  absolute top-1/2 left-1/2 -translate-y-1/2
                  ${isRevealed ? '-translate-x-[0.375rem]' : '-translate-x-1/2'}
                  flex items-center
                  transition-all duration-300 ease-in-out
                  focus:outline-none
                  ${isRevealed
                    ? 'h-6 px-4 bg-fba-black ring-2 ring-fba-red rounded-xl justify-start' // Pill shape
                    : 'w-3 h-3 rounded-full'
                  }
                  ${!isRevealed && isActive
                    ? 'bg-fba-red ring-2 ring-fba-red ring-offset-2 ring-offset-fba-black'
                    : ''
                  }
                  ${!isRevealed && !isActive
                    ? 'bg-gray-700 hover:bg-gray-500'
                    : ''
                  }
                `}
                aria-label={isRevealed ? `Navigate to ${section.name}` : `Show options for ${section.name} section`}
                aria-expanded={isRevealed}
              >
                <span className={`
                  font-display text-xs text-fba-white uppercase whitespace-nowrap
                  transition-opacity duration-200
                  ${isRevealed ? 'opacity-100' : 'opacity-0 h-0 w-0 pointer-events-none'}
                `}>
                  {section.name}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};