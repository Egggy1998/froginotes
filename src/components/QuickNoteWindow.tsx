import React, { useState } from 'react';
import { X, Check, Pin } from 'lucide-react';
import { useNotesStore } from '../stores/useNotesStore';
import { NoteColor, MascotMood } from '../types';
import { FrogMascot } from './mascots/FrogMascot';

const colorOptions: { id: NoteColor; bg: string }[] = [
  { id: 'yellow', bg: 'bg-[#FFF5D6]' },
  { id: 'mint', bg: 'bg-[#E2F6D8]' },
  { id: 'peach', bg: 'bg-[#FDECE8]' },
  { id: 'lime', bg: 'bg-[#ECF8E5]' },
  { id: 'blush', bg: 'bg-[#FDF1EC]' },
  { id: 'pink', bg: 'bg-[#FDEBE7]' },
  { id: 'blue', bg: 'bg-[#E5F2FD]' },
  { id: 'butter', bg: 'bg-[#FEF7D3]' },
];

const colorClassMap: Record<string, string> = {
  yellow: 'bg-[#FFF5D6] border-[#F6E7B9]',
  mint: 'bg-[#E2F6D8] border-[#CFEBC2]',
  peach: 'bg-[#FDECE8] border-[#F2D7D1]',
  lime: 'bg-[#ECF8E5] border-[#DCEFD3]',
  blush: 'bg-[#FDF1EC] border-[#F5DFD6]',
  pink: 'bg-[#FDEBE7] border-[#F5D4CF]',
  blue: 'bg-[#E5F2FD] border-[#CDE1F5]',
  butter: 'bg-[#FEF7D3] border-[#F7EBBA]',
};

export const QuickNoteWindow: React.FC = () => {
  const { showQuickNote, setShowQuickNote, addNote, activeFolder, t } = useNotesStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<NoteColor>('yellow');
  const [mascot, setMascot] = useState<MascotMood>('wink');
  const [isPinned, setIsPinned] = useState(false);

  if (!showQuickNote) return null;

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      setShowQuickNote(false);
      return;
    }

    addNote({
      title: title.trim() || t.quickNoteTitle.replace('... ♡', ''),
      content: content.trim(),
      type: 'text',
      color,
      mascot,
      folderId: activeFolder || 'personal',
      isPinned,
    });

    setTitle('');
    setContent('');
    setShowQuickNote(false);
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setShowQuickNote(false);
  };

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === 'Escape') handleClose();
        if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'Enter')) {
          e.preventDefault();
          handleSave();
        }
      }}
      className="fixed bottom-16 right-24 z-50 animate-in zoom-in-95 fade-in duration-200 select-none"
    >
      <div
        className={`w-[320px] h-[280px] rounded-[22px] p-4 flex flex-col justify-between shadow-2xl border ${
          colorClassMap[color] || 'bg-[#FFF5D6] border-[#F6E7B9]'
        } backdrop-blur-md`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FrogMascot mood={mascot} size={24} />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.quickNoteTitle}
              className="bg-transparent font-rounded font-extrabold text-[15px] text-[#1E2B20] placeholder-[#79917D] focus:outline-none w-44"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? t.unpinNote : t.pinNote}
              className={`p-1 rounded-full hover:bg-black/5 transition-colors ${
                isPinned ? 'text-[#3E6848]' : 'text-[#6C8570]'
              }`}
            >
              <Pin size={13} className={isPinned ? 'fill-current' : ''} />
            </button>
            <button
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-black/5 text-[#6C8570] transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Note Body */}
        <div className="flex-1 my-2 overflow-hidden select-text">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t.quickNotePlaceholder}
            className="w-full h-full bg-transparent resize-none text-[13px] text-[#253828] placeholder-[#7B927E] focus:outline-none leading-relaxed font-rounded"
          />
        </div>

        {/* Footer controls: colors + save */}
        <div className="flex items-center justify-between pt-2 border-t border-black/5">
          <div className="flex items-center gap-1">
            {colorOptions.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColor(c.id)}
                className={`w-4.5 h-4.5 rounded-full border border-black/10 ${c.bg} transition-transform hover:scale-110 ${
                  color === c.id ? 'ring-1.5 ring-[#3E6848]' : ''
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="px-3.5 py-1 text-xs font-bold bg-[#3E6848] hover:bg-[#32553A] text-white rounded-full shadow-xs transition-all flex items-center gap-1"
          >
            <Check size={12} strokeWidth={3} />
            <span>{t.save}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
