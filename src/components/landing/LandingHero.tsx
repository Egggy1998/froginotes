import React from 'react';
import { Play } from 'lucide-react';
import { HeroAppMockup } from './HeroAppMockup';
import { FrogMascot } from '../mascots/FrogMascot';
import {
  OFFICIAL_DOWNLOAD_URL,
  WINDOWS_DOWNLOAD_URL,
  MAC_ARM64_DOWNLOAD_URL,
  MAC_X64_DOWNLOAD_URL,
} from '../../lib/constants';

interface LandingHeroProps {
  onDownloadClick?: () => void;
  onDemoClick?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onDownloadClick,
  onDemoClick,
}) => {
  return (
    <section id="hero" className="relative w-full pt-10 pb-20 overflow-hidden select-none">
      {/* Background soft botanical / foliage decorations */}
      <div className="absolute top-0 -left-20 w-80 h-80 bg-[#E8F5E5]/60 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-20 -right-20 w-96 h-96 bg-[#FAF0D7]/50 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Atmospheric leaf silhouette accents */}
      <div className="absolute -top-6 -left-6 opacity-30 pointer-events-none -z-0">
        <svg width="180" height="180" viewBox="0 0 200 200" fill="#6EA860">
          <path d="M40 0C60 40 90 80 140 100C90 120 60 160 40 200C20 160 0 120 0 100C0 80 20 40 40 0Z" />
        </svg>
      </div>

      <div className="max-w-[1220px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column (5 of 12 cols = ~42%) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Handwritten Microcopy */}
          <div className="font-handwriting italic text-[#4A7C50] text-[21px] leading-tight rotate-[-2deg] inline-block select-none">
            <span>Small notes</span>
            <br />
            <span>Brighter days ♡</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-rounded font-extrabold text-[38px] sm:text-[44px] lg:text-[46px] text-[#19271D] leading-[1.18] tracking-tight">
            Sticky note đáng yêu
            <br />
            cho ngày làm việc
            <br />
            <span className="text-[#3D6E4A]">vui hơn ♡</span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-[15.5px] text-[#4B5563] leading-relaxed max-w-[430px]">
            Ghi chú nhanh, gọn gàng,
            <br />
            luôn sẵn sàng bên bạn trên PC.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center gap-3.5">
              {/* Primary Button */}
              <a
                href={OFFICIAL_DOWNLOAD_URL}
                onClick={onDownloadClick}
                aria-label="Tải FrogiNotes cho Windows Setup (.exe)"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#3D6E4A] hover:bg-[#325A3C] text-white rounded-full text-sm font-bold shadow-[0_8px_24px_rgba(61,110,74,0.30)] hover:shadow-[0_10px_28px_rgba(61,110,74,0.40)] transition-all cursor-pointer active:scale-95"
              >
                <svg width="15" height="15" viewBox="0 0 88 88" fill="currentColor" aria-hidden="true">
                  <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 75.48.016 46.126zM40.97 6.425L87.95 0v41.528l-46.98.375zm47.01 45.421V88L40.97 81.428l.027-34.805z" />
                </svg>
                <span>Tải cho Windows (.exe) →</span>
              </a>

              {/* Secondary Button */}
              <button
                type="button"
                onClick={onDemoClick}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-[#F4F8F2] text-[#19271D] border border-[#D5E1D2] rounded-full text-sm font-bold shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all cursor-pointer active:scale-95"
              >
                <Play size={14} className="fill-[#19271D] text-[#19271D]" />
                <span>Xem demo</span>
              </button>
            </div>

            {/* Platform Options */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
              <span className="text-[#6D8B71] font-medium text-[11px] pr-1">Hoặc tải cho:</span>
              <a
                href={MAC_ARM64_DOWNLOAD_URL}
                onClick={onDownloadClick}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/80 hover:bg-white border border-[#D0E2CD] hover:border-[#5E9B47] text-[#284E34] rounded-full text-[11px] font-bold transition-all shadow-2xs"
              >
                <span>🍏 Mac M1/M2/M3/M4</span>
              </a>
              <a
                href={MAC_X64_DOWNLOAD_URL}
                onClick={onDownloadClick}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/80 hover:bg-white border border-[#D0E2CD] hover:border-[#5E9B47] text-[#284E34] rounded-full text-[11px] font-bold transition-all shadow-2xs"
              >
                <span>🍏 Mac Intel</span>
              </a>
            </div>
          </div>

          {/* Mascot sticker peeking below */}
          <div className="pt-2 flex items-center gap-3 group cursor-pointer">
            <div className="relative transition-transform group-hover:scale-120 group-hover:rotate-6 duration-200">
              <FrogMascot mood="love" size={40} />
              <span className="absolute -top-3 -right-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity animate-bounce">
                💖
              </span>
            </div>
            <span className="font-handwriting text-sm text-[#5E9B47] group-hover:text-[#284E34] transition-colors">
              Cùng chú ếch đồng hành mỗi ngày ♡
            </span>
          </div>
        </div>

        {/* Right Column (7 of 12 cols = ~58%) */}
        <div className="lg:col-span-7 flex justify-center relative">
          {/* Main App Window Mockup */}
          <HeroAppMockup />

          {/* Decorative Ceramic Mug on the right side */}
          <div className="hidden lg:block absolute -right-6 -bottom-4 pointer-events-auto select-none z-20 animate-float-mug hover:scale-110 hover:rotate-3 transition-transform duration-300 cursor-pointer group/mug">
            {/* Pens sticking out */}
            <div className="absolute -top-5 left-5 flex gap-1.5 z-0 rotate-[6deg] group-hover/mug:rotate-[10deg] transition-transform">
              <div className="w-2 h-8 bg-amber-400 rounded-t-sm shadow-2xs" />
              <div className="w-2.5 h-10 bg-[#3E6848] rounded-t-sm shadow-2xs" />
              <div className="w-2 h-7 bg-pink-300 rounded-t-sm shadow-2xs" />
            </div>

            {/* Mug Body */}
            <div className="relative w-24 h-28 rounded-[20px] bg-gradient-to-b from-[#FFFFFF] to-[#F1F6EE] border-2 border-[#D8E6D3] shadow-[0_16px_35px_rgba(40,78,52,0.16)] group-hover/mug:shadow-[0_20px_45px_rgba(40,78,52,0.22)] p-2 flex flex-col items-center justify-center text-center z-10 transition-shadow">
              <div className="transition-transform group-hover/mug:scale-120 group-hover/mug:rotate-12">
                <FrogMascot mood="happy" size={26} />
              </div>
              <p className="font-handwriting text-[9.5px] text-[#284E34] mt-1 leading-tight font-bold">
                Good Notes
                <br />
                Brighter Days ♡
              </p>
              {/* Mug handle */}
              <div className="absolute -right-3 top-5 w-4 h-11 rounded-r-2xl border-3 border-[#D8E6D3] bg-white/50 -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
