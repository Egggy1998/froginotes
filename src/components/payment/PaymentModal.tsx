/**
 * PaymentModal — VietQR payment modal for FrogiNotes Cloud Pro.
 *
 * Shows QR code, bank details, and polls for payment confirmation every 2s.
 * On success: triggers confetti, updates user.plan → 'pro', unlocks Cloud Sync.
 *
 * Gói Pro Cloud — 50.000đ / tháng (hoặc 500.000đ / năm).
 * Mã VietQR từ GPM Pay — quét QR hoặc chuyển khoản thủ công.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Copy, CheckCircle2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuthStore } from '../../stores/useAuthStore';
import { createPaymentOrder, checkOrderStatus, type CreateOrderResponse, type PlanType, type PeriodType } from '../../lib/api-payment';
import { FrogMascot } from '../mascots/FrogMascot';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PaymentModalProps {
  plan?: PlanType;
  period?: PeriodType;
  onClose: () => void;
}

// ─── Copy-to-clipboard helper ─────────────────────────────────────────────────

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      title={`Sao chép ${label ?? ''}`}
      className="ml-1.5 shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors text-[#5B7360] hover:text-[#284E34]"
    >
      {copied
        ? <CheckCircle2 size={13} className="text-green-600" />
        : <Copy size={13} />
      }
    </button>
  );
}

// ─── Price label helper ───────────────────────────────────────────────────────

function getPriceLabel(period: PeriodType): string {
  if (period === 'monthly') return '50.000đ / tháng';
  if (period === 'yearly') return '500.000đ / năm';
  return 'Dùng thử miễn phí';
}

// ─── PaymentModal ─────────────────────────────────────────────────────────────

export const PaymentModal: React.FC<PaymentModalProps> = ({
  plan = 'pro',
  period = 'monthly',
  onClose,
}) => {
  const { user } = useAuthStore();
  const [order, setOrder] = useState<CreateOrderResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [pollStatus, setPollStatus] = useState<'pending' | 'completed' | 'expired' | 'cancelled' | null>(null);
  const [celebrated, setCelebrated] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Create order on mount ─────────────────────────────────────────────────
  const createOrder = useCallback(async () => {
    setIsCreating(true);
    setLoadError(null);
    try {
      const o = await createPaymentOrder(plan, period);
      setOrder(o);
    } catch (e: any) {
      setLoadError(e?.message ?? 'Không thể tạo đơn thanh toán. Vui lòng thử lại.');
    } finally {
      setIsCreating(false);
    }
  }, [plan, period]);

  useEffect(() => {
    createOrder();
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [createOrder]);

  // ── Poll order status every 2s ────────────────────────────────────────────
  useEffect(() => {
    if (!order) return;
    if (pollStatus === 'completed' || pollStatus === 'expired' || pollStatus === 'cancelled') return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const result = await checkOrderStatus(order.orderId);
        if (result.status !== 'pending') {
          setPollStatus(result.status);
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
      } catch {
        // Network hiccup — keep polling
      }
    }, 2000); // Poll every 2 seconds per GPM Pay spec

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [order, pollStatus]);

  // ── Celebrate on success ──────────────────────────────────────────────────
  useEffect(() => {
    if (pollStatus === 'completed' && !celebrated) {
      setCelebrated(true);

      // Update auth store: user.plan → 'pro' (unlock Cloud Sync)
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.setState({ user: { ...currentUser, plan: 'pro' } });
      }

      // Confetti burst
      const shoot = () => {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#5E9B47', '#A8D8AC', '#FFD700', '#FF69B4', '#87CEEB'],
        });
      };
      shoot();
      setTimeout(shoot, 300);
      setTimeout(shoot, 600);

      // Auto-close after celebration
      setTimeout(() => onClose(), 3500);
    }
  }, [pollStatus, celebrated, onClose]);

  // ─── Render ───────────────────────────────────────────────────────────────

  const priceLabel = getPriceLabel(period);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none">
      <div
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-[#DCE8D8] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#F4F9F1] to-[#EAF4E3] border-b border-[#E6EDE3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FrogMascot mood={pollStatus === 'completed' ? 'party' : 'crown'} size={26} />
            <div>
              <h2 className="font-rounded font-extrabold text-sm text-[#284E34]">
                Gói Pro Cloud 👑
              </h2>
              <p className="text-[10px] text-[#5B7360] font-semibold">{priceLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 text-[#5B7360] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">

          {/* ── Success state ── */}
          {pollStatus === 'completed' && (
            <div className="text-center space-y-3 py-4">
              <div className="text-5xl">🎉</div>
              <p className="font-rounded font-extrabold text-lg text-[#284E34]">
                Chúc mừng! Bạn là Pro! 🐸✨
              </p>
              <p className="text-xs text-[#526456]">
                Cloud Sync đã được mở khóa. Tận hưởng đồng bộ đa nền tảng nhé!
              </p>
              <div className="flex justify-center">
                <FrogMascot mood="party" size={64} />
              </div>
            </div>
          )}

          {/* ── Expired / cancelled state ── */}
          {(pollStatus === 'expired' || pollStatus === 'cancelled') && (
            <div className="text-center space-y-3 py-2">
              <AlertCircle size={32} className="text-amber-500 mx-auto" />
              <p className="font-bold text-sm text-[#284E34]">Đơn hàng đã hết hạn</p>
              <p className="text-xs text-[#526456]">Vui lòng tạo đơn mới để tiếp tục.</p>
              <button
                onClick={() => { setOrder(null); setPollStatus(null); createOrder(); }}
                className="mx-auto flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#3E6848] text-white rounded-full hover:bg-[#32553A] transition-all"
              >
                <RefreshCw size={12} /> Tạo đơn mới
              </button>
            </div>
          )}

          {/* ── Loading order ── */}
          {isCreating && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 size={28} className="animate-spin text-[#3E6848]" />
              <p className="text-xs text-[#5B7360]">Đang tạo mã QR thanh toán...</p>
            </div>
          )}

          {/* ── Create error ── */}
          {loadError && !isCreating && (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-red-50 border border-red-200">
                <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-red-800 leading-relaxed">{loadError}</p>
              </div>
              <button
                onClick={createOrder}
                className="w-full py-2 text-xs font-bold bg-[#3E6848] text-white rounded-full hover:bg-[#32553A] transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={12} /> Thử lại
              </button>
            </div>
          )}

          {/* ── Order loaded — show QR + details ── */}
          {order && !isCreating && !loadError && pollStatus !== 'completed' && pollStatus !== 'expired' && pollStatus !== 'cancelled' && (
            <>
              {/* Package label */}
              <div className="flex items-center justify-center gap-2 py-1">
                <span className="text-[11px] font-extrabold text-[#3E6848] bg-[#E2F6D8] px-3 py-1 rounded-full border border-[#C2E2AE]">
                  Gói Pro Cloud — 50.000đ / tháng
                </span>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-2 bg-white border-2 border-[#E0E8DC] rounded-2xl shadow-sm">
                  {order.qrCode.startsWith('data:') || order.qrCode.startsWith('http') ? (
                    <img src={order.qrCode} alt="VietQR GPM Pay" className="w-40 h-40 object-contain" />
                  ) : (
                    <div className="w-40 h-40 flex items-center justify-center bg-[#F8FAF6] rounded-xl">
                      <p className="text-[10px] text-[#7A9380] text-center px-2">QR Code sẽ hiển thị sau khi kết nối server</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Polling status */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#5B7360]">
                <Loader2 size={11} className="animate-spin" />
                <span>Đang chờ xác nhận thanh toán...</span>
              </div>

              {/* Bank details */}
              <div className="bg-[#F4F9F1] rounded-2xl border border-[#E0E8DC] divide-y divide-[#E6EDE3]">
                {/* Bank name */}
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <span className="text-[11px] text-[#7A9380]">Ngân hàng</span>
                  <div className="flex items-center">
                    <span className="text-xs font-bold text-[#19271D]">{order.bankName}</span>
                  </div>
                </div>

                {/* Account number */}
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <span className="text-[11px] text-[#7A9380]">Số tài khoản</span>
                  <div className="flex items-center">
                    <span className="text-xs font-bold text-[#19271D] font-mono">{order.accountNumber}</span>
                    <CopyButton text={order.accountNumber} label="số tài khoản" />
                  </div>
                </div>

                {/* Account name */}
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <span className="text-[11px] text-[#7A9380]">Chủ tài khoản</span>
                  <span className="text-xs font-bold text-[#19271D]">{order.accountName}</span>
                </div>

                {/* Amount */}
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <span className="text-[11px] text-[#7A9380]">Số tiền</span>
                  <div className="flex items-center">
                    <span className="text-xs font-extrabold text-[#3E6848]">
                      {order.amount.toLocaleString('vi-VN')}đ
                    </span>
                    <CopyButton text={String(order.amount)} label="số tiền" />
                  </div>
                </div>

                {/* Transfer content */}
                <div className="px-4 py-2.5 flex items-start justify-between gap-2">
                  <span className="text-[11px] text-[#7A9380] shrink-0 mt-0.5">Nội dung CK</span>
                  <div className="flex items-start">
                    <span className="text-[11px] font-bold text-[#19271D] font-mono text-right break-all">{order.transferContent}</span>
                    <CopyButton text={order.transferContent} label="nội dung" />
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-[#FFF9E6] border border-[#FFE58A] rounded-2xl px-4 py-3">
                <p className="text-[11px] text-[#7A5C00] leading-relaxed text-center">
                  Mở app ngân hàng quét mã QR hoặc chuyển đúng số tiền & nội dung để hệ thống tự động kích hoạt gói Pro trong 30 giây.
                </p>
              </div>
            </>
          )}

          {/* Close button (only when not completed) */}
          {pollStatus !== 'completed' && (
            <button
              onClick={onClose}
              className="w-full py-2 text-xs font-medium text-[#5B7360] hover:text-[#284E34] transition-colors"
            >
              Để sau
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
