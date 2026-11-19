import type { ScreenId } from '../types/artifact';

interface FooterProps {
  onNavigate: (screen: ScreenId) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="mt-20 border-t border-[#DDD6C8] bg-[#F4F0E8]/70">
      <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="font-serif text-lg font-bold text-[#1C1917]">
              BẢO TÀNG LS
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-[#57534E]">
              Hồ sơ số cho 15 hiện vật tiêu biểu của Bảo tàng tỉnh Lạng Sơn.
              Nền tảng lưu trữ chuẩn hóa siêu dữ liệu Dublin Core và kiểm kê
              hiện vật phục vụ nghiên cứu, giáo dục và công chúng.
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#57534E]">
              Danh mục màn hình
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[#1C1917]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#7C2D12] transition-colors cursor-pointer"
                >
                  Trang chủ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('list')}
                  className="hover:text-[#7C2D12] transition-colors cursor-pointer"
                >
                  Danh sách 15 hiện vật
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('qa')}
                  className="hover:text-[#7C2D12] transition-colors cursor-pointer"
                >
                  Tra cứu và hỏi đáp
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#57534E]">
              Quản trị & Tư liệu
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[#1C1917]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('sources')}
                  className="hover:text-[#7C2D12] transition-colors cursor-pointer"
                >
                  Nguồn tư liệu & Quyền công bố
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#7C2D12] transition-colors cursor-pointer"
                >
                  Giới thiệu dự án
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('manage')}
                  className="hover:text-[#7C2D12] transition-colors cursor-pointer"
                >
                  Quản lý dữ liệu & Xuất hồ sơ
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-[#DDD6C8] pt-6 text-xs text-[#57534E] sm:flex-row sm:items-center sm:justify-between">
          <p>
            BẢO TÀNG LS — Hồ sơ số cho 15 hiện vật tiêu biểu của Bảo tàng tỉnh
            Lạng Sơn.
          </p>
          <p>
            Tuân thủ nguyên tắc không suy diễn tư liệu và bảo vệ quyền công bố
            hình ảnh.
          </p>
        </div>
      </div>
    </footer>
  );
}
