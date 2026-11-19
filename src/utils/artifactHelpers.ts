import type {
  ArtifactRecord,
  DublinCoreMetadata,
  VerificationLevel,
} from '../types/artifact';

export const MISSING_DATA_TEXT = 'Còn thiếu dữ liệu';
export const NO_IMAGE_TEXT = 'Chưa có ảnh hiện vật';

export const DUBLIN_CORE_FIELDS: Array<{
  key: keyof DublinCoreMetadata;
  labelEn: string;
  labelVi: string;
  hint: string;
}> = [
  { key: 'title', labelEn: 'Title', labelVi: 'Nhan đề', hint: 'Tên gọi chính thức của tài nguyên / hiện vật trong hồ sơ số' },
  { key: 'creator', labelEn: 'Creator', labelVi: 'Người hoặc cơ quan tạo ra', hint: 'Tác giả, nghệ nhân, cộng đồng hoặc cơ quan chế tác (nếu xác minh được)' },
  { key: 'subject', labelEn: 'Subject', labelVi: 'Chủ đề', hint: 'Từ khóa, chủ đề lịch sử – văn hóa liên quan' },
  { key: 'description', labelEn: 'Description', labelVi: 'Mô tả', hint: 'Tóm tắt đặc điểm và nội dung hồ sơ hiện vật' },
  { key: 'publisher', labelEn: 'Publisher', labelVi: 'Đơn vị công bố', hint: 'Đơn vị phát hành hồ sơ số (khi được xác nhận)' },
  { key: 'contributor', labelEn: 'Contributor', labelVi: 'Người đóng góp', hint: 'Cá nhân/tổ chức tham gia biên soạn, cung cấp tư liệu' },
  { key: 'date', labelEn: 'Date', labelVi: 'Ngày tháng', hint: 'Niên đại hoặc mốc thời gian liên quan đến hiện vật / hồ sơ' },
  { key: 'type', labelEn: 'Type', labelVi: 'Loại', hint: 'Bản chất tài nguyên (ví dụ: Hiện vật bảo tàng / Physical Object)' },
  { key: 'format', labelEn: 'Format', labelVi: 'Định dạng', hint: 'Định dạng vật lý hoặc định dạng tệp số hóa' },
  { key: 'identifier', labelEn: 'Identifier', labelVi: 'Mã định danh', hint: 'Mã định danh duy nhất của hồ sơ (HS001 – HS015)' },
  { key: 'source', labelEn: 'Source', labelVi: 'Nguồn', hint: 'Nguồn gốc tài liệu, hồ sơ kiểm kê hoặc tư liệu gốc' },
  { key: 'language', labelEn: 'Language', labelVi: 'Ngôn ngữ', hint: 'Ngôn ngữ trên hiện vật (nếu có chữ viết) hoặc ngôn ngữ hồ sơ' },
  { key: 'relation', labelEn: 'Relation', labelVi: 'Quan hệ', hint: 'Liên kết với bộ sưu tập, hiện vật hoặc tư liệu liên quan' },
  { key: 'coverage', labelEn: 'Coverage', labelVi: 'Phạm vi không gian, thời gian', hint: 'Địa bàn, không gian văn hóa và giai đoạn lịch sử' },
  { key: 'rights', labelEn: 'Rights', labelVi: 'Quyền', hint: 'Thông tin bản quyền, đơn vị sở hữu và phạm vi công bố' },
];

export const ARTIFACT_CATEGORIES = [
  'Khảo cổ học',
  'Lịch sử – Cách mạng',
  'Văn hóa dân gian – Dân tộc học',
  'Mỹ thuật – Tín ngưỡng',
  'Tài liệu – Sưu tập giấy',
  'Chưa phân loại',
] as const;

export const VERSION_TYPES = [
  'Bản gốc',
  'Bản sao',
  'Bản số của gốc',
  'Bản số của sao',
] as const;

