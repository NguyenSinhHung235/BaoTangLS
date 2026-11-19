import { useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Edit3,
  ShieldAlert,
} from 'lucide-react';
import type { ArtifactRecord } from '../../types/artifact';
import {
  DUBLIN_CORE_FIELDS,
  MISSING_DATA_TEXT,
  computeRecordCompletion,
  getVerificationText,
  hasValue,
} from '../../utils/artifactHelpers';
import { ArtifactPhotoFrame } from '../ArtifactPhotoFrame';
import { StatusText } from '../StatusText';

interface ArtifactDetailScreenProps {
  records: ArtifactRecord[];
  selectedMaHoSo: string;
  onSelectArtifact: (maHoSo: string) => void;
  onBackToList: () => void;
  onEditInManager: (maHoSo: string) => void;
}

interface FieldRowProps {
  label: string;
  value: string | null | undefined;
  recordVerification: ArtifactRecord['mucKiemChung'];
  securityNote?: string;
}

function FieldRow({
  label,
  value,
  recordVerification,
  securityNote,
}: FieldRowProps) {
  const present = hasValue(value);
  const fieldStatus = !present
    ? 'thieu_du_lieu'
    : recordVerification === 'da_xac_minh'
      ? 'da_xac_minh'
      : 'cho_xac_minh';

  return (
    <div className="grid grid-cols-1 gap-2 py-3.5 sm:grid-cols-12 sm:gap-6">
      <dt className="text-xs font-semibold text-[#57534E] sm:col-span-4">
        <span>{label}</span>
        <div className="mt-1">
          <StatusText status={fieldStatus} />
        </div>
      </dt>
      <dd className="text-sm leading-relaxed sm:col-span-8">
        {present ? (
          <span className="whitespace-pre-line text-[#1C1917]">{value}</span>
        ) : (
          <span className="italic text-[#78716C]">{MISSING_DATA_TEXT}</span>
        )}
        {securityNote && (
          <p className="mt-1.5 flex items-start gap-1.5 text-xs text-[#78716C]">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#92400E]" aria-hidden="true" />
            <span>{securityNote}</span>
          </p>
        )}
      </dd>
    </div>
  );
}

