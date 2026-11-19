export type ArtifactVersionType =
  | 'Bản gốc'
  | 'Bản sao'
  | 'Bản số của gốc'
  | 'Bản số của sao';

export type VerificationLevel =
  | 'chua_co_du_lieu'
  | 'cho_xac_minh'
  | 'da_xac_minh';

export interface DublinCoreMetadata {
  title: string | null;
  creator: string | null;
  subject: string | null;
  description: string | null;
  publisher: string | null;
  contributor: string | null;
  date: string | null;
  type: string | null;
  format: string | null;
  identifier: string | null;
  source: string | null;
  language: string | null;
  relation: string | null;
  coverage: string | null;
  rights: string | null;
}

export interface ArtifactImageItem {
  id: string;
  url: string;
  loaiAnh: 'toan_canh' | 'chi_tiet';
  chuThich: string | null;
  nguonAnh: string | null;
  duocPhepCongBo: boolean;
}

export interface ArtifactRecord {
  maHoSo: string; // HS001 .. HS015
  maHienVat: string | null;
  tenHienVat: string | null;
  tenGoiKhac: string | null;
  loaiHienVat: string | null;
  noiLuuGiuHienNay: string | null;
  viTriTrungBay: string | null;
  noiLuuGiuBanDau: string | null;
  chatLieu: string | null;
  kichThuoc: string | null;
  trongLuong: string | null;
  nienDai: string | null;
  tinhTrangBaoQuan: string | null;
  moTaHinhThai: string | null;
  nguonGoc: string | null;
  boiCanhLichSu: string | null;
  giaTriLichSu: string | null;
  giaTriVanHoa: string | null;
  giaTriKhoaHoc: string | null;
  quaTrinhSuuTam: string | null;
  tinhTrangBanGoc: string | null;
  loaiBanDangHienThi: ArtifactVersionType | null;
  soDangKy: string | null;
  donViQuanLy: string | null;
  nguoiChoPhepCongBo: string | null;
  phamViDuocPhepCongBo: string | null;
  phanKhongCongBo: string | null;
  ngaySoHoa: string | null;
  nguoiThucHienSoHoa: string | null;
  thongTinTepAnh: string | null;
  nguonThongTin: string | null;
  mucKiemChung: VerificationLevel;
  ghiChuKiemChung: string | null;
  danhSachAnh: ArtifactImageItem[];
  chuThichAnh: string | null;
  nguonAnh: string | null;
  dublinCore: DublinCoreMetadata;
  ngayCapNhat: string | null;
}

export interface SourceDocumentRecord {
  id: string;
  tenTaiLieu: string | null;
  coQuanPhatHanh: string | null;
  duongDanTruyCap: string | null;
  loaiNguon: string | null;
  noiDungSuDung: string | null;
  trangThaiXacMinh: VerificationLevel;
}

export interface RightsGrantRecord {
  id: string;
  tenNguoiHoacDonVi: string | null;
  vaiTro: string | null;
  ngayDongY: string | null;
  phamViCongBo: string | null;
  gioiHanSuDung: string | null;
}

export interface TeamMemberRecord {
  id: string;
  hoTen: string | null;
  maSinhVien: string | null;
  vaiTro: string | null;
}

export interface ArchiveMetadataStore {
  nguonTuLieu: SourceDocumentRecord[];
  quyenCongBo: RightsGrantRecord[];
  nhomThucHien: TeamMemberRecord[];
}

export type ScreenId =
  | 'home'
  | 'list'
  | 'detail'
  | 'qa'
  | 'sources'
  | 'about'
  | 'manage';

export interface GeminiSystemStatus {
  apiConfigured: boolean;
  hasVerifiedData: boolean;
  hasAnyData: boolean;
  activeRecordsCount: number;
  verifiedRecordsCount: number;
  model: string;
}
