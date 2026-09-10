import React from 'react';
import { HeroAppMockup } from './HeroAppMockup';
import { FrogMascot } from '../mascots/FrogMascot';

export const InterfaceShowcase: React.FC = () => {
  return (
    <section id="showcase" className="w-full py-12 select-none overflow-hidden relative">
      <div className="max-w-[1220px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="h-[1.5px] w-8 bg-[#8BB883] rounded-full" />
            <span className="h-[1.5px] w-4 bg-[#8BB883] rounded-full" />
            <h2 className="font-rounded font-extrabold text-[28px] sm:text-[32px] text-[#19271D] tracking-tight">
              Giao diện tối giản, dễ thương
            </h2>
            <span className="h-[1.5px] w-4 bg-[#8BB883] rounded-full" />
            <span className="h-[1.5px] w-8 bg-[#8BB883] rounded-full" />
          </div>
          <p className="text-[15px] text-[#526456] max-w-md mx-auto">
            Màu sắc nhẹ nhàng, sắp xếp khoa học, giúp bạn tập trung hơn.
          </p>
        </div>

        {/* Center Container with Mockup and Side Accents */}
        <div className="relative flex items-center justify-center">
          {/* Left Decorative Script */}
          <div className="hidden lg:block absolute left-4 top-1/3 -translate-y-1/2 pointer-events-none text-left rotate-[-3deg]">
            <p className="font-handwriting text-[#5E9B47] text-[22px] leading-snug">
              Your thoughts
              <br />
              in a happier place ♡
            </p>
            <div className="mt-1 text-[#8BB883] opacity-60">
              <svg width="45" height="45" viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10 10 C 25 35, 35 15, 45 40" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Center: Large Expanded Mockup */}
          <div className="relative z-10 w-full max-w-[780px] shadow-[0_30px_65px_rgba(25,39,29,0.14)] rounded-[24px]">
            <HeroAppMockup expandedMode={true} />

            {/* Frog Mascot peeking from top-right edge of window frame */}
            <div className="hidden lg:block absolute -top-12 -right-8 select-none z-20 transition-transform duration-300 hover:-translate-y-2 hover:scale-115 hover:rotate-6 cursor-pointer group/peek">
              <div className="relative">
                <FrogMascot mood="party" size={85} />
                <div className="absolute -top-4 -left-10 bg-white px-2.5 py-0.8 rounded-full border border-[#D5E1D2] shadow-xs whitespace-nowrap rotate-[-4deg] group-hover/peek:scale-110 transition-transform">
                  <span className="font-handwriting text-xs font-bold text-[#284E34]">
                    Tadaaa! ♡
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
