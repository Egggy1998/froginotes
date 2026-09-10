import React from 'react';
import { Play } from 'lucide-react';
import { FrogMascot } from '../mascots/FrogMascot';
import {
  OFFICIAL_DOWNLOAD_URL,
  WINDOWS_DOWNLOAD_URL,
  MAC_ARM64_DOWNLOAD_URL,
} from '../../lib/constants';

interface FinalCTASectionProps {
  onDownloadClick?: () => void;
  onExploreClick?: () => void;
}

export const FinalCTASection: React.FC<FinalCTASectionProps> = ({
  onDownloadClick,
  onExploreClick,
}) => {
  return (
    <section id="download" className="w-full py-16 select-none relative overflow-hidden">
      <div className="max-w-[1220px] mx-auto px-6">
        {/* Banner Box */}
        <div className="relative bg-gradient-to-r from-[#EAF6EE] via-[#F1F9F1] to-[#EAF6EE] border border-[#CDE5D4] rounded-[32px] p-8 md:p-14 text-center shadow-[0_16px_40px_rgba(40,78,52,0.08)] overflow-hidden">
          {/* Foliage Leaf Accents at Left & Right */}
          <div className="absolute -left-8 -top-8 w-36 h-36 opacity-30 pointer-events-none">
            <svg viewBox="0 0 100 100" fill="#6EA860">
              <path d="M10 0 C40 30 70 70 100 100 C70 70 30 40 0 10 Z" />
              <path d="M0 40 C30 60 60 90 90 100 C60 80 30 60 0 40 Z" />
            </svg>
          </div>
          <div className="absolute -right-8 -bottom-8 w-36 h-36 opacity-30 pointer-events-none rotate-180">
            <svg viewBox="0 0 100 100" fill="#6EA860">
              <path d="M10 0 C40 30 70 70 100 100 C70 70 30 40 0 10 Z" />
            </svg>
          </div>

          {/* Left Mascot holding Heart with cute badge */}
          <div className="hidden lg:flex items-end gap-3 absolute left-10 bottom-4 pointer-events-auto transition-transform hover:scale-115 hover:-translate-y-1 duration-300 cursor-pointer group/heart select-none">
            <div className="relative">
              <div className="transition-transform group-hover/heart:rotate-6">
                <FrogMascot mood="love" size={88} />
              </div>
              {/* Cute heart held by frog */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#FF6B8B] border-2 border-white shadow-sm flex items-center justify-center text-sm transition-transform group-hover/heart:scale-125 group-hover/heart:animate-bounce">
                💖
              </div>
            </div>
            <span className="font-handwriting text-[#5E9B47] text-[18px] pb-2 font-bold group-hover/heart:text-[#284E34] transition-colors">
              Yêu đời hơn mỗi ngày ♡
            </span>
          </div>

          {/* Right Handwritten Script */}
          <div className="hidden lg:block absolute right-12 top-10 pointer-events-none text-right rotate-[-3deg]">
            <p className="font-handwriting text-[#5E9B47] text-[22px] leading-snug font-bold">
              Better Notes
              <br />
              Happier You ♡
            </p>
          </div>

          {/* Center Content */}
          <div className="max-w-xl mx-auto relative z-10 space-y-4">
            <h2 className="font-rounded font-extrabold text-[28px] md:text-[34px] text-[#19271D] leading-tight tracking-tight">
              Sẵn sàng ghi chú theo cách đáng yêu hơn?
            </h2>

            <p className="text-[15px] md:text-[16px] text-[#526456] leading-relaxed">
              Tải FrogiNotes ngay và biến mỗi ngày làm việc thêm vui!
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
              {/* Primary Windows Download Button */}
              <a
                href={WINDOWS_DOWNLOAD_URL}
                onClick={onDownloadClick}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#3D6E4A] hover:bg-[#325A3C] text-white rounded-full text-sm font-bold shadow-[0_8px_24px_rgba(61,110,74,0.30)] hover:shadow-[0_10px_28px_rgba(61,110,74,0.40)] transition-all cursor-pointer active:scale-95"
              >
                <svg width="14" height="14" viewBox="0 0 88 88" fill="currentColor">
                  <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 75.48.016 46.126zM40.97 6.425L87.95 0v41.528l-46.98.375zm47.01 45.421V88L40.97 81.428l.027-34.805z" />
                </svg>
                <span>Tải cho Windows</span>
              </a>

              {/* macOS Download Button */}
              <a
                href={MAC_ARM64_DOWNLOAD_URL}
                onClick={onDownloadClick}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#2B4E34] hover:bg-[#1E3A27] text-white rounded-full text-sm font-bold shadow-[0_8px_24px_rgba(43,78,52,0.30)] hover:shadow-[0_10px_28px_rgba(43,78,52,0.40)] transition-all cursor-pointer active:scale-95"
              >
                <span className="text-base leading-none">🍏</span>
                <span>Tải cho macOS</span>
              </a>

              {/* Secondary Explore Button */}
              <button
                type="button"
                onClick={onExploreClick}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-[#F4F8F2] text-[#19271D] border border-[#D5E1D2] rounded-full text-sm font-bold shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all cursor-pointer active:scale-95"
              >
                <Play size={14} className="fill-[#19271D] text-[#19271D]" />
                <span>Khám phá giao diện</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
