import React, { useState } from 'react';
import { User, Sparkles, ChevronDown } from 'lucide-react';
import { FrogMascot } from '../mascots/FrogMascot';
import { useNotesStore } from '../../stores/useNotesStore';
import { useAuthStore } from '../../stores/useAuthStore';
import {
  OFFICIAL_DOWNLOAD_URL,
  WINDOWS_SETUP_URL,
  WINDOWS_DOWNLOAD_URL,
  MAC_ARM64_DOWNLOAD_URL,
  MAC_X64_DOWNLOAD_URL,
} from '../../lib/constants';

interface LandingHeaderProps {
  onDownloadClick?: () => void;
  onDemoClick?: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  onDownloadClick,
  onDemoClick,
}) => {
  const { currentUser, setShowAuthModal, setShowAccountModal } = useNotesStore();
  const { user: cloudUser, phase } = useAuthStore();
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const isCloudAuth = phase === 'authenticated' && cloudUser !== null;
  const activeUser = isCloudAuth ? cloudUser : currentUser;
  const isPro = (isCloudAuth && cloudUser?.plan === 'pro') || (!isCloudAuth && currentUser?.plan === 'pro');

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="w-full bg-[#FAF9F5]/90 backdrop-blur-md sticky top-0 z-50 border-b border-[#EBEFE8] transition-all">
      <div className="max-w-[1220px] mx-auto px-6 h-20 flex items-center justify-between">
        {/* Left: Logo */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('hero');
          }}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="transition-transform group-hover:scale-105">
            <FrogMascot mood="happy" size={34} />
          </div>
          <span className="font-rounded font-extrabold text-[21px] text-[#19271D] tracking-tight">
            FrogiNotes
          </span>
        </a>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[14.5px] font-medium text-[#4B5563]">
          <button
            type="button"
            onClick={() => scrollToSection('features')}
            className="hover:text-[#19271D] transition-colors cursor-pointer"
          >
            Tính năng
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('showcase')}
            className="hover:text-[#19271D] transition-colors cursor-pointer"
          >
            Giao diện
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('how-it-works')}
            className="hover:text-[#19271D] transition-colors cursor-pointer"
          >
            Hướng dẫn
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('donate')}
            className="hover:text-[#19271D] transition-colors cursor-pointer flex items-center gap-1 text-[#487850] font-bold"
          >
            <span>Ủng hộ ☕</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('download')}
            className="hover:text-[#19271D] transition-colors cursor-pointer"
          >
            Tải app
          </button>
        </nav>

        {/* Right: Auth / Account + Download CTA Button */}
        <div className="flex items-center gap-2.5">
          {activeUser ? (
            <button
              type="button"
              onClick={() => setShowAccountModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF5E5] hover:bg-[#DDEED5] border border-[#C8E2BF] text-xs font-bold text-[#284E34] transition-all cursor-pointer shadow-2xs"
              title="Quản lý tài khoản"
            >
              <FrogMascot mood={isPro ? "crown" : "happy"} size={22} />
              <span className="max-w-[100px] truncate">{activeUser.name || activeUser.email?.split('@')[0]}</span>
              {isPro ? (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#3D6E4A] text-white">
                  PRO 👑
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#DDE9D9] text-[#4F6A54]">
                  FREE
                </span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-[#355B3C] hover:bg-[#EEF5EA] border border-transparent hover:border-[#D5E4CE] transition-all cursor-pointer"
            >
              <User size={14} />
              <span>Đăng nhập</span>
            </button>
          )}

          {/* Download Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-[#3D6E4A] hover:bg-[#325A3C] text-white rounded-full text-xs font-bold shadow-[0_4px_14px_rgba(61,110,74,0.22)] hover:shadow-[0_6px_18px_rgba(61,110,74,0.32)] transition-all cursor-pointer active:scale-95"
            >
              {/* OS Icons */}
              <svg width="13" height="13" viewBox="0 0 88 88" fill="currentColor">
                <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 75.48.016 46.126zM40.97 6.425L87.95 0v41.528l-46.98.375zm47.01 45.421V88L40.97 81.428l.027-34.805z" />
              </svg>
              <span>Tải app</span>
              <ChevronDown size={13} className={`transition-transform duration-200 ${showDownloadMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showDownloadMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDownloadMenu(false)}
                />
                <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-[#DDE7DB] p-2 z-50 text-xs font-semibold text-[#19271D] space-y-1 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2.5 py-1 text-[10.5px] font-bold text-[#6D8B71] uppercase tracking-wider">
                    Chọn phiên bản
                  </div>

                  {/* Windows Installer Option */}
                  <a
                    href={WINDOWS_SETUP_URL}
                    onClick={() => {
                      setShowDownloadMenu(false);
                      onDownloadClick?.();
                    }}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F2F7EF] transition-colors group/item"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#EAF5E3] text-[#284E34] flex items-center justify-center font-bold">
                      ⚡
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-[#284E34] group-hover/item:text-[#1E3A27] flex items-center gap-1">
                        Windows Setup (.exe)
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-[#3D6E4A] text-white">Khuyên dùng</span>
                      </span>
                      <span className="text-[10px] text-[#7A9380]">Bộ cài tự động Windows 10 / 11</span>
                    </div>
                  </a>

                  {/* Windows Portable Option */}
                  <a
                    href={WINDOWS_DOWNLOAD_URL}
                    onClick={() => {
                      setShowDownloadMenu(false);
                      onDownloadClick?.();
                    }}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F2F7EF] transition-colors group/item"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#EAF5E3] text-[#284E34] flex items-center justify-center font-bold">
                      🪟
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-[#284E34] group-hover/item:text-[#1E3A27]">
                        Windows Portable (.zip)
                      </span>
                      <span className="text-[10px] text-[#7A9380]">Bản giải nén dùng ngay</span>
                    </div>
                  </a>

                  {/* Mac Apple Silicon Option */}
                  <a
                    href={MAC_ARM64_DOWNLOAD_URL}
                    onClick={() => {
                      setShowDownloadMenu(false);
                      onDownloadClick?.();
                    }}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F2F7EF] transition-colors group/item"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#EAF5E3] text-[#284E34] flex items-center justify-center font-bold">
                      🍏
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-[#284E34] group-hover/item:text-[#1E3A27]">
                        macOS Apple Silicon
                      </span>
                      <span className="text-[10px] text-[#7A9380]">Mac M1 / M2 / M3 / M4</span>
                    </div>
                  </a>

                  {/* Mac Intel Option */}
                  <a
                    href={MAC_X64_DOWNLOAD_URL}
                    onClick={() => {
                      setShowDownloadMenu(false);
                      onDownloadClick?.();
                    }}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F2F7EF] transition-colors group/item"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#EAF5E3] text-[#284E34] flex items-center justify-center font-bold">
                      🍏
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-[#284E34] group-hover/item:text-[#1E3A27]">
                        macOS Intel (x64)
                      </span>
                      <span className="text-[10px] text-[#7A9380]">Mac chạy chip Intel</span>
                    </div>
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