export function createEmptyDublinCore(maHoSo: string): DublinCoreMetadata {
  return {
    title: null,
    creator: null,
    subject: null,
    description: null,
    publisher: null,
    contributor: null,
    date: null,
    type: null,
    format: null,
    identifier: maHoSo,
    source: null,
    language: null,
    relation: null,
    coverage: null,
    rights: null,
  };
}

export function createEmptyArtifactRecord(index: number): ArtifactRecord {
  const maHoSo = `HS${String(index).padStart(3, '0')}`;
  return {
    maHoSo,
    maHienVat: null,
    tenHienVat: null,
    tenGoiKhac: null,
    loaiHienVat: null,
    noiLuuGiuHienNay: null,
    viTriTrungBay: null,
    noiLuuGiuBanDau: null,
    chatLieu: null,
    kichThuoc: null,
    trongLuong: null,
    nienDai: null,
    tinhTrangBaoQuan: null,
    moTaHinhThai: null,
    nguonGoc: null,
    boiCanhLichSu: null,
    giaTriLichSu: null,
    giaTriVanHoa: null,
    giaTriKhoaHoc: null,
    quaTrinhSuuTam: null,
    tinhTrangBanGoc: null,
    loaiBanDangHienThi: null,
    soDangKy: null,
    donViQuanLy: null,
    nguoiChoPhepCongBo: null,
    phamViDuocPhepCongBo: null,
    phanKhongCongBo: null,
    ngaySoHoa: null,
    nguoiThucHienSoHoa: null,
    thongTinTepAnh: null,
    nguonThongTin: null,
    mucKiemChung: 'chua_co_du_lieu',
    ghiChuKiemChung: null,
    danhSachAnh: [],
    chuThichAnh: null,
    nguonAnh: null,
    dublinCore: createEmptyDublinCore(maHoSo),
    ngayCapNhat: null,
  };
}

export function createInitial15Records(): ArtifactRecord[] {
  return Array.from({ length: 15 }, (_, idx) => createEmptyArtifactRecord(idx + 1));
}

export function hasValue(val: string | null | undefined): boolean {
  return typeof val === 'string' && val.trim().length > 0;
}

export function displayValue(val: string | null | undefined): string {
  return hasValue(val) ? val!.trim() : MISSING_DATA_TEXT;
}

const INVENTORY_TRACKED_KEYS: Array<keyof ArtifactRecord> = [
  'maHienVat',
  'tenHienVat',
  'tenGoiKhac',
  'loaiHienVat',
  'noiLuuGiuHienNay',
  'viTriTrungBay',
  'noiLuuGiuBanDau',
  'chatLieu',
  'kichThuoc',
  'trongLuong',
  'nienDai',
  'tinhTrangBaoQuan',
  'moTaHinhThai',
  'nguonGoc',
  'boiCanhLichSu',
  'giaTriLichSu',
  'giaTriVanHoa',
  'giaTriKhoaHoc',
  'quaTrinhSuuTam',
  'tinhTrangBanGoc',
  'loaiBanDangHienThi',
  'soDangKy',
  'donViQuanLy',
  'nguoiChoPhepCongBo',
  'phamViDuocPhepCongBo',
  'phanKhongCongBo',
  'ngaySoHoa',
  'nguoiThucHienSoHoa',
  'thongTinTepAnh',
  'nguonThongTin',
  'chuThichAnh',
  'nguonAnh',
];

export interface RecordCompletionStats {
  filled: number;
  total: number;
  percent: number;
  hasAnyInput: boolean;
  statusLabel: 'Còn thiếu dữ liệu' | 'Chờ xác minh' | 'Đã hoàn thiện';
  statusKey: 'thieu_du_lieu' | 'cho_xac_minh' | 'hoan_thien';
}

