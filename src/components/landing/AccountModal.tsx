/**
 * AccountModal — Cloud account management.
 *
 * Shows authenticated user from useAuthStore (authoritative /me response).
 * Falls back to local-only display when no cloud session exists.
 *
 * Displays:
 *   - Pro badge if user.plan === 'pro'
 *   - "Nâng cấp Pro" button if user.plan === 'free'
 *
 * Logout: calls useAuthStore.logout() which revokes the session server-side
 * and clears the bearer token from memory. Local notes are NEVER deleted.
 */

import React, { useState } from 'react';
import { X, LogOut, HardDrive, ShieldAlert, Cloud, Loader2, Crown, Zap } from 'lucide-react';
import { useNotesStore } from '../../stores/useNotesStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { FrogMascot } from '../mascots/FrogMascot';
import { PaymentModal } from '../payment/PaymentModal';

export const AccountModal: React.FC<{ onOpenApp?: () => void }> = ({ onOpenApp }) => {
  const {
    showAccountModal,
    setShowAccountModal,
    setShowAuthModal,
    notes,
    diaryEntries,
  } = useNotesStore();

  const {
    phase,
    user: cloudUser,
    cloudDisabled,
    logout: cloudLogout,
  } = useAuthStore();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  if (!showAccountModal) return null;

  const isCloudAuthenticated = phase === 'authenticated' && cloudUser !== null;
  const isPro = isCloudAuthenticated && cloudUser?.plan === 'pro';
  const isFree = isCloudAuthenticated && cloudUser?.plan === 'free';

  const handleCloudLogout = async () => {
    setIsLoggingOut(true);
    try {
      await cloudLogout();
    } finally {
      setIsLoggingOut(false);
      setShowAccountModal(false);
    }
  };

  const handleSignIn = () => {
    setShowAccountModal(false);
    setShowAuthModal(true);
  };

  // ─── Cloud authenticated view ─────────────────────────────────────────────
  if (isCloudAuthenticated && cloudUser) {
    return (
      <>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white rounded-[28px] shadow-[0_20px_60px_rgba(35,60,38,0.22)] border border-[#DCE8D8] overflow-hidden select-text"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-[#F4F9F1] to-white border-b border-[#E6EDE3] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E2F2D4] border border-[#C2E2AE] flex items-center justify-center shadow-xs">
                  <FrogMascot mood={isPro ? 'crown' : 'love'} size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-rounded font-extrabold text-[18px] text-[#19271D]">
                      {cloudUser.name ?? cloudUser.email.split('@')[0]}
                    </h2>
                    {/* Pro badge or Free badge */}
                    {isPro ? (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white shadow-sm">
                        <Crown size={9} /> PRO
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E2F2D4] text-[#3E6848] border border-[#C2E2AE]">
                        FREE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#526456] font-medium">{cloudUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAccountModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-[#5B7360] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">

              {/* Pro active notice or Upgrade CTA */}
              {isPro ? (
                <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-gradient-to-r from-[#FFF9E6] to-[#FFF3CC] border border-[#FCD34D]">
                  <Crown size={15} className="text-[#D97706] mt-0.5 shrink-0" />
                  <div className="text-[11px] text-[#92400E] leading-relaxed">
                    <p className="font-bold mb-0.5">Cloud Pro đang hoạt động ⭐</p>
                    <p>Bạn đang sử dụng gói Pro. Mọi tính năng đồng bộ đa nền tảng đã được mở khóa.</p>
                  </div>
                </div>
              ) : isFree ? (
                <div className="rounded-2xl border border-[#C2E2AE] bg-gradient-to-br from-[#F4FBF0] to-[#E2F6D8] p-4 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-[#3E6848]" />
                    <p className="text-xs font-bold text-[#19271D]">Nâng cấp để mở Cloud Sync đa nền tảng</p>
                  </div>
                  <p className="text-[11px] text-[#526456]">
                    Đồng bộ thời gian thực · Sao lưu an toàn · Khôi phục mọi lúc
                  </p>
                  <button
                    onClick={() => setShowPayment(true)}
                    className="w-full py-2.5 text-xs font-extrabold bg-[#3E6848] hover:bg-[#32553A] text-white rounded-full shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Crown size={12} /> Nâng cấp Pro — 299.000đ / năm
                  </button>
                </div>
              ) : null}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Ghi chú" value={notes.length} icon={<HardDrive size={14} />} />
                <StatCard label="Nhật ký" value={diaryEntries.length} icon={<HardDrive size={14} />} />
              </div>

              {/* Open app */}
              {onOpenApp && (
                <button
                  onClick={() => { onOpenApp(); setShowAccountModal(false); }}
                  className="w-full py-2.5 text-xs font-bold bg-[#3E6848] hover:bg-[#32553A] text-white rounded-full shadow-md transition-all cursor-pointer"
                >
                  Mở ứng dụng 🐸
                </button>
              )}

              {/* Logout */}
              <button
                onClick={handleCloudLogout}
                disabled={isLoggingOut}
                className="w-full py-2.5 text-xs font-bold text-red-600 border border-red-200 rounded-full hover:bg-red-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isLoggingOut
                  ? <><Loader2 size={13} className="animate-spin" /> Đang đăng xuất...</>
                  : <><LogOut size={13} /> Đăng xuất</>
                }
              </button>
              <p className="text-[10px] text-[#7A9380] text-center">
                Đăng xuất chỉ xóa phiên đám mây. Ghi chú cục bộ không bị ảnh hưởng.
              </p>
            </div>
          </div>
        </div>

        {/* Payment modal */}
        {showPayment && (
          <PaymentModal
            plan="pro"
            period="yearly"
            onClose={() => setShowPayment(false)}
          />
        )}
      </>
    );
  }

  // ─── Not authenticated — show sign-in prompt ──────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-[28px] shadow-[0_20px_60px_rgba(35,60,38,0.22)] border border-[#DCE8D8] overflow-hidden select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-[#F4F9F1] to-white border-b border-[#E6EDE3] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E2F2D4] border border-[#C2E2AE] flex items-center justify-center shadow-xs">
              <FrogMascot mood="sleepy" size={32} />
            </div>
            <div>
              <h2 className="font-rounded font-extrabold text-[18px] text-[#19271D]">Tài khoản</h2>
              <p className="text-xs text-[#526456]">Chưa đăng nhập</p>
            </div>
          </div>
          <button
            onClick={() => setShowAccountModal(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-[#5B7360] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Ghi chú" value={notes.length} icon={<HardDrive size={14} />} />
            <StatCard label="Nhật ký" value={diaryEntries.length} icon={<HardDrive size={14} />} />
          </div>

          {cloudDisabled ? (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#FEF3C7] border border-[#FCD34D]">
              <ShieldAlert size={15} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Đồng bộ đám mây chưa được kích hoạt. Dữ liệu được lưu cục bộ an toàn.
              </p>
            </div>
          ) : (
            <>
              <button
                onClick={handleSignIn}
                className="w-full py-2.5 text-xs font-bold bg-[#3E6848] hover:bg-[#32553A] text-white rounded-full shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Cloud size={13} />
                Đăng nhập đám mây
              </button>
              <p className="text-[10px] text-[#7A9380] text-center">
                Không cần mật khẩu — đăng nhập bằng link email an toàn.
              </p>
            </>
          )}

          {onOpenApp && (
            <button
              onClick={() => { onOpenApp(); setShowAccountModal(false); }}
              className="w-full py-2 text-xs font-medium text-[#5B7360] hover:text-[#19271D] transition-colors cursor-pointer"
            >
              Mở ứng dụng 🐸
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── StatCard ─────────────────────────────────────────────────────────────────

const StatCard: React.FC<{ label: string; value: number; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="p-3 rounded-2xl bg-[#F4F9F1] border border-[#E6EDE3] flex items-center gap-2.5">
    <div className="text-[#5B7360]">{icon}</div>
    <div>
      <p className="font-rounded font-extrabold text-[16px] text-[#19271D] leading-none">{value}</p>
      <p className="text-[10px] text-[#7A9380] mt-0.5">{label}</p>
    </div>
  </div>
);
