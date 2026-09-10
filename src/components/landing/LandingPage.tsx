import React, { useState } from 'react';
import { LandingHeader } from './LandingHeader';
import { LandingHero } from './LandingHero';
import { FeatureSection } from './FeatureSection';
import { InterfaceShowcase } from './InterfaceShowcase';
import { HowItWorksSection } from './HowItWorksSection';
import { FinalCTASection } from './FinalCTASection';
import { DonateSection } from './DonateSection';
import { LandingFooter } from './LandingFooter';
import { MainWindow } from '../MainWindow';
import { X, Download, Check } from 'lucide-react';
import { FrogMascot } from '../mascots/FrogMascot';

export const LandingPage: React.FC<{ onBackToApp?: () => void }> = ({ onBackToApp }) => {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [downloadToast, setDownloadToast] = useState(false);

  const handleDownload = () => {
    // In desktop or web: trigger download toast
    setDownloadToast(true);
    setTimeout(() => setDownloadToast(false), 3500);

    // If served, trigger real download if release exists
    const link = document.createElement('a');
    link.href = './release-builds/FrogiNotes-win32-x64/FrogiNotes.exe';
    link.download = 'FrogiNotes-Setup.exe';
    document.body.appendChild(link);
    try {
      link.click();
    } catch {
      // fallback
    }
    document.body.removeChild(link);
  };

  const handleDemo = () => {
    setShowDemoModal(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF9F5] text-[#19271D] overflow-x-hidden font-sans relative selection:bg-[#D1F2D9] selection:text-[#19271D]">
      {/* Dev / View Switcher (Top floating pill) */}
      {onBackToApp && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            type="button"
            onClick={onBackToApp}
            className="flex items-center gap-2 px-4 py-2 bg-[#284E34] hover:bg-[#1E3A27] text-white text-xs font-bold rounded-full shadow-[0_8px_24px_rgba(40,78,52,0.3)] transition-all cursor-pointer hover:scale-105"
          >
            <FrogMascot mood="sparkle" size={20} />
            <span>Mở FrogiNotes Desktop 🍃</span>
          </button>
        </div>
      )}

      {/* Download toast notification */}
      {downloadToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#284E34] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-bounce">
          <Check size={16} strokeWidth={3} className="text-[#89E27A]" />
          <span>Đang tải FrogiNotes cho Windows (.exe)! Cảm ơn bạn nhé ♡</span>
        </div>
      )}

      {/* Main Landing Sections */}
      <LandingHeader onDownloadClick={handleDownload} onDemoClick={handleDemo} />

      <main className="relative">
        <LandingHero onDownloadClick={handleDownload} onDemoClick={handleDemo} />
        <FeatureSection />
        <InterfaceShowcase />
        <HowItWorksSection />
        <DonateSection />
        <FinalCTASection onDownloadClick={handleDownload} onExploreClick={handleDemo} />
      </main>

      <LandingFooter />

      {/* Interactive Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-[1080px] bg-transparent rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#284E34] flex items-center justify-center shadow-md transition-all cursor-pointer"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            {/* Live Interactive App Window inside modal */}
            <div className="w-full h-[740px]">
              <MainWindow isMockup={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
