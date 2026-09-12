import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Check,
  Star,
  Bell,
  Sparkles,
  CalendarDays,
} from 'lucide-react';
import { useNotesStore } from '../../stores/useNotesStore';
import { Note, DiaryEntry, NoteColor } from '../../types';
import { FrogMascot } from '../mascots/FrogMascot';
import { StickyCard } from '../StickyCard';
import { localTodayStr } from '../../lib/dateHelper';

const COLOR_PILLS: Record<NoteColor, string> = {
  yellow: 'bg-[#FFF5D6] text-[#634812] border-[#F2DE9C]',
  mint: 'bg-[#E2F6D8] text-[#244E20] border-[#B8E2AC]',
  peach: 'bg-[#FDECE8] text-[#7A3428] border-[#F5C7BF]',
  lime: 'bg-[#ECF8E5] text-[#2E5828] border-[#C4E8BA]',
  blush: 'bg-[#FDF1EC] text-[#753B2B] border-[#F5D0C4]',
  photo: 'bg-[#E0EFE0] text-[#244E20] border-[#B8E2AC]',
  pink: 'bg-[#FDEBE7] text-[#782E2E] border-[#F5C4BD]',
  blue: 'bg-[#E5F2FD] text-[#20496E] border-[#BADCF5]',
  butter: 'bg-[#FEF7D3] text-[#635010] border-[#EFE099]',
};

