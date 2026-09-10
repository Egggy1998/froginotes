import React, { useState } from 'react';
import { X, Cloud, CloudCheck, RefreshCw, Key, ShieldCheck, Check } from 'lucide-react';
import { useNotesStore } from '../stores/useNotesStore';
import { FrogMascot } from './mascots/FrogMascot';

export const CloudSyncModal: React.FC = () => {
  const {
    showSyncModal,
    setShowSyncModal,
    cloudSyncEnabled,
    syncKey,
    activateCloudSync,
    disableCloudSync,
    syncFromDB,
    notes,
    diaryEntries,
    t,
  } = useNotesStore();

  const [inputKey, setInputKey] = useState(syncKey || '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!showSyncModal) return null;

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) {
      setMsg({ type: 'error', text: 'Please enter a valid Sync Key or Access Code.' });
      return;
    }

    setLoading(true);
    setMsg(null);
    const success = await activateCloudSync(inputKey.trim());
    setLoading(false);

    if (success) {
      setMsg({ type: 'success', text: 'Cloud Sync activated successfully!' });
      setTimeout(() => {
        setShowSyncModal(false);
      }, 1000);
    } else {
      setMsg({ type: 'error', text: 'Could not connect to database. Check your internet connection.' });
    }
  };

  const handleSyncNow = async () => {
    setLoading(true);
    await syncFromDB();
    setLoading(false);
    setMsg({ type: 'success', text: 'All notes synced with cloud!' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#DCE8D8] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#F8FAF6] border-b border-[#E6EDE3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FrogMascot mood="happy" size={28} />
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
          {cloudSyncEnabled ? (
            /* Active State */
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#E2F6D8] border border-[#A8D8AC] flex items-center justify-center mx-auto text-[#284E34]">
                <CloudCheck size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-rounded font-extrabold text-lg text-[#284E34]">
                  {t.cloudActiveTitle}
                </h3>
                <p className="text-xs text-[#627D68] mt-1 font-medium">
                  {t.cloudActiveSub}
                </p>
              </div>

              <div className="bg-[#F8FAF6] p-3.5 rounded-2xl border border-[#E0E8DC] text-left text-xs space-y-2">
                <div className="flex items-center justify-between text-[#738E78] font-bold text-[11px] uppercase">
                  <span>Mã kích hoạt</span>
                  <span className="flex items-center gap-1 text-[#3E6848] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#5E9B47] animate-pulse" />
                    Đang kết nối
                  </span>
                </div>
                <div className="font-mono font-bold text-[#284E34] text-xs">
                  {syncKey.length > 8 ? syncKey.slice(0, 8) + '••••••••' : syncKey || 'FROGI-DEFAULT'}
                </div>

                <div className="pt-2 border-t border-[#E8EDE5] flex items-center justify-between text-[11px] font-bold text-[#557159]">
                  <span>Dữ liệu đồng bộ:</span>
                  <span className="text-[#284E34]">
                    {notes.length} ghi chú • {diaryEntries.length} nhật ký
                  </span>
                </div>

                <div className="text-[10.5px] text-[#7A9380] flex items-center justify-between">
                  <span>Cơ sở dữ liệu:</span>
                  <span className="font-mono text-[10px]">Turso LibSQL (Tokyo)</span>
                </div>
              </div>

              {msg && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-semibold text-center ${
                    msg.type === 'success'
                      ? 'bg-[#E2F6D8] text-[#284E34]'
                      : 'bg-[#FEE2E2] text-[#DC2626]'
                  }`}
                >
                  {msg.text}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSyncNow}
                  disabled={loading}
                  className="flex-1 py-2 text-xs font-bold bg-[#3E6848] hover:bg-[#32553A] text-white rounded-full shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                  <span>{loading ? 'Đang đồng bộ...' : t.cloudSyncNow}</span>
                </button>
                <button
                  type="button"
                  onClick={disableCloudSync}
                  className="px-4 py-2 text-xs font-bold text-[#DC2626] hover:bg-[#FEE2E2] rounded-full transition-colors"
                >
                  {t.cloudDisconnect}
                </button>
              </div>
            </div>
          ) : (
            /* Inactive / Free Offline State */
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#EFF5ED] border border-[#D5E1D2] flex items-center justify-center mx-auto text-[#4A6E50] mb-2">
                  <Cloud size={24} />
                </div>
                <h3 className="font-rounded font-extrabold text-base text-[#284E34]">
                  {t.cloudInactiveTitle}
                </h3>
                <p className="text-xs text-[#627D68] mt-1 leading-relaxed">
                  {t.cloudInactiveSub}
                </p>

                {/* Database Infrastructure Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0F7EE] border border-[#D0E4CC] rounded-full text-[11px] font-bold text-[#284E34] mt-2">
                  <span className="w-2 h-2 rounded-full bg-[#5E9B47] animate-pulse" />
                  <span>Hạ tầng: Turso LibSQL Database (AWS Tokyo)</span>
                </div>
              </div>

              {/* Benefits list */}
              <div className="bg-[#F8FAF6] p-3.5 rounded-2xl border border-[#E0E8DC] space-y-2 text-xs font-semibold text-[#284E34]">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-[#5E9B47]" />
                  <span>{t.cloudBenefit1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#5E9B47]" />
                  <span>{t.cloudBenefit2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Key size={14} className="text-[#5E9B47]" />
                  <span>{t.cloudBenefit3}</span>
                </div>
              </div>

              {msg && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-semibold text-center ${
                    msg.type === 'success'
                      ? 'bg-[#E2F6D8] text-[#284E34]'
                      : 'bg-[#FEE2E2] text-[#DC2626]'
                  }`}
                >
                  {msg.text}
                </div>
              )}

              {/* Activation Form */}
              <form onSubmit={handleActivate} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#738E78] mb-1">
                    {t.cloudKeyLabel}
                  </label>
                  <input
                    type="text"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder={t.cloudKeyPlaceholder}
                    className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#D5E1D2] focus:border-[#5E9B47] focus:outline-none bg-[#FCFDFB]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 text-xs font-bold bg-[#3E6848] hover:bg-[#32553A] text-white rounded-full shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <Key size={13} />
                    <span>{loading ? 'Đang kích hoạt...' : t.cloudActivateBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSyncModal(false)}
                    className="px-4 py-2 text-xs font-bold text-[#5B7360] hover:bg-black/5 rounded-full transition-colors"
                  >
                    {t.cloudFreeBtn}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