export function computeRecordCompletion(record: ArtifactRecord): RecordCompletionStats {
  let filled = 0;

  for (const key of INVENTORY_TRACKED_KEYS) {
    const val = record[key];
    if (typeof val === 'string' && val.trim().length > 0) {
      filled += 1;
    }
  }

  // Count Dublin Core fields except identifier which is pre-assigned HS001..HS015
  for (const dc of DUBLIN_CORE_FIELDS) {
    if (dc.key === 'identifier') continue;
    if (hasValue(record.dublinCore[dc.key])) {
      filled += 1;
    }
  }

  // Image presence counts as 1 slot
  if (record.danhSachAnh && record.danhSachAnh.length > 0) {
    filled += 1;
  }

  const total = INVENTORY_TRACKED_KEYS.length + (DUBLIN_CORE_FIELDS.length - 1) + 1;
  const percent = Math.round((filled / total) * 100);
  const hasAnyInput = filled > 0;

  let statusKey: RecordCompletionStats['statusKey'] = 'thieu_du_lieu';
  let statusLabel: RecordCompletionStats['statusLabel'] = 'Còn thiếu dữ liệu';

  if (hasAnyInput) {
    if (record.mucKiemChung === 'da_xac_minh' && percent >= 70 && hasValue(record.tenHienVat)) {
      statusKey = 'hoan_thien';
      statusLabel = 'Đã hoàn thiện';
    } else {
      statusKey = 'cho_xac_minh';
      statusLabel = 'Chờ xác minh';
    }
  }

  return {
    filled,
    total,
    percent,
    hasAnyInput,
    statusLabel,
    statusKey,
  };
}

export function getVerificationText(level: VerificationLevel): string {
  switch (level) {
    case 'da_xac_minh':
      return 'Đã xác minh';
    case 'cho_xac_minh':
      return 'Chờ xác minh';
    default:
      return 'Còn thiếu dữ liệu';
  }
}

