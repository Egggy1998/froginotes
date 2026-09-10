import React, { useState } from 'react';
import { X, User, Cloud, LogOut, Check, Copy, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { useNotesStore } from '../../stores/useNotesStore';
import { FrogMascot } from '../mascots/FrogMascot';

export const AccountModal: React.FC<{ onOpenApp?: () => void }> = ({ onOpenApp }) => {
  const {
    currentUser,
    showAccountModal,
    setShowAccountModal,
    logout,
    syncFromDB,
    notes,
    diaryEntries,
    isSyncing,
  } = useNotesStore();

  const [copiedKey, setCopiedKey] = useState(false);
  const [syncMsg, setSyncMsg] = useState(false);

  if (!showAccountModal || !currentUser) return null;

  const handleCopyKey = () => {
    if (!currentUser.syncKey) return;
    navigator.clipboard.writeText(currentUser.syncKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSyncNow = async () => {
    await syncFromDB();
    setSyncMsg(true);
    setTimeout(() => setSyncMsg(false), 2500);
  };

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
              <FrogMascot mood="love" size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-rounded font-extrabold text-[18px] text-[#19271D]">
                  {currentUser.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E2F6D8] text-[#284E34] border border-[#A8D8AC] flex items-center gap-1">
                  <Sparkles size={10} className="text-amber-500" />
                  <span>{currentUser.plan.toUpperCase()}</span>
                </span>
              </div>
              <p className="text-xs text-[#526456] font-medium">{currentUser.email}</p>
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
          {/* Cloud Sync Status Card */}
          <div className="bg-[#F8FAF6] p-4 rounded-2xl border border-[#DDE7DB] space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#6D8B71] uppercase tracking-wider text-[10.5px]">
                Đồng bộ đám mây (Cloud Sync)
              </span>
              <span className="inline-flex items-center gap-1 text-[#284E34] bg-[#E2F6D8] px-2 py-0.5 rounded-full border border-[#A8D8AC] text-[10.5px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5E9B47] animate-pulse" />
                Đang hoạt động
              </span>
            </div>

            {/* Sync Key */}
            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-[#E0E8DC]">
              <div>
                <span className="block text-[10px] font-bold text-[#7A9380] uppercase">Mã Sync Key</span>
                <span className="font-mono text-xs font-extrabold text-[#1D4ED8]">
                  {currentUser.syncKey || 'FROGI-DEFAULT'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyKey}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#284E34] bg-[#EEF5EB] hover:bg-[#DDF0D8] rounded-lg transition-colors cursor-pointer"
              >
                {copiedKey ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                <span>{copiedKey ? 'Đã sao chép' : 'Sao chép'}</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-white p-2 rounded-xl border border-[#E0E8DC] text-center">
                <span className="block text-[10px] font-bold text-[#7A9380]">Ghi chú Cloud</span>
                <span className="font-rounded font-extrabold text-sm text-[#284E34]">{notes.length} thẻ</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#E0E8DC] text-center">
                <span className="block text-[10px] font-bold text-[#7A9380]">Nhật ký Cloud</span>
                <span className="font-rounded font-extrabold text-sm text-[#284E34]">{diaryEntries.length} trang</span>
              </div>
            </div>

            {/* Database indicator */}
            <div className="text-[10.5px] text-[#657F6B] flex items-center justify-between pt-1">
              <span>Cơ sở dữ liệu:</span>
              <span className="font-mono font-bold text-[10px] text-[#284E34]">Turso LibSQL (Tokyo)</span>
            </div>
          </div>

          {syncMsg && (
            <div className="p-2 rounded-xl bg-[#E2F6D8] text-[#284E34] text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
              <Check size={14} className="text-green-600" />
              <span>Đã đồng bộ thành công tất cả ghi chú với Cloud!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="w-full py-2.5 text-xs font-bold bg-[#3E6848] hover:bg-[#32553A] text-white rounded-full shadow-[0_4px_16px_rgba(62,104,72,0.22)] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ 2 chiều ngay 🔄'}</span>
            </button>

            {onOpenApp && (
              <button
                type="button"
                onClick={() => {
                  setShowAccountModal(false);
                  onOpenApp();
                }}
                className="w-full py-2 text-xs font-bold bg-[#F4F9F1] hover:bg-[#EAF4E5] text-[#284E34] border border-[#D2E4CE] rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Mở FrogiNotes Web Dashboard 🍃</span>
              </button>
            )}

            <button
              type="button"
              onClick={logout}
              className="w-full py-2 text-xs font-bold text-[#DC2626] hover:bg-[#FEE2E2] rounded-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut size={13} />
              <span>Đăng xuất khỏi tài khoản</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
