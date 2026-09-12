/**
 * AuthModal — Real magic-link auth via FrogiNotes cloud API.
 *
 * Flow:
 *   1. User enters email → POST /request-challenge
 *   2. "Check your email" screen while polling /poll every 2 s
 *   3. On confirmation → /me verified → authenticated
 *   4. Handles: 503 (email unavailable), 429 (rate limit), 410 (expired),
 *      cancellation, component unmount, cloud disabled.
 *
 * When VITE_API_URL is absent or email service returns 503, shows a clear
 * "unavailable" state — never fakes success.
 */

import React, { useEffect, useRef, useState } from 'react';
import { X, Cloud, ShieldAlert, Loader2, Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { useNotesStore } from '../../stores/useNotesStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { FrogMascot } from '../mascots/FrogMascot';

export const AuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal } = useNotesStore();
  const {
    phase,
    user,
    error,
    pendingEmail,
    cloudDisabled,
    emailUnavailable,
    startLogin,
    cancelLogin,
    clearError,
  } = useAuthStore();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Cancel poll if modal closes
  useEffect(() => {
    if (!showAuthModal) {
      if (phase === 'requesting' || phase === 'polling' || phase === 'verifying') {
        cancelLogin();
      }
    }
  }, [showAuthModal]);

  // Focus input on open
  useEffect(() => {
    if (showAuthModal && phase === 'idle') {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [showAuthModal, phase]);

  // Close modal when authenticated
  useEffect(() => {
    if (phase === 'authenticated' && showAuthModal) {
      // Brief success moment, then close
      const t = setTimeout(() => setShowAuthModal(false), 1200);
      return () => clearTimeout(t);
    }
  }, [phase, showAuthModal]);

  if (!showAuthModal) return null;

  const handleClose = () => {
    if (phase === 'requesting' || phase === 'polling' || phase === 'verifying') {
      cancelLogin();
    }
    setShowAuthModal(false);
  };

  const validateEmail = (val: string) => {
    if (!val.trim()) return 'Vui lòng nhập email.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return 'Định dạng email không hợp lệ.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) { setEmailError(err); return; }
    setEmailError('');
    await startLogin(email.trim().toLowerCase());
  };

  const handleRetry = () => {
    clearError();
    setEmail('');
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const handleCancelPolling = () => {
    cancelLogin();
    clearError();
    setEmail('');
  };

  // ─── Cloud disabled ───────────────────────────────────────────────────────
  if (cloudDisabled) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none animate-in fade-in duration-150">
        <div
          className="w-full max-w-md bg-white rounded-[28px] shadow-[0_20px_60px_rgba(35,60,38,0.22)] border border-[#DCE8D8] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader onClose={handleClose} subtitle="Tính năng chưa khả dụng" />
          <div className="p-6 space-y-4 select-text">
            <Banner variant="warning">
              <p className="font-bold mb-1">Đồng bộ đám mây chưa được cấu hình</p>
              <p>API cloud chưa được kết nối (VITE_API_URL chưa được thiết lập). Tất cả dữ liệu vẫn an toàn trên máy bạn.</p>
            </Banner>
            <CloseButton onClick={handleClose} />
          </div>
        </div>
      </div>
    );
  }

  // ─── Authenticated ────────────────────────────────────────────────────────
  if (phase === 'authenticated' && user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none animate-in fade-in duration-150">
        <div
          className="w-full max-w-md bg-white rounded-[28px] shadow-[0_20px_60px_rgba(35,60,38,0.22)] border border-[#DCE8D8] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 flex flex-col items-center gap-4 text-center">
            <CheckCircle size={40} className="text-[#3E6848]" />
            <div>
              <p className="font-rounded font-extrabold text-[17px] text-[#19271D]">Đăng nhập thành công! 🎉</p>
              <p className="text-xs text-[#5B7360] mt-1">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Polling — waiting for user to click email link ───────────────────────
  if (phase === 'polling' || phase === 'verifying') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none animate-in fade-in duration-150">
        <div
          className="w-full max-w-md bg-white rounded-[28px] shadow-[0_20px_60px_rgba(35,60,38,0.22)] border border-[#DCE8D8] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader onClose={handleCancelPolling} subtitle="Kiểm tra email của bạn" />
          <div className="p-6 space-y-4 select-text">
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-14 h-14 rounded-full bg-[#E2F2D4] flex items-center justify-center">
                {phase === 'verifying'
                  ? <Loader2 size={28} className="text-[#3E6848] animate-spin" />
                  : <Mail size={28} className="text-[#3E6848]" />
                }
              </div>
              <p className="font-rounded font-bold text-[15px] text-[#19271D] text-center">
                {phase === 'verifying' ? 'Đang xác minh phiên...' : 'Đường link đã được gửi! 📬'}
              </p>
              <p className="text-xs text-[#526456] text-center leading-relaxed">
                Mở email gửi đến <strong>{pendingEmail}</strong> và nhấn vào link xác nhận.
                Tab này sẽ tự động đăng nhập.
              </p>
              {phase === 'polling' && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#7A9380]">
                  <Loader2 size={12} className="animate-spin" />
                  <span>Đang chờ xác nhận...</span>
                </div>
              )}
            </div>
            <Banner variant="info">
              <p>Link có hiệu lực trong 15 phút. Nếu không thấy email, hãy kiểm tra thư mục spam.</p>
            </Banner>
            <button
              type="button"
              onClick={handleCancelPolling}
              className="w-full py-2.5 text-xs font-bold text-[#5B7360] border border-[#D0E0CC] rounded-full hover:bg-[#F4F9F1] transition-all cursor-pointer"
            >
              Hủy và thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error state ──────────────────────────────────────────────────────────
  if (phase === 'error' && error) {
    const isEmailUnavailable = emailUnavailable || error.code === 'email_unavailable';
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none animate-in fade-in duration-150">
        <div
          className="w-full max-w-md bg-white rounded-[28px] shadow-[0_20px_60px_rgba(35,60,38,0.22)] border border-[#DCE8D8] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader onClose={handleClose} subtitle="Có lỗi xảy ra" />
          <div className="p-6 space-y-4 select-text">
            <Banner variant="warning">
              <p className="font-bold mb-1">
                {isEmailUnavailable
                  ? 'Dịch vụ email chưa được cấu hình'
                  : error.code === 'rate_limited'
                    ? 'Quá nhiều yêu cầu'
                    : error.code === 'expired'
                      ? 'Link đã hết hạn'
                      : 'Đăng nhập thất bại'}
              </p>
              <p>{error.message}</p>
              {error.retryAfterSeconds && (
                <p className="mt-1 text-[10px]">Thử lại sau {Math.ceil(error.retryAfterSeconds / 60)} phút.</p>
              )}
            </Banner>
            {!isEmailUnavailable && (
              <button
                type="button"
                onClick={handleRetry}
                className="w-full py-2.5 text-xs font-bold bg-[#3E6848] hover:bg-[#32553A] text-white rounded-full shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={13} />
                Thử lại
              </button>
            )}
            <CloseButton onClick={handleClose} />
          </div>
        </div>
      </div>
    );
  }

  // ─── Idle / Requesting — email input form ─────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-[28px] shadow-[0_20px_60px_rgba(35,60,38,0.22)] border border-[#DCE8D8] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader onClose={handleClose} subtitle="Đăng nhập bằng email" />

        <div className="p-6 space-y-4 select-text">
          <Banner variant="info">
            <p className="font-bold mb-1">Đăng nhập không cần mật khẩu 🔐</p>
            <p>Nhập email của bạn — chúng tôi sẽ gửi link xác nhận một lần. Không cần mật khẩu.</p>
          </Banner>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-[#284E34] mb-1.5">
                Email
              </label>
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                placeholder="you@example.com"
                disabled={phase === 'requesting'}
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#D0E0CC] bg-[#F8FAF6] focus:outline-none focus:ring-2 focus:ring-[#3E6848]/30 focus:border-[#3E6848] transition-all placeholder:text-[#A8BCA8] disabled:opacity-50"
                autoComplete="email"
                inputMode="email"
              />
              {emailError && (
                <p className="text-[11px] text-red-600 mt-1">{emailError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={phase === 'requesting' || !email.trim()}
              className="w-full py-2.5 text-xs font-bold bg-[#3E6848] hover:bg-[#32553A] text-white rounded-full shadow-[0_4px_16px_rgba(62,104,72,0.25)] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {phase === 'requesting' ? (
                <><Loader2 size={13} className="animate-spin" /> Đang gửi...</>
              ) : (
                <><Cloud size={13} /> Gửi link đăng nhập</>
              )}
            </button>
          </form>

          <div className="border-t border-[#E6EDE3] pt-3">
            <p className="text-[10px] text-[#7A9380] text-center leading-relaxed">
              FrogiNotes lưu dữ liệu cục bộ. Tài khoản cloud là tùy chọn — bạn có thể dùng offline không cần đăng nhập.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2 text-xs font-medium text-[#5B7360] hover:text-[#19271D] transition-colors cursor-pointer"
          >
            Tiếp tục dùng ngoại tuyến 🍃
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Shared sub-components ────────────────────────────────────────────────────

const ModalHeader: React.FC<{ onClose: () => void; subtitle: string }> = ({ onClose, subtitle }) => (
  <div className="px-6 pt-6 pb-3 bg-gradient-to-b from-[#F4F9F1] to-white flex items-center justify-between">
    <div className="flex items-center gap-2.5">
      <div className="w-10 h-10 rounded-2xl bg-[#E2F2D4] border border-[#C2E2AE] flex items-center justify-center shadow-2xs">
        <FrogMascot mood="sleepy" size={28} />
      </div>
      <div>
        <h2 className="font-rounded font-extrabold text-[17px] text-[#19271D]">Tài khoản đám mây ☁️</h2>
        <p className="font-handwriting text-xs text-[#7A9380]">{subtitle}</p>
      </div>
    </div>
    <button
      onClick={onClose}
      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-[#5B7360] transition-colors cursor-pointer"
    >
      <X size={18} />
    </button>
  </div>
);

const Banner: React.FC<{ variant: 'warning' | 'info'; children: React.ReactNode }> = ({ variant, children }) => {
  const styles = variant === 'warning'
    ? 'bg-[#FEF3C7] border-[#FCD34D] text-amber-800'
    : 'bg-[#F0F9FF] border-[#BAE6FD] text-blue-900';
  const Icon = variant === 'warning' ? ShieldAlert : Cloud;
  const iconStyle = variant === 'warning' ? 'text-amber-600' : 'text-blue-500';
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-2xl border ${styles}`}>
      <Icon size={16} className={`${iconStyle} mt-0.5 shrink-0`} />
      <div className="text-xs leading-relaxed">{children}</div>
    </div>
  );
};

const CloseButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full py-2.5 text-xs font-bold text-[#5B7360] border border-[#D0E0CC] rounded-full hover:bg-[#F4F9F1] transition-all cursor-pointer"
  >
    Tiếp tục dùng ngoại tuyến 🍃
  </button>
);
