import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  Plus,
  Trash2,
  Pin,
  Star,
  Copy,
  Calendar as CalendarIcon,
  Clock,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import { useNotesStore } from '../stores/useNotesStore';
import { NoteColor, NoteType, FolderId, Note, TapeStyle, TapePosition } from '../types';
import { FrogMascot, MascotMood } from './mascots/FrogMascot';
import { TapedPhotoCard } from './TapedPhotoCard';

const colorOptions: { id: NoteColor; label: string; bg: string }[] = [
  { id: 'yellow', label: 'Yellow', bg: 'bg-[#FFF5D6]' },
  { id: 'mint', label: 'Mint', bg: 'bg-[#E2F6D8]' },
  { id: 'peach', label: 'Peach', bg: 'bg-[#FDECE8]' },
  { id: 'lime', label: 'Lime', bg: 'bg-[#ECF8E5]' },
  { id: 'blush', label: 'Blush', bg: 'bg-[#FDF1EC]' },
  { id: 'pink', label: 'Pink', bg: 'bg-[#FDEBE7]' },
  { id: 'blue', label: 'Blue', bg: 'bg-[#E5F2FD]' },
  { id: 'butter', label: 'Butter', bg: 'bg-[#FEF7D3]' },
];

const mascotOptions: { id: MascotMood | 'none'; label: string }[] = [
  { id: 'happy', label: 'Happy' },
  { id: 'wink', label: 'Wink' },
  { id: 'bunny', label: 'Bunny' },
  { id: 'smart', label: 'Study' },
  { id: 'music', label: 'Music' },
  { id: 'crown', label: 'Royal' },
  { id: 'party', label: 'Party' },
  { id: 'sleepcap', label: 'Sleep' },
  { id: 'love', label: 'Love' },
  { id: 'confident', label: 'Proud' },
  { id: 'sparkle', label: 'Sparkle' },
  { id: 'thinking', label: 'Idea' },
  { id: 'surprised', label: 'Gasp' },
  { id: 'sleepy', label: 'Chill' },
  { id: 'none', label: 'None' },
];

