import React, { useEffect } from 'react';
import { DesktopEnvironment } from './components/DesktopEnvironment';
import { MainWindow } from './components/MainWindow';
import { FloatingFrogWidget } from './components/FloatingFrogWidget';
import { NoteModal } from './components/NoteModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { QuickNoteWindow } from './components/QuickNoteWindow';
import { LandingPage } from './components/landing/LandingPage';
import { useNotesStore } from './stores/useNotesStore';

export const App: React.FC = () => {
  const {
    openNewNoteModal,
    closeNoteModal,
    setCollapsed,
    environmentMode,
    setEnvironmentMode,
    isCollapsed,
    isLandingView,
    setIsLandingView,
    syncFromDB,
    setShowQuickNote,
  } = useNotesStore();

  const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

  // Listen for Electron IPC triggers from bubble context menu
  useEffect(() => {
    if (isElectron) {
      (window as any).electronAPI?.onTriggerNewNote?.(() => {
        openNewNoteModal();
      });
      (window as any).electronAPI?.onTriggerQuickNote?.(() => {
        setShowQuickNote(true);
      });
    }
  }, [isElectron, openNewNoteModal, setShowQuickNote]);

  // Sync with Turso cloud DB on startup
  useEffect(() => {
    syncFromDB();
  }, [syncFromDB]);

  // Check URL params or Electron environment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get('view') === 'landing') {
      setIsLandingView(true);
      setEnvironmentMode(false);
    } else if (params.get('view') === 'app') {
      setIsLandingView(false);
    } else if (params.get('collapsed') === 'true') {
      setCollapsed(true);
      setEnvironmentMode(false);
    } else if (isElectron || params.get('mode') === 'standalone') {
      setEnvironmentMode(false);
    }
  }, [setCollapsed, setEnvironmentMode, setIsLandingView, isElectron]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + N: new note
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        openNewNoteModal();
      }
      // Escape: close modal
      if (e.key === 'Escape') {
        closeNoteModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openNewNoteModal, closeNoteModal]);

  // Keep body classes in sync with view mode for smooth scrolling
  useEffect(() => {
    if (isLandingView) {
      document.body.className = "text-[#19271D] antialiased font-['Nunito',sans-serif] landing-mode";
      document.body.style.backgroundColor = '#FAF9F5';
    } else {
      document.body.className = "text-[#29452C] antialiased select-none font-['Nunito',sans-serif] desktop-mode";
      document.body.style.backgroundColor = 'transparent';
    }
  }, [isLandingView]);

  if (isLandingView) {
    return (
      <div className="w-full min-h-screen bg-[#FAF9F5]">
        <LandingPage onBackToApp={() => setIsLandingView(false)} />
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-transparent overflow-hidden select-none">
      {environmentMode ? (
        <DesktopEnvironment />
      ) : !isCollapsed ? (
        <MainWindow isMockup={false} />
      ) : (
        <FloatingFrogWidget />
      )}
      <NoteModal />
      <CloudSyncModal />
      <QuickNoteWindow />
    </div>
  );
};
