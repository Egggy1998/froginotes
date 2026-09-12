import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Heart,
  Sparkles,
  Calendar as CalendarIcon,
  Trash2,
  Upload,
  Sun,
  Cloud,
  CloudRain,
  Coffee,
  Check,
  Edit3,
} from 'lucide-react';
import { useNotesStore } from '../../stores/useNotesStore';
import { DiaryEntry, DiaryWeather, MascotMood, TapeStyle, TapePosition } from '../../types';
import { localTodayStr } from '../../lib/dateHelper';
import { FrogMascot } from '../mascots/FrogMascot';
import { TapedPhotoCard } from '../TapedPhotoCard';

const MOODS: { mood: MascotMood; labelVi: string; labelEn: string }[] = [
  { mood: 'happy', labelVi: 'Vui vẻ', labelEn: 'Happy' },
  { mood: 'sparkle', labelVi: 'Hứng khởi', labelEn: 'Sparkle' },
  { mood: 'love', labelVi: 'Ấm áp', labelEn: 'Loved' },
  { mood: 'confident', labelVi: 'Tự hào', labelEn: 'Proud' },
  { mood: 'smart', labelVi: 'Tập trung', labelEn: 'Focused' },
  { mood: 'party', labelVi: 'Ăn mừng', labelEn: 'Party' },
  { mood: 'music', labelVi: 'Chill nhạc', labelEn: 'Musical' },
  { mood: 'bunny', labelVi: 'Dễ thương', labelEn: 'Cute' },
  { mood: 'thinking', labelVi: 'Trầm tư', labelEn: 'Thinking' },
  { mood: 'sleepy', labelVi: 'Mệt xíu', labelEn: 'Tired' },
];

const WEATHERS: { id: DiaryWeather; labelVi: string; labelEn: string; icon: React.ReactNode }[] = [
  { id: 'sunny', labelVi: 'Nắng ấm', labelEn: 'Sunny', icon: <Sun size={15} className="text-amber-500" /> },
  { id: 'cloudy', labelVi: 'Mát mẻ', labelEn: 'Cloudy', icon: <Cloud size={15} className="text-sky-500" /> },
  { id: 'rainy', labelVi: 'Mưa rào', labelEn: 'Rainy', icon: <CloudRain size={15} className="text-blue-500" /> },
  { id: 'cozy', labelVi: 'Ấm cúng', labelEn: 'Cozy', icon: <Coffee size={15} className="text-amber-700" /> },
];

