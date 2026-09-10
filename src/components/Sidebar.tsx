import React from 'react';
import {
  FileText,
  Calendar,
  Star,
  Bell,
  BookHeart,
  Archive,
  Trash2,
  Folder as FolderIcon,
  Plus,
} from 'lucide-react';
import { useNotesStore } from '../stores/useNotesStore';
import { NavSection, FolderId } from '../types';
import { FrogAvatar, SidebarWavingFrog } from './mascots/FrogMascots';
import { FrogMascot } from './mascots/FrogMascot';

interface NavItemConfig {
  id: NavSection;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface FolderItemConfig {
  id: FolderId;
  label: string;
  color: string;
  count: number;
}

export const Sidebar: React.FC = () => {
  const {
    activeNav,
    activeFolder,
    setActiveNav,
    setActiveFolder,
    notes,
    diaryEntries,
    openNewNoteModal,
    t,
  } = useNotesStore();

  // Dynamic live counts based ONLY on active (non-trash, non-archived) notes
  const getFolderCount = (fId: FolderId) =>
    notes.filter((n) => n.folderId === fId && !n.isTrash && !n.isArchived).length;

  const todayCount = notes.filter((n) => n.isToday && !n.isTrash && !n.isArchived).length;
  const starredCount = notes.filter((n) => n.isStarred && !n.isTrash && !n.isArchived).length;
  const reminderCount = notes.filter((n) => n.hasReminder && !n.isTrash && !n.isArchived).length;
  const diaryCount = diaryEntries.length;
  const archiveCount = notes.filter((n) => n.isArchived && !n.isTrash).length;
  const trashCount = notes.filter((n) => n.isTrash).length;

  const navItems: NavItemConfig[] = [
    { id: 'notes', label: t.navNotes, icon: <FileText size={17} strokeWidth={2.2} /> },
    { id: 'today', label: t.navToday, icon: <Calendar size={17} strokeWidth={2.2} />, badge: todayCount },
    { id: 'starred', label: t.navStarred, icon: <Star size={17} strokeWidth={2.2} />, badge: starredCount },
    { id: 'reminders', label: t.navReminders, icon: <Bell size={17} strokeWidth={2.2} />, badge: reminderCount },
    { id: 'diary', label: t.navDiary, icon: <BookHeart size={17} strokeWidth={2.2} />, badge: diaryCount },
    { id: 'archive', label: t.navArchive, icon: <Archive size={17} strokeWidth={2.2} />, badge: archiveCount },
    { id: 'trash', label: t.navTrash, icon: <Trash2 size={17} strokeWidth={2.2} />, badge: trashCount },
  ];

  const folders: FolderItemConfig[] = [
    { id: 'personal', label: t.folderPersonal, color: '#66AA5B', count: getFolderCount('personal') },
    { id: 'work', label: t.folderWork, color: '#E5A624', count: getFolderCount('work') },
    { id: 'ideas', label: t.folderIdeas, color: '#E879A8', count: getFolderCount('ideas') },
    { id: 'health', label: t.folderHealth, color: '#4BA3E3', count: getFolderCount('health') },
    { id: 'travel', label: t.folderTravel, color: '#9B78DC', count: getFolderCount('travel') },
  ];

  return (
    <aside className="w-[220px] shrink-0 border-r border-[#E6EDE3] bg-[#F8FAF6] flex flex-col justify-between select-none h-full py-4 px-3">
      {/* Top Brand Logo */}
      <div>
        <div className="flex items-center gap-2.5 px-2 mb-5">
          <FrogMascot mood="happy" size={32} />
          <div>
            <div className="flex items-center gap-1">
              <span className="font-rounded font-extrabold text-[17px] text-[#284E34] tracking-tight">
                FrogiNotes
              </span>
              <span className="text-sm">🍃</span>
            </div>
            <p className="text-[10px] text-[#758A78] font-medium leading-none">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Primary Navigation List */}
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = activeNav === item.id && activeFolder === null;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#D8ECD7] text-[#284E34]'
                    : 'text-[#4A634E] hover:bg-[#EEF5EB] hover:text-[#284E34]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-[#284E34]' : 'text-[#628066]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-[#C5E2C3] text-[#284E34]'
                        : 'bg-[#E7ECE4] text-[#69826D]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Folders Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-3 mb-1.5">
            <span className="text-[11px] font-bold tracking-wider text-[#7E9682] uppercase">
              {t.folders}
            </span>
            <button
              onClick={() => openNewNoteModal(activeFolder || 'personal')}
              title="Thêm ghi chú vào thư mục"
              className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-[#E5EEE2] text-[#6D8A72] transition-colors"
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
          </div>

          <div className="space-y-0.5">
            {folders.map((folder) => {
              const isActive = activeFolder === folder.id;
              return (
                <button
                  key={folder.id}
                  onClick={() => setActiveFolder(folder.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[13px] font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#D8ECD7] text-[#284E34]'
                      : 'text-[#4A634E] hover:bg-[#EEF5EB] hover:text-[#284E34]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FolderIcon
                      size={15}
                      strokeWidth={2}
                      style={{ color: folder.color, fill: `${folder.color}30` }}
                    />
                    <span>{folder.label}</span>
                  </div>
                  {/* ONLY show badge count if count > 0 */}
                  {folder.count > 0 && (
                    <span
                      className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-[#C5E2C3] text-[#284E34]'
                          : 'bg-[#E7ECE4] text-[#69826D]'
                      }`}
                    >
                      {folder.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Mascot Frog */}
      <div className="pt-2 border-t border-[#E8EDE5]/60 flex items-end gap-2 px-2 py-1 select-none">
        <FrogMascot mood="wink" size={48} className="shrink-0" />
        <div className="relative bg-[#FFFFFF] border border-[#E0E7DC] rounded-xl px-2.5 py-1.5 shadow-sm">
          <p className="font-handwriting text-xs text-[#2A5235] font-bold leading-tight select-none whitespace-pre-line">
            {t.sidebarMascot}
          </p>
          <div className="absolute -left-1.5 bottom-2.5 w-0 h-0 border-t-[5px] border-t-transparent border-r-[6px] border-r-[#FFFFFF] border-b-[5px] border-b-transparent drop-shadow-[-1px_0px_0px_#E0E7DC]" />
        </div>
      </div>
    </aside>
  );
};