export function ArtifactDetailScreen({
  records,
  selectedMaHoSo,
  onSelectArtifact,
  onBackToList,
  onEditInManager,
}: ArtifactDetailScreenProps) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'dublin_core'>(
    'inventory'
  );

  const currentIdx = Math.max(
    0,
    records.findIndex((r) => r.maHoSo === selectedMaHoSo)
  );
  const record = records[currentIdx] ?? records[0];
  const completion = computeRecordCompletion(record);

  const prevRecord = currentIdx > 0 ? records[currentIdx - 1] : null;
  const nextRecord =
    currentIdx < records.length - 1 ? records[currentIdx + 1] : null;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      {/* Top Action & Quick Record Switcher */}
      <div className="flex flex-col gap-4 border-b border-[#DDD6C8] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBackToList}
          className="inline-flex min-h-[40px] items-center gap-2 text-sm font-medium text-[#57534E] hover:text-[#1C1917] cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Quay lại danh sách 15 hiện vật</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!prevRecord}
            onClick={() => prevRecord && onSelectArtifact(prevRecord.maHoSo)}
            className="inline-flex h-10 items-center gap-1 rounded-md border border-[#C7BEB0] bg-[#FFFFFF] px-3 text-xs font-medium text-[#1C1917] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F4F0E8] cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span>{prevRecord ? prevRecord.maHoSo : 'Đầu'}</span>
          </button>

          <label htmlFor="detail-jump-select" className="sr-only">
            Chọn nhanh mã hồ sơ
          </label>
          <select
            id="detail-jump-select"
            value={record.maHoSo}
            onChange={(e) => onSelectArtifact(e.target.value)}
            className="h-10 rounded-md border border-[#C7BEB0] bg-[#FFFFFF] px-3 font-mono text-xs font-medium text-[#1C1917] focus:border-[#7C2D12] focus:outline-none"
          >
            {records.map((r) => (
              <option key={r.maHoSo} value={r.maHoSo}>
                {r.maHoSo} — {r.tenHienVat ? r.tenHienVat : MISSING_DATA_TEXT}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={!nextRecord}
            onClick={() => nextRecord && onSelectArtifact(nextRecord.maHoSo)}
            className="inline-flex h-10 items-center gap-1 rounded-md border border-[#C7BEB0] bg-[#FFFFFF] px-3 text-xs font-medium text-[#1C1917] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F4F0E8] cursor-pointer"
          >
            <span>{nextRecord ? nextRecord.maHoSo : 'Cuối'}</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onEditInManager(record.maHoSo)}
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-[#7C2D12] px-3.5 text-xs font-medium text-[#FBF9F5] hover:bg-[#5E220D] transition-colors cursor-pointer"
          >
            <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Cập nhật hồ sơ</span>
          </button>
        </div>
      </div>

      {/* Main Split Gallery & Metadata View */}
      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Photo Viewer & Quick Summary */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="border border-[#DDD6C8] bg-[#FFFFFF] p-5">
            <ArtifactPhotoFrame
              maHoSo={record.maHoSo}
              images={record.danhSachAnh}
              defaultCaption={record.chuThichAnh}
              defaultSource={record.nguonAnh}
              enableInspector
            />

            <div className="mt-5 border-t border-[#DDD6C8] pt-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#57534E]">Loại bản đang hiển thị</span>
                <span className="font-medium text-[#1C1917]">
                  {record.loaiBanDangHienThi || MISSING_DATA_TEXT}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#57534E]">Mức kiểm chứng hồ sơ</span>
                <span className="font-medium text-[#1C1917]">
                  {getVerificationText(record.mucKiemChung)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#57534E]">Tiến độ nhập trường</span>
                <span className="font-mono text-[#1C1917] tabular-nums">
                  {completion.filled}/{completion.total} ({completion.percent}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed A-E Sections + Dublin Core */}
        <div className="lg:col-span-7">
          <div className="border-b border-[#DDD6C8] pb-6">
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#57534E]">
              <span className="font-mono font-semibold text-[#7C2D12]">
                MÃ HỒ SƠ: {record.maHoSo}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Mã hiện vật: {record.maHienVat || MISSING_DATA_TEXT}
              </span>
              <span aria-hidden="true">·</span>
              <StatusText status={completion.statusKey} />
            </div>

            <h1 className="mt-3 font-serif text-3xl font-semibold text-[#1C1917] sm:text-4xl text-balance">
              {record.tenHienVat || MISSING_DATA_TEXT}
            </h1>
            <p className="mt-2 text-sm text-[#57534E]">
              Tên gọi khác: {record.tenGoiKhac || MISSING_DATA_TEXT}
            </p>

            {/* View Switcher Tabs: A-E Inventory vs 15 Dublin Core Fields */}
            <div
              role="tablist"
              aria-label="Chế độ xem thông tin hồ sơ"
              className="mt-6 inline-flex items-center gap-1 rounded-md border border-[#DDD6C8] bg-[#F4F0E8] p-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'inventory'}
                onClick={() => setActiveTab('inventory')}
                className={`rounded px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'inventory'
                    ? 'bg-[#FFFFFF] text-[#1C1917] shadow-xs'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                Hồ sơ chi tiết (Nhóm A – E)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'dublin_core'}
                onClick={() => setActiveTab('dublin_core')}
                className={`rounded px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'dublin_core'
                    ? 'bg-[#FFFFFF] text-[#1C1917] shadow-xs'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                Chuẩn Dublin Core (15 trường)
              </button>
            </div>
          </div>

          {activeTab === 'inventory' ? (
            <div className="divide-y divide-[#DDD6C8]">
              {/* Group A */}
              <section className="py-7">
                <h2 className="font-serif text-xl font-semibold text-[#1C1917]">
                  A. Thông tin nhận diện
                </h2>
                <dl className="mt-4 divide-y divide-[#EFECE6] border-t border-[#EFECE6]">
                  <FieldRow
                    label="Mã hồ sơ"
                    value={record.maHoSo}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Mã hiện vật"
                    value={record.maHienVat}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Tên hiện vật"
                    value={record.tenHienVat}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Tên gọi khác"
                    value={record.tenGoiKhac}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Loại hiện vật"
                    value={record.loaiHienVat}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Số đăng ký hoặc số tham khảo"
                    value={record.soDangKy}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Nơi lưu giữ hiện nay"
                    value={record.noiLuuGiuHienNay}
                    recordVerification={record.mucKiemChung}
                    securityNote="Lưu ý an ninh bảo tàng: Chỉ ghi tên đơn vị lưu giữ chung (ví dụ: Bảo tàng tỉnh Lạng Sơn), không công bố vị trí kho hoặc tủ bảo quản cụ thể nếu ảnh hưởng an toàn hiện vật quý."
                  />
                  <FieldRow
                    label="Vị trí trưng bày"
                    value={record.viTriTrungBay}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Nơi lưu giữ tại thời điểm tạo ra / sử dụng"
                    value={record.noiLuuGiuBanDau}
                    recordVerification={record.mucKiemChung}
                  />
                </dl>
              </section>

              {/* Group B */}
              <section className="py-7">
                <h2 className="font-serif text-xl font-semibold text-[#1C1917]">
                  B. Đặc điểm hiện vật
                </h2>
                <dl className="mt-4 divide-y divide-[#EFECE6] border-t border-[#EFECE6]">
                  <FieldRow
                    label="Chất liệu"
                    value={record.chatLieu}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Kích thước"
                    value={record.kichThuoc}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Trọng lượng (nếu có)"
                    value={record.trongLuong}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Niên đại"
                    value={record.nienDai}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Tình trạng bảo quản"
                    value={record.tinhTrangBaoQuan}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Mô tả đặc điểm hình thái"
                    value={record.moTaHinhThai}
                    recordVerification={record.mucKiemChung}
                  />
                </dl>
              </section>

              {/* Group C */}
              <section className="py-7">
                <h2 className="font-serif text-xl font-semibold text-[#1C1917]">
                  C. Thông tin lịch sử và giá trị
                </h2>
                <dl className="mt-4 divide-y divide-[#EFECE6] border-t border-[#EFECE6]">
                  <FieldRow
                    label="Nguồn gốc hiện vật"
                    value={record.nguonGoc}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Bối cảnh lịch sử"
                    value={record.boiCanhLichSu}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Giá trị lịch sử"
                    value={record.giaTriLichSu}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Giá trị văn hóa"
                    value={record.giaTriVanHoa}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Giá trị khoa học"
                    value={record.giaTriKhoaHoc}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Quá trình sưu tầm hoặc tiếp nhận"
                    value={record.quaTrinhSuuTam}
                    recordVerification={record.mucKiemChung}
                  />
                </dl>
              </section>

              {/* Group D */}
              <section className="py-7">
                <h2 className="font-serif text-xl font-semibold text-[#1C1917]">
                  D. Thông tin số hóa
                </h2>
                <dl className="mt-4 divide-y divide-[#EFECE6] border-t border-[#EFECE6]">
                  <FieldRow
                    label="Loại bản đang hiển thị (Bản gốc / Bản sao / Bản số của gốc / Bản số của sao)"
                    value={record.loaiBanDangHienThi}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Tình trạng bản gốc"
                    value={record.tinhTrangBanGoc}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Ngày số hóa"
                    value={record.ngaySoHoa}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Người thực hiện số hóa"
                    value={record.nguoiThucHienSoHoa}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Thông tin tệp ảnh"
                    value={record.thongTinTepAnh}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Nguồn thông tin"
                    value={record.nguonThongTin}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Mức kiểm chứng & Ghi chú xác minh"
                    value={
                      record.ghiChuKiemChung
                        ? `${getVerificationText(record.mucKiemChung)} — ${record.ghiChuKiemChung}`
                        : getVerificationText(record.mucKiemChung)
                    }
                    recordVerification={record.mucKiemChung}
                  />
                </dl>
              </section>

              {/* Group E */}
              <section className="py-7">
                <h2 className="font-serif text-xl font-semibold text-[#1C1917]">
                  E. Thông tin quyền
                </h2>
                <dl className="mt-4 divide-y divide-[#EFECE6] border-t border-[#EFECE6]">
                  <FieldRow
                    label="Đơn vị hoặc cá nhân quản lý hiện vật"
                    value={record.donViQuanLy}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Người cho phép công bố hình ảnh"
                    value={record.nguoiChoPhepCongBo}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Phạm vi được phép sử dụng / công bố"
                    value={record.phamViDuocPhepCongBo}
                    recordVerification={record.mucKiemChung}
                  />
                  <FieldRow
                    label="Nội dung không được công bố"
                    value={record.phanKhongCongBo}
                    recordVerification={record.mucKiemChung}
                  />
                </dl>
              </section>
            </div>
          ) : (
            <section className="py-7">
              <div className="mb-4">
                <h2 className="font-serif text-xl font-semibold text-[#1C1917]">
                  15 Trường Siêu dữ liệu Dublin Core (ISO 15836)
                </h2>
                <p className="mt-1 text-xs text-[#57534E]">
                  Cấu trúc siêu dữ liệu chuẩn phục vụ liên thông và lưu trữ số
                  lâu dài cho hồ sơ {record.maHoSo}.
                </p>
              </div>
              <div className="overflow-x-auto border border-[#DDD6C8] bg-[#FFFFFF]">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#DDD6C8] bg-[#F4F0E8] text-xs font-semibold text-[#57534E]">
                      <th className="px-4 py-3">STT</th>
                      <th className="px-4 py-3">Trường Dublin Core</th>
                      <th className="px-4 py-3">Giá trị hồ sơ</th>
                      <th className="px-4 py-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFECE6]">
                    {DUBLIN_CORE_FIELDS.map((field, index) => {
                      const val = record.dublinCore[field.key];
                      const present = hasValue(val);
                      const status = !present
                        ? 'thieu_du_lieu'
                        : record.mucKiemChung === 'da_xac_minh'
                          ? 'da_xac_minh'
                          : 'cho_xac_minh';
                      return (
                        <tr key={field.key}>
                          <td className="px-4 py-3 font-mono text-xs text-[#57534E] tabular-nums">
                            {String(index + 1).padStart(2, '0')}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-[#1C1917]">
                              {field.labelEn} — {field.labelVi}
                            </p>
                            <p className="mt-0.5 text-xs text-[#78716C]">
                              {field.hint}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            {present ? (
                              <span className="text-[#1C1917]">{val}</span>
                            ) : (
                              <span className="italic text-[#78716C]">
                                {MISSING_DATA_TEXT}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusText status={status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
