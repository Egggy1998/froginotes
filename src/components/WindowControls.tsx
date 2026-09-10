import React from 'react';
import { Minus, Square, X } from 'lucide-react';
import { useNotesStore } from '../stores/useNotesStore';

export const WindowControls: React.FC = () => {
  const { toggleCollapse } = useNotesStore();

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ((window as any).electronAPI?.collapseToBubble) {
      (window as any).electronAPI.collapseToBubble();
    } else {
      toggleCollapse();
    }
  };

  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    // In Electron or browser
    if ((window as any).electronAPI?.maximize) {
      (window as any).electronAPI.maximize();
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ((window as any).electronAPI?.close) {
      (window as any).electronAPI.close();
    } else {
      toggleCollapse();
    }
  };

  return (
    <div className="flex items-center gap-0.5 app-no-drag">
      <button
        onClick={handleMinimize}
        title="Minimize to floating frog bubble"
        className="w-8 h-7 flex items-center justify-center rounded hover:bg-black/5 text-[#436449] transition-colors"
      >
        {/* Crisp Minimize Bar */}
        <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
          <rect width="10" height="1" />
        </svg>
      </button>
      <button
        onClick={handleMaximize}
        title="Maximize"
        className="w-8 h-7 flex items-center justify-center rounded hover:bg-black/5 text-[#436449] transition-colors"
      >
        {/* Crisp Square Maximize */}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="0.5" y="0.5" width="9" height="9" />
        </svg>
      </button>
      <button
        onClick={handleClose}
        title="Close"
        className="w-8 h-7 flex items-center justify-center rounded hover:bg-[#E86C65] hover:text-white text-[#436449] transition-colors"
      >
        {/* Crisp X Close */}
        <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.2">
          <line x1="1" y1="1" x2="9" y2="9" />
          <line x1="9" y1="1" x2="1" y2="9" />
        </svg>
      </button>
    </div>
  );
};
