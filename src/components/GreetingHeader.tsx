import React from 'react';
import { useNotesStore } from '../stores/useNotesStore';
import { Trash2 } from 'lucide-react';

export const GreetingHeader: React.FC = () => {
  const { activeNav, activeFolder, emptyTrash, notes, t } = useNotesStore();

  const trashCount = notes.filter((n) => n.isTrash).length;

  const getHeading = () => {
    if (activeFolder) {
      const folderNameMap: Record<string, string> = {
        personal: t.folderPersonal,
        work: t.folderWork,
        ideas: t.folderIdeas,
        health: t.folderHealth,
        travel: t.folderTravel,
      };
      return `${folderNameMap[activeFolder] || activeFolder} 📁`;
    }
    switch (activeNav) {
      case 'today':
        return t.greetingToday;
      case 'starred':
        return t.greetingStarred;
      case 'reminders':
        return t.greetingReminders;
      case 'archive':
        return t.greetingArchive;
      case 'trash':
        return t.greetingTrash;
      default:
        return t.greetingDefault;
    }
  };

  const getSubheading = () => {
    if (activeFolder) {
      return t.subheadingFolder;
    }
    switch (activeNav) {
      case 'archive':
        return t.subheadingArchive;
      case 'trash':
        return t.subheadingTrash;
      default:
        return t.subheadingDefault;
    }
  };

  return (
    <div className="mb-5 select-none flex items-center justify-between">
      <div>
        <h1 className="font-rounded font-extrabold text-[22px] text-[#1E2B20] tracking-tight flex items-center gap-2 leading-tight">
          {getHeading()}
        </h1>
        <p className="text-[12.5px] font-medium text-[#65786A] mt-0.5 font-handwriting text-base">
          {getSubheading()}
        </p>
      </div>

      {activeNav === 'trash' && trashCount > 0 && !activeFolder && (
        <button
          onClick={emptyTrash}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#DC2626] bg-[#FEE2E2] hover:bg-[#FECACA] rounded-full transition-colors"
        >
          <Trash2 size={13} />
          <span>{t.emptyTrashBtn} ({trashCount})</span>
        </button>
      )}
    </div>
  );
};
