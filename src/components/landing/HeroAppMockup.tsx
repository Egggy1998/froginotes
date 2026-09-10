import React from 'react';
import {
  Search,
  Check,
  Star,
  Calendar,
  Briefcase,
  User,
  Trash2,
  FileText,
  Lightbulb,
  ShoppingCart,
} from 'lucide-react';
import { FrogMascot } from '../mascots/FrogMascot';

export const HeroAppMockup: React.FC<{ expandedMode?: boolean }> = ({ expandedMode = false }) => {
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: -(y / (rect.height / 2)) * 4.5,
      y: (x / (rect.width / 2)) * 4.5,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: isHovered
          ? 'transform 0.08s ease-out, box-shadow 0.2s ease-out'
          : 'transform 0.45s ease-out, box-shadow 0.45s ease-out',
      }}
      className={`relative w-full max-w-[620px] bg-white rounded-[22px] border border-[#E0E8DC] overflow-hidden select-none transition-shadow ${
        isHovered
          ? 'shadow-[0_32px_75px_rgba(35,60,38,0.18)]'
          : 'shadow-[0_24px_55px_rgba(35,60,38,0.12)]'
      }`}
    >
      {/* App Window Chrome Header */}
      <div className="h-10 px-4 bg-[#F8FAF7] border-b border-[#E6EDE3] flex items-center justify-between">
        {/* Left: Branding */}
        <div className="flex items-center gap-1.5">
          <FrogMascot mood="happy" size={20} />
          <span className="font-rounded font-extrabold text-[13px] text-[#284E34]">
            FrogiNotes
          </span>
        </div>

        {/* Center: Search pill */}
        <div className="flex items-center gap-1.5 bg-white border border-[#D9E3D5] rounded-full px-3 py-1 w-44 shadow-2xs">
          <Search size={11} className="text-[#87A08B]" />
          <span className="text-[10px] text-[#87A08B]">Tìm kiếm ghi chú...</span>
        </div>

        {/* Right: Window controls */}
        <div className="flex items-center gap-2">
          {expandedMode && (
            <button
              type="button"
              className="mr-2 px-2.5 py-0.8 bg-[#3D6E4A] hover:bg-[#325A3C] text-white rounded-full text-[10px] font-bold shadow-2xs transition-colors"
            >
              + Tạo ghi chú
            </button>
          )}
          <div className="flex items-center gap-1.5 text-[#87A08B]">
            <span className="w-2.5 h-[1.5px] bg-[#87A08B] rounded-full" />
            <span className="w-2 h-2 border border-[#87A08B] rounded-xs" />
            <span className="text-xs leading-none font-bold">✕</span>
          </div>
        </div>
      </div>

      {/* Main App Layout */}
      <div className="flex h-[365px] bg-[#FAFBF9]">
        {/* Sidebar */}
        <div className="w-[125px] border-r border-[#E8EEE5] bg-[#F8FAF6] p-2 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#D1F2D9] text-[#23452B] font-bold text-[11px]">
              <FileText size={12} className="text-[#3E6848]" />
              <span>Tất cả</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[#556F59] font-medium text-[11px] hover:bg-black/5">
              <Calendar size={12} />
              <span>Hôm nay</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[#556F59] font-medium text-[11px] hover:bg-black/5">
              <Star size={12} />
              <span>Đã gắn sao</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[#556F59] font-medium text-[11px] hover:bg-black/5">
              <Briefcase size={12} />
              <span>Công việc</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[#556F59] font-medium text-[11px] hover:bg-black/5">
              <User size={12} />
              <span>Cá nhân</span>
            </div>
            {expandedMode && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[#556F59] font-medium text-[11px] hover:bg-black/5">
                <Lightbulb size={12} />
                <span>Ý tưởng</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[#556F59] font-medium text-[11px] hover:bg-black/5">
              <Trash2 size={12} />
              <span>Thùng rác</span>
            </div>
          </div>

          {/* Tiny mascot peeking in sidebar */}
          <div className="px-1.5 py-1 text-center bg-white/60 rounded-xl border border-[#E0E7DC]">
            <FrogMascot mood="happy" size={24} className="mx-auto" />
            <span className="font-handwriting text-[9.5px] text-[#426447] block mt-0.5">
              Good ideas ♡
            </span>
          </div>
        </div>

        {/* Notes Grid (3 columns x 2 rows = 6 sticky cards) */}
        <div className="flex-1 p-2.5 grid grid-cols-3 gap-2 overflow-hidden">
          {/* Card 1: Công việc hôm nay (Yellow) */}
          <div className="relative bg-[#FFF7E0] rounded-[13px] p-2 border border-black/5 flex flex-col justify-between shadow-2xs hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group/card">
            <div>
              <h4 className="font-rounded font-extrabold text-[10.5px] text-[#284E34] mb-1">
                Công việc hôm nay
              </h4>
              <ul className="space-y-1 text-[9.5px] text-[#344837]">
                <li className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-xs bg-[#5E9B47] text-white flex items-center justify-center">
                    <Check size={8} strokeWidth={3} />
                  </div>
                  <span className="line-through text-[#809984]">Hoàn thiện slide</span>
                </li>
                <li className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-xs border border-[#3E6848]/60 bg-white" />
                  <span>Gửi email khách</span>
                </li>
                <li className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-xs border border-[#3E6848]/60 bg-white" />
                  <span>Họp team 14h</span>
                </li>
              </ul>
            </div>
            <div className="self-end transition-transform group-hover/card:scale-120 group-hover/card:rotate-6">
              <FrogMascot mood="happy" size={20} />
            </div>
          </div>

          {/* Card 2: Ý tưởng (Pink) */}
          <div className="relative bg-[#FDE8E8] rounded-[13px] p-2 border border-black/5 flex flex-col justify-between shadow-2xs hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group/card">
            <div>
              <div className="flex items-center gap-1 text-[10.5px] font-rounded font-extrabold text-[#284E34] mb-1">
                <Lightbulb size={10} className="text-amber-600 transition-transform group-hover/card:scale-120" />
                <span>Ý tưởng</span>
              </div>
              <ul className="space-y-0.5 text-[9.5px] text-[#344837]">
                <li>• Giao diện mới</li>
                <li>• Sticker dễ thương</li>
                <li>• Màu pastel dịu</li>
              </ul>
            </div>
            <span className="font-handwriting text-[9px] text-[#784B52] self-end group-hover/card:font-bold">
              creative ♡
            </span>
          </div>

          {/* Card 3: Việc cá nhân (Mint Green) */}
          <div className="relative bg-[#E8F8EE] rounded-[13px] p-2 border border-black/5 flex flex-col justify-between shadow-2xs hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group/card">
            <div>
              <h4 className="font-rounded font-extrabold text-[10.5px] text-[#284E34] mb-1">
                Việc cá nhân
              </h4>
              <ul className="space-y-1 text-[9.5px] text-[#344837]">
                <li className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-xs bg-[#5E9B47] text-white flex items-center justify-center">
                    <Check size={8} strokeWidth={3} />
                  </div>
                  <span className="line-through text-[#809984]">Đọc sách 20p</span>
                </li>
                <li className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-xs bg-[#5E9B47] text-white flex items-center justify-center">
                    <Check size={8} strokeWidth={3} />
                  </div>
                  <span className="line-through text-[#809984]">Tập thể dục</span>
                </li>
                <li className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-xs border border-[#3E6848]/60 bg-white" />
                  <span>Uống đủ 2L nước</span>
                </li>
              </ul>
            </div>
            <span className="text-[11px] self-end transition-transform group-hover/card:scale-125">🌱</span>
          </div>

          {/* Card 4: Hôm nay thật tốt! (Sky Blue) */}
          <div className="relative bg-[#EBF5FB] rounded-[13px] p-2 border border-black/5 flex flex-col justify-between shadow-2xs hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group/card">
            <div>
              <h4 className="font-rounded font-extrabold text-[10.5px] text-[#284E34] mb-1">
                Hôm nay thật tốt!
              </h4>
              <p className="text-[9.5px] text-[#38556B] font-medium leading-tight">
                Cố gắng mỗi ngày một chút nhé! Bạn làm được mà. ♡
              </p>
            </div>
            <div className="self-end transition-transform group-hover/card:scale-120 group-hover/card:-rotate-6">
              <FrogMascot mood="sparkle" size={22} />
            </div>
          </div>

          {/* Card 5: Mua sắm (Warm Cream) */}
          <div className="relative bg-[#FFF9F0] rounded-[13px] p-2 border border-black/5 flex flex-col justify-between shadow-2xs hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group/card">
            <div>
              <div className="flex items-center gap-1 text-[10.5px] font-rounded font-extrabold text-[#284E34] mb-1">
                <ShoppingCart size={10} className="text-amber-700 transition-transform group-hover/card:scale-120" />
                <span>Mua sắm</span>
              </div>
              <ul className="space-y-0.8 text-[9.5px] text-[#344837]">
                <li className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-xs border border-[#3E6848]/60 bg-white" />
                  <span>Sữa tươi</span>
                </li>
                <li className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-xs border border-[#3E6848]/60 bg-white" />
                  <span>Trái cây tươi</span>
                </li>
                <li className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-xs border border-[#3E6848]/60 bg-white" />
                  <span>Bút chì màu</span>
                </li>
              </ul>
            </div>
            <span className="font-handwriting text-[9px] text-[#7A6242] self-end group-hover/card:font-bold">
              market ♡
            </span>
          </div>

          {/* Card 6: Polaroid Daisy Photo Card with Washi Tape */}
          <div className="relative bg-white rounded-[13px] p-1.5 border border-black/10 flex flex-col items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group/photo">
            {/* Washi tape at top */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-14 h-3 bg-[#A8E6CF]/90 border-y border-[#7ECBA8]/60 shadow-xs rotate-[-2.5deg] group-hover/photo:scale-105 transition-transform z-10" />

            {/* Inner Polaroid photo container with chamomile flowers */}
            <div className="w-full h-22 rounded-[9px] bg-gradient-to-b from-[#648E59] via-[#486B40] to-[#344F2E] mt-1 overflow-hidden relative flex flex-col items-center justify-center p-1 text-center shadow-inner group-hover/photo:brightness-105 transition-all">
              {/* Natural chamomile daisies */}
              <div className="flex items-center justify-center gap-1.5 mb-1 transition-transform group-hover/photo:scale-110">
                <div className="w-4 h-4 rounded-full bg-white shadow-2xs flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                </div>
                <div className="w-5 h-5 rounded-full bg-white shadow-2xs flex items-center justify-center -mt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                </div>
                <div className="w-4 h-4 rounded-full bg-white shadow-2xs flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                </div>
              </div>

              <span className="font-handwriting text-white text-[10px] font-bold leading-tight drop-shadow-sm">
                {expandedMode ? 'Enjoy the little things ♡' : 'Good Things Take Time ♡'}
              </span>
            </div>

            <div className="w-full flex items-center justify-between px-1.5 mt-1">
              <span className="font-handwriting text-[9.5px] text-[#426447]">
                daisy days ♡
              </span>
              <div className="transition-transform group-hover/photo:scale-125 group-hover/photo:rotate-6">
                <FrogMascot mood="love" size={17} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
