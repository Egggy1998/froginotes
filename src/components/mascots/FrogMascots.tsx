import React from 'react';

// Common Frog Avatar (Face)
export const FrogAvatar: React.FC<{ size?: number; className?: string }> = ({ size = 36, className = '' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      {/* Outer Circle Green Body */}
      <circle cx="50" cy="50" r="46" fill="#A8D8AC" stroke="#2A5235" strokeWidth="4" />
      
      {/* Frog Eyes (Two bumps / top) */}
      <circle cx="32" cy="32" r="15" fill="#A8D8AC" stroke="#2A5235" strokeWidth="4" />
      <circle cx="68" cy="32" r="15" fill="#A8D8AC" stroke="#2A5235" strokeWidth="4" />
      
      {/* Eye pupils */}
      <circle cx="34" cy="32" r="7.5" fill="#1E2B20" />
      <circle cx="32" cy="30" r="2.5" fill="#FFFFFF" />
      <circle cx="36" cy="34" r="1" fill="#FFFFFF" />
      
      <circle cx="66" cy="32" r="7.5" fill="#1E2B20" />
      <circle cx="64" cy="30" r="2.5" fill="#FFFFFF" />
      <circle cx="68" cy="34" r="1" fill="#FFFFFF" />
      
      {/* Pink Cheeks */}
      <ellipse cx="26" cy="58" rx="8" ry="5" fill="#FCA5A5" opacity="0.8" />
      <ellipse cx="74" cy="58" rx="8" ry="5" fill="#FCA5A5" opacity="0.8" />
      
      {/* Smile */}
      <path d="M 40 54 Q 50 64 60 54" stroke="#2A5235" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Open cute mouth optional tongue */}
      <path d="M 43 56 Q 50 67 57 56 Z" fill="#E17B77" />
    </svg>
  );
};

// Sidebar Waving Frog Mascot
export const SidebarWavingFrog: React.FC = () => {
  return (
    <div className="flex items-end gap-2 px-2 py-1">
      {/* Frog illustration */}
      <div className="relative w-16 h-16 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          {/* Motion lines above head */}
          <path d="M 22 12 Q 26 18 24 24" stroke="#2A5235" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 32 8 Q 36 15 34 22" stroke="#2A5235" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 42 12 Q 44 19 40 25" stroke="#2A5235" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Left Body & Arm */}
          <path d="M 26 88 C 26 65 35 55 50 55 C 65 55 74 65 74 88 Z" fill="#A8D8AC" stroke="#2A5235" strokeWidth="3.5" />
          
          {/* Waving Arm on Left */}
          <path d="M 32 66 C 18 55 14 38 24 36 C 30 35 34 46 36 56" fill="#A8D8AC" stroke="#2A5235" strokeWidth="3.5" strokeLinejoin="round" />
          {/* Little fingers */}
          <circle cx="21" cy="35" r="3" fill="#A8D8AC" stroke="#2A5235" strokeWidth="2" />
          <circle cx="25" cy="33" r="3" fill="#A8D8AC" stroke="#2A5235" strokeWidth="2" />
          <circle cx="29" cy="35" r="3" fill="#A8D8AC" stroke="#2A5235" strokeWidth="2" />

          {/* Right Arm resting */}
          <path d="M 68 66 C 76 72 78 80 75 88" stroke="#2A5235" strokeWidth="3.5" strokeLinecap="round" />

          {/* Head */}
          <ellipse cx="50" cy="48" rx="26" ry="20" fill="#A8D8AC" stroke="#2A5235" strokeWidth="3.5" />

          {/* Eyes */}
          <circle cx="37" cy="34" r="11" fill="#A8D8AC" stroke="#2A5235" strokeWidth="3.5" />
          <circle cx="63" cy="34" r="11" fill="#A8D8AC" stroke="#2A5235" strokeWidth="3.5" />

          {/* Pupils */}
          <circle cx="38" cy="34" r="5.5" fill="#1E2B20" />
          <circle cx="36" cy="32" r="2" fill="#FFFFFF" />
          <circle cx="62" cy="34" r="5.5" fill="#1E2B20" />
          <circle cx="60" cy="32" r="2" fill="#FFFFFF" />

          {/* Pink Cheeks */}
          <ellipse cx="32" cy="52" rx="5" ry="3.5" fill="#FCA5A5" opacity="0.85" />
          <ellipse cx="68" cy="52" rx="5" ry="3.5" fill="#FCA5A5" opacity="0.85" />

          {/* Big happy mouth */}
          <path d="M 42 50 Q 50 62 58 50 Z" fill="#E17B77" stroke="#2A5235" strokeWidth="2.5" />
        </svg>
      </div>

      {/* Speech Bubble: "Good ideas live here! ♡" */}
      <div className="relative bg-[#FFFFFF] border border-[#E0E7DC] rounded-xl px-2.5 py-1.5 shadow-sm">
        <p className="font-handwriting text-xs text-[#2A5235] font-bold leading-tight select-none">
          Good ideas<br />live here! ♡
        </p>
        {/* Bubble pointer triangle */}
        <div className="absolute -left-1.5 bottom-2.5 w-0 h-0 border-t-[5px] border-t-transparent border-r-[6px] border-r-[#FFFFFF] border-b-[5px] border-b-transparent drop-shadow-[-1px_0px_0px_#E0E7DC]" />
      </div>
    </div>
  );
};