export const DiaryView: React.FC = () => {
  const { diaryEntries, addDiaryEntry, deleteDiaryEntry, language, t } = useNotesStore();

  const todayStr = localTodayStr();
  const existingToday = diaryEntries.find((e) => e.date === todayStr);

  // Form states for today's entry
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [mood, setMood] = useState<MascotMood>(existingToday?.mood || 'happy');
  const [weather, setWeather] = useState<DiaryWeather>(existingToday?.weather || 'sunny');
  const [title, setTitle] = useState<string>(existingToday?.title || '');
  const [content, setContent] = useState<string>(existingToday?.content || '');
  const [photoUrl, setPhotoUrl] = useState<string>(existingToday?.photoUrl || '');
  const [tapeStyle, setTapeStyle] = useState<TapeStyle>(existingToday?.tapeStyle || 'mint');
  const [tapePosition, setTapePosition] = useState<TapePosition>(existingToday?.tapePosition || 'center');
  const [showPhotoPicker, setShowPhotoPicker] = useState<boolean>(!!existingToday?.photoUrl);
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !title.trim() && !photoUrl) return;

    addDiaryEntry({
      date: selectedDate,
      mood,
      weather,
      title: title.trim() || undefined,
      content: content.trim(),
      photoUrl: photoUrl || undefined,
      tapeStyle,
      tapePosition,
    });

    // Launch celebratory confetti!
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#78AF58', '#FFD166', '#EF476F', '#06D6A0', '#118AB2'],
      });
    } catch {
      // fallback
    }

    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        if (language === 'vi') {
          const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
          return `${days[d.getDay()]}, ${parts[2]} Th${parts[1]}, ${parts[0]}`;
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
    <div className="space-y-7 pb-8 select-text max-w-[960px] mx-auto">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2EBDD]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EAF5E3] border border-[#CDE3C4] flex items-center justify-center text-[#284E34] shadow-xs">
            <FrogMascot mood="happy" size={28} />
          </div>
          <div>
            <h2 className="font-rounded font-extrabold text-[22px] text-[#284E34] leading-tight flex items-center gap-2">
              {t.greetingDiary}
              <span className="text-xs font-bold text-[#5E9B47] bg-[#EAF5E3] px-2.5 py-0.5 rounded-full border border-[#D5E8CD]">
                {diaryEntries.length} {language === 'vi' ? 'trang nhật ký' : 'entries'}
              </span>
            </h2>
            <p className="font-handwriting text-[13.5px] text-[#608065]">
              {t.subheadingDiary}
            </p>
          </div>
        </div>

        {/* Small motivational pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF9E6] border border-[#F5E6B8] text-xs font-bold text-[#8A6A1E]">
          <Sparkles size={13} className="text-[#E5A624]" />
          <span>{language === 'vi' ? 'Ghi lại để yêu đời hơn mỗi ngày' : 'Capture your little joys'}</span>
        </div>
      </div>

      {/* Daily Check-in Card (Today's Entry) */}
      <div className="relative bg-white rounded-[24px] p-5 sm:p-6 border border-[#DCE8D8] shadow-[0_4px_20px_rgba(40,78,52,0.06)] overflow-hidden">
        {/* Soft decorative corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#EDF7E7] to-transparent rounded-bl-full pointer-events-none -z-0" />

        <form onSubmit={handleSave} className="relative z-10 space-y-4">
          {/* Top row: Date + Weather Picker */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EEF4EC]">
            <div className="flex items-center gap-2">
              <span className="font-rounded font-bold text-sm text-[#284E34] flex items-center gap-1.5">
                <CalendarIcon size={16} className="text-[#5E9B47]" />
                {formatDate(selectedDate)}
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  const newD = e.target.value;
                  setSelectedDate(newD);
                  const found = diaryEntries.find((entry) => entry.date === newD);
                  if (found) {
                    setMood(found.mood);
                    setWeather(found.weather || 'sunny');
                    setTitle(found.title || '');
                    setContent(found.content || '');
                    setPhotoUrl(found.photoUrl || '');
                    setTapeStyle(found.tapeStyle || 'mint');
                    setTapePosition(found.tapePosition || 'center');
                    setShowPhotoPicker(!!found.photoUrl);
                  } else if (newD === todayStr) {
                    // reset to blank or existing today
                    setTitle(existingToday?.title || '');
                    setContent(existingToday?.content || '');
                    setPhotoUrl(existingToday?.photoUrl || '');
                  }
                }}
                className="text-xs bg-[#F2F7EF] hover:bg-[#EAF3E5] text-[#375B3D] px-2 py-0.8 rounded-lg border border-[#D5E4D1] cursor-pointer focus:outline-none"
              />
            </div>

            {/* Weather options */}
            <div className="flex items-center gap-1 bg-[#F4F8F2] p-1 rounded-xl border border-[#E0EBDD]">
              <span className="text-[11px] font-bold text-[#6D8B71] px-1.5">
                {t.diaryWeatherTitle}:
              </span>
              {WEATHERS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWeather(w.id)}
                  title={language === 'vi' ? w.labelVi : w.labelEn}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    weather === w.id
                      ? 'bg-white text-[#284E34] shadow-xs border border-[#CCE0C6]'
                      : 'text-[#6C8570] hover:text-[#284E34]'
                  }`}
                >
                  {w.icon}
                  <span className="text-[11px]">{language === 'vi' ? w.labelVi : w.labelEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mood Selector (Horizontal Mascot Pills) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-rounded font-bold text-xs text-[#284E34] flex items-center gap-1">
                <Heart size={13} className="text-[#E879A8] fill-[#E879A8]" />
                {t.diaryMoodTitle}:
              </label>
              <span className="font-handwriting text-xs text-[#6D8B71]">
                {t.diaryTodayPrompt}
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {MOODS.map((m) => (
                <button
                  key={m.mood}
                  type="button"
                  onClick={() => setMood(m.mood)}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-2xl min-w-[62px] transition-all cursor-pointer ${
                    mood === m.mood
                      ? 'bg-[#EBF7E5] border-2 border-[#5E9B47] shadow-xs scale-105'
                      : 'bg-[#F9FAF8] hover:bg-[#F0F5EE] border border-[#E2EBDD]'
                  }`}
                >
                  <FrogMascot mood={m.mood} size={30} />
                  <span
                    className={`text-[10.5px] mt-1 font-bold whitespace-nowrap ${
                      mood === m.mood ? 'text-[#284E34]' : 'text-[#6D8B71]'
                    }`}
                  >
                    {language === 'vi' ? m.labelVi : m.labelEn}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Title & Content inputs */}
          <div className="space-y-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={language === 'vi' ? 'Tiêu đề của ngày... (ví dụ: Một buổi chiều bình yên ☕)' : 'Title for today...'}
              className="w-full px-3.5 py-2 text-sm font-bold text-[#284E34] placeholder:text-[#90A794] bg-[#F8FAF7] rounded-xl border border-[#D5E4D1] focus:bg-white focus:border-[#5E9B47] focus:outline-none transition-all"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder={t.diaryNotePlaceholder}
              className="w-full px-3.5 py-2.5 text-xs text-[#284E34] leading-relaxed placeholder:text-[#90A794] bg-[#F8FAF7] rounded-xl border border-[#D5E4D1] focus:bg-white focus:border-[#5E9B47] focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Scrapbook Photo Attachment toggle */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setShowPhotoPicker(!showPhotoPicker)}
                className="text-xs font-bold text-[#427047] flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                <span>📷</span>
                <span>
                  {showPhotoPicker
                    ? (language === 'vi' ? 'Thu gọn ảnh dán' : 'Hide photo attachment')
                    : (language === 'vi' ? '+ Dán ảnh kỷ niệm hôm nay' : '+ Attach scrapbook photo')}
                </span>
              </button>

              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="text-[11px] font-bold text-[#DC2626] hover:underline"
                >
                  {t.photoRemove}
                </button>
              )}
            </div>

            {/* Photo & Washi Tape Picker Area */}
            {showPhotoPicker && (
              <div className="bg-[#F8FAF6] p-3 rounded-2xl border border-[#E0EBDD] flex flex-col sm:flex-row gap-4 items-center">
                {/* Left: Interactive Preview */}
                <div className="w-48 h-32 shrink-0">
                  <TapedPhotoCard
                    title={title || 'Kỷ niệm đẹp. ♡'}
                    photoUrl={photoUrl || 'daisy'}
                    tapeStyle={tapeStyle}
                    tapePosition={tapePosition}
                    mascot={mood}
                  />
                </div>

                {/* Right: Controls */}
                <div className="flex-1 space-y-2 text-xs">
                  {/* Upload button */}
                  <div className="flex items-center gap-2">
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
                      className="flex items-center gap-1 px-3 py-1 bg-white border border-[#D5E1D2] hover:bg-[#EEF5EB] rounded-xl font-bold text-[#284E34] transition-colors"
                    >
                      <Upload size={12} />
                      <span>{t.photoUpload}</span>
                    </button>
                  </div>

                  {/* Presets */}
                  <div className="flex flex-wrap gap-1 font-bold text-[11px]">
                    {[
                      { id: 'daisy', label: '🌼 Hoa cúc' },
                      { id: 'coffee', label: '☕ Cà phê' },
                      { id: 'forest', label: '🌿 Rừng cây' },
                      { id: 'sunset', label: '🌅 Hoàng hôn' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPhotoUrl(p.id)}
                        className={`px-2 py-0.5 rounded-lg border transition-all ${
                          photoUrl === p.id
                            ? 'bg-white border-[#5E9B47] text-[#284E34] shadow-xs'
                            : 'bg-white/60 border-[#D5E1D2] text-[#607D66]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Tape Style */}
                  <div className="flex flex-wrap gap-1 text-[11px] font-bold">
                    <span className="text-[#6D8B71] py-0.5 pr-1">{t.tapeStyleLabel}:</span>
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
                        className={`px-2 py-0.5 rounded-md border transition-all ${
                          tapeStyle === ts.id
                            ? 'bg-white border-[#5E9B47] text-[#284E34] shadow-xs'
                            : 'bg-white/60 border-[#D5E1D2] text-[#607D66]'
                        }`}
                      >
                        {ts.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-[#EEF4EC]">
            <div className="text-xs font-bold text-[#5E9B47] flex items-center gap-1">
              {savedFeedback && (
                <span className="inline-flex items-center gap-1 text-[#3E6848] bg-[#E8F5E3] px-3 py-1 rounded-full animate-bounce">
                  <Check size={13} strokeWidth={3} /> {t.diarySavedMsg}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#3E6848] hover:bg-[#32553A] text-white rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Check size={13} strokeWidth={2.5} />
              <span>{t.diarySaveBtn}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Memory Timeline Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-rounded font-extrabold text-[17px] text-[#284E34] flex items-center gap-2">
            <span>{t.diaryTimelineTitle}</span>
          </h3>
        </div>

        {diaryEntries.length === 0 ? (
          <div className="bg-white/80 rounded-3xl p-8 border border-dashed border-[#C5DAC0] text-center space-y-2">
            <FrogMascot mood="thinking" size={48} className="mx-auto opacity-80" />
            <h4 className="font-rounded font-bold text-sm text-[#284E34]">
              {t.diaryEmptyTitle}
            </h4>
            <p className="text-xs text-[#6C8570] max-w-sm mx-auto font-handwriting">
              {t.diaryEmptySub}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 xl:gap-6">
            {diaryEntries.map((entry) => {
              const wObj = WEATHERS.find((w) => w.id === entry.weather);
              const mObj = MOODS.find((m) => m.mood === entry.mood);

              return (
                <div
                  key={entry.id}
                  className="bg-white rounded-[22px] p-5 border border-[#DDE7DB] shadow-[0_3px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(40,78,52,0.08)] transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Top Bar: Date + Weather badge + Mood stamp */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-rounded font-bold text-xs text-[#284E34]">
                        {formatDate(entry.date)}
                      </span>
                      {wObj && (
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#56755A] bg-[#F2F7EF] px-2 py-0.5 rounded-full border border-[#D5E4D1]">
                          {wObj.icon}
                          {language === 'vi' ? wObj.labelVi : wObj.labelEn}
                        </span>
                      )}
                    </div>

                    {/* Mood avatar stamp */}
                    <div className="flex items-center gap-1 bg-[#EEF6EB] px-2 py-0.5 rounded-full border border-[#D5E8CD]">
                      <FrogMascot mood={entry.mood} size={20} />
                      <span className="text-[10px] font-extrabold text-[#32553A]">
                        {language === 'vi' ? mObj?.labelVi : mObj?.labelEn}
                      </span>
                    </div>
                  </div>

                  {/* Optional Polaroid Photo Card */}
                  {entry.photoUrl && (
                    <div className="h-36 my-2">
                      <TapedPhotoCard
                        title={entry.title || 'Kỷ niệm đẹp. ♡'}
                        photoUrl={entry.photoUrl}
                        tapeStyle={entry.tapeStyle || 'mint'}
                        tapePosition={entry.tapePosition || 'center'}
                        mascot={entry.mood}
                      />
                    </div>
                  )}

                  {/* Title & Content */}
                  <div className="space-y-1 my-1">
                    {entry.title && (
                      <h4 className="font-rounded font-bold text-[13.5px] text-[#284E34]">
                        {entry.title}
                      </h4>
                    )}
                    <p className="text-xs text-[#3E5C44] leading-relaxed font-normal whitespace-pre-line">
                      {entry.content}
                    </p>
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#F0F5EE] text-[11px] text-[#7E9982]">
                    <span className="font-handwriting text-xs text-[#527457]">
                      {entry.date === todayStr ? 'Hôm nay ♡' : entry.date}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDate(entry.date);
                          setMood(entry.mood);
                          setWeather(entry.weather || 'sunny');
                          setTitle(entry.title || '');
                          setContent(entry.content || '');
                          setPhotoUrl(entry.photoUrl || '');
                          setTapeStyle(entry.tapeStyle || 'mint');
                          setTapePosition(entry.tapePosition || 'center');
                          setShowPhotoPicker(!!entry.photoUrl);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="p-1 hover:text-[#284E34] hover:bg-[#EEF5EB] rounded-lg transition-colors"
                        title={language === 'vi' ? 'Sửa bài này' : 'Edit entry'}
                      >
                        <Edit3 size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteDiaryEntry(entry.id)}
                        className="p-1 hover:text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors"
                        title={language === 'vi' ? 'Xóa bài này' : 'Delete entry'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
