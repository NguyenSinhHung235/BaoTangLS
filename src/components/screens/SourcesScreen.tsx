import { useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import type {
  ArchiveMetadataStore,
  RightsGrantRecord,
  SourceDocumentRecord,
  VerificationLevel,
} from '../../types/artifact';
import { displayValue } from '../../utils/artifactHelpers';
import { StatusText } from '../StatusText';

interface SourcesScreenProps {
  store: ArchiveMetadataStore;
  onSaveStore: (next: ArchiveMetadataStore) => Promise<void>;
}

export function SourcesScreen({ store, onSaveStore }: SourcesScreenProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ArchiveMetadataStore>(store);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const startEditing = () => {
    setDraft(JSON.parse(JSON.stringify(store)) as ArchiveMetadataStore);
    setEditing(true);
    setNotice(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setNotice(null);
    try {
      await onSaveStore(draft);
      setEditing(false);
      setNotice('Đã lưu danh mục nguồn tư liệu và quyền công bố.');
    } catch {
      setNotice('Không thể lưu thay đổi. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const addSource = () => {
    const nextIdx = draft.nguonTuLieu.length + 1;
    const item: SourceDocumentRecord = {
      id: `TL${String(nextIdx).padStart(3, '0')}`,
      tenTaiLieu: null,
      coQuanPhatHanh: null,
      duongDanTruyCap: null,
      loaiNguon: null,
      noiDungSuDung: null,
      trangThaiXacMinh: 'chua_co_du_lieu',
    };
    setDraft({ ...draft, nguonTuLieu: [...draft.nguonTuLieu, item] });
  };

  const addGrant = () => {
    const nextIdx = draft.quyenCongBo.length + 1;
    const item: RightsGrantRecord = {
      id: `Q${String(nextIdx).padStart(3, '0')}`,
      tenNguoiHoacDonVi: null,
      vaiTro: null,
      ngayDongY: null,
      phamViCongBo: null,
      gioiHanSuDung: null,
    };
    setDraft({ ...draft, quyenCongBo: [...draft.quyenCongBo, item] });
  };

  const dataToShow = editing ? draft : store;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-[#DDD6C8] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7C2D12]">
            Màn hình 5 · Minh bạch nguồn gốc & bản quyền
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-[#1C1917] sm:text-4xl">
            Nguồn tư liệu và ghi nhận quyền công bố
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#57534E]">
            Ghi nhận đầy đủ các nguồn tài liệu tham chiếu và văn bản đồng ý
            công bố hình ảnh, thông tin hiện vật của Bảo tàng tỉnh Lạng Sơn.
            Không tự tạo tên cơ quan, người cấp phép hoặc đường dẫn nguồn.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!editing ? (
            <button
              type="button"
              onClick={startEditing}
              className="rounded-md border border-[#C7BEB0] bg-[#FFFFFF] px-4 py-2 text-sm font-medium text-[#1C1917] hover:bg-[#F4F0E8] transition-colors cursor-pointer"
            >
              Cập nhật khi có tư liệu
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-md border border-[#C7BEB0] bg-[#FFFFFF] px-4 py-2 text-sm font-medium text-[#57534E] hover:bg-[#F4F0E8] cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#7C2D12] px-4 py-2 text-sm font-medium text-[#FBF9F5] hover:bg-[#5E220D] disabled:opacity-50 cursor-pointer"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {notice && (
        <div className="mt-6 border border-[#DDD6C8] bg-[#F4F0E8] px-4 py-3 text-sm text-[#1C1917]">
          {notice}
        </div>
      )}

      {/* Section A: Nguồn tư liệu */}
      <section className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
              A. Nguồn tư liệu
            </h2>
            <p className="mt-1 text-xs text-[#57534E]">
              Danh mục tài liệu gốc, hồ sơ kiểm kê, ấn phẩm khoa học hoặc nguồn
              lưu trữ được sử dụng để biên soạn 15 hồ sơ.
            </p>
          </div>
          {editing && (
            <button
              type="button"
              onClick={addSource}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#C7BEB0] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#1C1917] hover:bg-[#F4F0E8] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Thêm dòng nguồn</span>
            </button>
          )}
        </div>

        <div className="mt-5 overflow-x-auto border border-[#DDD6C8] bg-[#FFFFFF]">
          <table className="w-full min-w-[780px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#DDD6C8] bg-[#F4F0E8] text-xs font-semibold text-[#57534E]">
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3">Tên tài liệu hoặc nguồn</th>
                <th className="px-4 py-3">Cơ quan phát hành / quản lý</th>
                <th className="px-4 py-3">Đường dẫn truy cập</th>
                <th className="px-4 py-3">Loại nguồn</th>
                <th className="px-4 py-3">Nội dung được sử dụng</th>
                <th className="px-4 py-3">Trạng thái xác minh</th>
                {editing && <th className="px-4 py-3">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE6]">
              {dataToShow.nguonTuLieu.map((src, idx) => (
                <tr key={src.id} className="align-top">
                  <td className="px-4 py-3.5 font-mono text-xs text-[#57534E]">
                    {src.id}
                  </td>
                  {editing ? (
                    <>
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={src.tenTaiLieu ?? ''}
                          placeholder="Còn thiếu dữ liệu"
                          onChange={(e) => {
                            const next = [...draft.nguonTuLieu];
                            next[idx] = {
                              ...src,
                              tenTaiLieu: e.target.value || null,
                            };
                            setDraft({ ...draft, nguonTuLieu: next });
                          }}
                          className="w-full rounded border border-[#C7BEB0] px-2 py-1.5 text-xs"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={src.coQuanPhatHanh ?? ''}
                          placeholder="Còn thiếu dữ liệu"
                          onChange={(e) => {
                            const next = [...draft.nguonTuLieu];
                            next[idx] = {
                              ...src,
                              coQuanPhatHanh: e.target.value || null,
                            };
                            setDraft({ ...draft, nguonTuLieu: next });
                          }}
                          className="w-full rounded border border-[#C7BEB0] px-2 py-1.5 text-xs"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={src.duongDanTruyCap ?? ''}
                          placeholder="Còn thiếu dữ liệu"
                          onChange={(e) => {
                            const next = [...draft.nguonTuLieu];
                            next[idx] = {
                              ...src,
                              duongDanTruyCap: e.target.value || null,
                            };
                            setDraft({ ...draft, nguonTuLieu: next });
                          }}
                          className="w-full rounded border border-[#C7BEB0] px-2 py-1.5 text-xs"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={src.loaiNguon ?? ''}
                          placeholder="Còn thiếu dữ liệu"
                          onChange={(e) => {
                            const next = [...draft.nguonTuLieu];
                            next[idx] = {
                              ...src,
                              loaiNguon: e.target.value || null,
                            };
                            setDraft({ ...draft, nguonTuLieu: next });
                          }}
                          className="w-full rounded border border-[#C7BEB0] px-2 py-1.5 text-xs"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={src.noiDungSuDung ?? ''}
                          placeholder="Còn thiếu dữ liệu"
                          onChange={(e) => {
                            const next = [...draft.nguonTuLieu];
                            next[idx] = {
                              ...src,
                              noiDungSuDung: e.target.value || null,
                            };
                            setDraft({ ...draft, nguonTuLieu: next });
                          }}
                          className="w-full rounded border border-[#C7BEB0] px-2 py-1.5 text-xs"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <select
                          value={src.trangThaiXacMinh}
                          onChange={(e) => {
                            const next = [...draft.nguonTuLieu];
                            next[idx] = {
                              ...src,
                              trangThaiXacMinh: e.target
                                .value as VerificationLevel,
                            };
                            setDraft({ ...draft, nguonTuLieu: next });
                          }}
                          className="rounded border border-[#C7BEB0] px-2 py-1.5 text-xs"
                        >
                          <option value="chua_co_du_lieu">
                            Còn thiếu dữ liệu
                          </option>
                          <option value="cho_xac_minh">Chờ xác minh</option>
                          <option value="da_xac_minh">Đã xác minh</option>
                        </select>
                      </td>
                      <td className="px-3 py-2.5">
                        <button
                          type="button"
                          aria-label={`Xóa nguồn ${src.id}`}
                          disabled={draft.nguonTuLieu.length <= 1}
                          onClick={() =>
                            setDraft({
                              ...draft,
                              nguonTuLieu: draft.nguonTuLieu.filter(
                                (_, i) => i !== idx
                              ),
                            })
                          }
                          className="rounded p-1.5 text-[#57534E] hover:text-[#991B1B] disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3.5 text-[#1C1917]">
                        {displayValue(src.tenTaiLieu)}
                      </td>
                      <td className="px-4 py-3.5 text-[#44403C]">
                        {displayValue(src.coQuanPhatHanh)}
                      </td>
                      <td className="px-4 py-3.5 text-[#44403C]">
                        {src.duongDanTruyCap ? (
                          <a
                            href={src.duongDanTruyCap}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#7C2D12] underline break-all"
                          >
                            {src.duongDanTruyCap}
                          </a>
                        ) : (
                          <span className="italic text-[#78716C]">
                            Còn thiếu dữ liệu
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-[#44403C]">
                        {displayValue(src.loaiNguon)}
                      </td>
                      <td className="px-4 py-3.5 text-[#44403C]">
                        {displayValue(src.noiDungSuDung)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusText status={src.trangThaiXacMinh} />
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section B: Ghi nhận quyền công bố */}
      <section className="mt-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
              B. Ghi nhận quyền công bố
            </h2>
            <p className="mt-1 text-xs text-[#57534E]">
              Thông tin cá nhân hoặc đơn vị cho phép sử dụng hình ảnh, tư liệu
              hiện vật và giới hạn phạm vi công bố.
            </p>
          </div>
          {editing && (
            <button
              type="button"
              onClick={addGrant}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#C7BEB0] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#1C1917] hover:bg-[#F4F0E8] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Thêm ghi nhận quyền</span>
            </button>
          )}
        </div>

        <div className="mt-5 overflow-x-auto border border-[#DDD6C8] bg-[#FFFFFF]">
          <table className="w-full min-w-[780px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#DDD6C8] bg-[#F4F0E8] text-xs font-semibold text-[#57534E]">
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3">Tên người hoặc đơn vị cho phép</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Ngày đồng ý</th>
                <th className="px-4 py-3">Phạm vi được phép công bố</th>
                <th className="px-4 py-3">
                  Giới hạn sử dụng hình ảnh và thông tin
                </th>
                {editing && <th className="px-4 py-3">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE6]">
              {dataToShow.quyenCongBo.map((grant, idx) => (
                <tr key={grant.id} className="align-top">
                  <td className="px-4 py-3.5 font-mono text-xs text-[#57534E]">
                    {grant.id}
                  </td>
                  {editing ? (
                    <>
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={grant.tenNguoiHoacDonVi ?? ''}
                          placeholder="Còn thiếu dữ liệu"
                          onChange={(e) => {
                            const next = [...draft.quyenCongBo];
                            next[idx] = {
                              ...grant,
                              tenNguoiHoacDonVi: e.target.value || null,
                            };
                            setDraft({ ...draft, quyenCongBo: next });
                          }}
                          className="w-full rounded border border-[#C7BEB0] px-2 py-1.5 text-xs"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={grant.vaiTro ?? ''}
                          placeholder="Còn thiếu dữ liệu"
                          onChange={(e) => {
                            const next = [...draft.quyenCongBo];
                            next[idx] = {
                              ...grant,
                              vaiTro: e.target.value || null,
                            };
                            setDraft({ ...draft, quyenCongBo: next });
                          }}
                          className="w-full rounded border border-[#C7BEB0] px-2 py-1.5 text-xs"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={grant.ngayDongY ?? ''}
                          placeholder="Còn thiếu dữ liệu"
                          onChange={(e) => {
                            const next = [...draft.quyenCongBo];
                            next[idx] = {
                              ...grant,
                              ngayDongY: e.target.value || null,
                            };
                            setDraft({ ...draft, quyenCongBo: next });
                          }}
                          className="w-full rounded border border-[#C7BEB0] px-2 py-1.5 text-xs"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={grant.phamViCongBo ?? ''}
                          placeholder="Còn thiếu dữ liệu"
                          onChange={(e) => {
                            const next = [...draft.quyenCongBo];
                            next[idx] = {
                              ...grant,
                              phamViCongBo: e.target.value || null,
                            };
                            setDraft({ ...draft, quyenCongBo: next });
                          }}
                          className="w-full rounded border border-[#C7BEB0] px-2 py-1.5 text-xs"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={grant.gioiHanSuDung ?? ''}
                          placeholder="Còn thiếu dữ liệu"
                          onChange={(e) => {
                            const next = [...draft.quyenCongBo];
                            next[idx] = {
                              ...grant,
                              gioiHanSuDung: e.target.value || null,
                            };
                            setDraft({ ...draft, quyenCongBo: next });
                          }}
                          className="w-full rounded border border-[#C7BEB0] px-2 py-1.5 text-xs"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <button
                          type="button"
                          aria-label={`Xóa ghi nhận ${grant.id}`}
                          disabled={draft.quyenCongBo.length <= 1}
                          onClick={() =>
                            setDraft({
                              ...draft,
                              quyenCongBo: draft.quyenCongBo.filter(
                                (_, i) => i !== idx
                              ),
                            })
                          }
                          className="rounded p-1.5 text-[#57534E] hover:text-[#991B1B] disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3.5 text-[#1C1917]">
                        {displayValue(grant.tenNguoiHoacDonVi)}
                      </td>
                      <td className="px-4 py-3.5 text-[#44403C]">
                        {displayValue(grant.vaiTro)}
                      </td>
                      <td className="px-4 py-3.5 text-[#44403C] tabular-nums">
                        {displayValue(grant.ngayDongY)}
                      </td>
                      <td className="px-4 py-3.5 text-[#44403C]">
                        {displayValue(grant.phamViCongBo)}
                      </td>
                      <td className="px-4 py-3.5 text-[#44403C]">
                        {displayValue(grant.gioiHanSuDung)}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
