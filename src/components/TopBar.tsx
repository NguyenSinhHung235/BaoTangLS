import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { ScreenId } from '../types/artifact';

interface TopBarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

const NAV_ITEMS: Array<{ id: ScreenId; label: string }> = [
  { id: 'home', label: 'Trang chủ' },
  { id: 'list', label: '15 Hiện vật' },
  { id: 'qa', label: 'Hỏi đáp' },
  { id: 'sources', label: 'Nguồn tư liệu' },
  { id: 'about', label: 'Giới thiệu' },
];

export function TopBar({ currentScreen, onNavigate }: TopBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id: ScreenId) => {
    setMobileOpen(false);
    onNavigate(id);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#DDD6C8] bg-[#FBF9F5]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand wordmark only */}
        <button
          type="button"
          onClick={() => handleNav('home')}
          className="font-serif text-xl font-bold tracking-tight text-[#1C1917] whitespace-nowrap shrink-0 hover:text-[#7C2D12] transition-colors cursor-pointer"
        >
          BẢO TÀNG LS
        </button>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const isActive =
              currentScreen === item.id ||
              (item.id === 'list' && currentScreen === 'detail');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#7C2D12] font-semibold'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[19px] h-[2px] bg-[#7C2D12]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action + mobile drawer trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleNav('manage')}
            className={`hidden sm:inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              currentScreen === 'manage'
                ? 'bg-[#1C1917] text-[#FBF9F5]'
                : 'bg-[#7C2D12] text-[#FBF9F5] hover:bg-[#5E220D]'
            }`}
          >
            Quản lý hồ sơ
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[#DDD6C8] text-[#1C1917] md:hidden hover:bg-[#F4F0E8] cursor-pointer"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-[#DDD6C8] bg-[#FBF9F5] px-4 py-4 md:hidden">
          <nav aria-label="Điều hướng di động" className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                currentScreen === item.id ||
                (item.id === 'list' && currentScreen === 'detail');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item.id)}
                  className={`flex min-h-[44px] items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#F4F0E8] text-[#7C2D12] font-semibold'
                      : 'text-[#1C1917] hover:bg-[#F4F0E8]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="text-xs text-[#7C2D12]">Đang xem</span>
                  )}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => handleNav('manage')}
              className="mt-2 flex min-h-[44px] items-center justify-center rounded-md bg-[#7C2D12] px-4 py-2.5 text-sm font-medium text-[#FBF9F5] hover:bg-[#5E220D] cursor-pointer"
            >
              Quản lý dữ liệu & Xuất hồ sơ
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