export const NoteModal: React.FC = () => {
  const {
    showNoteModal,
    editingNote,
    closeNoteModal,
    addNote,
    updateNote,
    deleteNote,
    moveToTrash,
    duplicateNote,
    activeFolder,
    _pendingNewNoteFolderId,
    t,
  } = useNotesStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NoteType>('text');
  const [color, setColor] = useState<NoteColor>('yellow');
  const [folderId, setFolderId] = useState<FolderId>('personal');
  const [checklistItems, setChecklistItems] = useState<{ id: string; text: string; completed: boolean }[]>([
    { id: '1', text: '', completed: false },
  ]);
  const [bullets, setBullets] = useState<string[]>(['']);
  const [isPinned, setIsPinned] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [mascot, setMascot] = useState<MascotMood | 'none'>('happy');

  // Photo & Washi Tape states
  const [photoUrl, setPhotoUrl] = useState<string>('daisy');
  const [tapeStyle, setTapeStyle] = useState<TapeStyle>('mint');
  const [tapePosition, setTapePosition] = useState<TapePosition>('center');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Date & Reminder state
  const [enableDate, setEnableDate] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setPhotoUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Sync state when editingNote changes
  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title || '');
      setContent(editingNote.content || '');
      setType(editingNote.type || 'text');
      setColor(editingNote.color || 'yellow');
      setFolderId((editingNote.folderId as FolderId) || 'personal');
      setIsPinned(!!editingNote.isPinned);
      setIsStarred(!!editingNote.isStarred);
      setMascot(editingNote.mascot || 'happy');
      setPhotoUrl(editingNote.photoUrl || 'daisy');
      setTapeStyle(editingNote.tapeStyle || 'mint');
      setTapePosition(editingNote.tapePosition || 'center');

      if (editingNote.checklist && editingNote.checklist.length > 0) {
        setChecklistItems(editingNote.checklist.map((item) => ({ ...item })));
      } else {
        setChecklistItems([{ id: crypto.randomUUID(), text: '', completed: false }]);
      }
      if (editingNote.bullets && editingNote.bullets.length > 0) {
        setBullets([...editingNote.bullets]);
      } else {
        setBullets(['']);
      }

      // Check date / chip
      if (editingNote.chip) {
        setEnableDate(true);
        if (editingNote.reminderAt) {
          const d = new Date(editingNote.reminderAt);
          setReminderDate(d.toISOString().split('T')[0]);
          setReminderTime(d.toTimeString().slice(0, 5));
        } else if (editingNote.isToday) {
          const todayStr = new Date().toISOString().split('T')[0];
          setReminderDate(todayStr);
          setReminderTime('08:00');
        } else {
          setReminderDate(new Date().toISOString().split('T')[0]);
          setReminderTime('10:00');
        }
      } else {
        setEnableDate(false);
        setReminderDate('');
        setReminderTime('09:00');
      }
    } else {
      setTitle('');
      setContent('');
      setType('text');
      setColor('yellow');
      setPhotoUrl('daisy');
      setTapeStyle('mint');
      setTapePosition('center');
      setFolderId(_pendingNewNoteFolderId || activeFolder || 'personal');
      setIsPinned(false);
      setIsStarred(false);
      setMascot('happy');
      setChecklistItems([{ id: '1', text: '', completed: false }]);
      setBullets(['']);
      setEnableDate(false);
      setReminderDate('');
      setReminderTime('09:00');
    }
  }, [editingNote, activeFolder, _pendingNewNoteFolderId, showNoteModal]);

  if (!showNoteModal) return null;

  // Format date chip
  const buildChip = (dateStr: string, timeStr: string) => {
    if (!dateStr) return undefined;
    const targetDate = new Date(`${dateStr}T${timeStr || '09:00'}:00`);
    const today = new Date();
    const isSameDay =
      targetDate.getFullYear() === today.getFullYear() &&
      targetDate.getMonth() === today.getMonth() &&
      targetDate.getDate() === today.getDate();

    const hours = targetDate.getHours();
    const minutes = targetDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const timeFormatted = `${formattedHours}:${formattedMinutes} ${ampm}`;

    if (isSameDay) {
      return {
        chip: { icon: 'clock' as const, text: `Today, ${timeFormatted}` },
        isToday: true,
        hasReminder: false,
      };
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthStr = months[targetDate.getMonth()];
      const dayStr = targetDate.getDate();
      return {
        chip: { icon: 'calendar' as const, text: `${monthStr} ${dayStr}, ${timeFormatted}` },
        isToday: false,
        hasReminder: true,
      };
    }
  };

  const handleSetQuickPreset = (preset: 'today' | 'tomorrow' | 'nextWeek') => {
    setEnableDate(true);
    const d = new Date();
    if (preset === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    } else if (preset === 'nextWeek') {
      d.setDate(d.getDate() + 7);
    }
    setReminderDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !title.trim() &&
      !content.trim() &&
      checklistItems.every((c) => !c.text.trim()) &&
      bullets.every((b) => !b.trim())
    ) {
      closeNoteModal();
      return;
    }

    const dateInfo = enableDate && reminderDate ? buildChip(reminderDate, reminderTime) : null;
    const finalMascot = mascot === 'none' ? undefined : mascot;

    if (editingNote) {
      // UPDATE EXISTING NOTE
      const updates: Partial<Note> = {
        title: title.trim() || 'Untitled Note',
        type,
        color,
        folderId,
        isPinned,
        isStarred,
        mascot: finalMascot,
        chip: dateInfo ? dateInfo.chip : undefined,
        isToday: dateInfo ? dateInfo.isToday : false,
        hasReminder: dateInfo ? dateInfo.hasReminder : false,
        reminderAt: enableDate && reminderDate ? `${reminderDate}T${reminderTime || '09:00'}:00` : undefined,
      };

      if (type === 'checklist') {
        updates.checklist = checklistItems.filter((i) => i.text.trim());
        updates.content = undefined;
        updates.bullets = undefined;
      } else if (type === 'bullets') {
        updates.bullets = bullets.filter((b) => b.trim());
        updates.content = undefined;
        updates.checklist = undefined;
      } else if (type === 'photo') {
        updates.photoUrl = photoUrl;
        updates.tapeStyle = tapeStyle;
        updates.tapePosition = tapePosition;
        updates.content = undefined;
        updates.checklist = undefined;
        updates.bullets = undefined;
      } else {
        updates.content = content;
        updates.checklist = undefined;
        updates.bullets = undefined;
      }

      updateNote(editingNote.id, updates);
    } else {
      // CREATE NEW NOTE
      const baseNote = {
        color: type === 'photo' ? ('photo' as NoteColor) : color,
        folderId,
        isPinned,
        isStarred,
        mascot: finalMascot,
        chip: dateInfo ? dateInfo.chip : undefined,
        isToday: dateInfo ? dateInfo.isToday : false,
        hasReminder: dateInfo ? dateInfo.hasReminder : false,
        reminderAt: enableDate && reminderDate ? `${reminderDate}T${reminderTime || '09:00'}:00` : undefined,
      };

      if (type === 'photo') {
        addNote({
          ...baseNote,
          title: title.trim() || 'Những ngày tươi sáng. ♡',
          type: 'photo',
          photoUrl,
          tapeStyle,
          tapePosition,
        });
      } else if (type === 'checklist') {
        const validItems = checklistItems.filter((i) => i.text.trim());
        addNote({
          ...baseNote,
          title: title.trim() || 'Untitled Checklist',
          type: 'checklist',
          icon: 'leaf',
          checklist: validItems.length > 0 ? validItems : [{ id: '1', text: 'New item', completed: false }],
        });
      } else if (type === 'bullets') {
        const validBullets = bullets.filter((b) => b.trim());
        addNote({
          ...baseNote,
          title: title.trim() || 'Ideas',
          type: 'bullets',
          icon: 'lightbulb',
          bullets: validBullets.length > 0 ? validBullets : ['Idea 1'],
        });
      } else {
        addNote({
          ...baseNote,
          title: title.trim() || 'Quick Note',
          content,
          type: 'text',
          icon: 'pin',
        });
      }
    }

    closeNoteModal();
  };

  const handleDelete = () => {
    if (editingNote) {
      // Move to Trash instead of permanent delete — user can restore from Trash view
      moveToTrash(editingNote.id);
    }
  };

  const handleDuplicate = () => {
    if (editingNote) {
      duplicateNote(editingNote.id);
      closeNoteModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#DCE8D8] overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-3.5 bg-[#F8FAF6] border-b border-[#E6EDE3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FrogMascot mood={mascot !== 'none' ? mascot : 'happy'} size={30} />
            <h2 className="font-rounded font-extrabold text-base text-[#284E34]">
              {editingNote ? t.modalEditTitle : t.modalNewTitle}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? t.unpinNote : t.pinNote}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                isPinned
                  ? 'bg-[#D8ECD7] text-[#284E34]'
                  : 'hover:bg-black/5 text-[#738E78]'
              }`}
            >
              <Pin size={15} className={isPinned ? 'fill-current' : ''} />
            </button>
            <button
              type="button"
              onClick={() => setIsStarred(!isStarred)}
              title={isStarred ? t.unstarNote : t.starNote}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                isStarred
                  ? 'bg-[#FEF08A] text-[#B45309]'
                  : 'hover:bg-black/5 text-[#738E78]'
              }`}
            >
              <Star size={15} className={isStarred ? 'fill-current' : ''} />
            </button>
            <button
              onClick={closeNoteModal}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-[#5B7360] transition-colors ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form Body with scroll */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 select-text overflow-y-auto flex-1">
          {/* Note Type Selector */}
          <div className="flex rounded-xl bg-[#F0F3EE] p-1 border border-[#E0E7DC] select-none">
            {[
              { type: 'text' as NoteType, label: t.typeText },
              { type: 'checklist' as NoteType, label: t.typeChecklist },
              { type: 'bullets' as NoteType, label: t.typeBullets },
              { type: 'photo' as NoteType, label: t.typePhoto },
            ].map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => setType(item.type)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  type === item.type
                    ? 'bg-white text-[#284E34] shadow-xs'
                    : 'text-[#6C8570] hover:text-[#284E34]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#738E78] mb-1">
              {t.inputTitleLabel}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.inputTitlePlaceholder}
              className="w-full px-3 py-1.5 text-sm font-semibold rounded-xl border border-[#D5E1D2] focus:border-[#5E9B47] focus:outline-none bg-[#FCFDFB]"
              autoFocus
            />
          </div>

          {/* Content depends on type */}
          {type === 'text' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#738E78] mb-1">
                {t.inputContentLabel}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t.inputContentPlaceholder}
                rows={3}
                className="w-full px-3 py-1.5 text-sm rounded-xl border border-[#D5E1D2] focus:border-[#5E9B47] focus:outline-none bg-[#FCFDFB] resize-none"
              />
            </div>
          )}

          {type === 'checklist' && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#738E78]">
                {t.checklistLabel}
              </label>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {checklistItems.map((item, idx) => (
                  <div key={item.id || idx} className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={item.completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setChecklistItems((prev) =>
                          prev.map((c, i) => (i === idx ? { ...c, completed: !c.completed } : c))
                        );
                      }}
                      className={`w-5 h-5 rounded-[5px] flex items-center justify-center transition-all shrink-0 active:scale-90 cursor-pointer ${
                        item.completed
                          ? 'bg-[#5E9B47] text-white shadow-xs'
                          : 'border-[1.5px] border-[#2A5235]/70 bg-white hover:border-[#5E9B47]'
                      }`}
                    >
                      {item.completed && <Check size={12} strokeWidth={3} />}
                    </button>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => {
                        const val = e.target.value;
                        setChecklistItems((prev) =>
                          prev.map((c, i) => (i === idx ? { ...c, text: val } : c))
                        );
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const newItem = { id: crypto.randomUUID(), text: '', completed: false };
                          setChecklistItems((prev) => [
                            ...prev.slice(0, idx + 1),
                            newItem,
                            ...prev.slice(idx + 1),
                          ]);
                        } else if (e.key === 'Backspace' && item.text === '' && checklistItems.length > 1) {
                          e.preventDefault();
                          setChecklistItems((prev) => prev.filter((_, i) => i !== idx));
                        }
                      }}
                      placeholder={`Mục ${idx + 1}`}
                      className={`flex-1 px-2.5 py-1 text-xs rounded-lg border border-[#D5E1D2] focus:border-[#5E9B47] focus:outline-none transition-all ${
                        item.completed ? 'line-through text-[#7B927E]' : 'text-[#253828]'
                      }`}
                    />
                    {checklistItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setChecklistItems((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="text-[#9CA3AF] hover:text-[#DC2626] p-1 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setChecklistItems((prev) => [
                    ...prev,
                    { id: crypto.randomUUID(), text: '', completed: false },
                  ])
                }
                className="text-xs font-bold text-[#4B7C50] flex items-center gap-1 hover:underline pt-0.5"
              >
                <Plus size={13} /> {t.checklistAdd}
              </button>
            </div>
          )}

          {type === 'bullets' && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#738E78]">
                {t.bulletsLabel}
              </label>
              <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                {bullets.map((b, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[#3E6848] font-bold">•</span>
                    <input
                      type="text"
                      value={b}
                      onChange={(e) => {
                        const updated = [...bullets];
                        updated[idx] = e.target.value;
                        setBullets(updated);
                      }}
                      placeholder={`Ý tưởng ${idx + 1}`}
                      className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-[#D5E1D2] focus:border-[#5E9B47] focus:outline-none"
                    />
                    {bullets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setBullets(bullets.filter((_, i) => i !== idx))}
                        className="text-[#9CA3AF] hover:text-[#DC2626] p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setBullets([...bullets, ''])}
                className="text-xs font-bold text-[#4B7C50] flex items-center gap-1 hover:underline pt-0.5"
              >
                <Plus size={13} /> {t.bulletsAdd}
              </button>
            </div>
          )}

          {/* Photo & Washi Tape Section */}
          {type === 'photo' && (
            <div className="space-y-3 bg-[#F8FAF6] p-3 rounded-2xl border border-[#E0E8DC]">
              {/* Interactive Live Preview with Motion Graphics */}
              <div className="flex items-center justify-center py-1">
                <div className="w-56 h-36">
                  <TapedPhotoCard
                    title={title || 'Những ngày tươi sáng. ♡'}
                    photoUrl={photoUrl}
                    tapeStyle={tapeStyle}
                    tapePosition={tapePosition}
                    mascot={mascot !== 'none' ? mascot : undefined}
                  />
                </div>
              </div>

              {/* Upload image button */}
              <div className="flex items-center justify-between pt-1 border-t border-[#E8EDE5]">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#D5E1D2] hover:bg-[#EEF5EB] rounded-xl text-xs font-bold text-[#284E34] transition-colors"
                >
                  <Upload size={13} />
                  <span>{t.photoUpload}</span>
                </button>

                {photoUrl && photoUrl.startsWith('data:image') && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('daisy')}
                    className="text-[11px] font-bold text-[#DC2626] hover:underline"
                  >
                    {t.photoRemove}
                  </button>
                )}
              </div>

              {/* Presets */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#738E78] block mb-1">
                  {t.photoPresetLabel}
                </span>
                <div className="grid grid-cols-4 gap-1 text-[11px] font-bold text-[#284E34]">
                  {[
                    { id: 'daisy', label: '🌼 Hoa cúc' },
                    { id: 'coffee', label: '☕ Cà phê' },
                    { id: 'forest', label: '🌿 Rừng cây' },
                    { id: 'sunset', label: '🌅 Hoàng hôn' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setPhotoUrl(preset.id)}
                      className={`py-1 px-1 rounded-lg border text-center transition-all ${
                        photoUrl === preset.id
                          ? 'bg-white border-[#5E9B47] shadow-xs text-[#284E34]'
                          : 'bg-white/60 border-[#D5E1D2] hover:bg-white text-[#5B7360]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Washi Tape Style */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#738E78] block mb-1">
                  {t.tapeStyleLabel}
                </span>
                <div className="flex flex-wrap gap-1 text-xs font-bold">
                  {[
                    { id: 'mint' as TapeStyle, label: t.tapeMint },
                    { id: 'pink' as TapeStyle, label: t.tapePink },
                    { id: 'yellow' as TapeStyle, label: t.tapeYellow },
                    { id: 'checkered' as TapeStyle, label: t.tapeCheckered },
                    { id: 'scotch' as TapeStyle, label: t.tapeScotch },
                  ].map((ts) => (
                    <button
                      key={ts.id}
                      type="button"
                      onClick={() => setTapeStyle(ts.id)}
                      className={`px-2 py-0.8 rounded-lg border transition-all ${
                        tapeStyle === ts.id
                          ? 'bg-white border-[#5E9B47] shadow-xs text-[#284E34]'
                          : 'bg-white/60 border-[#D5E1D2] hover:bg-white text-[#5B7360]'
                      }`}
                    >
                      {ts.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Washi Tape Position */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#738E78] block mb-1">
                  {t.tapePositionLabel}
                </span>
                <div className="flex gap-1.5 text-xs font-bold">
                  {[
                    { id: 'center' as TapePosition, label: t.tapeCenter },
                    { id: 'corners' as TapePosition, label: t.tapeCorners },
                    { id: 'tilted' as TapePosition, label: t.tapeTilted },
                  ].map((tp) => (
                    <button
                      key={tp.id}
                      type="button"
                      onClick={() => setTapePosition(tp.id)}
                      className={`flex-1 py-1 rounded-lg border transition-all text-center ${
                        tapePosition === tp.id
                          ? 'bg-white border-[#5E9B47] shadow-xs text-[#284E34]'
                          : 'bg-white/60 border-[#D5E1D2] hover:bg-white text-[#5B7360]'
                      }`}
                    >
                      {tp.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DATE & REMINDER SECTION */}
          <div className="bg-[#F8FAF6] p-2.5 rounded-2xl border border-[#E0E8DC]">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableDate}
                  onChange={(e) => {
                    setEnableDate(e.target.checked);
                    if (e.target.checked && !reminderDate) {
                      setReminderDate(new Date().toISOString().split('T')[0]);
                    }
                  }}
                  className="rounded text-[#3E6848] focus:ring-[#3E6848] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-[#284E34] flex items-center gap-1.5">
                  <CalendarIcon size={13} className="text-[#5E9B47]" />
                  <span>{t.dateLabel}</span>
                </span>
              </label>

              {enableDate && (
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleSetQuickPreset('today')}
                    className="px-2 py-0.5 bg-white rounded-md border border-[#D5E1D2] text-[#3E6848] font-bold hover:bg-[#EEF5EB]"
                  >
                    {t.presetToday}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetQuickPreset('tomorrow')}
                    className="px-2 py-0.5 bg-white rounded-md border border-[#D5E1D2] text-[#3E6848] font-bold hover:bg-[#EEF5EB]"
                  >
                    {t.presetTomorrow}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetQuickPreset('nextWeek')}
                    className="px-2 py-0.5 bg-white rounded-md border border-[#D5E1D2] text-[#3E6848] font-bold hover:bg-[#EEF5EB]"
                  >
                    {t.presetNextWeek}
                  </button>
                </div>
              )}
            </div>

            {enableDate && (
              <div className="mt-2 grid grid-cols-2 gap-2 pt-2 border-t border-[#E8EDE5]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#738E78] block mb-0.5">
                    {t.dateInput}
                  </span>
                  <input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="w-full px-2 py-1 text-xs font-semibold rounded-xl border border-[#D5E1D2] bg-white text-[#284E34] focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#738E78] block mb-0.5">
                    {t.timeInput}
                  </span>
                  <div className="relative flex items-center">
                    <Clock size={12} className="absolute left-2.5 text-[#738E78] pointer-events-none" />
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="w-full pl-6 pr-2 py-1 text-xs font-semibold rounded-xl border border-[#D5E1D2] bg-white text-[#284E34] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MASCOT STICKER SELECTOR */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#738E78] mb-1">
              {t.stickerLabel}
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-[#F8FAF6] rounded-xl border border-[#E0E8DC]">
              {mascotOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMascot(opt.id)}
                  className={`flex flex-col items-center px-1.5 py-1 rounded-lg transition-all shrink-0 ${
                    mascot === opt.id
                      ? 'bg-white shadow-xs border border-[#5E9B47] scale-105'
                      : 'hover:bg-white/50 border border-transparent'
                  }`}
                >
                  {opt.id === 'none' ? (
                    <div className="w-7 h-7 rounded-full border border-dashed border-[#A0B5A2] flex items-center justify-center text-[9px] text-[#738E78] font-bold">
                      ✕
                    </div>
                  ) : (
                    <FrogMascot mood={opt.id} size={28} />
                  )}
                  <span className="text-[9px] font-bold text-[#3E6848] mt-0.5">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Color & Folder Row */}
          <div className="grid grid-cols-2 gap-3 pt-0.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#738E78] mb-1">
                {t.colorLabel}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {colorOptions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    className={`w-5 h-5 rounded-full border border-black/10 ${c.bg} flex items-center justify-center transition-transform hover:scale-110 ${
                      color === c.id ? 'ring-2 ring-[#3E6848] ring-offset-1' : ''
                    }`}
                  >
                    {color === c.id && <Check size={11} className="text-[#284E34]" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#738E78] mb-1">
                {t.folderLabel}
              </label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value as FolderId)}
                className="w-full px-2 py-1 text-xs font-semibold rounded-xl border border-[#D5E1D2] bg-white text-[#284E34] focus:outline-none"
              >
                <option value="personal">{t.folderPersonal}</option>
                <option value="work">{t.folderWork}</option>
                <option value="ideas">{t.folderIdeas}</option>
                <option value="health">{t.folderHealth}</option>
                <option value="travel">{t.folderTravel}</option>
              </select>
            </div>
          </div>

          {/* Actions Bottom Bar */}
          <div className="pt-2 border-t border-[#E8EDE5] flex items-center justify-between">
            {editingNote ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1 text-xs font-bold text-[#DC2626] hover:bg-[#FEE2E2] rounded-full transition-colors flex items-center gap-1"
                >
                  <Trash2 size={12} />
                  <span>{t.moveToTrash}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDuplicate}
                  title={t.duplicateNote}
                  className="p-1 text-[#5B7360] hover:bg-black/5 rounded-full transition-colors"
                >
                  <Copy size={13} />
                </button>
              </div>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeNoteModal}
                className="px-3.5 py-1 text-xs font-bold text-[#5B7360] hover:bg-black/5 rounded-full transition-colors"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-1 text-xs font-bold bg-[#3E6848] hover:bg-[#32553A] text-white rounded-full shadow-sm transition-all flex items-center gap-1"
              >
                {editingNote ? (
                  <>
                    <Check size={13} strokeWidth={2.5} />
                    <span>{t.saveBtn}</span>
                  </>
                ) : (
                  <>
                    <Plus size={13} strokeWidth={2.5} />
                    <span>{t.createBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
