import { useRef, useState, type ChangeEvent } from 'react';
import {
  AlertTriangle,
  Check,
  Download,
  ExternalLink,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import type {
  ArtifactImageItem,
  ArtifactRecord,
  ArtifactVersionType,
  VerificationLevel,
} from '../../types/artifact';
import {
  ARTIFACT_CATEGORIES,
  DUBLIN_CORE_FIELDS,
  MISSING_DATA_TEXT,
  VERSION_TYPES,
  buildExportFilename,
  computeRecordCompletion,
  exportArtifactsToCsv,
  exportArtifactsToJson,
  mergeImportedCsv,
  normalizeImportedJson,
} from '../../utils/artifactHelpers';
import { StatusText } from '../StatusText';

interface ManageDataScreenProps {
  records: ArtifactRecord[];
  initialEditMaHoSo?: string;
  onSaveSingleRecord: (record: ArtifactRecord) => Promise<void>;
  onReplaceAllRecords: (records: ArtifactRecord[]) => Promise<void>;
  onResetEmptyRecords: () => Promise<void>;
  onOpenDetail: (maHoSo: string) => void;
}

type EditorTab = 'A' | 'B' | 'C' | 'D' | 'E' | 'DC';

export function ManageDataScreen({
  records,
  initialEditMaHoSo,
  onSaveSingleRecord,
  onReplaceAllRecords,
  onResetEmptyRecords,
  onOpenDetail,
}: ManageDataScreenProps) {
  const [selectedCode, setSelectedCode] = useState<string>(
    initialEditMaHoSo || records[0]?.maHoSo || 'HS001'
  );
  const currentRecord =
    records.find((r) => r.maHoSo === selectedCode) ?? records[0];

  const [draft, setDraft] = useState<ArtifactRecord>(() =>
    JSON.parse(JSON.stringify(currentRecord))
  );
  const [activeTab, setActiveTab] = useState<EditorTab>('A');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Gemini Function 2: Editorial Description Standardization state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // New Image form state
  const [newImgUrl, setNewImgUrl] = useState('');
  const [newImgType, setNewImgType] = useState<'toan_canh' | 'chi_tiet'>(
    'toan_canh'
  );
  const [newImgCaption, setNewImgCaption] = useState('');
  const [newImgSource, setNewImgSource] = useState('');
  const [newImgPermitted, setNewImgPermitted] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const jsonInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const selectRecordForEdit = (maHoSo: string) => {
    const found = records.find((r) => r.maHoSo === maHoSo);
    if (!found) return;
    setSelectedCode(maHoSo);
    setDraft(JSON.parse(JSON.stringify(found)));
    setAiSuggestion(null);
    setAiError(null);
    setStatusMessage(null);
  };

  const updateField = <K extends keyof ArtifactRecord>(
    key: K,
    value: ArtifactRecord[K]
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const updateTextField = (key: keyof ArtifactRecord, raw: string) => {
    setDraft((prev) => ({
      ...prev,
      [key]: raw.trim() === '' ? null : raw,
    }));
  };

  const updateDcField = (
    key: keyof ArtifactRecord['dublinCore'],
    raw: string
  ) => {
    setDraft((prev) => ({
      ...prev,
      dublinCore: {
        ...prev.dublinCore,
        [key]:
          key === 'identifier'
            ? prev.maHoSo
            : raw.trim() === ''
              ? null
              : raw,
      },
    }));
  };

  const handleSaveRecord = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      await onSaveSingleRecord(draft);
      setStatusMessage({
        type: 'success',
        text: `Đã lưu thay đổi cho hồ sơ ${draft.maHoSo} vào tệp hienvat.json.`,
      });
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Không thể lưu hồ sơ hiện vật. Vui lòng thử lại.',
      });
    } finally {
      setSaving(false);
    }
  };

  const triggerDownload = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const json = exportArtifactsToJson(records);
    triggerDownload(json, buildExportFilename('json'), 'application/json;charset=utf-8');
  };

  const handleExportCsv = () => {
    const csv = exportArtifactsToCsv(records);
    triggerDownload(csv, buildExportFilename('csv'), 'text/csv;charset=utf-8');
  };

  const handleImportJson = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const merged = normalizeImportedJson(parsed, records);
      await onReplaceAllRecords(merged);
      const updatedSelected =
        merged.find((r) => r.maHoSo === selectedCode) ?? merged[0];
      setDraft(JSON.parse(JSON.stringify(updatedSelected)));
      setStatusMessage({
        type: 'success',
        text: `Đã nhập dữ liệu từ tệp ${file.name} thành công.`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Tệp JSON không hợp lệ hoặc sai cấu trúc.',
      });
    }
  };

  const handleImportCsv = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const { updated, matchedCount } = mergeImportedCsv(text, records);
      await onReplaceAllRecords(updated);
      const updatedSelected =
        updated.find((r) => r.maHoSo === selectedCode) ?? updated[0];
      setDraft(JSON.parse(JSON.stringify(updatedSelected)));
      setStatusMessage({
        type: 'success',
        text: `Đã nhập ${matchedCount} hồ sơ từ tệp CSV ${file.name}.`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Tệp CSV không hợp lệ hoặc thiếu cột maHoSo.',
      });
    }
  };

  const handleResetAll = async () => {
    await onResetEmptyRecords();
    setConfirmReset(false);
    const fresh = records.find((r) => r.maHoSo === selectedCode);
    if (fresh) {
      setDraft(JSON.parse(JSON.stringify(fresh)));
    }
    setStatusMessage({
      type: 'success',
      text: 'Đã khôi phục 15 khung hồ sơ rỗng chuẩn ban đầu (HS001–HS015).',
    });
  };

  const handleRequestAiDescription = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiSuggestion(null);
    try {
      const res = await fetch('/api/gemini/assist-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ record: draft }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data?.error || 'Không thể tạo đề xuất diễn đạt.');
        return;
      }
      setAiSuggestion(data.suggestion);
    } catch {
      setAiError('Không thể kết nối máy chủ hỗ trợ biên tập.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleUploadRealImageFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingImage(true);
    setStatusMessage(null);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Không đọc được tệp ảnh.'));
        reader.readAsDataURL(file);
      });
      const res = await fetch(
        `/api/artifacts/${draft.maHoSo}/upload-image`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, dataUrl }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setStatusMessage({
          type: 'error',
          text: data?.error || 'Không thể tải tệp ảnh lên thư mục hồ sơ.',
        });
        return;
      }
      setNewImgUrl(data.url);
      setStatusMessage({
        type: 'success',
        text: `Đã lưu tệp ảnh thật vào ${data.url}. Vui lòng nhập nguồn ảnh, chú thích và bấm "Thêm ảnh".`,
      });
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Lỗi khi tải ảnh từ thiết bị.',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddImage = () => {
    if (!newImgUrl.trim()) return;
    const item: ArtifactImageItem = {
      id: `IMG-${Date.now()}`,
      url: newImgUrl.trim(),
      loaiAnh: newImgType,
      chuThich: newImgCaption.trim() || null,
      nguonAnh: newImgSource.trim() || null,
      duocPhepCongBo: newImgPermitted,
    };
    setDraft((prev) => ({
      ...prev,
      danhSachAnh: [...prev.danhSachAnh, item],
    }));
    setNewImgUrl('');
    setNewImgCaption('');
    setNewImgSource('');
    setNewImgPermitted(false);
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      {/* Header + Import/Export Controls */}
      <div className="flex flex-col gap-5 border-b border-[#DDD6C8] pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7C2D12]">
            Màn hình 7 · Quản trị hồ sơ số
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-[#1C1917] sm:text-4xl">
            Quản lý dữ liệu và xuất hồ sơ
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#57534E]">
            Bổ sung, chỉnh sửa thông tin 15 hồ sơ (HS001–HS015) khi có tư liệu
            thật, theo dõi tiến độ hoàn thiện và nhập/xuất dữ liệu chuẩn JSON,
            CSV. Các trường để trống giữ nguyên giá trị null.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={jsonInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportJson}
            className="hidden"
          />
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleImportCsv}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => jsonInputRef.current?.click()}
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-[#C7BEB0] bg-[#FFFFFF] px-3 text-xs font-medium text-[#1C1917] hover:bg-[#F4F0E8] cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Nhập JSON</span>
          </button>

          <button
            type="button"
            onClick={() => csvInputRef.current?.click()}
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-[#C7BEB0] bg-[#FFFFFF] px-3 text-xs font-medium text-[#1C1917] hover:bg-[#F4F0E8] cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Nhập CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-[#7C2D12] bg-[#FFFFFF] px-3 text-xs font-medium text-[#7C2D12] hover:bg-[#7C2D12] hover:text-[#FBF9F5] transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Xuất JSON</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-[#7C2D12] px-3.5 text-xs font-medium text-[#FBF9F5] hover:bg-[#5E220D] transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          role="status"
          className={`mt-6 border px-4 py-3 text-sm ${
            statusMessage.type === 'success'
              ? 'border-[#14532D]/30 bg-[#14532D]/5 text-[#14532D]'
              : 'border-[#991B1B]/30 bg-[#991B1B]/5 text-[#991B1B]'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Workspace Grid: Left 15-Slot Progress List + Right Detailed Editor */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left: 15 Records Completion Table */}
        <aside className="lg:col-span-4">
          <div className="border border-[#DDD6C8] bg-[#FFFFFF]">
            <div className="flex items-center justify-between border-b border-[#DDD6C8] bg-[#F4F0E8] px-4 py-3">
              <h2 className="font-serif text-base font-semibold text-[#1C1917]">
                Tiến độ 15 hồ sơ
              </h2>
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="inline-flex items-center gap-1 text-xs text-[#57534E] hover:text-[#991B1B] cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                  <span>Đặt lại rỗng</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="font-semibold text-[#991B1B] underline cursor-pointer"
                  >
                    Xác nhận xóa
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="text-[#57534E] cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              )}
            </div>

            <div className="divide-y divide-[#EFECE6] max-h-[680px] overflow-y-auto">
              {records.map((rec) => {
                const stats = computeRecordCompletion(rec);
                const isSelected = rec.maHoSo === selectedCode;
                return (
                  <button
                    key={rec.maHoSo}
                    type="button"
                    onClick={() => selectRecordForEdit(rec.maHoSo)}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#F4F0E8] font-medium'
                        : 'hover:bg-[#FBF9F5]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[#7C2D12]">
                          {rec.maHoSo}
                        </span>
                        <span className="truncate text-sm text-[#1C1917]">
                          {rec.tenHienVat || MISSING_DATA_TEXT}
                        </span>
                      </div>
                      <div className="mt-1">
                        <StatusText status={stats.statusKey} />
                      </div>
                    </div>
                    <span className="font-mono text-xs text-[#57534E] tabular-nums shrink-0">
                      {stats.percent}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right: Structured Editor */}
        <section className="lg:col-span-8">
          <div className="border border-[#DDD6C8] bg-[#FFFFFF]">
            {/* Editor Header */}
            <div className="flex flex-col gap-3 border-b border-[#DDD6C8] bg-[#F4F0E8]/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#7C2D12]">
                    {draft.maHoSo}
                  </span>
                  <span className="text-[#C7BEB0]">·</span>
                  <span className="font-serif text-lg font-semibold text-[#1C1917]">
                    {draft.tenHienVat || MISSING_DATA_TEXT}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[#57534E]">
                  Trường để trống sẽ lưu là null và hiển thị “{MISSING_DATA_TEXT}”.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenDetail(draft.maHoSo)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-md border border-[#C7BEB0] bg-[#FFFFFF] px-3 text-xs font-medium text-[#1C1917] hover:bg-[#F4F0E8] cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Xem trang chi tiết</span>
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveRecord}
                  className="inline-flex h-10 items-center gap-1.5 rounded-md bg-[#7C2D12] px-4 text-xs font-medium text-[#FBF9F5] hover:bg-[#5E220D] disabled:opacity-50 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {saving ? 'Đang lưu...' : `Lưu hồ sơ ${draft.maHoSo}`}
                  </span>
                </button>
              </div>
            </div>

            {/* Editor Sub-tabs */}
            <div className="flex flex-wrap gap-1 border-b border-[#DDD6C8] bg-[#FBF9F5] px-4 py-2">
              {(
                [
                  { id: 'A', label: 'A. Nhận diện' },
                  { id: 'B', label: 'B. Đặc điểm' },
                  { id: 'C', label: 'C. Lịch sử & Giá trị' },
                  { id: 'D', label: 'D. Số hóa & Ảnh' },
                  { id: 'E', label: 'E. Quyền công bố' },
                  { id: 'DC', label: 'Dublin Core (15)' },
                ] as Array<{ id: EditorTab; label: string }>
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`rounded px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === t.id
                      ? 'bg-[#7C2D12] text-[#FBF9F5]'
                      : 'text-[#57534E] hover:bg-[#F4F0E8] hover:text-[#1C1917]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Editor Body */}
            <div className="p-5 sm:p-6">
              {activeTab === 'A' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917]">
                      Mã hồ sơ (cố định)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={draft.maHoSo}
                      className="mt-1.5 h-10 w-full rounded border border-[#DDD6C8] bg-[#F4F0E8] px-3 font-mono text-sm text-[#57534E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917]">
                      Mã hiện vật (bảo tàng)
                    </label>
                    <input
                      type="text"
                      value={draft.maHienVat ?? ''}
                      placeholder={MISSING_DATA_TEXT}
                      onChange={(e) =>
                        updateTextField('maHienVat', e.target.value)
                      }
                      className="mt-1.5 h-10 w-full rounded border border-[#C7BEB0] px-3 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#1C1917]">
                      Tên hiện vật
                    </label>
                    <input
                      type="text"
                      value={draft.tenHienVat ?? ''}
                      placeholder={MISSING_DATA_TEXT}
                      onChange={(e) =>
                        updateTextField('tenHienVat', e.target.value)
                      }
                      className="mt-1.5 h-10 w-full rounded border border-[#C7BEB0] px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917]">
                      Tên gọi khác
                    </label>
                    <input
                      type="text"
                      value={draft.tenGoiKhac ?? ''}
                      placeholder={MISSING_DATA_TEXT}
                      onChange={(e) =>
                        updateTextField('tenGoiKhac', e.target.value)
                      }
                      className="mt-1.5 h-10 w-full rounded border border-[#C7BEB0] px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917]">
                      Loại hiện vật
                    </label>
                    <input
                      type="text"
                      list="artifact-category-suggestions"
                      value={draft.loaiHienVat ?? ''}
                      placeholder={MISSING_DATA_TEXT}
                      onChange={(e) =>
                        updateTextField('loaiHienVat', e.target.value)
                      }
                      className="mt-1.5 h-10 w-full rounded border border-[#C7BEB0] bg-white px-3 text-sm"
                    />
                    <datalist id="artifact-category-suggestions">
                      {Array.from(
                        new Set([
                          ...ARTIFACT_CATEGORIES,
                          ...records
                            .map((r) => r.loaiHienVat)
                            .filter((v): v is string => Boolean(v)),
                        ])
                      ).map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917]">
                      Số đăng ký hoặc số tham khảo
                    </label>
                    <input
                      type="text"
                      value={draft.soDangKy ?? ''}
                      placeholder={MISSING_DATA_TEXT}
                      onChange={(e) =>
                        updateTextField('soDangKy', e.target.value)
                      }
                      className="mt-1.5 h-10 w-full rounded border border-[#C7BEB0] px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917]">
                      Mức kiểm chứng hồ sơ
                    </label>
                    <select
                      value={draft.mucKiemChung}
                      onChange={(e) =>
                        updateField(
                          'mucKiemChung',
                          e.target.value as VerificationLevel
                        )
                      }
                      className="mt-1.5 h-10 w-full rounded border border-[#C7BEB0] bg-white px-3 text-sm"
                    >
                      <option value="chua_co_du_lieu">Còn thiếu dữ liệu</option>
                      <option value="cho_xac_minh">Chờ xác minh</option>
                      <option value="da_xac_minh">Đã xác minh</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#1C1917]">
                      Nơi lưu giữ hiện nay (không ghi vị trí kho/tủ nhạy cảm)
                    </label>
                    <input
                      type="text"
                      value={draft.noiLuuGiuHienNay ?? ''}
                      placeholder={MISSING_DATA_TEXT}
                      onChange={(e) =>
                        updateTextField('noiLuuGiuHienNay', e.target.value)
                      }
                      className="mt-1.5 h-10 w-full rounded border border-[#C7BEB0] px-3 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#1C1917]">
                      Vị trí trưng bày (chỉ ghi mô tả chung, bỏ trống nếu chưa có sơ đồ)
                    </label>
                    <input
                      type="text"
                      value={draft.viTriTrungBay ?? ''}
                      placeholder={MISSING_DATA_TEXT}
                      onChange={(e) =>
                        updateTextField('viTriTrungBay', e.target.value)
                      }
                      className="mt-1.5 h-10 w-full rounded border border-[#C7BEB0] px-3 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#1C1917]">
                      Ghi chú mức kiểm chứng
                    </label>
                    <textarea
                      rows={2}
                      value={draft.ghiChuKiemChung ?? ''}
                      placeholder={MISSING_DATA_TEXT}
                      onChange={(e) =>
                        updateTextField('ghiChuKiemChung', e.target.value)
                      }
                      className="mt-1.5 w-full rounded border border-[#C7BEB0] p-2.5 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#1C1917]">
                      Nơi lưu giữ tại thời điểm tạo ra / sử dụng (nếu có căn cứ)
                    </label>
                    <input
                      type="text"
                      value={draft.noiLuuGiuBanDau ?? ''}
                      placeholder={MISSING_DATA_TEXT}
                      onChange={(e) =>
                        updateTextField('noiLuuGiuBanDau', e.target.value)
                      }
                      className="mt-1.5 h-10 w-full rounded border border-[#C7BEB0] px-3 text-sm"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'B' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917]">
                        Chất liệu
                      </label>
                      <input
                        type="text"
                        value={draft.chatLieu ?? ''}
                        placeholder={MISSING_DATA_TEXT}
                        onChange={(e) =>
                          updateTextField('chatLieu', e.target.value)
                        }
                        className="mt-1.5 h-10 w-full rounded border border-[#C7BEB0] px-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917]">
                        Niên đại
                      </label>
                      <input
                        type="text"
                        value={draft.nienDai ?? ''}
                        placeholder={MISSING_DATA_TEXT}
                        onChange={(e) =>
                          updateTextField('nienDai', e.target.value)
                        }
                        className="mt-1.5 h-10 w-full rounded border border-[#C7BEB0] px-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917]">
                        Kích thước
                      </label>
                      <input
                        type="text"
                        value={draft.kichThuoc ?? ''}
                        placeholder={MISSING_DATA_TEXT}
                        onChange={(e) =>
                          updateTextField('kichThuoc', e.target.value)
                        }
                        className="mt-1.5 h-10 w-full rounded border border-[#C7BEB0] px-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917]">
                        Trọng lượng (nếu có)
                      </label>
                      <input
                        type="text"
                        value={draft.trongLuong ?? ''}
                        placeholder={MISSING_DATA_TEXT}
                        onChange={(e) =>
                          updateTextField('trongLuong', e.target.value)
                        }
                        className="mt-1.5 h-10 w-full rounded border border-[#C7BEB0] px-3 text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#1C1917]">
                        Tình trạng bảo quản
                      </label>
                      <input
                        type="text"
                        value={draft.tinhTrangBaoQuan ?? ''}
                        placeholder={MISSING_DATA_TEXT}
                        onChange={(e) =>
                          updateTextField('tinhTrangBaoQuan', e.target.value)
                        }
                        className="mt-1.5 h-10 w-full rounded border border-[#C7BEB0] px-3 text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#1C1917]">
                        Mô tả đặc điểm hình thái
                      </label>
                      <textarea
                        rows={4}
                        value={draft.moTaHinhThai ?? ''}
                        placeholder={MISSING_DATA_TEXT}
                        onChange={(e) =>
                          updateTextField('moTaHinhThai', e.target.value)
                        }
                        className="mt-1.5 w-full rounded border border-[#C7BEB0] p-3 text-sm"
                      />
                    </div>
                  </div>

                  {/* Gemini Function 2: Editorial Description Standardization */}
                  <div className="border border-[#DDD6C8] bg-[#F4F0E8]/70 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold text-[#1C1917]">
                          Hỗ trợ biên tập & chuẩn hóa diễn đạt (Gemini)
                        </p>
                        <p className="mt-0.5 text-xs text-[#57534E]">
                          Chỉ tổng hợp từ các trường đã nhập trong hồ sơ này;
                          không tự suy đoán niên đại hay chất liệu.
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={aiLoading}
                        onClick={handleRequestAiDescription}
                        className="inline-flex h-9 items-center gap-1.5 rounded border border-[#7C2D12] bg-[#FFFFFF] px-3 text-xs font-medium text-[#7C2D12] hover:bg-[#7C2D12] hover:text-[#FBF9F5] transition-colors shrink-0 cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>
                          {aiLoading
                            ? 'Đang tạo đề xuất...'
                            : 'Đề xuất chuẩn hóa mô tả'}
                        </span>
                      </button>
                    </div>

                    {aiError && (
                      <p className="mt-3 text-xs text-[#991B1B]">{aiError}</p>
                    )}

                    {aiSuggestion && (
                      <div className="mt-4 border border-[#92400E]/30 bg-[#FFFFFF] p-4">
                        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#92400E]">
                          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Nội dung đề xuất – Chưa kiểm chứng</span>
                        </p>
                        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#1C1917]">
                          {aiSuggestion}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              updateTextField('moTaHinhThai', aiSuggestion);
                              setAiSuggestion(null);
                            }}
                            className="inline-flex items-center gap-1 rounded bg-[#1C1917] px-3 py-1.5 text-xs font-medium text-[#FBF9F5] cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>
                              Chấp nhận đưa vào bản nháp (chưa tự động lưu)
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAiSuggestion(null)}
                            className="rounded border border-[#C7BEB0] px-3 py-1.5 text-xs text-[#57534E] cursor-pointer"
                          >
                            Bỏ qua
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'C' && (
                <div className="space-y-4">
                  {(
                    [
                      ['nguonGoc', 'Nguồn gốc hiện vật'],
                      ['boiCanhLichSu', 'Bối cảnh lịch sử'],
                      ['giaTriLichSu', 'Giá trị lịch sử'],
                      ['giaTriVanHoa', 'Giá trị văn hóa'],
                      ['giaTriKhoaHoc', 'Giá trị khoa học'],
                      ['quaTrinhSuuTam', 'Quá trình sưu tầm hoặc tiếp nhận'],
                    ] as Array<[keyof ArtifactRecord, string]>
                  ).map(([key, label]) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-[#1C1917]">
                        {label}
                      </label>
                      <textarea
                        rows={2}
                        value={(draft[key] as string | null) ?? ''}
                        placeholder={MISSING_DATA_TEXT}
                        onChange={(e) => updateTextField(key, e.target.value)}
                        className="mt-1.5 w-full rounded border border-[#C7BEB0] p-2.5 text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'D' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917]">
                        Loại bản đang hiển thị
                      </label>
                      <select
                        value={draft.loaiBanDangHienThi ?? ''}
                        onChange={(e) =>
                          updateField(
                            'loaiBanDangHienThi',
                            (e.target.value || null) as ArtifactVersionType | null
                          )
                        }
                        className="mt-1.5 h-10 w-full rounded border border-[#C7BEB0] bg-white px-3 text-sm"
                      >
                        <option value="">{MISSING_DATA_TEXT}</option>
                        {VERSION_TYPES.map((vt) => (
                          <option key={vt} value={vt}>
                            {vt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917]">
                        Tình trạng bản gốc
                      </label>
                      <input
                        type="text"
                        value={draft.tinhTrangBanGoc ?? ''}
                        placeholder={MISSING_DATA_TEXT}
                        onChange={(e) =>
                          updateTextField('tinhTrangBanGoc', e.target.value)
                        }
                        className="mt-1.5 h-10 w-full rounded border border-[#C7BEB0] px-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917]">
                        Ngày số hóa
                      </label>
                      <input
                        type="text"
                        value={draft.ngaySoHoa ?? ''}
                        placeholder="YYYY-MM-DD hoặc Còn thiếu dữ liệu"
                        onChange={(e) =>
                          updateTextField('ngaySoHoa', e.target.value)
                        }
                        className="mt-1.5 h-10 w-full rounded border border-[#C7BEB0] px-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917]">
                        Người thực hiện số hóa
                      </label>
                      <input
                        type="text"
                        value={draft.nguoiThucHienSoHoa ?? ''}
                        placeholder={MISSING_DATA_TEXT}
                        onChange={(e) =>
                          updateTextField('nguoiThucHienSoHoa', e.target.value)
                        }
                        className="mt-1.5 h-10 w-full rounded border border-[#C7BEB0] px-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917]">
                        Thông tin tệp ảnh
                      </label>
                      <input
                        type="text"
                        value={draft.thongTinTepAnh ?? ''}
                        placeholder={MISSING_DATA_TEXT}
                        onChange={(e) =>
                          updateTextField('thongTinTepAnh', e.target.value)
                        }
                        className="mt-1.5 h-10 w-full rounded border border-[#C7BEB0] px-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917]">
                        Nguồn thông tin
                      </label>
                      <input
                        type="text"
                        value={draft.nguonThongTin ?? ''}
                        placeholder={MISSING_DATA_TEXT}
                        onChange={(e) =>
                          updateTextField('nguonThongTin', e.target.value)
                        }
                        className="mt-1.5 h-10 w-full rounded border border-[#C7BEB0] px-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917]">
                        Chú thích ảnh chung
                      </label>
                      <input
                        type="text"
                        value={draft.chuThichAnh ?? ''}
                        placeholder={MISSING_DATA_TEXT}
                        onChange={(e) =>
                          updateTextField('chuThichAnh', e.target.value)
                        }
                        className="mt-1.5 h-10 w-full rounded border border-[#C7BEB0] px-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917]">
                        Nguồn ảnh chung
                      </label>
                      <input
                        type="text"
                        value={draft.nguonAnh ?? ''}
                        placeholder={MISSING_DATA_TEXT}
                        onChange={(e) =>
                          updateTextField('nguonAnh', e.target.value)
                        }
                        className="mt-1.5 h-10 w-full rounded border border-[#C7BEB0] px-3 text-sm"
                      />
                    </div>
                  </div>

                  {/* Image list inside dedicated folder /images/hien-vat/HSxxx */}
                  <div className="border-t border-[#DDD6C8] pt-5">
                    <h3 className="text-sm font-semibold text-[#1C1917]">
                      Danh sách ảnh thật theo thư mục /images/hien-vat/
                      {draft.maHoSo}/
                    </h3>
                    <p className="mt-1 text-xs text-[#57534E]">
                      Chỉ thêm ảnh thật có nguồn hợp pháp và được phép công bố.
                      Ảnh chưa được cấp phép sẽ không hiển thị công khai.
                    </p>

                    {draft.danhSachAnh.length > 0 && (
                      <ul className="mt-3 space-y-2">
                        {draft.danhSachAnh.map((img, i) => (
                          <li
                            key={img.id}
                            className="flex items-center justify-between gap-3 border border-[#EFECE6] bg-[#FBF9F5] p-3 text-xs"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-mono text-[#1C1917]">
                                {img.url}
                              </p>
                              <p className="mt-0.5 text-[#57534E]">
                                {img.loaiAnh === 'chi_tiet'
                                  ? 'Ảnh chi tiết'
                                  : 'Ảnh toàn cảnh'}{' '}
                                · Nguồn: {img.nguonAnh || MISSING_DATA_TEXT} ·{' '}
                                {img.duocPhepCongBo
                                  ? 'Được phép công bố'
                                  : 'Chưa cấp phép công bố'}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setDraft((prev) => ({
                                  ...prev,
                                  danhSachAnh: prev.danhSachAnh.filter(
                                    (_, idx) => idx !== i
                                  ),
                                }))
                              }
                              className="text-[#57534E] hover:text-[#991B1B] cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-4 grid grid-cols-1 gap-3 border border-[#EFECE6] bg-[#F4F0E8]/50 p-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="block text-xs font-medium text-[#1C1917]">
                            Đường dẫn tệp ảnh thật (hoặc tải từ thiết bị vào /images/hien-vat/
                            {draft.maHoSo}/)
                          </label>
                          <div>
                            <input
                              ref={imageFileInputRef}
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={handleUploadRealImageFile}
                              className="hidden"
                            />
                            <button
                              type="button"
                              disabled={uploadingImage}
                              onClick={() => imageFileInputRef.current?.click()}
                              className="inline-flex items-center gap-1 rounded border border-[#7C2D12] bg-white px-2.5 py-1 text-xs font-medium text-[#7C2D12] hover:bg-[#7C2D12] hover:text-white disabled:opacity-50 cursor-pointer"
                            >
                              <Upload className="h-3 w-3" aria-hidden="true" />
                              <span>
                                {uploadingImage
                                  ? 'Đang tải...'
                                  : 'Tải ảnh thật từ máy'}
                              </span>
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={newImgUrl}
                          onChange={(e) => setNewImgUrl(e.target.value)}
                          placeholder={`/images/hien-vat/${draft.maHoSo}/...`}
                          className="mt-1.5 h-9 w-full rounded border border-[#C7BEB0] bg-white px-2.5 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#1C1917]">
                          Loại ảnh
                        </label>
                        <select
                          value={newImgType}
                          onChange={(e) =>
                            setNewImgType(
                              e.target.value as 'toan_canh' | 'chi_tiet'
                            )
                          }
                          className="mt-1 h-9 w-full rounded border border-[#C7BEB0] bg-white px-2.5 text-xs"
                        >
                          <option value="toan_canh">Ảnh toàn cảnh</option>
                          <option value="chi_tiet">Ảnh chi tiết</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#1C1917]">
                          Nguồn ảnh
                        </label>
                        <input
                          type="text"
                          value={newImgSource}
                          onChange={(e) => setNewImgSource(e.target.value)}
                          placeholder="Đơn vị / tác giả ảnh"
                          className="mt-1 h-9 w-full rounded border border-[#C7BEB0] bg-white px-2.5 text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-[#1C1917]">
                          Chú thích ảnh
                        </label>
                        <input
                          type="text"
                          value={newImgCaption}
                          onChange={(e) => setNewImgCaption(e.target.value)}
                          placeholder="Mô tả góc chụp hiện vật"
                          className="mt-1 h-9 w-full rounded border border-[#C7BEB0] bg-white px-2.5 text-xs"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:col-span-2">
                        <label className="inline-flex items-center gap-2 text-xs text-[#1C1917] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newImgPermitted}
                            onChange={(e) =>
                              setNewImgPermitted(e.target.checked)
                            }
                            className="h-4 w-4 accent-[#7C2D12]"
                          />
                          <span>
                            Xác nhận ảnh thật đã được người có thẩm quyền cho
                            phép công bố
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={handleAddImage}
                          disabled={!newImgUrl.trim()}
                          className="inline-flex items-center gap-1 rounded bg-[#1C1917] px-3 py-1.5 text-xs font-medium text-[#FBF9F5] disabled:opacity-40 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Thêm ảnh</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'E' && (
                <div className="space-y-4">
                  {(
                    [
                      ['donViQuanLy', 'Đơn vị hoặc cá nhân quản lý hiện vật'],
                      ['nguoiChoPhepCongBo', 'Người cho phép công bố hình ảnh'],
                      [
                        'phamViDuocPhepCongBo',
                        'Phạm vi được phép sử dụng / công bố',
                      ],
                      ['phanKhongCongBo', 'Nội dung không được công bố'],
                    ] as Array<[keyof ArtifactRecord, string]>
                  ).map(([key, label]) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-[#1C1917]">
                        {label}
                      </label>
                      <textarea
                        rows={2}
                        value={(draft[key] as string | null) ?? ''}
                        placeholder={MISSING_DATA_TEXT}
                        onChange={(e) => updateTextField(key, e.target.value)}
                        className="mt-1.5 w-full rounded border border-[#C7BEB0] p-2.5 text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'DC' && (
                <div className="space-y-4">
                  <p className="text-xs text-[#57534E]">
                    15 trường mô tả chuẩn Dublin Core cho hồ sơ {draft.maHoSo}:
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {DUBLIN_CORE_FIELDS.map((dc, idx) => (
                      <div
                        key={dc.key}
                        className={
                          dc.key === 'description' ? 'sm:col-span-2' : ''
                        }
                      >
                        <label className="block text-xs font-semibold text-[#1C1917]">
                          {idx + 1}. {dc.labelEn} — {dc.labelVi}
                        </label>
                        {dc.key === 'description' ? (
                          <textarea
                            rows={3}
                            value={draft.dublinCore[dc.key] ?? ''}
                            placeholder={MISSING_DATA_TEXT}
                            onChange={(e) =>
                              updateDcField(dc.key, e.target.value)
                            }
                            className="mt-1.5 w-full rounded border border-[#C7BEB0] p-2.5 text-sm"
                          />
                        ) : (
                          <input
                            type="text"
                            disabled={dc.key === 'identifier'}
                            value={draft.dublinCore[dc.key] ?? ''}
                            placeholder={MISSING_DATA_TEXT}
                            onChange={(e) =>
                              updateDcField(dc.key, e.target.value)
                            }
                            className={`mt-1.5 h-10 w-full rounded border px-3 text-sm ${
                              dc.key === 'identifier'
                                ? 'border-[#DDD6C8] bg-[#F4F0E8] font-mono text-[#57534E]'
                                : 'border-[#C7BEB0]'
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
