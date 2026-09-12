import React, { useState, useRef, useEffect } from 'react';
import { useNotesStore } from '../stores/useNotesStore';
import { FrogAvatar } from './mascots/FrogMascots';
import { FrogMascot } from './mascots/FrogMascot';
import { ExternalLink, Plus, Pin, X, FileText } from 'lucide-react';

export const FloatingFrogWidget: React.FC = () => {
  const {
    floatingPos,
    setFloatingPos,
    setCollapsed,
    openNewNoteModal,
    setShowQuickNote,
    t,
  } = useNotesStore();

  const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [alwaysOnTop, setAlwaysOnTop] = useState(true);

  // Drag tracking refs
  const isPointerDownRef = useRef(false);
  const hasMovedRef = useRef(false);
  const startPosRef = useRef({ screenX: 0, screenY: 0, clientX: 0, clientY: 0 });
  const lastPosRef = useRef({ screenX: 0, screenY: 0 });

  // Pointer Down (Mouse or Touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return; // Only primary left click
    isPointerDownRef.current = true;
    hasMovedRef.current = false;
    startPosRef.current = {
      screenX: e.screenX,
      screenY: e.screenY,
      clientX: e.clientX,
      clientY: e.clientY,
    };
    lastPosRef.current = {
      screenX: e.screenX,
      screenY: e.screenY,
    };

    // Capture pointer
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Pointer Move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;

    const totalDistX = Math.abs(e.screenX - startPosRef.current.screenX);
    const totalDistY = Math.abs(e.screenY - startPosRef.current.screenY);

    // If moved more than 6px, treat as drag
    if (totalDistX > 6 || totalDistY > 6) {
      hasMovedRef.current = true;
    }

    const deltaX = e.screenX - lastPosRef.current.screenX;
    const deltaY = e.screenY - lastPosRef.current.screenY;
    lastPosRef.current = { screenX: e.screenX, screenY: e.screenY };

    if (hasMovedRef.current) {
      if (isElectron && (window as any).electronAPI?.moveBubble) {
        // Move native Electron bubble window
        (window as any).electronAPI.moveBubble(deltaX, deltaY);
      } else if (!isElectron) {
        // Move inside browser showcase canvas
        setFloatingPos({
          x: Math.max(10, Math.min(window.innerWidth - 75, floatingPos.x + deltaX)),
          y: Math.max(10, Math.min(window.innerHeight - 75, floatingPos.y + deltaY)),
        });
      }
    }
  };

  // Pointer Up (Release)
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if already released
    }

    // If did NOT drag (or moved <= 3px), it is a CLICK -> EXPAND!
    if (!hasMovedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      expandApp();
    }
  };

  // Expand FrogiNotes
  const expandApp = () => {
    if (isElectron && (window as any).electronAPI?.expandToWindow) {
      (window as any).electronAPI.expandToWindow();
    } else {
      setCollapsed(false);
    }
  };

  // Right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isElectron && (window as any).electronAPI?.showBubbleContextMenu) {
      (window as any).electronAPI.showBubbleContextMenu();
    } else {
      setContextMenuPos({ x: e.clientX, y: e.clientY });
      setShowContextMenu(true);
    }
  };

  const handleOpenApp = () => {
    setShowContextMenu(false);
    expandApp();
  };

  const handleNewNote = () => {
    setShowContextMenu(false);
    expandApp();
    setTimeout(() => {
      openNewNoteModal();
    }, 150);
  };

  const handleToggleAlwaysOnTop = () => {
    const next = !alwaysOnTop;
    setAlwaysOnTop(next);
    setShowContextMenu(false);
    if (isElectron && (window as any).electronAPI?.setAlwaysOnTop) {
      (window as any).electronAPI.setAlwaysOnTop(next);
    }
  };

  const handleQuit = () => {
    setShowContextMenu(false);
    if (isElectron && (window as any).electronAPI?.close) {
      (window as any).electronAPI.close();
    } else {
      setCollapsed(false);
    }
  };

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        style={
          isElectron
            ? { width: '100vw', height: '100vh' }
            : { left: `${floatingPos.x}px`, top: `${floatingPos.y}px` }
        }
        className={`${
          isElectron
            ? 'fixed inset-0 flex items-center justify-center'
            : 'fixed z-50'
        } select-none cursor-pointer group touch-none`}
      >
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative flex items-center justify-center cursor-pointer active:scale-95 transition-transform outline-none"
        >
          {/* Yellow Radiance Accent Marks Top-Right */}
          <div className="absolute -top-3.5 -right-3.5 w-8 h-8 pointer-events-none">
            <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
              <line x1="20" y1="20" x2="32" y2="8" stroke="#E5A624" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="20" y1="20" x2="36" y2="18" stroke="#E5A624" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="20" y1="20" x2="22" y2="4" stroke="#E5A624" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="20" y1="20" x2="38" y2="28" stroke="#E5A624" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          {/* Circular Frog Widget Bubble (approx 62px) */}
          <div className="relative w-[62px] h-[62px] rounded-full bg-[#A8D8AC] border-2 border-[#2A5235] shadow-[0_8px_25px_rgba(42,82,53,0.35)] hover:shadow-[0_12px_30px_rgba(42,82,53,0.5)] hover:scale-105 transition-transform flex items-center justify-center">
            <FrogMascot mood="happy" size={54} />
          </div>

          {/* Floating Speech Tooltip / Callout (in browser/mockup mode) */}
          {!isElectron && (
            <div className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/95 border border-[#C5DAC0] rounded-full px-3 py-1 shadow-md flex items-center gap-1.5 animate-bounce pointer-events-none">
              <span className="font-handwriting text-xs text-[#284E34] font-bold">
                {t.clickToOpen}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right-click Context Menu */}
      {showContextMenu && (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setShowContextMenu(false)}
            onContextMenu={(e) => {
              e.preventDefault();
              setShowContextMenu(false);
            }}
          />
          <div
            style={{
              left: `${Math.min(window.innerWidth - 170, Math.max(10, contextMenuPos.x))}px`,
              top: `${Math.min(window.innerHeight - 170, Math.max(10, contextMenuPos.y))}px`,
            }}
            className="fixed z-50 w-44 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-[#D5E3D1] py-1.5 text-[13px] font-semibold text-[#284E34] select-none"
          >
            <button
              onClick={handleOpenApp}
              className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#EEF5EB] text-left transition-colors"
            >
              <ExternalLink size={14} />
              <span>{t.ctxOpen}</span>
            </button>
            <button
              onClick={handleNewNote}
              className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#EEF5EB] text-left transition-colors"
            >
              <Plus size={14} />
              <span>{t.ctxNew}</span>
            </button>
            <button
              onClick={() => {
                setShowContextMenu(false);
                setShowQuickNote(true);
              }}
              className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#EEF5EB] text-left transition-colors"
            >
              <FileText size={14} />
              <span>{t.ctxQuick}</span>
            </button>
            <button
              onClick={handleToggleAlwaysOnTop}
              className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#EEF5EB] text-left transition-colors"
            >
              <Pin size={14} className={alwaysOnTop ? 'text-[#3E6848]' : ''} />
              <span>{alwaysOnTop ? `${t.ctxAlwaysOnTop} ✓` : t.ctxAlwaysOnTop}</span>
            </button>
            <div className="my-1 border-t border-[#EDF2EB]" />
            <button
              onClick={handleQuit}
              className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#FEE2E2] text-[#DC2626] text-left transition-colors"
            >
              <X size={14} />
              <span>{t.ctxQuit}</span>
            </button>
          </div>
        </>
      )}
    </>
  );
};
