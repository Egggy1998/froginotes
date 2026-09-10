import React from 'react';
import { useNotesStore } from '../stores/useNotesStore';
import { MainWindow } from './MainWindow';
import { FloatingFrogWidget } from './FloatingFrogWidget';
import { FrogAvatar, WindowPeekFrog } from './mascots/FrogMascots';
import { FrogMascot } from './mascots/FrogMascot';
import {
  Sun,
  Wifi,
  Volume2,
  BatteryCharging,
  ChevronUp,
  Maximize2,
  Minimize2,
  RotateCcw,
  Globe,
} from 'lucide-react';

export const DesktopEnvironment: React.FC = () => {
  const {
    isCollapsed,
    setCollapsed,
    environmentMode,
    setEnvironmentMode,
    setIsLandingView,
    resetToDefault,
    t,
  } = useNotesStore();

  if (!environmentMode) {
    // Standalone desktop mode: fills viewport
    return (
      <div className="w-screen h-screen bg-[#EFF7E7] overflow-hidden flex flex-col items-center justify-center p-4">
        {/* Top Control Bar for Dev / Mode Switching */}
        <div className="absolute top-2 left-4 z-50 flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-[#D5E1D2] text-[11px] font-bold text-[#284E34] shadow-xs">
          <button
            onClick={() => setEnvironmentMode(true)}
            className="flex items-center gap-1 hover:text-[#3E6848]"
          >
            <Minimize2 size={12} />
            <span>Showcase 1600×900 Mode</span>
          </button>
          <span className="text-[#C5D3C1]">|</span>
          <button
            onClick={resetToDefault}
            className="flex items-center gap-1 hover:text-[#3E6848]"
          >
            <RotateCcw size={12} />
            <span>Reset Demo Notes</span>
          </button>
        </div>

        {!isCollapsed ? (
          <MainWindow isMockup={false} />
        ) : (
          <FloatingFrogWidget />
        )}
      </div>
    );
  }

  return (
    <div className="relative w-[1600px] h-[900px] bg-[#EEF5E8] overflow-hidden select-none flex flex-col justify-between font-['Nunito',sans-serif]">
      {/* Background Soft Natural Foliage & Desk Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft daylight gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#E3EFE0] via-[#F1F8EE] to-[#F7FAF4]" />
        
        {/* Top-left foliage decoration */}
        <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-[#A8D8AC]/25 blur-3xl" />
        <div className="absolute top-10 -left-10 opacity-30 pointer-events-none">
          <svg width="220" height="220" viewBox="0 0 100 100" fill="#6EA86F">
            <path d="M 10 90 C 20 50 60 20 90 10 C 70 40 50 70 10 90 Z" />
            <path d="M 25 80 C 40 45 70 30 85 20 C 65 50 50 75 25 80 Z" />
          </svg>
        </div>

        {/* Top-right foliage decoration */}
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#BFDEBA]/30 blur-3xl" />
        <div className="absolute top-0 right-0 opacity-25 pointer-events-none">
          <svg width="260" height="260" viewBox="0 0 100 100" fill="#5F9760">
            <path d="M 90 90 C 80 40 40 20 10 10 C 30 40 60 70 90 90 Z" />
          </svg>
        </div>

        {/* Desk Surface Horizon Line */}
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#E6EFE1] to-transparent opacity-80" />
      </div>

      {/* Top Bar Branding / Showcase Controls */}
      <header className="relative z-20 px-12 pt-5 flex items-start justify-between">
        {/* Left Branding Script */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-rounded font-extrabold text-[28px] text-[#284E34] tracking-tight flex items-center gap-1.5">
              <span>FrogiNotes</span>
              <span className="text-xl">🍃</span>
            </h1>
          </div>
          <p className="font-handwriting text-[#4F6C53] text-lg font-bold -mt-0.5">
            {t.sloganTop}
          </p>
          <p className="text-[11px] text-[#7A937E] font-semibold mt-0.5">
            {t.sloganSub}
          </p>
        </div>

        {/* Center / Dev mode toggle pills */}
        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#D5E1D2] text-[12px] font-bold text-[#284E34] shadow-xs">
          <button
            onClick={() => setIsLandingView(true)}
            className="flex items-center gap-1.5 hover:text-[#3E6848] px-2 py-0.5 rounded-full hover:bg-white/80 transition-colors text-[#2D6A4F]"
            title="Xem trang Landing Page giới thiệu sản phẩm"
          >
            <Globe size={13} />
            <span>Landing Page 🌐</span>
          </button>
          <span className="text-[#C5D3C1]">|</span>
          <button
            onClick={() => setEnvironmentMode(false)}
            className="flex items-center gap-1.5 hover:text-[#3E6848] px-2 py-0.5 rounded-full hover:bg-white/80 transition-colors"
            title="Chuyển sang chế độ cửa sổ ứng dụng riêng"
          >
            <Maximize2 size={13} />
            <span>Chế độ Cửa sổ</span>
          </button>
          <span className="text-[#C5D3C1]">|</span>
          <button
            onClick={resetToDefault}
            className="flex items-center gap-1.5 hover:text-[#3E6848] px-2 py-0.5 rounded-full hover:bg-white/80 transition-colors"
            title="Khôi phục 9 ghi chú mẫu ban đầu"
          >
            <RotateCcw size={13} />
            <span>Khôi phục mẫu</span>
          </button>
        </div>

        {/* Right Subtle Slogan */}
        <div className="text-right">
          <div className="font-handwriting text-[#527457] text-sm leading-snug">
            {t.motto1}<br />
            {t.motto2}<br />
            {t.motto3}
          </div>
        </div>
      </header>

      {/* Main Center Area: Left Preview Panel + Center App Window */}
      <div className="relative z-20 flex-1 flex items-center justify-center px-12 pb-2">
        {/* Left Side: Collapsed State Preview Card */}
        <div className="absolute left-10 top-1/2 -translate-y-1/2 w-[210px] hidden xl:flex flex-col items-center">
          {/* Top Speech Callout */}
          <div className="bg-white/90 backdrop-blur-xs border border-[#C5DAC0] rounded-2xl px-3 py-2 shadow-xs mb-3 text-center">
            <span className="text-[10px] bg-[#D8ECD7] text-[#284E34] font-bold px-1.5 py-0.5 rounded-full">
              Đã thu nhỏ
            </span>
            <p className="font-handwriting text-xs text-[#2A5235] font-semibold mt-1">
              Một bạn ếch nhỏ nhắn<br />trên màn hình của bạn. ♡
            </p>
          </div>

          {/* Mini Desktop Preview Window */}
          <div
            onClick={() => setCollapsed(!isCollapsed)}
            className="relative w-[190px] h-[135px] rounded-2xl overflow-hidden shadow-lg border border-black/10 bg-gradient-to-br from-[#8FB996] via-[#659B73] to-[#41714F] cursor-pointer group transition-transform hover:scale-105"
          >
            {/* Mountain / Forest Silhouette */}
            <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 200 140">
              <path d="M 0 140 L 40 80 L 90 120 L 150 60 L 200 140 Z" fill="#204529" />
              <path d="M 30 140 L 80 95 L 120 130 L 170 85 L 200 140 Z" fill="#15331E" />
            </svg>

            {/* Floating Frog Bubble Widget inside preview */}
            <div className="absolute bottom-5 right-5 w-10 h-10 rounded-full bg-[#A8D8AC] border-2 border-[#2A5235] shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
              <FrogMascot mood="happy" size={32} />
            </div>

            {/* Mini taskbar in preview */}
            <div className="absolute bottom-0 inset-x-0 h-4 bg-black/40 backdrop-blur-xs flex items-center justify-between px-2 text-[6px] text-white/80">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#A8D8AC]" />
              </div>
              <span>10:24 AM</span>
            </div>
          </div>

          {/* Hand-drawn arrow and "Click to open! ♡" */}
          <div className="mt-2.5 flex items-center gap-1.5 text-[#395A3E]">
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none" className="rotate-[-20deg]">
              <path d="M 10 10 Q 25 8 30 25" stroke="#395A3E" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 24 25 L 30 25 L 30 19" stroke="#395A3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <span className="font-handwriting text-xs font-bold">
              {t.clickToOpen}
            </span>
          </div>
        </div>

        {/* Center: FrogiNotes Main Window OR Collapsed Floating Widget */}
        <div className="relative flex flex-col items-center">
          {/* Peeking Frog at Top-Right of the window (shifted left to clear window controls) */}
          {!isCollapsed && (
            <div className="absolute -top-11 right-16 z-30 pointer-events-none">
              <WindowPeekFrog />
            </div>
          )}

          {/* Expanded Window */}
          <div
            className={`transition-all duration-300 ease-out ${
              isCollapsed
                ? 'opacity-0 scale-90 pointer-events-none absolute'
                : 'opacity-100 scale-100'
            }`}
          >
            <MainWindow isMockup={true} />
          </div>

          {/* Collapsed Mode: Floating circular frog right here in showcase */}
          {isCollapsed && <FloatingFrogWidget />}
        </div>

        {/* Right Side: Ceramic Coffee Mug with Frog Print */}
        <div className="absolute right-12 bottom-16 hidden 2xl:flex flex-col items-center pointer-events-none">
          {/* Ceramic Mug Graphic */}
          <div className="relative w-36 h-40">
            {/* Mug Handle */}
            <div className="absolute top-10 -left-6 w-10 h-20 rounded-l-full border-[10px] border-[#F2EFE8] drop-shadow-sm" />
            
            {/* Mug Body */}
            <div className="relative w-full h-full rounded-b-3xl bg-gradient-to-r from-[#F6F4EE] via-[#FFFFFF] to-[#EAE5DC] border border-[#DDD6C8] shadow-[0_15px_30px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center p-4">
              {/* Mug rim ellipse top */}
              <div className="absolute -top-3 inset-x-0 h-6 rounded-full bg-[#E5DFD4] border border-[#D5CEC0] flex items-center justify-center">
                {/* Coffee inside */}
                <div className="w-[92%] h-4 rounded-full bg-[#5A3825] opacity-90 shadow-inner" />
              </div>

              {/* Text printed on mug */}
              <div className="text-center mt-3">
                <p className="font-rounded font-extrabold text-[12px] text-[#284E34] leading-tight">
                  {t.tagline.split('.')[0]}.
                </p>
                <p className="font-handwriting font-bold text-[14px] text-[#3E6848] leading-tight">
                  {t.tagline.split('.')[1] || ''}
                </p>
              </div>

              {/* Frog doodle on mug */}
              <div className="mt-2">
                <FrogMascot mood="happy" size={28} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Slogan right */}
      <div className="absolute bottom-14 right-12 text-[11px] font-medium text-[#7C9580] pointer-events-none">
        {t.footerSlogan}
      </div>

      {/* Windows 11 Taskbar */}
      <footer className="relative z-30 h-12 bg-white/70 backdrop-blur-xl border-t border-[#DFE8DC] px-4 flex items-center justify-between select-none shadow-sm">
        {/* Left: Weather Widget */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#284E34] hover:bg-black/5 px-2.5 py-1 rounded-md cursor-pointer transition-colors">
          <Sun size={17} className="text-[#E5A624]" />
          <span>24°C Mostly sunny</span>
        </div>

        {/* Center: Windows 11 App Dock */}
        <div className="flex items-center gap-1">
          {/* Start button */}
          <button className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-black/5 transition-colors">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="#0078D4">
              <rect x="1" y="1" width="6.5" height="6.5" />
              <rect x="8.5" y="1" width="6.5" height="6.5" />
              <rect x="1" y="8.5" width="6.5" height="6.5" />
              <rect x="8.5" y="8.5" width="6.5" height="6.5" />
            </svg>
          </button>

          {/* Search */}
          <button className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-black/5 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#284E34" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* File Explorer */}
          <button className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-black/5 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#E5A624">
              <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
            </svg>
          </button>

          {/* Edge browser */}
          <button className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-black/5 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#0078D4" strokeWidth="2" fill="#E0F2FE" />
              <path d="M 6 14 Q 12 6 18 14" stroke="#0284C7" strokeWidth="2" fill="none" />
            </svg>
          </button>

          {/* FrogiNotes App Icon (ACTIVE WITH GREEN PILL INDICATOR) */}
          <button
            onClick={() => setCollapsed(!isCollapsed)}
            title="FrogiNotes (Active)"
            className="relative w-10 h-10 flex flex-col items-center justify-center rounded-md bg-black/5 hover:bg-black/10 transition-colors"
          >
            <FrogMascot mood="happy" size={24} />
            {/* Active Pill Indicator underneath */}
            <div className="absolute bottom-0.5 w-4 h-1 rounded-full bg-[#3E6848]" />
          </button>

          {/* Teams */}
          <button className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-black/5 transition-colors">
            <div className="w-5 h-5 rounded bg-[#4F52B2] text-white text-[10px] font-bold flex items-center justify-center">
              T
            </div>
          </button>

          {/* Wallet */}
          <button className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-black/5 transition-colors">
            <div className="w-5 h-5 rounded bg-[#0284C7] text-white text-[10px] font-bold flex items-center justify-center">
              W
            </div>
          </button>
        </div>

        {/* Right: System Tray */}
        <div className="flex items-center gap-3 text-xs font-medium text-[#284E34]">
          <button className="hover:bg-black/5 p-1 rounded">
            <ChevronUp size={14} />
          </button>
          <div className="flex items-center gap-2 hover:bg-black/5 px-2 py-1 rounded">
            <Wifi size={15} />
            <Volume2 size={15} />
            <BatteryCharging size={15} />
          </div>
          <div className="text-right leading-tight hover:bg-black/5 px-2 py-1 rounded">
            <div className="font-semibold text-[11px]">10:24 AM</div>
            <div className="text-[10px] text-[#69826D]">Apr 23, 2024</div>
          </div>
        </div>
      </footer>
    </div>
  );
};
