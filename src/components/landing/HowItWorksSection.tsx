import React from 'react';
import { ArrowRight, Minus } from 'lucide-react';
import { FrogMascot } from '../mascots/FrogMascot';

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="w-full py-16 select-none">
      <div className="max-w-[1220px] mx-auto px-6">
        {/* Section Header */}
        <div className="flex items-center justify-center gap-3 mb-14">
          <span className="h-[1.5px] w-8 bg-[#8BB883] rounded-full" />
          <span className="h-[1.5px] w-4 bg-[#8BB883] rounded-full" />
          <h2 className="font-rounded font-extrabold text-[28px] sm:text-[32px] text-[#19271D] tracking-tight">
            Chỉ 3 bước đơn giản
          </h2>
          <span className="h-[1.5px] w-4 bg-[#8BB883] rounded-full" />
          <span className="h-[1.5px] w-8 bg-[#8BB883] rounded-full" />
        </div>

        {/* 3 Steps Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative items-stretch">
          {/* Step 1 */}
          <div className="relative bg-[#EAF7EE] border border-[#CDE9D3] rounded-[26px] p-7 flex flex-col items-center text-center shadow-[0_8px_24px_rgba(40,78,50,0.05)] hover:shadow-[0_16px_36px_rgba(40,78,50,0.12)] hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
            {/* Step Number Badge */}
            <div className="w-9 h-9 rounded-full bg-[#FFA8A8] text-white font-extrabold text-sm flex items-center justify-center shadow-xs mb-5 group-hover:scale-115 group-hover:rotate-12 transition-transform">
              1
            </div>

            {/* Illustration: Mini app window */}
            <div className="w-48 h-28 bg-white rounded-2xl border border-[#D5E4D1] shadow-xs p-2.5 mb-5 flex flex-col justify-between relative overflow-hidden group-hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between border-b border-[#F0F5EE] pb-1.5">
                <span className="text-[10px] font-rounded font-extrabold text-[#284E34] flex items-center gap-1">
                  <FrogMascot mood="happy" size={14} /> FrogiNotes
                </span>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#D5E1D2]" />
                  <span className="w-2 h-2 rounded-full bg-[#D5E1D2]" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5 my-auto">
                <div className="h-9 rounded-lg bg-[#FFF7E0] border border-black/5 p-1 group-hover:-translate-y-1 transition-transform">
                  <div className="w-full h-1 bg-[#D9822B]/30 rounded-xs mb-1" />
                  <div className="w-2/3 h-1 bg-[#D9822B]/20 rounded-xs" />
                </div>
                <div className="h-9 rounded-lg bg-[#FDE8E8] border border-black/5 p-1 group-hover:-translate-y-1.5 transition-transform delay-75">
                  <div className="w-full h-1 bg-pink-400/30 rounded-xs mb-1" />
                  <div className="w-1/2 h-1 bg-pink-400/20 rounded-xs" />
                </div>
                <div className="h-9 rounded-lg bg-[#EBF5FB] border border-black/5 p-1 group-hover:-translate-y-1 transition-transform delay-100">
                  <div className="w-full h-1 bg-sky-400/30 rounded-xs mb-1" />
                  <div className="w-3/4 h-1 bg-sky-400/20 rounded-xs" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 transition-transform group-hover:scale-125 group-hover:rotate-12">
                <FrogMascot mood="happy" size={26} />
              </div>
            </div>

            {/* Title & Subtext */}
            <h3 className="font-rounded font-extrabold text-[18px] text-[#19271D] mb-1.5 group-hover:text-[#284E34] transition-colors">
              Mở app
            </h3>
            <p className="text-xs text-[#526456] leading-relaxed">
              Khởi động FrogiNotes trên PC.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative bg-[#EAF7EE] border border-[#CDE9D3] rounded-[26px] p-7 flex flex-col items-center text-center shadow-[0_8px_24px_rgba(40,78,50,0.05)] hover:shadow-[0_16px_36px_rgba(40,78,50,0.12)] hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
            {/* Step Number Badge */}
            <div className="w-9 h-9 rounded-full bg-[#78C68E] text-white font-extrabold text-sm flex items-center justify-center shadow-xs mb-5 group-hover:scale-115 group-hover:rotate-12 transition-transform">
              2
            </div>

            {/* Illustration: App collapsing into bubble */}
            <div className="w-48 h-28 bg-[#F0F7EE] rounded-2xl border border-[#D5E4D1] shadow-xs p-2.5 mb-5 flex flex-col items-center justify-center relative overflow-hidden group-hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-16 h-12 rounded-lg bg-white border border-[#D0E0CD] shadow-2xs opacity-60 scale-90 flex flex-col p-1 group-hover:scale-75 group-hover:opacity-40 transition-all duration-300">
                  <div className="w-full h-1 bg-[#284E34]/20 rounded-xs mb-1" />
                  <div className="w-1/2 h-1 bg-[#284E34]/10 rounded-xs" />
                </div>
                <span className="text-[#5E9B47] text-xs font-bold group-hover:translate-x-1 transition-transform">➔</span>
                <div className="w-10 h-10 rounded-full bg-[#D1F2D9] border-2 border-[#5E9B47] shadow-xs flex items-center justify-center group-hover:scale-120 group-hover:rotate-12 transition-transform duration-300">
                  <FrogMascot mood="happy" size={24} />
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#3E6848] bg-white px-2 py-0.5 rounded-full border border-[#D0E0CD]">
                Thu nhỏ thành widget tròn
              </span>
            </div>

            {/* Title & Subtext */}
            <h3 className="font-rounded font-extrabold text-[18px] text-[#19271D] mb-1.5 group-hover:text-[#284E34] transition-colors">
              Thu gọn
            </h3>
            <p className="text-xs text-[#526456] leading-relaxed">
              Thu gọn thành bong bóng.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative bg-[#EAF7EE] border border-[#CDE9D3] rounded-[26px] p-7 flex flex-col items-center text-center shadow-[0_8px_24px_rgba(40,78,50,0.05)] hover:shadow-[0_16px_36px_rgba(40,78,50,0.12)] hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
            {/* Step Number Badge */}
            <div className="w-9 h-9 rounded-full bg-[#8EC5FC] text-white font-extrabold text-sm flex items-center justify-center shadow-xs mb-5 group-hover:scale-115 group-hover:rotate-12 transition-transform">
              3
            </div>

            {/* Illustration: Floating Frog Mascot Widget with instant note popup */}
            <div className="w-48 h-28 bg-[#F0F7EE] rounded-2xl border border-[#D5E4D1] shadow-xs p-2.5 mb-5 flex items-center justify-center gap-2 relative overflow-hidden group-hover:shadow-md transition-shadow">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-[#D1F2D9] border-2 border-[#5E9B47] shadow-[0_4px_16px_rgba(62,104,72,0.25)] flex items-center justify-center group-hover:scale-120 group-hover:rotate-6 transition-transform duration-300">
                  <FrogMascot mood="sparkle" size={28} />
                </div>
              </div>
              {/* Note Pop-out Bubble */}
              <div className="bg-white rounded-xl border border-[#D0E0CD] shadow-sm p-1.5 text-left w-24 group-hover:scale-110 group-hover:translate-x-1 transition-transform duration-300">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5E9B47]" />
                  <span className="text-[9px] font-bold text-[#284E34]">Ghi chú 📝</span>
                </div>
                <div className="w-full h-1 bg-amber-200 rounded-xs mb-0.5" />
                <div className="w-3/4 h-1 bg-amber-100 rounded-xs" />
              </div>
            </div>

            {/* Title & Subtext */}
            <h3 className="font-rounded font-extrabold text-[18px] text-[#19271D] mb-1.5 group-hover:text-[#284E34] transition-colors">
              Mở lại tức thì
            </h3>
            <p className="text-xs text-[#526456] leading-relaxed">
              Nhấn là có ngay ghi chú của bạn.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