// Window Top-Right Peeking Frog (for mockup environment)
export const WindowPeekFrog: React.FC = () => {
  return (
    <div className="relative flex items-end">
      {/* Speech Bubble */}
      <div className="bg-[#FFFFFF]/90 backdrop-blur-xs border border-[#C5DAC0] rounded-2xl px-3 py-1.5 shadow-sm mr-2 mb-3">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] bg-[#D8ECD7] text-[#284E34] font-bold px-1.5 py-0.2 rounded-full">
            Đã mở rộng
          </span>
        </div>
        <p className="font-handwriting text-xs text-[#2A5235] font-semibold leading-tight">
          Nơi mọi suy nghĩ<br />tìm về bình yên. ♡
        </p>
      </div>

      {/* Peeking Frog */}
      <div className="w-16 h-12 relative overflow-visible">
        <svg viewBox="0 0 100 80" className="w-full h-full">
          {/* Accent lines upper right */}
          <path d="M 80 10 Q 86 16 83 22" stroke="#2A5235" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 90 14 Q 95 20 92 26" stroke="#2A5235" strokeWidth="2.5" strokeLinecap="round" />

          {/* Head top arc */}
          <path d="M 15 65 C 15 25 85 25 85 65 Z" fill="#A8D8AC" stroke="#2A5235" strokeWidth="3.5" />

          {/* Left Eye */}
          <circle cx="32" cy="30" r="14" fill="#A8D8AC" stroke="#2A5235" strokeWidth="3.5" />
          <circle cx="34" cy="30" r="7.5" fill="#1E2B20" />
          <circle cx="31" cy="27" r="2.5" fill="#FFFFFF" />
          <circle cx="36" cy="32" r="1.2" fill="#FFFFFF" />

          {/* Right Eye */}
          <circle cx="68" cy="30" r="14" fill="#A8D8AC" stroke="#2A5235" strokeWidth="3.5" />
          <circle cx="66" cy="30" r="7.5" fill="#1E2B20" />
          <circle cx="63" cy="27" r="2.5" fill="#FFFFFF" />
          <circle cx="68" cy="32" r="1.2" fill="#FFFFFF" />

          {/* Cheeks */}
          <ellipse cx="24" cy="54" rx="6" ry="4" fill="#FCA5A5" opacity="0.85" />
          <ellipse cx="76" cy="54" rx="6" ry="4" fill="#FCA5A5" opacity="0.85" />

          {/* Wide Open Smile */}
          <path d="M 38 48 Q 50 64 62 48 Z" fill="#E17B77" stroke="#2A5235" strokeWidth="3" />

          {/* Two Front Paws hooked over edge */}
          <path d="M 22 62 C 22 55 30 55 30 62 Z" fill="#A8D8AC" stroke="#2A5235" strokeWidth="3" />
          <path d="M 70 62 C 70 55 78 55 78 62 Z" fill="#A8D8AC" stroke="#2A5235" strokeWidth="3" />
        </svg>
      </div>
    </div>
  );
};

// Sun Doodle (R1 C1)
export const SunDoodle: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 50 50" fill="none" className={className}>
    {/* Center circle */}
    <circle cx="25" cy="25" r="9" stroke="#E5A624" strokeWidth="2.5" strokeDasharray="1 0" />
    {/* 8 rays */}
    <line x1="25" y1="6" x2="25" y2="11" stroke="#E5A624" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="25" y1="39" x2="25" y2="44" stroke="#E5A624" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="6" y1="25" x2="11" y2="25" stroke="#E5A624" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="39" y1="25" x2="44" y2="25" stroke="#E5A624" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="12" y1="12" x2="16" y2="16" stroke="#E5A624" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="34" y1="34" x2="38" y2="38" stroke="#E5A624" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="38" y1="12" x2="34" y2="16" stroke="#E5A624" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="12" y1="38" x2="16" y2="34" stroke="#E5A624" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// Frog Head Line Doodle for Mint card (R1 C2)
