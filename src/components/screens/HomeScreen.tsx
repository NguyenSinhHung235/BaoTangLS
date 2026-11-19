import { useState, type FormEvent } from 'react';
import { ArrowRight, BookOpen, FolderOpen, Search, ShieldCheck } from 'lucide-react';
import type { ArtifactRecord, ScreenId } from '../../types/artifact';
import {
  ARTIFACT_CATEGORIES,
  MISSING_DATA_TEXT,
  computeRecordCompletion,
  hasValue,
} from '../../utils/artifactHelpers';
import { ArtifactPhotoFrame } from '../ArtifactPhotoFrame';
import { StatusText } from '../StatusText';

interface HomeScreenProps {
  records: ArtifactRecord[];
  onNavigate: (screen: ScreenId) => void;
  onSearchToList: (query: string, category?: string) => void;
  onSelectArtifact: (maHoSo: string) => void;
}

export function HomeScreen({
  records,
  onNavigate,
  onSearchToList,
  onSelectArtifact,
}: HomeScreenProps) {
  const [searchInput, setSearchInput] = useState('');

  const totalCount = records.length;
  const stats = records.map((r) => ({
    record: r,
    completion: computeRecordCompletion(r),
  }));

  const withDataCount = stats.filter((s) => s.completion.hasAnyInput).length;
  const verifiedSourceCount = stats.filter(
    (s) => s.record.mucKiemChung === 'da_xac_minh' && s.completion.hasAnyInput
  ).length;
  const incompleteFieldsCount = stats.filter(
    (s) => s.completion.percent < 100
  ).length;

  // Featured artifacts ONLY show verified records that have real names
  const featuredRecords = stats.filter(
    (s) =>
      s.record.mucKiemChung === 'da_xac_minh' &&
      hasValue(s.record.tenHienVat)
  );

  // Build real category counts from populated records, or fallback to ARTIFACT_CATEGORIES
  const dynamicCategories = Array.from(
    new Set(
      records
        .map((r) => r.loaiHienVat?.trim())
        .filter((v): v is string => Boolean(v && v.length > 0))
    )
  );
  const categoriesToDisplay =
    dynamicCategories.length > 0 ? dynamicCategories : [...ARTIFACT_CATEGORIES];

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    const exactCode = records.find(
      (r) => r.maHoSo.toLowerCase() === trimmed.toLowerCase()
    );
    if (exactCode) {
      onSelectArtifact(exactCode.maHoSo);
      return;
    }
    onSearchToList(trimmed);
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      {/* Institutional Hero */}
      <section className="border-b border-[#DDD6C8] pb-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7C2D12]">
              BẢO TÀNG LS · Cổng hồ sơ số di sản
            </p>
            <h1 className="mt-4 font-serif text-3xl font-semibold leading-tight tracking-tight text-[#1C1917] sm:text-4xl lg:text-5xl text-balance">
              Hồ sơ số hiện vật tiêu biểu Bảo tàng tỉnh Lạng Sơn
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#44403C]">
              Nền tảng lưu trữ, chuẩn hóa và giới thiệu hồ sơ số cho 15 hiện vật
              tiêu biểu của Bảo tàng tỉnh Lạng Sơn. Hệ thống được xây dựng theo
              chuẩn siêu dữ liệu Dublin Core kết hợp trường kiểm kê bảo tàng,
              phục vụ công tác quản lý, nghiên cứu học thuật và tra cứu công
              chúng.
            </p>

            {/* Primary Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-7 flex max-w-xl flex-col gap-2 sm:flex-row"
            >
              <label htmlFor="home-artifact-search" className="sr-only">
                Tìm kiếm hiện vật theo tên hoặc mã hồ sơ
              </label>
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716C]"
                  aria-hidden="true"
                />
                <input
                  id="home-artifact-search"
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tìm theo mã hồ sơ (HS001–HS015) hoặc tên hiện vật..."
                  className="h-11 w-full rounded-md border border-[#C7BEB0] bg-[#FFFFFF] pl-10 pr-4 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#7C2D12] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#7C2D12] px-5 text-sm font-medium text-[#FBF9F5] whitespace-nowrap shrink-0 hover:bg-[#5E220D] transition-colors cursor-pointer"
              >
                <span>Tìm kiếm</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-4">
            <div className="border border-[#DDD6C8] bg-[#F4F0E8] p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#57534E]">
                Trạng thái dữ liệu bộ sưu tập
              </p>
              <p className="mt-2 font-serif text-lg font-medium text-[#1C1917]">
                {withDataCount === 0
                  ? 'Giai đoạn 1: Khung hồ sơ & Cấu trúc dữ liệu'
                  : `Đã nạp dữ liệu ${withDataCount}/15 hiện vật tiêu biểu`}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#57534E]">
                {withDataCount === 0
                  ? 'Đã khởi tạo sẵn 15 vị trí hồ sơ (HS001–HS015). Chưa nhập dữ liệu hiện vật thực tế để bảo đảm tính xác thực tư liệu.'
                  : 'Đã cập nhật thông tin mô tả, niên đại, chất liệu và nguồn tham khảo cho 15 hiện vật. Các trường số đăng ký, tình trạng bản gốc, ảnh thật và quyền công bố còn thiếu vẫn giữ trạng thái chờ bổ sung.'}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('list')}
                  className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-semibold text-[#7C2D12] hover:underline cursor-pointer"
                >
                  <span>Xem danh sách 15 hồ sơ</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Statistics Strip */}
        <div className="mt-10 grid grid-cols-2 gap-4 border-t border-[#DDD6C8] pt-8 lg:grid-cols-4">
          <div className="border border-[#DDD6C8] bg-[#FFFFFF] p-5">
            <p className="text-xs font-medium text-[#57534E]">
              Tổng số vị trí hồ sơ
            </p>
            <p className="mt-2 font-serif text-3xl font-semibold text-[#1C1917] tabular-nums">
              {totalCount}
            </p>
            <p className="mt-1 font-mono text-xs text-[#78716C]">
              HS001 – HS015
            </p>
          </div>

          <div className="border border-[#DDD6C8] bg-[#FFFFFF] p-5">
            <p className="text-xs font-medium text-[#57534E]">
              Hồ sơ đã có dữ liệu
            </p>
            <p className="mt-2 font-serif text-3xl font-semibold text-[#1C1917] tabular-nums">
              {withDataCount}
            </p>
            <p className="mt-1 text-xs text-[#78716C]">
              Có thông tin mô tả & định danh
            </p>
          </div>

          <div className="border border-[#DDD6C8] bg-[#FFFFFF] p-5">
            <p className="text-xs font-medium text-[#57534E]">
              Hồ sơ đã kiểm chứng nguồn
            </p>
            <p className="mt-2 font-serif text-3xl font-semibold text-[#14532D] tabular-nums">
              {verifiedSourceCount}
            </p>
            <p className="mt-1 text-xs text-[#78716C]">
              Đã đối chiếu tư liệu công bố / gốc
            </p>
          </div>

          <div className="border border-[#DDD6C8] bg-[#FFFFFF] p-5">
            <p className="text-xs font-medium text-[#57534E]">
              Hồ sơ còn thiếu trường chi tiết
            </p>
            <p className="mt-2 font-serif text-3xl font-semibold text-[#7C2D12] tabular-nums">
              {incompleteFieldsCount}
            </p>
            <p className="mt-1 text-xs text-[#78716C]">
              Thiếu ảnh thật, số ĐK, quyền công bố
            </p>
          </div>
        </div>
      </section>

      {/* Project Goal & 15-Artifact Collection Introduction */}
      <section className="grid grid-cols-1 gap-10 border-b border-[#DDD6C8] py-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#7C2D12]">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>Mục tiêu dự án</span>
          </div>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-[#1C1917] text-balance">
            Chuẩn hóa hồ sơ hiện vật phục vụ bảo tồn và nghiên cứu
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#44403C]">
            BẢO TÀNG LS hướng tới xây dựng không gian tra cứu minh bạch, chính
            xác cho cán bộ bảo tàng, nhà nghiên cứu lịch sử – văn hóa, giảng
            viên, sinh viên và công chúng quan tâm đến di sản tỉnh Lạng Sơn.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#44403C]">
            Mỗi hiện vật được tổ chức thành một hồ sơ độc lập theo 15 trường
            chuẩn quốc tế Dublin Core và hệ thống trường kiểm kê chuyên ngành,
            tách bạch giữa tư liệu gốc đã xác minh với các nội dung chờ thẩm
            định.
          </p>
        </div>

        <div className="lg:col-span-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#7C2D12]">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            <span>Bộ sưu tập 15 hiện vật</span>
          </div>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-[#1C1917] text-balance">
            Nguyên tắc liêm chính dữ liệu và bản quyền hình ảnh
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-[#44403C]">
            <li>
              · Mọi trường thông tin chưa được cung cấp tư liệu xác thực đều
              hiển thị rõ trạng thái <strong className="font-semibold text-[#1C1917]">“{MISSING_DATA_TEXT}”</strong>.
            </li>
            <li>
              · Phân biệt rõ bốn trạng thái bản hiện vật: Bản gốc, Bản sao, Bản
              số của gốc và Bản số của sao.
            </li>
            <li>
              · Không sử dụng hình ảnh do AI tạo ra thay cho ảnh hiện vật thật;
              mọi ảnh công bố đều gắn nguồn và phạm vi cấp phép.
            </li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('sources')}
              className="rounded-md border border-[#C7BEB0] bg-[#FFFFFF] px-4 py-2 text-sm font-medium text-[#1C1917] hover:bg-[#F4F0E8] transition-colors cursor-pointer"
            >
              Xem nguồn tư liệu & quyền công bố
            </button>
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="rounded-md border border-[#C7BEB0] bg-[#FFFFFF] px-4 py-2 text-sm font-medium text-[#1C1917] hover:bg-[#F4F0E8] transition-colors cursor-pointer"
            >
              Giới thiệu dự án
            </button>
          </div>
        </div>
      </section>

      {/* Classification Categories */}
      <section className="border-b border-[#DDD6C8] py-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#57534E]">
              Khung phân loại lưu trữ
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-[#1C1917]">
              Danh mục phân loại hiện vật
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('list')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#7C2D12] hover:underline cursor-pointer"
          >
            <span>Xem toàn bộ 15 vị trí hồ sơ</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoriesToDisplay.map((cat) => {
            const countInCategory = records.filter(
              (r) =>
                (r.loaiHienVat ?? '').toLowerCase() === cat.toLowerCase()
            ).length;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSearchToList('', cat)}
                className="flex items-center justify-between border border-[#DDD6C8] bg-[#FFFFFF] p-5 text-left transition-colors hover:border-[#7C2D12] hover:bg-[#F4F0E8]/50 cursor-pointer"
              >
                <div>
                  <p className="font-serif text-lg font-medium text-[#1C1917]">
                    {cat}
                  </p>
                  <p className="mt-1 text-xs text-[#57534E] tabular-nums">
                    {countInCategory > 0
                      ? `${countInCategory} hồ sơ hiện vật`
                      : `0 hồ sơ · ${MISSING_DATA_TEXT}`}
                  </p>
                </div>
                <FolderOpen
                  className="h-5 w-5 shrink-0 text-[#8C8377]"
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Artifacts Section — Explicitly empty when no verified data exists */}
      <section className="pt-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#57534E]">
              Tuyển chọn trưng bày số
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-[#1C1917]">
              Hiện vật nổi bật
            </h2>
          </div>
          <p className="text-xs text-[#57534E]">
            Chỉ hiển thị các hồ sơ đã được cung cấp tư liệu và xác minh
          </p>
        </div>

        {featuredRecords.length === 0 ? (
          <div className="mt-6 border border-dashed border-[#C7BEB0] bg-[#F4F0E8]/60 px-6 py-12 text-center">
            <p className="font-serif text-xl font-medium text-[#1C1917]">
              Chưa có hiện vật nổi bật để hiển thị
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#57534E]">
              Khu vực này được giữ trống có chủ đích cho đến khi danh sách 15
              hiện vật tiêu biểu của Bảo tàng tỉnh Lạng Sơn cùng hình ảnh và tư
              liệu gốc được cung cấp, kiểm chứng và cấp phép công bố.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('list')}
                className="rounded-md bg-[#7C2D12] px-4 py-2 text-sm font-medium text-[#FBF9F5] hover:bg-[#5E220D] transition-colors cursor-pointer"
              >
                Mở danh sách 15 khung hồ sơ
              </button>
              <button
                type="button"
                onClick={() => onNavigate('manage')}
                className="rounded-md border border-[#C7BEB0] bg-[#FFFFFF] px-4 py-2 text-sm font-medium text-[#1C1917] hover:bg-[#F4F0E8] transition-colors cursor-pointer"
              >
                Quản lý & nhập dữ liệu
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredRecords.slice(0, 3).map(({ record, completion }) => (
              <article
                key={record.maHoSo}
                className="flex flex-col border border-[#DDD6C8] bg-[#FFFFFF] p-5"
              >
                <div className="mb-3 flex items-center justify-between text-xs text-[#57534E]">
                  <span className="font-mono font-medium text-[#1C1917]">
                    {record.maHoSo}
                  </span>
                  <StatusText status={completion.statusKey} />
                </div>
                <ArtifactPhotoFrame
                  maHoSo={record.maHoSo}
                  images={record.danhSachAnh}
                  defaultCaption={record.chuThichAnh}
                  defaultSource={record.nguonAnh}
                  compact
                />
                <h3 className="mt-4 font-serif text-xl font-semibold text-[#1C1917]">
                  {record.tenHienVat}
                </h3>
                <p className="mt-1 text-xs text-[#57534E]">
                  {record.nienDai || MISSING_DATA_TEXT} ·{' '}
                  {record.chatLieu || MISSING_DATA_TEXT}
                </p>
                <button
                  type="button"
                  onClick={() => onSelectArtifact(record.maHoSo)}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#7C2D12] hover:underline cursor-pointer"
                >
                  <span>Xem hồ sơ chi tiết</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
