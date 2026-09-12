/**
 * DecorPackModal.tsx — Decor Pack browser + preview modal
 *
 * SCOPE: src/components/decor/DecorPackModal.tsx
 * No edits to NoteModal, TopBar, or shared types.
 *
 * Public props:
 *   onApply(selection: DecorSelection): void  — called when user applies an owned asset
 *   onClose(): void                           — called when modal is dismissed
 *   open: boolean                             — controlled visibility
 *
 * Behavior:
 *   - Free packs: selectable, apply immediately
 *   - Paid packs: preview with shimmer lock, "Coming Soon" banner
 *   - Checkout attempt: shows payment unavailable modal (never fakes success)
 *   - Existing mascots/tapes remain free — no paywall on existing assets
 */

import React, { useState, useEffect } from 'react';
import { X, Lock, ShoppingBag, Check, Sparkles } from 'lucide-react';
import { useDecorStore } from '../../stores/useDecorStore';
import { DecorAsset, DecorSelection, DecorPackId, DECOR_CATALOG, getApplyStyles } from '../../lib/decor-catalog';

interface DecorPackModalProps {
  open: boolean;
  onClose: () => void;
  /** Called when user picks and applies an owned asset */
  onApply: (selection: DecorSelection) => void;
  /** Currently applied asset ID (for showing active state) */
  currentAssetId?: string | null;
}

// ---------------------------------------------------------------------------
// Tape preview chip — shows the tape color + label
// ---------------------------------------------------------------------------
interface TapeChipProps {
  asset: DecorAsset;
  selected: boolean;
  owned: boolean;
  onSelect: () => void;
}