export const CalendarView: React.FC = () => {
  const {
    notes,
    diaryEntries,
    openNewNoteModal,
    openEditNoteModal,
    language,
    t,
  } = useNotesStore();

  const today = new Date();
  const todayStr = localTodayStr();

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-11
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(todayStr);
  };

  // Days in month calculation
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  // Convert to Mon=0 ... Sun=6
  const startDayOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  // Day names header
  const dayHeaders = [
    t.calendarDayMon,
    t.calendarDayTue,
    t.calendarDayWed,
    t.calendarDayThu,
    t.calendarDayFri,
    t.calendarDaySat,
    t.calendarDaySun,
  ];

  // Month title formatted
  const monthTitle =
    language === 'vi'
      ? `Tháng ${currentMonth + 1}, ${currentYear}`
      : new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        });

  // Helper to match notes with date
  const getNotesForDate = (dateStr: string): Note[] => {
    return notes.filter((n) => {
      if (n.isTrash || n.isArchived) return false;
      // Match reminder date
      if (n.reminderAt && n.reminderAt.startsWith(dateStr)) return true;
      // Match today flag
      if (n.isToday && dateStr === todayStr) return true;
      // Match created date if no reminder
      if (!n.reminderAt && !n.isToday && n.createdAt && n.createdAt.startsWith(dateStr)) return true;
      return false;
    });
  };

  // Helper to match diary entry with date
  const getDiaryForDate = (dateStr: string): DiaryEntry | undefined => {
    return diaryEntries.find((d) => d.date === dateStr);
  };

  // Selected date notes
  const selectedNotes = getNotesForDate(selectedDate);
  const selectedDiary = getDiaryForDate(selectedDate);

  // Format selected date title
  const formatSelectedDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        if (language === 'vi') {
          const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
          return `${days[d.getDay()]}, ngày ${parts[2]}/${parts[1]}/${parts[0]}`;
        } else {
          return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        }
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  return (
    <div className="space-y-5 pb-6 select-none max-w-[1240px] mx-auto">
      {/* Calendar Top Navigation Header */}
      <div className="bg-white rounded-[22px] px-6 py-4 border border-[#DFE8DC] shadow-[0_4px_18px_rgba(40,78,52,0.05)] flex flex-wrap items-center justify-between gap-4">
        {/* Left: Title & Month switch */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EAF5E3] border border-[#CCE3C4] flex items-center justify-center text-[#284E34] shadow-xs">
            <CalendarDays size={20} strokeWidth={2.2} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-rounded font-extrabold text-[20px] text-[#19271D] leading-tight">
                {monthTitle}
              </h2>
              <button
                type="button"
                onClick={goToToday}
                className="px-2.5 py-0.8 bg-[#F0F6ED] hover:bg-[#E2F0DC] text-[#345B3A] rounded-full text-xs font-bold border border-[#D0E2CC] transition-all cursor-pointer shadow-2xs"
              >
                {t.calendarTodayBtn}
              </button>
            </div>
            <p className="font-handwriting text-[13px] text-[#608065]">
              {t.subheadingCalendar}
            </p>
          </div>
        </div>

        {/* Right: Switcher arrows & stats */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-[#F3F7F0] p-1 rounded-xl border border-[#DCE8D8]">
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-[#284E34] transition-all cursor-pointer shadow-2xs"
              title="Tháng trước"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="w-px h-4 bg-[#D5E2D1] mx-1" />
            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-[#284E34] transition-all cursor-pointer shadow-2xs"
              title="Tháng sau"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => openNewNoteModal()}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#3E6848] hover:bg-[#32553A] text-white rounded-full text-xs font-bold shadow-[0_4px_12px_rgba(62,104,72,0.22)] transition-all cursor-pointer active:scale-95"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>{t.newNote}</span>
          </button>
        </div>
      </div>

      {/* Main Grid & Side Agenda Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Monthly Calendar (8 cols = ~66%) */}
        <div className="lg:col-span-8 bg-white rounded-[24px] p-5 border border-[#DFE8DC] shadow-[0_4px_20px_rgba(40,78,52,0.05)]">
          {/* 7 Days of Week Header */}
          <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
            {dayHeaders.map((day, idx) => (
              <div
                key={idx}
                className={`py-1.5 text-xs font-bold uppercase tracking-wider ${
                  idx >= 5 ? 'text-[#E879A8]' : 'text-[#6D8B71]'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty offset cells before 1st day of month */}
            {Array.from({ length: startDayOffset }).map((_, idx) => (
              <div
                key={`offset-${idx}`}
                className="h-24 sm:h-28 rounded-2xl bg-[#FAFAF8]/50 border border-transparent opacity-30"
              />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInCurrentMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const dayNotes = getNotesForDate(dateStr);
              const dayDiary = getDiaryForDate(dateStr);

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`relative h-24 sm:h-28 rounded-2xl p-1.5 sm:p-2 border flex flex-col justify-between transition-all duration-150 cursor-pointer group ${
                    isSelected
                      ? 'bg-[#EBF7E5] border-2 border-[#5E9B47] shadow-[0_4px_14px_rgba(94,155,71,0.18)]'
                      : isToday
                      ? 'bg-[#F4F9F1] border-[#BCE1B4] hover:bg-[#EBF7E5]'
                      : 'bg-[#FCFDFB] hover:bg-[#F6FAF3] border-[#E5EDE2]'
                  }`}
                >
                  {/* Top: Day Number + Icons */}
                  <div className="flex items-center justify-between leading-none">
                    <span
                      className={`text-xs font-rounded font-extrabold w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                        isToday
                          ? 'bg-[#5E9B47] text-white shadow-2xs'
                          : isSelected
                          ? 'bg-[#284E34] text-white'
                          : 'text-[#284E34] group-hover:text-[#19271D]'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {/* Mood stamp from Diary if present */}
                    {dayDiary && (
                      <div className="scale-85 -mr-1" title={`${t.calendarDiaryMood}: ${dayDiary.mood}`}>
                        <FrogMascot mood={dayDiary.mood} size={18} />
                      </div>
                    )}
                  </div>

                  {/* Middle: Notes pills */}
                  <div className="flex-1 my-1 overflow-hidden space-y-1">
                    {dayNotes.slice(0, 2).map((note) => {
                      const pillStyle = COLOR_PILLS[note.color] || COLOR_PILLS.yellow;
                      return (
                        <div
                          key={note.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditNoteModal(note);
                          }}
                          className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-bold border truncate flex items-center gap-1 shadow-2xs hover:scale-102 transition-transform ${pillStyle}`}
                          title={note.title}
                        >
                          {note.type === 'checklist' ? (
                            <Check size={9} strokeWidth={3} className="shrink-0 text-[#3E6848]" />
                          ) : note.hasReminder ? (
                            <Clock size={9} className="shrink-0 text-[#3E6848]" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-60" />
                          )}
                          <span className="truncate">{note.title}</span>
                        </div>
                      );
                    })}

                    {dayNotes.length > 2 && (
                      <span className="text-[9px] font-bold text-[#6D8B71] block px-1">
                        +{dayNotes.length - 2} note khác...
                      </span>
                    )}
                  </div>

                  {/* Bottom micro-counter */}
                  <div className="flex items-center justify-between text-[9px] text-[#7A9380] font-medium leading-none">
                    {dayNotes.length > 0 ? (
                      <span className="font-bold text-[#4B7351]">
                        {dayNotes.length} {t.calendarNotesCount}
                      </span>
                    ) : (
                      <span />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Day Agenda & Notes Detail (4 cols = ~34%) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Day Header Card */}
          <div className="bg-white rounded-[24px] p-5 border border-[#DFE8DC] shadow-[0_4px_20px_rgba(40,78,52,0.05)] space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEF4EC]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D8B71] block">
                  Kế hoạch ngày
                </span>
                <h3 className="font-rounded font-extrabold text-[16px] text-[#19271D]">
                  {formatSelectedDate(selectedDate)}
                </h3>
              </div>

              {selectedDate === todayStr && (
                <span className="px-2.5 py-0.8 bg-[#E2F6D8] text-[#284E34] border border-[#A8D8AC] rounded-full text-xs font-extrabold shadow-2xs">
                  Hôm nay ✨
                </span>
              )}
            </div>

            {/* Diary Card for this day if present */}
            {selectedDiary && (
              <div className="bg-[#FAFDF9] rounded-2xl border border-[#D5E5CE] p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <FrogMascot mood={selectedDiary.mood} size={22} />
                    <span className="text-xs font-bold text-[#284E34]">
                      {t.calendarDiaryMood}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#6D8B71]">
                    {selectedDiary.weather === 'sunny' ? 'Nắng ấm ☀️' : 'Ấm cúng ☕'}
                  </span>
                </div>
                {selectedDiary.title && (
                  <h4 className="font-rounded font-bold text-xs text-[#19271D]">
                    {selectedDiary.title}
                  </h4>
                )}
                <p className="text-[11.5px] text-[#4A6450] leading-relaxed line-clamp-2">
                  {selectedDiary.content}
                </p>
              </div>
            )}

            {/* Add note for this date button */}
            <button
              type="button"
              onClick={() => openNewNoteModal()}
              className="w-full py-2 bg-[#F4F9F1] hover:bg-[#EAF4E5] text-[#284E34] border border-[#D0E2CC] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={13} strokeWidth={2.5} />
              <span>{t.calendarAddNoteForDay}</span>
            </button>
          </div>

          {/* List of notes for selected day */}
          <div className="space-y-3">
            {selectedNotes.length === 0 ? (
              <div className="bg-white/80 rounded-3xl p-6 border border-dashed border-[#C5DAC0] text-center space-y-2">
                <FrogMascot mood="sleepy" size={42} className="mx-auto opacity-70" />
                <h4 className="font-rounded font-bold text-xs text-[#284E34]">
                  {t.calendarNoNotesForDay}
                </h4>
                <p className="text-[11px] text-[#6C8570] font-handwriting">
                  Thảnh thơi hoặc lên kế hoạch việc mới nhé! ♡
                </p>
              </div>
            ) : (
              selectedNotes.map((note) => (
                <div key={note.id} className="w-full">
                  <StickyCard note={note} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
