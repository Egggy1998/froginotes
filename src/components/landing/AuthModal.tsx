import React, { useState } from 'react';
import { X, Mail, Lock, User, Check, ArrowRight, Sparkles } from 'lucide-react';
import { useNotesStore } from '../../stores/useNotesStore';
import { FrogMascot } from '../mascots/FrogMascot';

export const AuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, login, activateCloudSync } = useNotesStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!showAuthModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      login(email.trim(), name.trim() || undefined, 'pro');
      // Auto enable cloud sync with generated key
      activateCloudSync('FROGI-' + email.split('@')[0].toUpperCase());
      setLoading(false);
      setShowAuthModal(false);
    }, 600);
  };

  const handleQuickDemo = () => {
    setLoading(true);
    setTimeout(() => {
      login('egggy@froginotes.com', 'Hồng Quảng', 'pro');
      activateCloudSync('FROGI-EGGY-2026');
      setLoading(false);
      setShowAuthModal(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-[28px] shadow-[0_20px_60px_rgba(35,60,38,0.22)] border border-[#DCE8D8] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-3 bg-gradient-to-b from-[#F4F9F1] to-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E2F2D4] border border-[#C2E2AE] flex items-center justify-center shadow-2xs">
              <FrogMascot mood={mode === 'login' ? 'happy' : 'party'} size={28} />
            </div>
            <div>
              <h2 className="font-rounded font-extrabold text-[17px] text-[#19271D]">
                {mode === 'login' ? 'Chào mừng bạn trở lại! 🍃' : 'Tạo tài khoản FrogiNotes ✨'}
              </h2>
              <p className="font-handwriting text-xs text-[#5E9B47]">
                {mode === 'login' ? 'Đăng nhập để đồng bộ ghi chú đám mây' : 'Tham gia cùng cộng đồng ghi chú dễ thương'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAuthModal(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-[#5B7360] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-2">
          <div className="flex rounded-xl bg-[#F0F5EE] p-1 border border-[#DFE8DC]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#284E34] shadow-xs'
                  : 'text-[#6C8570] hover:text-[#284E34]'
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-[#284E34] shadow-xs'
                  : 'text-[#6C8570] hover:text-[#284E34]'
              }`}
            >
              Tạo tài khoản
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 select-text">
          {error && (
            <div className="p-2.5 rounded-xl bg-[#FEE2E2] text-[#DC2626] text-xs font-bold text-center">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6D8B71] mb-1">
                Tên hiển thị
              </label>
              <div className="relative flex items-center">
                <User size={15} className="absolute left-3.5 text-[#88A28C]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Hồng Quảng"
                  className="w-full pl-10 pr-3.5 py-2 text-xs font-semibold rounded-xl border border-[#D5E1D2] focus:border-[#5E9B47] focus:outline-none bg-[#FCFDFB]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6D8B71] mb-1">
              Email
            </label>
            <div className="relative flex items-center">
              <Mail size={15} className="absolute left-3.5 text-[#88A28C]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenban@gmail.com"
                className="w-full pl-10 pr-3.5 py-2 text-xs font-semibold rounded-xl border border-[#D5E1D2] focus:border-[#5E9B47] focus:outline-none bg-[#FCFDFB]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6D8B71] mb-1">
              Mật khẩu
            </label>
            <div className="relative flex items-center">
              <Lock size={15} className="absolute left-3.5 text-[#88A28C]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự..."
                className="w-full pl-10 pr-3.5 py-2 text-xs font-semibold rounded-xl border border-[#D5E1D2] focus:border-[#5E9B47] focus:outline-none bg-[#FCFDFB]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-xs font-bold bg-[#3E6848] hover:bg-[#32553A] text-white rounded-full shadow-[0_4px_16px_rgba(62,104,72,0.25)] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 mt-2"
          >
            <span>{loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập ngay' : 'Tạo tài khoản miễn phí'}</span>
            <ArrowRight size={13} />
          </button>

          {/* Quick Demo Button */}
          <div className="pt-2 border-t border-[#EEF4EC]">
            <button
              type="button"
              onClick={handleQuickDemo}
              disabled={loading}
              className="w-full py-2 text-xs font-bold bg-[#F4F9F1] hover:bg-[#EAF4E5] text-[#284E34] border border-[#D2E4CE] rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={13} className="text-amber-500" />
              <span>Đăng nhập nhanh tài khoản mẫu (1-Click)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