const TapeChip: React.FC<TapeChipProps> = ({ asset, selected, owned, onSelect }) => {
  const applyStyles = getApplyStyles(asset);

  return (
    <button
      onClick={onSelect}
      title={owned ? asset.labelVi : `${asset.labelVi} — Cần mua gói`}
      aria-pressed={selected}
      className={`
        relative group flex flex-col items-center gap-1.5 p-2.5 rounded-xl
        transition-all duration-200 border
        ${selected
          ? 'border-[#4D6F39] bg-[#E2F6D8] shadow-[0_0_0_2px_rgba(77,111,57,0.4)]'
          : 'border-transparent bg-white/60 hover:bg-white/90 hover:border-[#C9E0C0]'
        }
        ${!owned ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}
      `}
    >
      {/* Tape strip preview */}
      <div
        className="w-14 h-4 rounded-sm relative overflow-hidden"
        style={{
          background: applyStyles.background,
          border: `1px solid ${applyStyles.borderTop.replace('1px solid ', '')}`,
          boxShadow: applyStyles.boxShadow,
          backgroundImage: applyStyles.backgroundImage,
          backgroundSize: applyStyles.backgroundSize,
        }}
      >
        {!owned && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
            <Lock size={8} className="text-gray-500/80" />
          </div>
        )}
      </div>

      {/* Color swatch dot */}
      <div
        className="w-3 h-3 rounded-full border border-black/10"
        style={{ background: asset.swatchColor }}
      />

      {/* Label */}
      <span className="text-[10px] leading-tight text-center text-[#4D4D4D] font-medium max-w-[56px] line-clamp-2">
        {asset.labelVi}
      </span>

      {/* Selected tick */}
      {selected && (
        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#4D6F39] flex items-center justify-center">
          <Check size={10} className="text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
};

// ---------------------------------------------------------------------------
// Payment unavailable notice
// ---------------------------------------------------------------------------
const PaymentUnavailableNotice: React.FC<{ packName: string; onDismiss: () => void }> = ({
  packName,
  onDismiss,
}) => (
  <div
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="payment-notice-title"
    className="
      fixed inset-0 z-[200] flex items-center justify-center p-4
      bg-black/30 backdrop-blur-sm
    "
    onClick={onDismiss}
  >
    <div
      className="
        bg-white rounded-[20px] p-6 max-w-xs w-full shadow-2xl
        border border-black/5
      "
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#FDF1EC] flex items-center justify-center">
          <ShoppingBag size={22} className="text-[#D97757]" />
        </div>
        <h3 id="payment-notice-title" className="font-semibold text-[#3D3D3D] text-[15px]">
          Thanh toán chưa khả dụng
        </h3>
        <p className="text-[13px] text-[#7A7A7A] leading-relaxed">
          Gói <strong className="text-[#4D4D4D]">{packName}</strong> chưa thể mua lúc này.
          <br />
          Vui lòng thử lại sau khi tính năng thanh toán được mở. ♡
        </p>
        <p className="text-[11px] text-[#ADADAD] italic">
          Payment unavailable — checkout not yet configured.
        </p>
        <button
          onClick={onDismiss}
          className="
            mt-1 px-5 py-2 rounded-full bg-[#4D6F39] text-white text-sm font-medium
            hover:bg-[#3D5D2C] transition-colors
          "
        >
          Đã hiểu ♡
        </button>
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Main modal
// ---------------------------------------------------------------------------

export const DecorPackModal: React.FC<DecorPackModalProps> = ({
  open,
  onClose,
  onApply,
  currentAssetId,
}) => {
  const {
    isPackOwned,
    canUseAsset,
    selectAsset,
    getPacksWithOwnership,
    requestCheckout,
    lastCheckoutError,
    clearCheckoutError,
    isSyncing,
  } = useDecorStore();

  const [localSelectedAssetId, setLocalSelectedAssetId] = useState<string | null>(
    currentAssetId ?? null
  );
  const [paymentNotice, setPaymentNotice] = useState<{ packId: DecorPackId; packName: string } | null>(
    null
  );
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Sync with parent-supplied currentAssetId
  useEffect(() => {
    if (currentAssetId !== undefined) {
      setLocalSelectedAssetId(currentAssetId);
    }
  }, [currentAssetId]);

  // Clear error when modal opens
  useEffect(() => {
    if (open) clearCheckoutError();
  }, [open, clearCheckoutError]);

  if (!open) return null;

  const packsWithOwnership = getPacksWithOwnership();

  const handleAssetClick = (asset: DecorAsset) => {
    if (!canUseAsset(asset.id)) {
      // Show payment unavailable — not buy success
      const pack = DECOR_CATALOG.find((p) => p.id === asset.packId);
      if (pack) setPaymentNotice({ packId: pack.id, packName: pack.nameVi });
      return;
    }
    setLocalSelectedAssetId(asset.id);
  };

  const handleApply = () => {
    if (!localSelectedAssetId || !canUseAsset(localSelectedAssetId)) return;
    const ok = selectAsset(localSelectedAssetId);
    if (!ok) return;
    const selection = useDecorStore.getState().getActiveSelection();
    if (selection) {
      onApply(selection);
    }
    onClose();
  };

  const handleComingSoonClick = async (packId: DecorPackId) => {
    const pack = DECOR_CATALOG.find((p) => p.id === packId);
    if (!pack) return;
    setCheckoutLoading(true);
    await requestCheckout(packId);
    setCheckoutLoading(false);
    setPaymentNotice({ packId, packName: pack.nameVi });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="decor-modal-title"
        className="
          fixed z-[110] inset-0 flex items-center justify-center p-4
          pointer-events-none
        "
      >
        <div
          className="
            pointer-events-auto
            w-full max-w-[440px] max-h-[85vh] flex flex-col
            bg-[#FAFDF8] rounded-[22px] shadow-[0_20px_60px_rgba(28,49,25,0.18)]
            border border-[#D4EAC8]
            overflow-hidden
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#E8F4E0]">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-[#4D6F39]" />
              <h2 id="decor-modal-title" className="font-semibold text-[#2A3D20] text-[16px]">
                Decor Packs
              </h2>
              {isSyncing && (
                <span className="text-[11px] text-[#7A7A7A] animate-pulse">syncing…</span>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close decor packs"
              className="w-8 h-8 rounded-full hover:bg-[#E8F4E0] flex items-center justify-center transition-colors"
            >
              <X size={16} className="text-[#4D4D4D]" />
            </button>
          </div>

          {/* Pack list */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {packsWithOwnership.map((pack) => (
              <div key={pack.id} className="space-y-2">
                {/* Pack header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[13px] text-[#3D3D3D]">{pack.nameVi}</span>
                    {pack.owned && (
                      <span className="text-[10px] bg-[#E2F6D8] text-[#4D6F39] px-1.5 py-0.5 rounded-full font-medium">
                        Đã có
                      </span>
                    )}
                    {pack.comingSoon && !pack.owned && (
                      <span className="text-[10px] bg-[#FDF1EC] text-[#D97757] px-1.5 py-0.5 rounded-full font-medium">
                        Sắp ra mắt
                      </span>
                    )}
                    {pack.priceUsdCents === 0 && (
                      <span className="text-[10px] bg-[#E5F2FD] text-[#3B82F6] px-1.5 py-0.5 rounded-full font-medium">
                        Miễn phí
                      </span>
                    )}
                  </div>
                  {pack.comingSoon && !pack.owned && (
                    <button
                      disabled={checkoutLoading}
                      onClick={() => handleComingSoonClick(pack.id)}
                      className="
                        text-[11px] px-2.5 py-1 rounded-full
                        bg-[#F5F5F5] text-[#7A7A7A]
                        border border-[#E0E0E0]
                        hover:bg-[#ECECEC] transition-colors
                        disabled:opacity-50
                      "
                    >
                      {checkoutLoading ? '…' : 'Thông tin'}
                    </button>
                  )}
                </div>

                {/* Pack description */}
                <p className="text-[11px] text-[#9A9A9A] leading-relaxed">{pack.descriptionVi}</p>

                {/* Assets grid */}
                <div className="flex flex-wrap gap-2 py-1">
                  {pack.previewAssets.map((asset) => {
                    const assetOwned = isPackOwned(pack.id);
                    return (
                      <TapeChip
                        key={asset.id}
                        asset={asset}
                        selected={localSelectedAssetId === asset.id}
                        owned={assetOwned}
                        onSelect={() => handleAssetClick(asset)}
                      />
                    );
                  })}
                </div>

                {/* Lock shimmer for paid packs */}
                {!pack.owned && pack.comingSoon && (
                  <div className="
                    rounded-xl border border-[#F0E8D8] bg-[#FDFAF5]
                    px-3 py-2 flex items-center gap-2
                  ">
                    <Lock size={12} className="text-[#C9A87A] shrink-0" />
                    <p className="text-[11px] text-[#B09070] leading-snug">
                      Gói này sẽ khả dụng khi thanh toán được mở.
                      Nhấn &ldquo;Thông tin&rdquo; để xem cập nhật.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer: Apply button */}
          <div className="px-5 py-4 border-t border-[#E8F4E0] flex gap-2">
            <button
              onClick={onClose}
              className="
                flex-1 py-2.5 rounded-full border border-[#D4EAC8]
                text-[#4D6F39] text-sm font-medium
                hover:bg-[#E8F4E0] transition-colors
              "
            >
              Huỷ
            </button>
            <button
              onClick={handleApply}
              disabled={
                !localSelectedAssetId ||
                !canUseAsset(localSelectedAssetId)
              }
              className="
                flex-1 py-2.5 rounded-full
                bg-[#4D6F39] text-white text-sm font-medium
                hover:bg-[#3D5D2C] transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed
              "
            >
              Áp dụng ♡
            </button>
          </div>
        </div>
      </div>

      {/* Payment unavailable notice (never a buy success) */}
      {paymentNotice && (
        <PaymentUnavailableNotice
          packName={paymentNotice.packName}
          onDismiss={() => setPaymentNotice(null)}
        />
      )}

      {/* Checkout error from store (edge case: adapter returned error) */}
      {lastCheckoutError && !paymentNotice && (
        <PaymentUnavailableNotice
          packName="gói này"
          onDismiss={clearCheckoutError}
        />
      )}
    </>
  );
};