export const FrogHeadDoodle: React.FC<{ className?: string }> = ({ className = 'w-9 h-8' }) => (
  <svg viewBox="0 0 60 50" fill="none" className={className}>
    {/* Body */}
    <ellipse cx="30" cy="30" rx="22" ry="16" fill="#A8D8AC" stroke="#2A5235" strokeWidth="2.5" />
    {/* Eyes */}
    <circle cx="18" cy="18" r="9" fill="#A8D8AC" stroke="#2A5235" strokeWidth="2.5" />
    <circle cx="42" cy="18" r="9" fill="#A8D8AC" stroke="#2A5235" strokeWidth="2.5" />
    <circle cx="19" cy="18" r="4" fill="#1E2B20" />
    <circle cx="17" cy="16" r="1.5" fill="#FFF" />
    <circle cx="41" cy="18" r="4" fill="#1E2B20" />
    <circle cx="39" cy="16" r="1.5" fill="#FFF" />
    {/* Cheeks */}
    <circle cx="14" cy="32" r="3.5" fill="#FCA5A5" />
    <circle cx="46" cy="32" r="3.5" fill="#FCA5A5" />
    {/* Smile */}
    <path d="M 24 30 Q 30 36 36 30" stroke="#2A5235" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

// Sprout Doodle (R2 C1)
export const SproutDoodle: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    {/* Stem */}
    <path d="M 20 36 C 20 25 18 18 20 12" stroke="#48784E" strokeWidth="2.5" strokeLinecap="round" />
    {/* Left leaf */}
    <path d="M 20 22 C 12 21 8 15 12 11 C 16 11 19 16 20 22 Z" fill="#88C488" stroke="#48784E" strokeWidth="2" />
    {/* Right leaf */}
    <path d="M 20 16 C 27 15 32 10 28 6 C 24 6 21 11 20 16 Z" fill="#A2DC9A" stroke="#48784E" strokeWidth="2" />
  </svg>
);

// Frog Holding Tea Cup (R3 C1)
export const FrogTeaDoodle: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <svg viewBox="0 0 80 80" fill="none" className={className}>
    {/* Tiny heart floating above */}
    <path d="M 40 10 C 37 5 30 6 30 11 C 30 16 40 22 40 22 C 40 22 50 16 50 11 C 50 6 43 5 40 10 Z" fill="#F87171" />
    
    {/* Frog Head */}
    <ellipse cx="40" cy="44" rx="22" ry="16" fill="#A8D8AC" stroke="#2A5235" strokeWidth="2.5" />
    {/* Eyes */}
    <circle cx="28" cy="32" r="9" fill="#A8D8AC" stroke="#2A5235" strokeWidth="2.5" />
    <circle cx="52" cy="32" r="9" fill="#A8D8AC" stroke="#2A5235" strokeWidth="2.5" />
    <circle cx="29" cy="32" r="4.5" fill="#1E2B20" />
    <circle cx="27" cy="30" r="1.5" fill="#FFF" />
    <circle cx="51" cy="32" r="4.5" fill="#1E2B20" />
    <circle cx="49" cy="30" r="1.5" fill="#FFF" />
    
    {/* Cheeks */}
    <circle cx="23" cy="45" r="3.5" fill="#FCA5A5" />
    <circle cx="57" cy="45" r="3.5" fill="#FCA5A5" />
    
    {/* Smile */}
    <path d="M 36 44 Q 40 48 44 44" stroke="#2A5235" strokeWidth="2" strokeLinecap="round" />

    {/* Teacup & Hands */}
    <rect x="33" y="52" width="14" height="12" rx="3" fill="#A0623B" stroke="#2A5235" strokeWidth="2" />
    {/* Cup handle */}
    <path d="M 47 55 Q 52 57 47 61" stroke="#2A5235" strokeWidth="2" fill="none" />
    {/* Steam lines */}
    <path d="M 37 49 Q 36 46 38 43" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 43 49 Q 44 46 42 43" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />

    {/* Frog paws holding cup */}
    <circle cx="32" cy="58" r="3.5" fill="#A8D8AC" stroke="#2A5235" strokeWidth="1.8" />
    <circle cx="48" cy="58" r="3.5" fill="#A8D8AC" stroke="#2A5235" strokeWidth="1.8" />
  </svg>
);

// Cloud Doodle (R3 C2)
export const CloudDoodle: React.FC<{ className?: string }> = ({ className = 'w-10 h-8' }) => (
  <svg viewBox="0 0 50 35" fill="none" className={className}>
    <path
      d="M 12 28 Q 6 28 8 20 Q 8 13 16 14 Q 18 7 27 8 Q 35 6 38 14 Q 45 13 44 21 Q 46 28 39 28 Z"
      stroke="#79B5E9"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="#F0F7FF"
    />
  </svg>
);

