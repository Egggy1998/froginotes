import React from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { useNotesStore } from '../stores/useNotesStore';
import { StickyCard } from './StickyCard';
import { FrogMascot } from './mascots/FrogMascot';

export const NoteGrid: React.FC = () => {
  const { notes, activeNav, activeFolder, searchQuery, viewMode, openNewNoteModal, resetToDefault, t } = useNotesStore();

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    // Trash view — show ONLY trash notes
    if (activeNav === 'trash' && !activeFolder) {
      if (!note.isTrash) return false;
      // Search still works inside Trash view
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = note.title?.toLowerCase().includes(q);
        const matchContent = note.content?.toLowerCase().includes(q);
        const matchBullets = note.bullets?.some((b) => b.toLowerCase().includes(q));
        const matchChecklist = note.checklist?.some((c) => c.text.toLowerCase().includes(q));
        if (!matchTitle && !matchContent && !matchBullets && !matchChecklist) return false;
      }
      return true;
    }

    // Archive view — show ONLY archived (non-trash) notes
    if (activeNav === 'archive' && !activeFolder) {
      if (!note.isArchived || note.isTrash) return false;
      // Search still works inside Archive view
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = note.title?.toLowerCase().includes(q);
        const matchContent = note.content?.toLowerCase().includes(q);
        const matchBullets = note.bullets?.some((b) => b.toLowerCase().includes(q));
        const matchChecklist = note.checklist?.some((c) => c.text.toLowerCase().includes(q));
        if (!matchTitle && !matchContent && !matchBullets && !matchChecklist) return false;
      }
      return true;
    }

    // Exclude trash and archive from all other views
    if (note.isTrash || note.isArchived) {
      return false;
    }

    // Folder filtering (when a folder is selected, show active notes in this folder)
    if (activeFolder) {
      if (note.folderId !== activeFolder) return false;
    } else {
      // Nav filtering (only when no folder is explicitly chosen)
      if (activeNav === 'today' && !note.isToday) return false;
      if (activeNav === 'starred' && !note.isStarred) return false;
      if (activeNav === 'reminders' && !note.hasReminder) return false;
    }

    // Search query filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = note.title?.toLowerCase().includes(q);
      const matchContent = note.content?.toLowerCase().includes(q);
      const matchBullets = note.bullets?.some((b) => b.toLowerCase().includes(q));
      const matchChecklist = note.checklist?.some((c) => c.text.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchBullets && !matchChecklist) {
        return false;
      }
    }

    return true;
  });

  if (filteredNotes.length === 0) {
    // Context-aware empty state messages
    const isSearching = searchQuery.trim().length > 0;
    const emptyConfig = (() => {
      if (isSearching) {
        return {
          mood: 'thinking' as const,
          title: t.emptySearchTitle,
          subtitle: `${t.emptySearchSub} ("${searchQuery}")`,
        };
      }
      if (activeNav === 'trash' && !activeFolder) {
        return {
          mood: 'wink' as const,
          title: t.emptyTrashTitle,
          subtitle: t.emptyTrashSub,
        };
      }
      if (activeNav === 'archive' && !activeFolder) {
        return {
          mood: 'sleepy' as const,
          title: t.emptyArchiveTitle,
          subtitle: t.emptyArchiveSub,
        };
      }
      if (activeNav === 'starred') {
        return {
          mood: 'sparkle' as const,
          title: t.emptyStarredTitle,
          subtitle: t.emptyStarredSub,
        };
      }
      if (activeNav === 'today') {
        return {
          mood: 'happy' as const,
          title: t.emptyTodayTitle,
          subtitle: t.emptyTodaySub,
        };
      }
      if (activeNav === 'reminders') {
        return {
          mood: 'surprised' as const,
          title: t.emptyRemindersTitle,
          subtitle: t.emptyRemindersSub,
        };
      }
      if (activeFolder) {
        return {
          mood: 'thinking' as const,
          title: t.emptyFolderTitle,
          subtitle: t.emptyFolderSub,
        };
      }
      return {
        mood: 'thinking' as const,
        title: t.emptyDefaultTitle,
        subtitle: t.emptyDefaultSub,
      };
    })();

    return (
      <div className="h-[430px] flex flex-col items-center justify-center text-center p-8 select-none">
        <FrogMascot mood={emptyConfig.mood} size={64} className="mb-3 animate-float-gentle" />
        <h3 className="font-rounded font-extrabold text-lg text-[#284E34]">
          {emptyConfig.title}
        </h3>
        <p className="text-sm font-medium text-[#748C79] mt-1 font-handwriting text-base max-w-sm">
          {emptyConfig.subtitle}
        </p>

        {!isSearching && activeNav === 'notes' && !activeFolder && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => openNewNoteModal()}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#3E6848] hover:bg-[#32553A] text-white rounded-full text-xs font-bold shadow-[0_4px_14px_rgba(62,104,72,0.22)] transition-all cursor-pointer active:scale-95"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Tạo ghi chú đầu tiên 🍃</span>
            </button>
            <button
              type="button"
              onClick={resetToDefault}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-[#F0F5EE] text-[#426447] border border-[#D5E1D2] rounded-full text-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              <Sparkles size={13} className="text-amber-500" />
              <span>Nạp 9 ghi chú mẫu</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Sort pinned first, then newest updated first
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
  });

  return (
    <div
      className={`grid gap-5 xl:gap-6 ${
        viewMode === 'grid'
          ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
          : 'grid-cols-1'
      }`}
    >
      {sortedNotes.map((note) => (
        <StickyCard key={note.id} note={note} />
      ))}
    </div>
  );
};
