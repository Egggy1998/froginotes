import React from 'react';
import { User, Sparkles } from 'lucide-react';
import { FrogMascot } from '../mascots/FrogMascot';
import { useNotesStore } from '../../stores/useNotesStore';
import { OFFICIAL_DOWNLOAD_URL } from '../../lib/constants';

interface LandingHeaderProps {
  onDownloadClick?: () => void;
  onDemoClick?: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  onDownloadClick,
  onDemoClick,
}) => {
  const { currentUser, setShowAuthModal, setShowAccountModal } = useNotesStore();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="w-full bg-[#FAF9F5]/90 backdrop-blur-md sticky top-0 z-50 border-b border-[#EBEFE8] transition-all">
      <div className="max-w-[1220px] mx-auto px-6 h-20 flex items-center justify-between">
        {/* Left: Logo */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('hero');
          }}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="transition-transform group-hover:scale-105">
            <FrogMascot mood="happy" size={34} />
          </div>
          <span className="font-rounded font-extrabold text-[21px] text-[#19271D] tracking-tight">
            FrogiNotes
          </span>
        </a>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[14.5px] font-medium text-[#4B5563]">
          <button
            type="button"
            onClick={() => scrollToSection('features')}
            className="hover:text-[#19271D] transition-colors cursor-pointer"
          >
            Tính năng
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('showcase')}
            className="hover:text-[#19271D] transition-colors cursor-pointer"
          >
            Giao diện
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('how-it-works')}
            className="hover:text-[#19271D] transition-colors cursor-pointer"
          >
            Hướng dẫn
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('donate')}
            className="hover:text-[#19271D] transition-colors cursor-pointer flex items-center gap-1 text-[#487850] font-bold"
          >
            <span>Ủng hộ ☕</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('download')}
            className="hover:text-[#19271D] transition-colors cursor-pointer"
          >
            Tải app
          </button>
        </nav>

        {/* Right: Auth / Account + Download CTA Button */}
        <div className="flex items-center gap-2.5">
          {currentUser ? (
            <button
              type="button"
              onClick={() => setShowAccountModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF5E5] hover:bg-[#DDEED5] border border-[#C8E2BF] text-xs font-bold text-[#284E34] transition-all cursor-pointer shadow-2xs"
              title="Quản lý tài khoản"
            >
              <FrogMascot mood="love" size={22} />
              <span className="max-w-[100px] truncate">{currentUser.name}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#3D6E4A] text-white">
                PRO
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-[#355B3C] hover:bg-[#EEF5EA] border border-transparent hover:border-[#D5E4CE] transition-all cursor-pointer"
            >
              <User size={14} />
              <span>Đăng nhập</span>
            </button>
          )}

          <a
            href={OFFICIAL_DOWNLOAD_URL}
            onClick={onDownloadClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3D6E4A] hover:bg-[#325A3C] text-white rounded-full text-xs font-bold shadow-[0_4px_14px_rgba(61,110,74,0.22)] hover:shadow-[0_6px_18px_rgba(61,110,74,0.32)] transition-all cursor-pointer active:scale-95"
          >
            {/* Windows 4-square icon */}
            <svg width="13" height="13" viewBox="0 0 88 88" fill="currentColor">
              <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 75.48.016 46.126zM40.97 6.425L87.95 0v41.528l-46.98.375zm47.01 45.421V88L40.97 81.428l.027-34.805z" />
            </svg>
            <span>Tải cho Windows</span>
          </a>
        </div>
      </div>
    </header>
  );
};
