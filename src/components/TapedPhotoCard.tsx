import React, { useState, useRef } from 'react';
import { TapeStyle, TapePosition } from '../types';
import { FrogMascot, MascotMood } from './mascots/FrogMascot';

interface TapedPhotoCardProps {
  title?: string;
  photoUrl?: string;
  tapeStyle?: TapeStyle;
  tapePosition?: TapePosition;
  mascot?: MascotMood;
  onClick?: () => void;
}

// Preset photo illustrations & gradients if no custom photo uploaded
const presetBackgrounds: Record<string, string> = {
  daisy: 'from-[#5F8349] via-[#4D6F39] to-[#344E24]',
  coffee: 'from-[#8D6E53] via-[#6F5138] to-[#4D3523]',
  forest: 'from-[#3D6E50] via-[#2D563D] to-[#1C3B27]',
  sunset: 'from-[#D97757] via-[#B85852] to-[#6E3547]',
};

export const TapedPhotoCard: React.FC<TapedPhotoCardProps> = ({
  title = 'Những ngày tươi sáng. ♡',
  photoUrl,
  tapeStyle = 'mint',
  tapePosition = 'center',
  mascot = 'happy',
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt calculation on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: -(y / (rect.height / 2)) * 6, // max 6 deg tilt
      y: (x / (rect.width / 2)) * 6,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  // Tape styling classes
  const getTapeClass = () => {
    switch (tapeStyle) {
      case 'pink':
        return 'bg-[#F9A8D4]/85 border-y border-[#F472B6]/40 shadow-[0_2px_6px_rgba(244,114,182,0.3)]';
      case 'yellow':
        return 'bg-[#FDE047]/85 border-y border-[#EAB308]/40 shadow-[0_2px_6px_rgba(234,179,8,0.3)]';
      case 'checkered':
        return 'bg-[#BAE6FD]/85 border-y border-[#38BDF8]/40 shadow-[0_2px_6px_rgba(56,189,248,0.3)] [background-image:linear-gradient(45deg,#38bdf820_25%,transparent_25%),linear-gradient(-45deg,#38bdf820_25%,transparent_25%)] [background-size:8px_8px]';
      case 'scotch':
        return 'bg-white/50 backdrop-blur-xs border-y border-white/70 shadow-[0_2px_5px_rgba(0,0,0,0.1)]';
      case 'mint':
      default:
        return 'bg-[#A8D8AC]/85 border-y border-[#629B69]/40 shadow-[0_2px_6px_rgba(42,82,53,0.2)]';
    }
  };

  // Tape position rendering
  const renderTape = () => {
    const tapeClass = getTapeClass();

    if (tapePosition === 'corners') {
      return (
        <>
          {/* Top-left corner tape */}
          <div
            className={`absolute -top-1 -left-2 w-11 h-4 ${tapeClass} rotate-[-35deg] z-20 pointer-events-none transition-transform duration-300 ${
              isHovered ? 'scale-105 -translate-y-0.5' : ''
            }`}
          />
          {/* Top-right corner tape */}
          <div
            className={`absolute -top-1 -right-2 w-11 h-4 ${tapeClass} rotate-[35deg] z-20 pointer-events-none transition-transform duration-300 ${
              isHovered ? 'scale-105 -translate-y-0.5' : ''
            }`}
          />
        </>
      );
    }

    if (tapePosition === 'tilted') {
      return (
        <div
          className={`absolute -top-1.5 left-6 w-16 h-5 ${tapeClass} rotate-[-6deg] z-20 pointer-events-none transition-transform duration-300 ${
            isHovered ? 'scale-110 -translate-y-1' : ''
          }`}
        />
      );
    }

    // Default: Center
    return (
      <div
        className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-16 h-5 ${tapeClass} rotate-[-1.5deg] z-20 pointer-events-none transition-transform duration-300 ${
          isHovered ? 'scale-110 -translate-y-1' : ''
        }`}
      />
    );
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(700px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${
          isHovered ? 1.025 : 1
        }, ${isHovered ? 1.025 : 1}, 1)`,
        transition: isHovered
          ? 'transform 0.08s ease-out, box-shadow 0.2s ease-out'
          : 'transform 0.4s ease-out, box-shadow 0.4s ease-out',
      }}
      className={`relative w-full h-full rounded-[18px] overflow-hidden bg-white p-2 flex flex-col cursor-pointer border border-black/5 select-none ${
        isHovered
          ? 'shadow-[0_16px_35px_rgba(28,49,25,0.18)]'
          : 'shadow-[0_4px_14px_rgba(0,0,0,0.06)]'
      }`}
    >
      {/* Tape decoration */}
      {renderTape()}

      {/* Photo Frame Container */}
      <div className="relative flex-1 w-full rounded-[13px] overflow-hidden flex flex-col items-center justify-center p-3.5 group">
        {photoUrl && photoUrl.startsWith('data:image') ? (
          /* User Uploaded Custom Image */
          <img
            src={photoUrl}
            alt="Pinned memory"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          /* Cozy Illustrated Nature Gradient */
          <div
            className={`absolute inset-0 bg-gradient-to-b ${
              presetBackgrounds[photoUrl || 'daisy'] || presetBackgrounds.daisy
            }`}
          >
            {/* Soft sunny radial highlight */}
            <div className="absolute inset-0 opacity-45 bg-[radial-gradient(circle_at_50%_25%,#FFFFFF,transparent_65%)]" />

            {/* Illustrated chamomile daisies in field */}
            <svg
              className={`absolute inset-0 w-full h-full pointer-events-none transition-transform duration-700 ease-out ${
                isHovered ? 'scale-105' : 'scale-100'
              }`}
              viewBox="0 0 160 120"
            >
              <g transform="translate(30, 80)">
                <circle cx="0" cy="0" r="10" fill="#FFFFFF" opacity="0.9" />
                <circle cx="0" cy="0" r="4.5" fill="#FACC15" />
              </g>
              <g transform="translate(130, 90)">
                <circle cx="0" cy="0" r="12" fill="#FFFFFF" opacity="0.9" />
                <circle cx="0" cy="0" r="5" fill="#FACC15" />
              </g>
              <g transform="translate(85, 98)">
                <circle cx="0" cy="0" r="8" fill="#FFFFFF" opacity="0.9" />
                <circle cx="0" cy="0" r="3.5" fill="#FACC15" />
              </g>
              {/* Animated swaying grass strands */}
              <path
                d={
                  isHovered
                    ? 'M 20 120 Q 30 88 35 78'
                    : 'M 20 120 Q 25 90 28 80'
                }
                stroke="#88C770"
                strokeWidth="2.2"
                strokeLinecap="round"
                className="transition-all duration-500"
              />
              <path
                d={
                  isHovered
                    ? 'M 70 120 Q 75 92 72 82'
                    : 'M 70 120 Q 72 95 68 85'
                }
                stroke="#88C770"
                strokeWidth="2.2"
                strokeLinecap="round"
                className="transition-all duration-500"
              />
              <path
                d={
                  isHovered
                    ? 'M 120 120 Q 124 88 128 72'
                    : 'M 120 120 Q 118 90 122 75'
                }
                stroke="#88C770"
                strokeWidth="2.2"
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
          </div>
        )}

        {/* Floating Sparkle / Heart Motion Graphics on Hover */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {/* Sparkle 1 */}
            <div className="absolute top-4 left-6 text-yellow-200 animate-pulse text-xs">
              ✨
            </div>
            {/* Sparkle 2 */}
            <div className="absolute bottom-6 right-10 text-yellow-100 animate-bounce text-xs delay-100">
              ✨
            </div>
            {/* Heart 1 */}
            <div className="absolute top-8 right-6 text-pink-200/80 animate-ping text-[10px]">
              ♡
            </div>
          </div>
        )}

        {/* Center Handwritten Calligraphy Caption */}
        <div className="relative z-10 text-center text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] px-2">
          <p className="font-handwriting text-2xl font-bold leading-tight tracking-wide whitespace-pre-line">
            {title}
          </p>
        </div>

        {/* Corner Mascot Stamp (Motion bouncy on hover) */}
        {mascot && mascot !== 'none' && (
          <div
            className={`absolute bottom-2 right-2.5 z-20 transition-transform duration-300 pointer-events-none ${
              isHovered ? 'scale-115 rotate-6' : 'scale-100'
            }`}
          >
            <FrogMascot mood={mascot} size={30} />
          </div>
        )}

        {/* Small White Line Heart Doodle bottom-left */}
        <div className="absolute bottom-2.5 left-3 text-white/90 drop-shadow-xs pointer-events-none">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
