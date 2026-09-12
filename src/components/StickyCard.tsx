import React, { useState } from 'react';
import {
  MoreHorizontal,
  Clock,
  Calendar as CalendarIcon,
  Check,
  Star,
  Pin,
  Trash2,
  Edit2,
  Copy,
  Archive,
  RotateCcw,
} from 'lucide-react';
import { Note } from '../types';
import { useNotesStore } from '../stores/useNotesStore';
import {
  SunDoodle,
  FrogHeadDoodle,
  SproutDoodle,
  FrogTeaDoodle,
  CloudDoodle,
  FrogPawsDoodle,
  DaisyCard,
} from './mascots/FrogMascots';
import { FrogMascot } from './mascots/FrogMascot';
import { TapedPhotoCard } from './TapedPhotoCard';

interface StickyCardProps {
  note: Note;
}

const colorMap: Record<string, string> = {
  yellow: 'bg-[#FFF5D6]',
  mint: 'bg-[#E2F6D8]',
  peach: 'bg-[#FDECE8]',
  lime: 'bg-[#ECF8E5]',
  blush: 'bg-[#FDF1EC]',
  pink: 'bg-[#FDEBE7]',
  blue: 'bg-[#E5F2FD]',
  butter: 'bg-[#FEF7D3]',
};

export const StickyCard: React.FC<StickyCardProps> = ({ note }) => {
  const {
    toggleChecklistItem,
    toggleStar,
    togglePin,
    deleteNote,
    duplicateNote,
    openEditNoteModal,
    moveToTrash,
    restoreFromTrash,
    archiveNote,
    unarchiveNote,
    activeNav,
    t,
  } = useNotesStore();
  const [showMenu, setShowMenu] = useState(false);

  // If photo card or has photo (R2 C3 Polaroid / Washi tape note)
  if (note.type === 'photo' || note.color === 'photo' || note.photoUrl) {
    return (
      <div className="h-[184px]">
        <TapedPhotoCard
          title={note.title || 'Ngày tươi sáng\nphía trước. ♡'}
          photoUrl={note.photoUrl}
          tapeStyle={note.tapeStyle || 'mint'}
          tapePosition={note.tapePosition || 'center'}
          mascot={note.mascot || 'happy'}
          decorAssetId={note.decorAssetId}
          onClick={() => openEditNoteModal(note)}
        />
      </div>
    );
  }

  const bgClass = colorMap[note.color] || 'bg-[#FFF5D6]';

  // Render Header Icon
  const renderHeaderIcon = () => {
    switch (note.icon) {
      case 'pin':
        return (
          <span className="text-[12px] select-none leading-none" role="img" aria-label="pin">
            📌
          </span>
        );
      case 'leaf':
        return (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="#5E9B47"
            stroke="#2A5235"
            strokeWidth="2"
          >
            <path d="M11 20A7 7 0 0 1 4 13C4 7 11 2 20 2c0 9-5 16-9 18Z" />
            <path d="M4 22c2-4 7-8 16-10" fill="none" />
          </svg>
        );
      case 'bell':
        return (
          <div className="w-4.5 h-4.5 rounded-full bg-[#D8ECD7] flex items-center justify-center">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2A5235"
              strokeWidth="2.5"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </div>
        );
      case 'lightbulb':
        return (
          <span className="text-[12px] select-none leading-none" role="img" aria-label="ideas">
            💡
          </span>
        );
      case 'cart':
        return (
          <span className="text-[12px] select-none leading-none" role="img" aria-label="cart">
            🛒
          </span>
        );
      case 'plane':
        return (
          <span className="text-[12px] select-none leading-none" role="img" aria-label="plane">
            ✈️
          </span>
        );
      case 'heart':
        return (
          <span className="text-[12px] select-none leading-none" role="img" aria-label="heart">
            💛
          </span>
        );
      default:
        return null;
    }
  };

  // Render Doodles & Mascot
  const renderDoodle = () => {
    return (
      <>
        {/* Mascot Sticker */}
        {note.mascot && (
          <div className="absolute bottom-1 right-2 pointer-events-none transition-transform group-hover:scale-110">
            <FrogMascot mood={note.mascot} size={36} />
          </div>
        )}

        {/* Supporting Doodle */}
        {note.doodle === 'sun' && (
          <div className="absolute top-6 right-2.5 pointer-events-none opacity-90">
            <SunDoodle className="w-8 h-8" />
          </div>
        )}
        {note.doodle === 'sprout' && (
          <div className="absolute bottom-1.5 right-11 pointer-events-none">
            <SproutDoodle className="w-6 h-6" />
          </div>
        )}
        {note.doodle === 'cloud' && (
          <div className="absolute top-7 right-2 pointer-events-none">
            <CloudDoodle className="w-9 h-6" />
          </div>
        )}
      </>
    );
  };

  return (
    <div
      onClick={() => openEditNoteModal(note)}
      className={`relative h-[184px] ${bgClass} rounded-[18px] p-3.5 flex flex-col justify-between shadow-[0_3px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.09)] transition-all group overflow-hidden border border-black/[0.04] cursor-pointer`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between relative z-10">
        {/* Left: Icon + Title */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-1">
          {renderHeaderIcon()}
          <h3
            className="font-rounded font-extrabold text-[14px] text-[#1E2B20] tracking-tight truncate"
            title={note.title}
          >
            {note.title}
          </h3>
        </div>

        {/* Right Action Icons: 1-Click Pin + 1-Click Star + 3-dots Menu */}
        <div
          className="flex items-center gap-0.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Quick Pin Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePin(note.id);
            }}
            title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
            className={`w-5 h-5 flex items-center justify-center rounded transition-all ${
              note.isPinned
                ? 'text-[#284E34] bg-black/5 hover:bg-black/10 scale-105'
                : 'text-[#8A9F8E] hover:text-[#284E34] hover:bg-black/5 opacity-40 hover:opacity-100 group-hover:opacity-80'
            }`}
          >
            <Pin size={11} className={note.isPinned ? 'fill-current' : ''} />
          </button>

          {/* Quick Star Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleStar(note.id);
            }}
            title={note.isStarred ? 'Unstar note' : 'Star note'}
            className={`w-5 h-5 flex items-center justify-center rounded transition-all ${
              note.isStarred
                ? 'text-[#E5A624] bg-black/5 hover:bg-black/10 scale-105'
                : 'text-[#8A9F8E] hover:text-[#E5A624] hover:bg-black/5 opacity-40 hover:opacity-100 group-hover:opacity-80'
            }`}
          >
            <Star size={11} className={note.isStarred ? 'fill-current' : ''} />
          </button>

          {/* 3-dots Menu Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-black/5 text-[#5D7362] transition-colors"
          >
            <MoreHorizontal size={14} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-6 w-38 bg-white rounded-xl shadow-xl border border-[#E3EAE0] py-1 z-50 text-[11px] font-semibold text-[#284E34]">
                {note.isTrash ? (
                  <>
                    <button
                      onClick={() => {
                        restoreFromTrash(note.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-[#EEF5EB] text-[#284E34] text-left"
                    >
                      <RotateCcw size={12} />
                      <span>{t.restoreNote}</span>
                    </button>
                    <div className="my-0.5 border-t border-[#EDF2EB]" />
                    <button
                      onClick={() => {
                        deleteNote(note.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-[#FEE2E2] text-[#DC2626] text-left"
                    >
                      <Trash2 size={12} />
                      <span>{t.deleteForever}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        openEditNoteModal(note);
                        setShowMenu(false);
                      }}
                      className="w-full px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-[#EEF5EB] text-left"
                    >
                      <Edit2 size={12} />
                      <span>{t.editNote}</span>
                    </button>
                    <button
                      onClick={() => {
                        togglePin(note.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-[#EEF5EB] text-left"
                    >
                      <Pin size={12} />
                      <span>{note.isPinned ? t.unpinNote : t.pinNote}</span>
                    </button>
                    <button
                      onClick={() => {
                        toggleStar(note.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-[#EEF5EB] text-left"
                    >
                      <Star size={12} />
                      <span>{note.isStarred ? t.unstarNote : t.starNote}</span>
                    </button>
                    {note.isArchived ? (
                      <button
                        onClick={() => {
                          unarchiveNote(note.id);
                          setShowMenu(false);
                        }}
                        className="w-full px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-[#EEF5EB] text-left"
                      >
                        <Archive size={12} />
                        <span>{t.unarchiveNote}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          archiveNote(note.id);
                          setShowMenu(false);
                        }}
                        className="w-full px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-[#EEF5EB] text-left"
                      >
                        <Archive size={12} />
                        <span>{t.archiveNote}</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        duplicateNote(note.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-[#EEF5EB] text-left"
                    >
                      <Copy size={12} />
                      <span>{t.duplicateNote}</span>
                    </button>
                    <div className="my-0.5 border-t border-[#EDF2EB]" />
                    <button
                      onClick={() => {
                        moveToTrash(note.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-[#FEE2E2] text-[#DC2626] text-left"
                    >
                      <Trash2 size={12} />
                      <span>{t.moveToTrash}</span>
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Card Content */}
      <div className="flex-1 mt-1 overflow-y-auto pr-0.5 text-[12px] leading-snug relative z-10 select-text">
        {/* Type: Text */}
        {note.type === 'text' && note.content && (
          <p className="font-rounded text-[#253828] font-medium whitespace-pre-line text-[12px] leading-relaxed">
            {note.content}
          </p>
        )}

        {/* Type: Checklist */}
        {note.type === 'checklist' && note.checklist && (
          <ul className="space-y-1">
            {note.checklist.map((item, idx) => (
              <li
                key={item.id || idx}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleChecklistItem(note.id, item.id);
                }}
                className="flex items-center gap-2 cursor-pointer group/item select-none py-0.5 px-1 -mx-1 rounded-md hover:bg-black/[0.04] transition-all"
              >
                <button
                  type="button"
                  aria-label={item.completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleChecklistItem(note.id, item.id);
                  }}
                  className={`w-4 h-4 rounded-[4px] flex items-center justify-center transition-all shrink-0 active:scale-85 ${
                    item.completed
                      ? 'bg-[#5E9B47] text-white shadow-xs'
                      : 'border-[1.5px] border-[#2A5235]/70 bg-white group-hover/item:border-[#5E9B47] group-hover/item:shadow-xs'
                  }`}
                >
                  {item.completed && <Check size={11} strokeWidth={3} />}
                </button>
                <span
                  className={`text-[12px] transition-all font-medium leading-tight flex-1 ${
                    item.completed
                      ? 'line-through text-[#7B927E]'
                      : 'text-[#253828]'
                  }`}
                >
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Type: Bullets */}
        {note.type === 'bullets' && note.bullets && (
          <ul className="space-y-0.5">
            {note.bullets.map((bullet, idx) => (
              <li
                key={idx}
                className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#253828] leading-tight"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#2A5235] shrink-0" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Doodle in corner */}
      {renderDoodle()}

      {/* Bottom Metadata Chip (if present) */}
      {note.chip && (
        <div className="mt-0.5 relative z-10">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/80 backdrop-blur-2xs rounded-full border border-black/5 text-[10px] font-bold text-[#4B634E] shadow-2xs">
            {note.chip.icon === 'clock' ? (
              <Clock size={10} strokeWidth={2.2} />
            ) : (
              <CalendarIcon size={10} strokeWidth={2.2} />
            )}
            <span>{note.chip.text}</span>
          </div>
        </div>
      )}
    </div>
  );
};
