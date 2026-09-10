import React, { useEffect, useRef } from 'react';
import { Search, LayoutGrid, List, CalendarDays, Plus, ChevronDown, Cloud, CloudCheck, RefreshCw } from 'lucide-react';
import { useNotesStore } from '../stores/useNotesStore';
import { WindowControls } from './WindowControls';

export const TopBar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    openNewNoteModal,
    cloudSyncEnabled,
    isSyncing,
    setShowSyncModal,
    language,
    setLanguage,
    t,
  } = useNotesStore();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl + K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="h-14 px-6 flex items-center justify-between border-b border-[#E6EDE3] bg-white/70 backdrop-blur-xs select-none app-drag-region">
      {/* Left / Center Search Capsule */}
      <div className="flex-1 max-w-[420px] app-no-drag">
        <div className="relative flex items-center">
          <Search
            size={16}
            className="absolute left-3.5 text-[#738C77] pointer-events-none"
          />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full h-9 pl-9 pr-16 bg-[#F0F3EE] hover:bg-[#EAEFE8] focus:bg-white text-[13px] text-[#1E2B20] placeholder-[#79917D] rounded-full border border-transparent focus:border-[#A8D8AC] focus:outline-none transition-all"
          />
          {/* Ctrl + K badge */}
          <div className="absolute right-2.5 flex items-center gap-1 text-[10px] font-bold text-[#79917D] pointer-events-none">
            <kbd className="px-1.5 py-0.5 bg-white rounded border border-[#D5DDD1] shadow-2xs">
              Ctrl
            </kbd>
            <kbd className="px-1.5 py-0.5 bg-white rounded border border-[#D5DDD1] shadow-2xs">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right side controls: Lang + Cloud Sync + View switch + New Note + Window controls */}
      <div className="flex items-center gap-2 app-no-drag">
        {/* Language switch button */}
        <button
          onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
          title={language === 'vi' ? 'Chuyển sang Tiếng Anh' : 'Switch to Vietnamese'}
          className="px-2 py-0.8 rounded-full text-[11px] font-bold bg-[#F0F3EE] hover:bg-[#E4ECE1] text-[#284E34] border border-[#DFE7DB] transition-all flex items-center gap-1"
        >
          <span>{language === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}</span>
        </button>

        {/* Cloud Sync Status Button */}
        <button
          onClick={() => setShowSyncModal(true)}
          title={isSyncing ? 'Đang đồng bộ...' : cloudSyncEnabled ? t.cloudActiveTitle : t.cloudSync}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
            isSyncing
              ? 'bg-[#EBF7E5] text-[#284E34] border border-[#BDE3B4]'
              : cloudSyncEnabled
              ? 'bg-[#E2F6D8] text-[#284E34] border border-[#A8D8AC] hover:bg-[#D4EFC9]'
              : 'bg-[#F0F3EE] text-[#5B7360] border border-[#DFE7DB] hover:bg-[#E4ECE1] hover:text-[#284E34]'
          }`}
        >
          {isSyncing ? (
            <>
              <RefreshCw size={13} className="text-[#3E6848] animate-spin" />
              <span>Đang đồng bộ...</span>
            </>
          ) : cloudSyncEnabled ? (
            <>
              <CloudCheck size={13} className="text-[#3E6848]" strokeWidth={2.5} />
              <span>{t.cloudSynced}</span>
            </>
          ) : (
            <>
              <Cloud size={13} strokeWidth={2.2} />
              <span>{t.cloudSync}</span>
            </>
          )}
        </button>

        {/* View mode toggle */}
        <div className="flex items-center bg-[#F0F3EE] p-0.5 rounded-xl border border-[#E3EAE0]">
          <button
            onClick={() => setViewMode('grid')}
            title={t.viewGrid}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-[#284E34] shadow-xs'
                : 'text-[#6C8570] hover:text-[#284E34]'
            }`}
          >
            <LayoutGrid size={15} strokeWidth={2.2} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            title={t.viewList}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-white text-[#284E34] shadow-xs'
                : 'text-[#6C8570] hover:text-[#284E34]'
            }`}
          >
            <List size={15} strokeWidth={2.2} />
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            title={t.viewCalendar}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
              viewMode === 'calendar'
                ? 'bg-white text-[#284E34] shadow-xs'
                : 'text-[#6C8570] hover:text-[#284E34]'
            }`}
          >
            <CalendarDays size={15} strokeWidth={2.2} />
          </button>
        </div>

        {/* Split Button: + New Note */}
        <div className="flex items-center bg-[#3E6848] hover:bg-[#34583D] text-white rounded-full shadow-sm transition-all overflow-hidden">
          <button
            onClick={() => openNewNoteModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-bold transition-colors"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>{t.newNote}</span>
          </button>
          <div className="w-[1px] h-4 bg-white/25" />
          <button
            onClick={() => openNewNoteModal()}
            title={t.newNote}
            className="px-1.5 py-1.5 hover:bg-white/10 transition-colors"
          >
            <ChevronDown size={13} strokeWidth={2.5} />
          </button>
        </div>

        {/* Separator before window controls */}
        <div className="w-[1px] h-4 bg-[#E0E7DC]" />

        {/* Window controls */}
        <WindowControls />
      </div>
    </header>
  );
};