export function formatExportDate(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function buildExportFilename(ext: 'json' | 'csv'): string {
  return `baotang-ls-hienvat-${formatExportDate()}.${ext}`;
}

function escapeCsvCell(value: string | null | undefined): string {
  const str = value ?? '';
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const CSV_COLUMNS: Array<{
  header: string;
  get: (r: ArtifactRecord) => string;
  set?: (r: ArtifactRecord, val: string) => void;
}> = [
  { header: 'maHoSo', get: (r) => r.maHoSo },
  { header: 'maHienVat', get: (r) => r.maHienVat ?? '', set: (r, v) => { r.maHienVat = v || null; } },
  { header: 'tenHienVat', get: (r) => r.tenHienVat ?? '', set: (r, v) => { r.tenHienVat = v || null; } },
  { header: 'tenGoiKhac', get: (r) => r.tenGoiKhac ?? '', set: (r, v) => { r.tenGoiKhac = v || null; } },
  { header: 'loaiHienVat', get: (r) => r.loaiHienVat ?? '', set: (r, v) => { r.loaiHienVat = v || null; } },
  { header: 'noiLuuGiuHienNay', get: (r) => r.noiLuuGiuHienNay ?? '', set: (r, v) => { r.noiLuuGiuHienNay = v || null; } },
  { header: 'viTriTrungBay', get: (r) => r.viTriTrungBay ?? '', set: (r, v) => { r.viTriTrungBay = v || null; } },
  { header: 'noiLuuGiuBanDau', get: (r) => r.noiLuuGiuBanDau ?? '', set: (r, v) => { r.noiLuuGiuBanDau = v || null; } },
  { header: 'chatLieu', get: (r) => r.chatLieu ?? '', set: (r, v) => { r.chatLieu = v || null; } },
  { header: 'kichThuoc', get: (r) => r.kichThuoc ?? '', set: (r, v) => { r.kichThuoc = v || null; } },
  { header: 'trongLuong', get: (r) => r.trongLuong ?? '', set: (r, v) => { r.trongLuong = v || null; } },
  { header: 'nienDai', get: (r) => r.nienDai ?? '', set: (r, v) => { r.nienDai = v || null; } },
  { header: 'tinhTrangBaoQuan', get: (r) => r.tinhTrangBaoQuan ?? '', set: (r, v) => { r.tinhTrangBaoQuan = v || null; } },
  { header: 'moTaHinhThai', get: (r) => r.moTaHinhThai ?? '', set: (r, v) => { r.moTaHinhThai = v || null; } },
  { header: 'nguonGoc', get: (r) => r.nguonGoc ?? '', set: (r, v) => { r.nguonGoc = v || null; } },
  { header: 'boiCanhLichSu', get: (r) => r.boiCanhLichSu ?? '', set: (r, v) => { r.boiCanhLichSu = v || null; } },
  { header: 'giaTriLichSu', get: (r) => r.giaTriLichSu ?? '', set: (r, v) => { r.giaTriLichSu = v || null; } },
  { header: 'giaTriVanHoa', get: (r) => r.giaTriVanHoa ?? '', set: (r, v) => { r.giaTriVanHoa = v || null; } },
  { header: 'giaTriKhoaHoc', get: (r) => r.giaTriKhoaHoc ?? '', set: (r, v) => { r.giaTriKhoaHoc = v || null; } },
  { header: 'quaTrinhSuuTam', get: (r) => r.quaTrinhSuuTam ?? '', set: (r, v) => { r.quaTrinhSuuTam = v || null; } },
  { header: 'tinhTrangBanGoc', get: (r) => r.tinhTrangBanGoc ?? '', set: (r, v) => { r.tinhTrangBanGoc = v || null; } },
  {
    header: 'loaiBanDangHienThi',
    get: (r) => r.loaiBanDangHienThi ?? '',
    set: (r, v) => {
      if (v === 'Bản gốc' || v === 'Bản sao' || v === 'Bản số của gốc' || v === 'Bản số của sao') {
        r.loaiBanDangHienThi = v;
      } else {
        r.loaiBanDangHienThi = null;
      }
    },
  },
  { header: 'soDangKy', get: (r) => r.soDangKy ?? '', set: (r, v) => { r.soDangKy = v || null; } },
  { header: 'donViQuanLy', get: (r) => r.donViQuanLy ?? '', set: (r, v) => { r.donViQuanLy = v || null; } },
  { header: 'nguoiChoPhepCongBo', get: (r) => r.nguoiChoPhepCongBo ?? '', set: (r, v) => { r.nguoiChoPhepCongBo = v || null; } },
  { header: 'phamViDuocPhepCongBo', get: (r) => r.phamViDuocPhepCongBo ?? '', set: (r, v) => { r.phamViDuocPhepCongBo = v || null; } },
  { header: 'phanKhongCongBo', get: (r) => r.phanKhongCongBo ?? '', set: (r, v) => { r.phanKhongCongBo = v || null; } },
  { header: 'ngaySoHoa', get: (r) => r.ngaySoHoa ?? '', set: (r, v) => { r.ngaySoHoa = v || null; } },
  { header: 'nguoiThucHienSoHoa', get: (r) => r.nguoiThucHienSoHoa ?? '', set: (r, v) => { r.nguoiThucHienSoHoa = v || null; } },
  { header: 'thongTinTepAnh', get: (r) => r.thongTinTepAnh ?? '', set: (r, v) => { r.thongTinTepAnh = v || null; } },
  { header: 'nguonThongTin', get: (r) => r.nguonThongTin ?? '', set: (r, v) => { r.nguonThongTin = v || null; } },
  {
    header: 'mucKiemChung',
    get: (r) => r.mucKiemChung,
    set: (r, v) => {
      if (v === 'da_xac_minh' || v === 'cho_xac_minh' || v === 'chua_co_du_lieu') {
        r.mucKiemChung = v;
      }
    },
  },
  { header: 'chuThichAnh', get: (r) => r.chuThichAnh ?? '', set: (r, v) => { r.chuThichAnh = v || null; } },
  { header: 'nguonAnh', get: (r) => r.nguonAnh ?? '', set: (r, v) => { r.nguonAnh = v || null; } },
  ...DUBLIN_CORE_FIELDS.map((dc) => ({
    header: `dc_${dc.key}`,
    get: (r: ArtifactRecord) => r.dublinCore[dc.key] ?? '',
    set: (r: ArtifactRecord, v: string) => {
      r.dublinCore[dc.key] = v || (dc.key === 'identifier' ? r.maHoSo : null);
    },
  })),
];

export function exportArtifactsToCsv(records: ArtifactRecord[]): string {
  const headerRow = CSV_COLUMNS.map((c) => escapeCsvCell(c.header)).join(',');
  const dataRows = records.map((rec) =>
    CSV_COLUMNS.map((c) => escapeCsvCell(c.get(rec))).join(',')
  );
  // Prepend UTF-8 BOM for proper Vietnamese Excel encoding
  return `\uFEFF${[headerRow, ...dataRows].join('\r\n')}`;
}

export function exportArtifactsToJson(records: ArtifactRecord[]): string {
  return JSON.stringify(
    {
      duAn: 'BẢO TÀNG LS',
      chuDe: 'Hồ sơ số cho 15 hiện vật tiêu biểu của Bảo tàng tỉnh Lạng Sơn',
      ngayXuat: formatExportDate(),
      soLuongHoSo: records.length,
      hoSoHienVat: records,
    },
    null,
    2
  );
}

function parseCsvRows(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    const next = clean[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\r' && next === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      i++;
    } else if (ch === '\n' || ch === '\r') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

export function mergeImportedCsv(
  csvText: string,
  existingRecords: ArtifactRecord[]
): { updated: ArtifactRecord[]; matchedCount: number } {
  const rows = parseCsvRows(csvText);
  if (rows.length < 2) {
    throw new Error('Tệp CSV không có dòng dữ liệu hợp lệ.');
  }

  const headers = rows[0].map((h) => h.trim());
  const maHoSoIdx = headers.indexOf('maHoSo');
  if (maHoSoIdx === -1) {
    throw new Error('Tệp CSV thiếu cột bắt buộc "maHoSo" (HS001–HS015).');
  }

  const cloned = existingRecords.map((r) => ({
    ...r,
    dublinCore: { ...r.dublinCore },
    danhSachAnh: [...r.danhSachAnh],
  }));

  let matchedCount = 0;

  for (let rIdx = 1; rIdx < rows.length; rIdx++) {
    const row = rows[rIdx];
    const code = (row[maHoSoIdx] ?? '').trim().toUpperCase();
    const target = cloned.find((item) => item.maHoSo === code);
    if (!target) continue;

    matchedCount += 1;
    for (const col of CSV_COLUMNS) {
      if (!col.set) continue;
      const colIdx = headers.indexOf(col.header);
      if (colIdx !== -1 && colIdx < row.length) {
        col.set(target, row[colIdx].trim());
      }
    }
    target.ngayCapNhat = formatExportDate();
  }

  return { updated: cloned, matchedCount };
}

export function normalizeImportedJson(
  raw: unknown,
  existingRecords: ArtifactRecord[]
): ArtifactRecord[] {
  const list = Array.isArray(raw)
    ? raw
    : typeof raw === 'object' && raw !== null && Array.isArray((raw as { hoSoHienVat?: unknown }).hoSoHienVat)
      ? (raw as { hoSoHienVat: unknown[] }).hoSoHienVat
      : null;

  if (!list) {
    throw new Error('Cấu trúc tệp JSON không đúng định dạng hienvat.json.');
  }

  const byCode = new Map<string, Partial<ArtifactRecord>>();
  for (const item of list) {
    if (typeof item === 'object' && item !== null && typeof (item as { maHoSo?: unknown }).maHoSo === 'string') {
      const code = (item as { maHoSo: string }).maHoSo.trim().toUpperCase();
      byCode.set(code, item as Partial<ArtifactRecord>);
    }
  }

  return existingRecords.map((base) => {
    const incoming = byCode.get(base.maHoSo);
    if (!incoming) return base;
    const mergedDc = {
      ...createEmptyDublinCore(base.maHoSo),
      ...(incoming.dublinCore ?? {}),
      identifier: base.maHoSo,
    };
    return {
      ...base,
      ...incoming,
      maHoSo: base.maHoSo,
      dublinCore: mergedDc,
      danhSachAnh: Array.isArray(incoming.danhSachAnh) ? incoming.danhSachAnh : base.danhSachAnh,
    };
  });
}
