/**
 * DecorLockOverlay.tsx — Lock shimmer for gated decor assets
 *
 * SCOPE: src/components/decor/DecorLockOverlay.tsx
 *
 * Renders a shimmer overlay over any element when the user lacks entitlement.
 * Shows a lock icon and a subtle message.
 *
 * Public props:
 *   assetId: string          — the asset being guarded
 *   children: ReactNode      — the preview content to overlay
 *   onClickLocked?: () => void  — called when user clicks the locked area
 */

import React from 'react';
import { Lock } from 'lucide-react';
import { useDecorStore } from '../../stores/useDecorStore';

interface DecorLockOverlayProps {
  assetId: string;
  children: React.ReactNode;
  /** Called when locked area is clicked (e.g. open pack modal) */
  onClickLocked?: () => void;
  className?: string;
}

export const DecorLockOverlay: React.FC<DecorLockOverlayProps> = ({
  assetId,
  children,
  onClickLocked,
  className = '',
}) => {
  const { canUseAsset } = useDecorStore();
  const owned = canUseAsset(assetId);

  if (owned) {
    return <>{children}</>;
  }

  return (
    <div className={`relative select-none ${className}`}>
      {/* Blurred preview of the locked content */}
      <div className="pointer-events-none blur-[2px] opacity-60" aria-hidden="true">
        {children}
      </div>

      {/* Lock shimmer overlay */}
      <button
        onClick={onClickLocked}
        aria-label="Tính năng này cần mua gói. Nhấn để xem thêm."
        className="
          absolute inset-0 flex flex-col items-center justify-center gap-1
          rounded-[inherit]
          bg-gradient-to-b from-white/30 via-white/50 to-white/30
          backdrop-blur-[1px]
          cursor-pointer group
          transition-all duration-200
          hover:from-white/40 hover:via-white/60 hover:to-white/40
        "
      >
        {/* Shimmer sweep animation */}
        <div className="
          absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none
        ">
          <div className="
            absolute inset-0 -translate-x-full
            bg-gradient-to-r from-transparent via-white/40 to-transparent
            animate-[shimmer_2s_ease-in-out_infinite]
          " />
        </div>

        <div className="
          relative z-10 flex flex-col items-center gap-1
          transition-transform duration-200 group-hover:scale-110
        ">
          <div className="
            w-7 h-7 rounded-full bg-white/80 shadow-sm
            flex items-center justify-center
            border border-[#E0D0B0]/60
          ">
            <Lock size={13} className="text-[#B09070]" />
          </div>
          <span className="text-[9px] text-[#8A7060] font-medium bg-white/70 px-1.5 py-0.5 rounded-full">
            Cần mua gói
          </span>
        </div>
      </button>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          60%, 100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

/**
 * DecorTapePreview — Shows a tape strip that can be locked or active.
 * Convenience wrapper for use in NoteModal or DiaryView tape selectors.
 *
 * Public props (clean typed):
 *   assetId: string
 *   selected: boolean
 *   onSelect: () => void         — fires even if locked (caller handles gate)
 *   onClickLocked?: () => void   — fires when locked area is clicked
 */
interface DecorTapePreviewProps {
  assetId: string;
  selected: boolean;
  onSelect: () => void;
  onClickLocked?: () => void;
}

export const DecorTapePreview: React.FC<DecorTapePreviewProps> = ({
  assetId,
  selected,
  onSelect,
  onClickLocked,
}) => {
  const { canUseAsset } = useDecorStore();
  const owned = canUseAsset(assetId);

  const handleClick = () => {
    if (!owned && onClickLocked) {
      onClickLocked();
      return;
    }
    onSelect();
  };

  return (
    <button
      onClick={handleClick}
      title={owned ? assetId : `${assetId} — cần mua gói`}
      aria-pressed={selected}
      className={`
        relative w-12 h-4 rounded-sm transition-all duration-150
        ${selected ? 'ring-2 ring-[#4D6F39] ring-offset-1' : 'hover:ring-1 hover:ring-[#C9E0C0]'}
        ${!owned ? 'cursor-pointer' : 'cursor-pointer'}
      `}
    >
      {!owned && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-sm z-10">
          <Lock size={8} className="text-gray-400" />
        </div>
      )}
      {/* Tape preview filled by parent via style prop or className */}
    </button>
  );
};
