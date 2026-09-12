import React, { useState } from 'react';
import {
  X, Cloud, ShieldAlert, HardDrive, CheckCircle2,
  Loader2, UserCircle, Lock, RefreshCw, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { useNotesStore } from '../stores/useNotesStore';
import { useAuthStore } from '../stores/useAuthStore';
import { FrogMascot } from './mascots/FrogMascot';
import { PaymentModal } from './payment/PaymentModal';

/**
 * CloudSyncModal — Cloud Sync paywall & status panel.
 *
 * States:
 *   - Not logged in        → "Đăng nhập để xem gói Cloud Sync" + login CTA
 *   - Logged in, plan=free → PRO upgrade card + locked sync controls
 *   - Logged in, plan=pro  → Active cloud sync panel (toggle, sync now, timestamp)
 */
export const CloudSyncModal: React.FC = () => {
  const {
    showSyncModal, setShowSyncModal, setShowAuthModal,
    notes, diaryEntries, t,
  } = useNotesStore();

  const { phase, user, cloudDisabled, emailUnavailable } = useAuthStore();
  const [showPayment, setShowPayment] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [lastSync] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!showSyncModal) return null;

  const isAuthenticated = phase === 'authenticated' && user !== null;
  const isConnecting = phase === 'requesting' || phase === 'polling' || phase === 'verifying';
  const isPro = isAuthenticated && user?.plan === 'pro';
  const isFree = isAuthenticated && user?.plan === 'free';

  const handleSignIn = () => {
    setShowSyncModal(false);
    setShowAuthModal(true);
  };

  const handleSyncNow = async () => {
    if (!isPro) return;
    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 1800)); // placeholder
    setIsSyncing(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs select-none">
        <div
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#DCE8D8] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 bg-[#F8FAF6] border-b border-[#E6EDE3] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FrogMascot mood={isPro ? 'love' : isAuthenticated ? 'crown' : 'sleepy'} size={28} />
              <h2 className="font-rounded font-extrabold text-base text-[#284E34]">
                {t.cloudModalTitle}
              </h2>
            </div>
            <button
              onClick={() => setShowSyncModal(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-[#5B7360] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 select-text space-y-4">

            {/* ══ NOT LOGGED IN ══ */}
            {!isAuthenticated && !isConnecting && (
              <>
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <FrogMascot mood="sleepy" size={56} />
                  <p className="font-rounded font-bold text-[#284E34] text-sm">
                    Đăng nhập để xem gói Cloud Sync
                  </p>
                  <p className="text-[11px] text-[#7A9380] leading-relaxed">
                    Đăng nhập tài khoản FrogiNotes để khám phá<br />
                    tính năng đồng bộ đa nền tảng.
                  </p>
                </div>

                {cloudDisabled ? (
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FEF3C7] border border-[#FCD34D]">
                    <ShieldAlert size={15} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Cloud API chưa được cấu hình. Dữ liệu vẫn an toàn trên máy bạn.
                    </p>
                  </div>
                ) : emailUnavailable ? (
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FEF3C7] border border-[#FCD34D]">
                    <ShieldAlert size={15} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Dịch vụ email chưa sẵn sàng. Thử lại sau.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="w-full py-2.5 text-xs font-bold bg-[#3E6848] hover:bg-[#32553A] text-white rounded-full shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Cloud size={13} />
                    Đăng nhập tài khoản đám mây
                  </button>
                )}
              </>
            )}

            {/* ══ AUTH FLOW IN PROGRESS ══ */}
            {isConnecting && (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD]">
                <Loader2 size={18} className="text-blue-500 shrink-0 animate-spin" />
                <div className="text-xs text-blue-900 leading-relaxed">
                  <p className="font-bold">Đang xác thực...</p>
                  <p>Vui lòng kiểm tra email và nhấn link xác nhận.</p>
                </div>
              </div>
            )}

            {/* ══ LOGGED IN – FREE PLAN ══ */}
            {isFree && (
              <>
                {/* Account chip */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#F4F9F1] border border-[#E0E8DC] text-[11px]">
                  <UserCircle size={14} className="text-[#5B7360] shrink-0" />
                  <span className="text-[#526456]">{user.email}</span>
                  <span className="ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-white text-[#5B7360] border border-[#D0E0CC]">FREE</span>
                </div>

                {/* PRO Upgrade Card */}
                <div className="rounded-2xl border-2 border-[#C2E2AE] bg-gradient-to-br from-[#F4FBF0] to-[#E2F6D8] p-4 space-y-3">
                  {/* Cute frog illustration + header */}
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-14 h-14 rounded-2xl bg-white border border-[#C2E2AE] flex items-center justify-center shadow-xs">
                      <FrogMascot mood="crown" size={44} />
                    </div>
                    <div>
                      <h3 className="font-rounded font-extrabold text-sm text-[#19271D] leading-tight">
                        Mở khóa Cloud Sync Đa Nền Tảng ☁️🍃
                      </h3>
                      <p className="text-[11px] text-[#526456] mt-0.5">
                        Đồng bộ ghi chú mọi thiết bị, mọi lúc.
                      </p>
                    </div>
                  </div>

                  {/* Feature perks */}
                  <ul className="space-y-1.5">
                    {[
                      '⚡ Mở khóa Cloud Sync thời gian thực',
                      '📔 Sao lưu nhật ký & ảnh an toàn trên Cloud',
                      '🔄 Khôi phục mọi lúc',
                      '💬 Hỗ trợ ưu tiên',
                    ].map((perk) => (
                      <li key={perk} className="flex items-center gap-2 text-[11px] text-[#19271D]">
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Price */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-rounded font-extrabold text-lg text-[#3E6848]">50.000đ</span>
                      <span className="text-[11px] text-[#5B7360]">/ tháng</span>
                    </div>
                    <p className="text-[10px] text-[#7A9380]">
                      hoặc 500.000đ / năm — tiết kiệm 2 tháng 🎉
                    </p>
                  </div>

                  {/* CTA button */}
                  <button
                    onClick={() => setShowPayment(true)}
                    className="w-full py-2.5 text-xs font-extrabold bg-[#3E6848] hover:bg-[#32553A] text-white rounded-full shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Nâng cấp Pro — 50k/tháng 👑
                  </button>
                </div>

                {/* Locked sync controls */}
                <div className="rounded-2xl border border-[#E0E8DC] bg-[#F8FAF6] p-4 space-y-2.5 opacity-60">
                  <div className="flex items-center gap-2">
                    <Lock size={13} className="text-[#7A9380]" />
                    <span className="text-xs font-bold text-[#7A9380]">Đồng bộ đám mây</span>
                    <span className="ml-auto text-[10px] text-[#7A9380]">Yêu cầu Pro</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#9AB09E]">Bật đồng bộ tự động</span>
                    <ToggleLeft size={22} className="text-[#C0D0C4]" />
                  </div>
                  <button
                    disabled
                    className="w-full py-2 text-[11px] font-bold text-[#9AB09E] border border-[#D8E4D4] rounded-full cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <Lock size={11} /> Đồng bộ ngay
                  </button>
                </div>
              </>
            )}

            {/* ══ LOGGED IN – PRO PLAN ══ */}
            {isPro && (
              <>
                {/* Status banner */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#E2F2D4] border border-[#C2E2AE]">
                  <CheckCircle2 size={18} className="text-[#3E6848] mt-0.5 shrink-0" />
                  <div className="text-xs text-[#19271D] leading-relaxed">
                    <p className="font-bold mb-0.5 flex items-center gap-1.5">
                      Cloud Sync đang hoạt động ✅
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-white text-[#3E6848] border border-[#C2E2AE]">PRO ⭐</span>
                    </p>
                    <p className="text-[#526456] flex items-center gap-1">
                      <UserCircle size={11} className="shrink-0" />
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Sync controls */}
                <div className="rounded-2xl border border-[#E0E8DC] bg-[#F8FAF6] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#284E34]">Đồng bộ tự động</span>
                    <button
                      onClick={() => setSyncEnabled((v) => !v)}
                      className="flex items-center text-[#3E6848] cursor-pointer"
                      aria-label="Toggle sync"
                    >
                      {syncEnabled
                        ? <ToggleRight size={24} className="text-[#3E6848]" />
                        : <ToggleLeft size={24} className="text-[#9AB09E]" />
                      }
                    </button>
                  </div>

                  {lastSync && (
                    <p className="text-[10.5px] text-[#7A9380]">
                      Lần cuối đồng bộ: {new Date(lastSync).toLocaleString('vi-VN')}
                    </p>
                  )}

                  <button
                    onClick={handleSyncNow}
                    disabled={isSyncing || !syncEnabled}
                    className="w-full py-2.5 text-xs font-bold bg-[#3E6848] hover:bg-[#32553A] disabled:opacity-50 text-white rounded-full shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSyncing
                      ? <><Loader2 size={13} className="animate-spin" /> Đang đồng bộ...</>
                      : <><RefreshCw size={13} /> Đồng bộ ngay</>
                    }
                  </button>
                </div>
              </>
            )}

            {/* ── Local data card (always visible) ── */}
            <div className="bg-[#F8FAF6] p-4 rounded-2xl border border-[#E0E8DC] space-y-3">
              <div className="flex items-center gap-2">
                <HardDrive size={16} className="text-[#4A6E50]" />
                <span className="text-xs font-bold text-[#284E34]">Dữ liệu cục bộ (Local)</span>
                <span className="ml-auto inline-flex items-center gap-1 text-[#284E34] bg-[#E2F6D8] px-2 py-0.5 rounded-full border border-[#A8D8AC] text-[10.5px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5E9B47]" />
                  Đang hoạt động
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-2.5 rounded-xl border border-[#E0E8DC] text-center">
                  <span className="block text-[10px] font-bold text-[#7A9380]">Ghi chú</span>
                  <span className="font-rounded font-extrabold text-sm text-[#284E34]">{notes.length} thẻ</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-[#E0E8DC] text-center">
                  <span className="block text-[10px] font-bold text-[#7A9380]">Nhật ký</span>
                  <span className="font-rounded font-extrabold text-sm text-[#284E34]">{diaryEntries.length} trang</span>
                </div>
              </div>

              <p className="text-[10.5px] text-[#7A9380] leading-relaxed">
                Ghi chú cục bộ luôn miễn phí và hoạt động ngoại tuyến. Không ảnh hưởng khi nâng cấp.
              </p>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowSyncModal(false)}
              className="w-full py-2.5 text-xs font-bold text-[#5B7360] border border-[#D0E0CC] rounded-full hover:bg-[#F4F9F1] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Tiếp tục dùng ngoại tuyến 🍃</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payment modal (rendered on top) */}
      {showPayment && (
        <PaymentModal
          plan="pro"
          period="monthly"
          onClose={() => setShowPayment(false)}
        />
      )}
    </>
  );
};