// Frog Resting Paws Doodle (R3 C3)
export const FrogPawsDoodle: React.FC<{ className?: string }> = ({ className = 'w-16 h-14' }) => (
  <svg viewBox="0 0 80 60" fill="none" className={className}>
    {/* Head */}
    <ellipse cx="40" cy="32" rx="24" ry="18" fill="#A8D8AC" stroke="#2A5235" strokeWidth="2.5" />
    {/* Eyes */}
    <circle cx="28" cy="20" r="10" fill="#A8D8AC" stroke="#2A5235" strokeWidth="2.5" />
    <circle cx="52" cy="20" r="10" fill="#A8D8AC" stroke="#2A5235" strokeWidth="2.5" />
    <circle cx="29" cy="20" r="5" fill="#1E2B20" />
    <circle cx="27" cy="18" r="1.8" fill="#FFF" />
    <circle cx="51" cy="20" r="5" fill="#1E2B20" />
    <circle cx="49" cy="18" r="1.8" fill="#FFF" />
    {/* Cheeks */}
    <ellipse cx="23" cy="34" rx="4" ry="2.5" fill="#FCA5A5" />
    <ellipse cx="57" cy="34" rx="4" ry="2.5" fill="#FCA5A5" />
    {/* Smile */}
    <path d="M 35 32 Q 40 37 45 32" stroke="#2A5235" strokeWidth="2.2" strokeLinecap="round" />
    
    {/* Resting paws on card edge */}
    <ellipse cx="26" cy="46" rx="6" ry="4" fill="#A8D8AC" stroke="#2A5235" strokeWidth="2" />
    <ellipse cx="54" cy="46" rx="6" ry="4" fill="#A8D8AC" stroke="#2A5235" strokeWidth="2" />
  </svg>
);

// Polaroid Daisy Card (R2 C3)
export const DaisyCard: React.FC<{ text?: string }> = ({
  text = 'Ngày tươi sáng\nphía trước. ♡',
}) => {
  return (
    <div className="relative w-full h-full rounded-[18px] overflow-hidden shadow-[0_3px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] border border-black/5 bg-[#FFFFFF] p-2 flex flex-col group transition-transform hover:-translate-y-0.5">
      {/* Semi-transparent Green Washi Tape at Top Center with Realistic Shadow */}
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-16 h-5 bg-[#A8D8AC]/80 backdrop-blur-xs border-y border-[#629B69]/30 rotate-[-1.5deg] shadow-[0_2px_4px_rgba(0,0,0,0.12)] z-20 pointer-events-none" />

      {/* Photo Area */}
      <div className="relative flex-1 w-full rounded-[14px] overflow-hidden bg-gradient-to-b from-[#64884F] via-[#52743F] to-[#385526] flex flex-col items-center justify-center p-4">
        {/* Soft simulated sunny field & chamomile flowers */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_20%,#FFFFFF,transparent_60%)]" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-[#EAF5D8]/30 blur-md" />
        <div className="absolute top-2 right-2 w-16 h-16 rounded-full bg-[#FFEFA8]/30 blur-sm" />
        
        {/* Illustrated chamomile daisies in field */}
        <svg className="absolute inset-0 w-full h-full opacity-70 pointer-events-none" viewBox="0 0 160 120">
          {/* Flower 1 */}
          <g transform="translate(30, 80)">
            <circle cx="0" cy="0" r="10" fill="#FFFFFF" />
            <circle cx="0" cy="0" r="4.5" fill="#FACC15" />
          </g>
          {/* Flower 2 */}
          <g transform="translate(130, 90)">
            <circle cx="0" cy="0" r="12" fill="#FFFFFF" />
            <circle cx="0" cy="0" r="5" fill="#FACC15" />
          </g>
          {/* Flower 3 */}
          <g transform="translate(85, 98)">
            <circle cx="0" cy="0" r="8" fill="#FFFFFF" />
            <circle cx="0" cy="0" r="3.5" fill="#FACC15" />
          </g>
          {/* Grass strands */}
          <path d="M 20 120 Q 25 90 28 80" stroke="#7FB567" strokeWidth="2" strokeLinecap="round" />
          <path d="M 70 120 Q 72 95 68 85" stroke="#7FB567" strokeWidth="2" strokeLinecap="round" />
          <path d="M 120 120 Q 118 90 122 75" stroke="#7FB567" strokeWidth="2" strokeLinecap="round" />
        </svg>

        {/* Centered White Handwritten Text */}
        <div className="relative z-10 text-center text-white drop-shadow-md select-none">
          <p className="font-handwriting text-2xl font-bold leading-tight tracking-wide whitespace-pre-line">
            {text}
          </p>
        </div>

        {/* Small White Line Heart Doodle bottom-right inside photo */}
        <div className="absolute bottom-2.5 right-3 text-white/90 drop-shadow-xs">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
