import { useMemo } from 'react';
import { ArrowRight, RotateCcw, Search } from 'lucide-react';
import type { ArtifactRecord } from '../../types/artifact';
import {
  ARTIFACT_CATEGORIES,
  MISSING_DATA_TEXT,
  computeRecordCompletion,
  displayValue,
} from '../../utils/artifactHelpers';
import { ArtifactPhotoFrame } from '../ArtifactPhotoFrame';
import { StatusText } from '../StatusText';

interface ArtifactListScreenProps {
  records: ArtifactRecord[];
  searchQuery: string;
  onSearchQueryChange: (val: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (val: string) => void;
  eraFilter: string;
  onEraFilterChange: (val: string) => void;
  materialFilter: string;
  onMaterialFilterChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  onSelectArtifact: (maHoSo: string) => void;
}

export function ArtifactListScreen({
  records,
  searchQuery,
  onSearchQueryChange,
  categoryFilter,
  onCategoryFilterChange,
  eraFilter,
  onEraFilterChange,
  materialFilter,
  onMaterialFilterChange,
  statusFilter,
  onStatusFilterChange,
  onSelectArtifact,
}: ArtifactListScreenProps) {
  const uniqueEras = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.nienDai && r.nienDai.trim()) set.add(r.nienDai.trim());
    });
    return Array.from(set);
  }, [records]);

  const uniqueMaterials = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.chatLieu && r.chatLieu.trim()) set.add(r.chatLieu.trim());
    });
    return Array.from(set);
  }, [records]);

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>(ARTIFACT_CATEGORIES);
    records.forEach((r) => {
      if (r.loaiHienVat && r.loaiHienVat.trim()) set.add(r.loaiHienVat.trim());
    });
    return Array.from(set);
  }, [records]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return records.filter((rec) => {
      const completion = computeRecordCompletion(rec);

      if (q) {
        const hay = [
          rec.maHoSo,
          rec.maHienVat ?? '',
          rec.tenHienVat ?? '',
          rec.tenGoiKhac ?? '',
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      if (categoryFilter !== 'all') {
        const val = (rec.loaiHienVat ?? '').trim();
        if (categoryFilter === 'Chưa phân loại') {
          if (val !== '' && val !== 'Chưa phân loại') return false;
        } else if (val !== categoryFilter) {
          return false;
        }
      }

      if (eraFilter !== 'all') {
        if ((rec.nienDai ?? '').trim() !== eraFilter) return false;
      }

      if (materialFilter !== 'all') {
        if ((rec.chatLieu ?? '').trim() !== materialFilter) return false;
      }

      if (statusFilter !== 'all') {
        if (completion.statusKey !== statusFilter) return false;
      }

      return true;
    });
  }, [
    records,
    searchQuery,
    categoryFilter,
    eraFilter,
    materialFilter,
    statusFilter,
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    categoryFilter !== 'all' ||
    eraFilter !== 'all' ||
    materialFilter !== 'all' ||
    statusFilter !== 'all';

  const resetFilters = () => {
    onSearchQueryChange('');
    onCategoryFilterChange('all');
    onEraFilterChange('all');
    onMaterialFilterChange('all');
    onStatusFilterChange('all');
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-[#DDD6C8] pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7C2D12]">
          Mục lục bộ sưu tập · 15 vị trí hồ sơ
        </p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-[#1C1917] sm:text-4xl">
              Danh sách 15 hiện vật tiêu biểu
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#57534E]">
              Chuẩn bị sẵn 15 mã hồ sơ định danh từ HS001 đến HS015. Các trường
              chưa có tư liệu gốc hiển thị rõ “{MISSING_DATA_TEXT}”.
            </p>
          </div>
          <p className="font-mono text-sm text-[#57534E] tabular-nums">
            Đang hiển thị {filteredRecords.length} / {records.length} hồ sơ
          </p>
        </div>

        {/* Search and 4-Attribute Filters */}
        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
          <div className="relative sm:col-span-2 lg:col-span-4">
            <label htmlFor="list-search-input" className="sr-only">
              Tìm theo tên hoặc mã hiện vật
            </label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716C]"
              aria-hidden="true"
            />
            <input
              id="list-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Tìm theo tên hoặc mã (HS001–HS015)..."
              className="h-11 w-full rounded-md border border-[#C7BEB0] bg-[#FFFFFF] pl-9 pr-3 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#7C2D12] focus:outline-none"
            />
          </div>

          <div className="lg:col-span-2">
            <label htmlFor="filter-category" className="sr-only">
              Lọc theo loại hiện vật
            </label>
            <select
              id="filter-category"
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="h-11 w-full rounded-md border border-[#C7BEB0] bg-[#FFFFFF] px-3 text-sm text-[#1C1917] focus:border-[#7C2D12] focus:outline-none"
            >
              <option value="all">Loại: Tất cả</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label htmlFor="filter-era" className="sr-only">
              Lọc theo niên đại
            </label>
            <select
              id="filter-era"
              value={eraFilter}
              onChange={(e) => onEraFilterChange(e.target.value)}
              className="h-11 w-full rounded-md border border-[#C7BEB0] bg-[#FFFFFF] px-3 text-sm text-[#1C1917] focus:border-[#7C2D12] focus:outline-none"
            >
              <option value="all">Niên đại: Tất cả</option>
              {uniqueEras.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label htmlFor="filter-material" className="sr-only">
              Lọc theo chất liệu
            </label>
            <select
              id="filter-material"
              value={materialFilter}
              onChange={(e) => onMaterialFilterChange(e.target.value)}
              className="h-11 w-full rounded-md border border-[#C7BEB0] bg-[#FFFFFF] px-3 text-sm text-[#1C1917] focus:border-[#7C2D12] focus:outline-none"
            >
              <option value="all">Chất liệu: Tất cả</option>
              {uniqueMaterials.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label htmlFor="filter-status" className="sr-only">
              Lọc theo tình trạng hồ sơ
            </label>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="h-11 w-full rounded-md border border-[#C7BEB0] bg-[#FFFFFF] px-3 text-sm text-[#1C1917] focus:border-[#7C2D12] focus:outline-none"
            >
              <option value="all">Tình trạng: Tất cả</option>
              <option value="thieu_du_lieu">Còn thiếu dữ liệu</option>
              <option value="cho_xac_minh">Chờ xác minh</option>
              <option value="hoan_thien">Đã hoàn thiện</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-3 flex items-center justify-between text-xs text-[#57534E]">
            <span>Đang áp dụng bộ lọc tra cứu.</span>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 font-medium text-[#7C2D12] hover:underline cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Xóa bộ lọc</span>
            </button>
          </div>
        )}
      </div>

      {/* Artifact Grid */}
      {filteredRecords.length === 0 ? (
        <div className="mt-10 border border-dashed border-[#C7BEB0] bg-[#F4F0E8]/60 px-6 py-14 text-center">
          <p className="font-serif text-xl font-medium text-[#1C1917]">
            Không có hồ sơ phù hợp với điều kiện lọc hiện tại
          </p>
          <p className="mt-2 text-sm text-[#57534E]">
            Hiện tại các hồ sơ chưa có dữ liệu chi tiết về niên đại hoặc chất
            liệu. Bạn có thể đặt lại bộ lọc để xem lại toàn bộ 15 vị trí hồ sơ.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 rounded-md bg-[#7C2D12] px-4 py-2 text-sm font-medium text-[#FBF9F5] hover:bg-[#5E220D] cursor-pointer"
          >
            Hiển thị lại 15 hồ sơ
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecords.map((record) => {
            const completion = computeRecordCompletion(record);
            return (
              <article
                key={record.maHoSo}
                className="flex flex-col justify-between border border-[#DDD6C8] bg-[#FFFFFF] p-5 transition-colors hover:border-[#A89F91]"
              >
                <div>
                  {/* Quiet top metadata line (Zero-pill) */}
                  <div className="mb-3 flex items-center justify-between gap-2 border-b border-[#EFECE6] pb-2.5 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono font-semibold text-[#1C1917]">
                        {record.maHoSo}
                      </span>
                      <span aria-hidden="true" className="text-[#C7BEB0]">
                        ·
                      </span>
                      <span className="truncate text-[#57534E]">
                        Mã HV: {displayValue(record.maHienVat)}
                      </span>
                    </div>
                    <StatusText status={completion.statusKey} className="shrink-0" />
                  </div>

                  {/* Image Frame */}
                  <ArtifactPhotoFrame
                    maHoSo={record.maHoSo}
                    images={record.danhSachAnh}
                    defaultCaption={record.chuThichAnh}
                    defaultSource={record.nguonAnh}
                    compact
                  />

                  {/* Title */}
                  <h2 className="mt-4 font-serif text-xl font-semibold leading-snug text-[#1C1917]">
                    {displayValue(record.tenHienVat)}
                  </h2>

                  {/* Definition metadata rows */}
                  <dl className="mt-4 divide-y divide-[#EFECE6] border-t border-[#EFECE6] text-xs">
                    <div className="flex items-center justify-between gap-4 py-2">
                      <dt className="text-[#57534E]">Niên đại</dt>
                      <dd className="text-right font-medium text-[#1C1917]">
                        {displayValue(record.nienDai)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2">
                      <dt className="text-[#57534E]">Chất liệu</dt>
                      <dd className="text-right font-medium text-[#1C1917]">
                        {displayValue(record.chatLieu)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2">
                      <dt className="text-[#57534E]">Loại hiện vật</dt>
                      <dd className="text-right font-medium text-[#1C1917]">
                        {displayValue(record.loaiHienVat)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2">
                      <dt className="text-[#57534E]">Mức hoàn thiện</dt>
                      <dd className="font-mono text-right text-[#57534E] tabular-nums">
                        {completion.filled}/{completion.total} trường ({completion.percent}%)
                      </dd>
                    </div>
                  </dl>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectArtifact(record.maHoSo)}
                  className="mt-5 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md border border-[#C7BEB0] bg-[#FBF9F5] px-4 py-2 text-sm font-medium text-[#1C1917] transition-colors hover:border-[#7C2D12] hover:bg-[#7C2D12] hover:text-[#FBF9F5] cursor-pointer"
                >
                  <span>Xem chi tiết hồ sơ</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
