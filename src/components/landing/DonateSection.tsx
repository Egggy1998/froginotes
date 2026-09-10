import React, { useState } from 'react';
import { Coffee, Copy, Check, Heart, Sparkles } from 'lucide-react';
import { FrogMascot } from '../mascots/FrogMascot';

export const DonateSection: React.FC = () => {
  const [copiedStk, setCopiedStk] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);

  const copyToClipboard = (text: string, type: 'stk' | 'memo') => {
    navigator.clipboard.writeText(text);
    if (type === 'stk') {
      setCopiedStk(true);
      setTimeout(() => setCopiedStk(false), 2000);
    } else {
      setCopiedMemo(true);
      setTimeout(() => setCopiedMemo(false), 2000);
    }
  };

  return (
    <section id="donate" className="w-full py-14 select-none relative overflow-hidden">
      <div className="max-w-[1100px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="h-[1.5px] w-8 bg-[#8BB883] rounded-full" />
            <span className="h-[1.5px] w-4 bg-[#8BB883] rounded-full" />
            <h2 className="font-rounded font-extrabold text-[28px] sm:text-[32px] text-[#19271D] tracking-tight flex items-center gap-2">
              <span>Mời chú ếch ly cà phê</span>
              <span className="text-amber-700">☕</span>
            </h2>
            <span className="h-[1.5px] w-4 bg-[#8BB883] rounded-full" />
            <span className="h-[1.5px] w-8 bg-[#8BB883] rounded-full" />
          </div>
          <p className="text-[15px] text-[#526456] max-w-md mx-auto leading-relaxed">
            Nếu bạn yêu thích FrogiNotes và muốn ủng hộ tác giả phát triển thêm nhiều tính năng mới, hãy mời mình một ly cà phê nhé! Cảm ơn bạn rất nhiều ♡
          </p>
        </div>

        {/* Main Donation Container */}
        <div className="relative bg-gradient-to-br from-[#FFFDF7] via-[#F8FAF4] to-[#F1F7EC] border border-[#D8E6D3] rounded-[30px] p-6 sm:p-10 shadow-[0_16px_40px_rgba(40,78,52,0.06)] grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left Column: Info & Copy Buttons (7 of 12) */}
          <div className="md:col-span-7 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF5E3] border border-[#CCE3C4] flex items-center justify-center shadow-xs">
                <FrogMascot mood="smart" size={32} />
              </div>
              <div>
                <h3 className="font-rounded font-extrabold text-[18px] text-[#19271D]">
                  Ủng hộ nhà phát triển FrogiNotes
                </h3>
                <span className="font-handwriting text-sm text-[#5E9B47]">
                  Mỗi đóng góp nhỏ đều là động lực lớn ♡
                </span>
              </div>
            </div>

            {/* Donation Suggestion Tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#D5E1D2] text-xs font-bold text-[#284E34] shadow-2xs">
                <span>☕ 1 Ly Trà Xanh</span>
                <span className="text-[#5E9B47] font-semibold">20.000đ</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#D5E1D2] text-xs font-bold text-[#284E34] shadow-2xs">
                <span>🧋 1 Ly Trà Sữa</span>
                <span className="text-[#5E9B47] font-semibold">35.000đ</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#D5E1D2] text-xs font-bold text-[#284E34] shadow-2xs">
                <span>🍰 1 Bữa Ăn Nhẹ</span>
                <span className="text-[#5E9B47] font-semibold">50.000đ</span>
              </div>
            </div>

            {/* Bank Transfer Details Card */}
            <div className="bg-white/90 rounded-2xl border border-[#DDE7DB] p-4.5 space-y-3 shadow-xs">
              {/* Bank Name */}
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#F0F5EE]">
                <span className="text-[#6D8B71] font-medium">Ngân hàng:</span>
                <span className="font-bold text-[#19271D] text-right">
                  MB Bank (Ngân hàng TMCP Quân Đội)
                </span>
              </div>

              {/* Account Holder */}
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#F0F5EE]">
                <span className="text-[#6D8B71] font-medium">Chủ tài khoản:</span>
                <span className="font-extrabold text-[#19271D] tracking-wide">
                  HONG QUANG
                </span>
              </div>

              {/* Account Number / Alias */}
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#F0F5EE]">
                <span className="text-[#6D8B71] font-medium">Số tài khoản / Alias:</span>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#1D4ED8] font-mono text-sm bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    Egggy
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('Egggy', 'stk')}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#284E34] bg-[#EEF5EB] hover:bg-[#DDF0D8] rounded-lg transition-colors cursor-pointer"
                    title="Sao chép số tài khoản"
                  >
                    {copiedStk ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                    <span>{copiedStk ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>

              {/* Transfer Memo */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6D8B71] font-medium">Nội dung chuyển khoản:</span>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#1D4ED8] font-mono text-sm bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    donate
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('donate', 'memo')}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#284E34] bg-[#EEF5EB] hover:bg-[#DDF0D8] rounded-lg transition-colors cursor-pointer"
                    title="Sao chép nội dung chuyển khoản"
                  >
                    {copiedMemo ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                    <span>{copiedMemo ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Micro message */}
            <p className="font-handwriting text-xs text-[#527457] flex items-center gap-1.5">
              <Heart size={14} className="text-rose-500 fill-rose-500 inline" />
              <span>Cảm ơn tấm lòng của bạn đã tiếp thêm năng lượng cho FrogiNotes!</span>
            </p>
          </div>

          {/* Right Column: VietQR Card Image (5 of 12) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="relative group/qr transition-transform hover:scale-102 duration-300">
              {/* Outer soft ambient glow */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#78AF58]/20 to-[#38BDF8]/20 rounded-3xl blur-md group-hover/qr:blur-lg transition-all" />

              {/* QR Container */}
              <div className="relative bg-white rounded-2xl p-2.5 border border-[#D5E1D2] shadow-[0_10px_30px_rgba(0,0,0,0.08)] max-w-[260px] overflow-hidden text-center">
                <img
                  src="./donate-qr.png"
                  alt="Mã VietQR ủng hộ FrogiNotes"
                  className="w-full h-auto object-contain rounded-xl"
                  loading="lazy"
                />
                <div className="mt-2 text-[10.5px] font-bold text-[#556F59] flex items-center justify-center gap-1">
                  <Sparkles size={12} className="text-amber-500" />
                  <span>Quét mã qua app ngân hàng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
