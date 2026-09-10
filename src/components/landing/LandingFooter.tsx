import React from 'react';
import { FrogMascot } from '../mascots/FrogMascot';

export const LandingFooter: React.FC = () => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full bg-[#FAF9F5] border-t border-[#E6EDE3] pt-8 pb-20 md:pb-12 select-none">
      <div className="max-w-[1220px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Brand + Tagline */}
        <div className="flex items-center gap-2.5">
          <FrogMascot mood="happy" size={28} />
          <div>
            <span className="font-rounded font-extrabold text-[16px] text-[#19271D] block leading-tight">
              FrogiNotes
            </span>
            <span className="font-handwriting text-xs text-[#6B7280]">
              Small notes. Brighter days. ♡
            </span>
          </div>
        </div>

        {/* Center: Quick Links */}
        <nav className="flex items-center gap-6 text-xs font-medium text-[#4B5563]">
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
            className="hover:text-[#19271D] transition-colors cursor-pointer text-[#487850] font-bold"
          >
            Ủng hộ ☕
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('download')}
            className="hover:text-[#19271D] transition-colors cursor-pointer"
          >
            Tải app
          </button>
        </nav>

        {/* Right: Copyright */}
        <div className="text-xs text-[#6B7280] font-normal">
          © 2024 FrogiNotes. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
