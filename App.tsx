import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Header } from './components/layout/Header.tsx';
import { DotNav } from './components/layout/DotNav.tsx';
import Ticker from './components/ui/Ticker.tsx';
import TheScrl from './components/sections/TheScrl.tsx';
import TheMerch from './components/sections/TheMerch.tsx';
import TheApps from './components/sections/TheApps.tsx';
import TheInfo from './components/sections/TheInfo.tsx';
import { useSettings } from './hooks/useSettings.ts';
import AdminDrawer from './components/admin/AdminDrawer.tsx';
import { useEditMode } from './hooks/useEditMode.ts';
import PromoPopup from './components/ui/PromoPopup.tsx';
import OverlayAnimation from './components/ui/OverlayAnimation.tsx';

const sections = [
  { id: 'the-scrl', name: 'THE.SCRL', component: <TheScrl /> },
  { id: 'the-merch', name: 'THE.MERCH', component: <TheMerch /> },
  { id: 'the-apps', name: 'THE.APPS', component: <TheApps /> },
  { id: 'the-info', name: 'THE.INFO', component: <TheInfo /> },
];

function App() {
  const { settings, applySettings } = useSettings();
  const { isEditMode } = useEditMode();
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  // FIX: The ref is for a <section> element, which is an HTMLElement, not an HTMLDivElement.
  const sectionRefs = useRef<Record<string, HTMLElement>>({});

  useEffect(() => {
    if (settings) {
      applySettings(settings);
    }
  }, [settings, applySettings]);

  const handleScroll = useCallback(() => {
    const container = mainContainerRef.current;
    if (!container) return;
    
    const scrollPosition = container.scrollTop;
    const containerHeight = container.clientHeight;

    for (const section of sections) {
      const el = sectionRefs.current[section.id];
      if (el) {
        const sectionTop = el.offsetTop - container.offsetTop;
        if (scrollPosition >= sectionTop - containerHeight / 2 && scrollPosition < sectionTop + el.offsetHeight - containerHeight / 2) {
          setActiveSection(section.id);
          break;
        }
      }
    }
  }, []);

  const scrollToSection = (id: string) => {
    const sectionEl = sectionRefs.current[id];
    if (sectionEl) {
      sectionEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const container = mainContainerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditMode) return; // Disable when editing to not interfere with inputs
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= sections.length) {
        scrollToSection(sections[keyNum - 1].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditMode]);

  return (
    <div className={`font-base bg-fba-black text-fba-white w-screen h-screen flex flex-col transition-colors duration-300`}>
      <OverlayAnimation settings={settings?.overlay_animation} />
      <Header />
      {settings?.fonts.ticker && <Ticker text={settings.fonts.ticker} speed={settings.fonts.tickerSpeed} />}
      <div className="flex-grow grid grid-cols-[auto_1fr] overflow-hidden">
        <DotNav sections={sections} activeSection={activeSection} onNavigate={scrollToSection} />
        <main 
            ref={mainContainerRef}
            className="w-full h-full overflow-y-auto scroll-smooth snap-y snap-mandatory"
        >
          {sections.map(section => (
            <section
              key={section.id}
              id={section.id}
              ref={(el) => {
                if(el) sectionRefs.current[section.id] = el
              }}
              className="w-full h-full flex-shrink-0 snap-start flex items-center justify-center relative"
            >
              {section.component}
            </section>
          ))}
        </main>
      </div>
      <AdminDrawer isOpen={isEditMode} />
      <PromoPopup settings={settings?.promo} />
    </div>
  );
}

export default App;