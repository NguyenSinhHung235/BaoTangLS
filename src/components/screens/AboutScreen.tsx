import { useState } from 'react';
import { CheckCircle2, Clock, Plus, Save, Trash2 } from 'lucide-react';
import type { ArchiveMetadataStore, TeamMemberRecord } from '../../types/artifact';
import { displayValue } from '../../utils/artifactHelpers';

interface AboutScreenProps {
  store: ArchiveMetadataStore;
  onSaveStore: (next: ArchiveMetadataStore) => Promise<void>;
}

const COMPLETED_ITEMS = [
  'Thiết kế và xây dựng khung giao diện website BẢO TÀNG LS hỗ trợ tiếng Việt có dấu (UTF-8), tương thích điện thoại, máy tính bảng và máy tính.',
  'Xây dựng đầy đủ 7 màn hình liên kết với nhau: Trang chủ, Danh sách 15 hiện vật, Chi tiết hồ sơ, Tra cứu và hỏi đáp, Nguồn tư liệu và ghi nhận, Giới thiệu, Quản lý dữ liệu và xuất hồ sơ.',
  'Nạp dữ liệu mô tả ban đầu cho toàn bộ 15 hiện vật tiêu biểu của Bảo tàng tỉnh Lạng Sơn (HS001–HS015) vào tệp hienvat.json theo chuẩn 15 trường Dublin Core và trường kiểm kê.',
  'Cập nhật 3 nguồn tham khảo chính (Trang tin điện tử Bảo tàng tỉnh Lạng Sơn, Cục Di sản văn hóa, Báo Lạng Sơn) và ghi nhận hiến tặng của gia đình bà Mông Thị Thơm (HS007, HS008).',
  'Tách biệt thư mục lưu trữ ảnh hiện vật theo từng mã hồ sơ (/images/hien-vat/HS001–HS015), giữ nguyên trạng thái khung ảnh trống khi chưa có ảnh gốc được cấp phép.',
  'Hoàn thiện công cụ tìm kiếm, lọc theo loại/niên đại/chất liệu/tình trạng, nhập/xuất tệp JSON và CSV có ngày tháng xuất dữ liệu, cùng cổng hỏi đáp Gemini dẫn mã hồ sơ.',
];

const PENDING_ITEMS = [
  'Bổ sung số đăng ký hiện vật cho các hồ sơ còn thiếu (hiện chỉ có súng thần công HS003 ghi mã hiệu BTLS 182).',
  'Bổ sung mô tả chi tiết tình trạng bản gốc (mức độ nguyên vẹn, hư hại) và vị trí trưng bày cụ thể (gian, tủ, sơ đồ trưng bày) sau khi liên hệ Bảo tàng tỉnh Lạng Sơn.',
  'Bổ sung văn bản xác nhận người cho phép công bố hình ảnh, phạm vi sử dụng và phần thông tin không công bố cho từng hiện vật.',
  'Bổ sung bộ ảnh chụp hiện vật thật (toàn cảnh và chi tiết) hợp pháp kèm chú thích và nguồn ảnh vào thư mục /images/hien-vat/HS001–HS015.',
  'Bổ sung thông tin họ tên, mã sinh viên và phân công nhiệm vụ của nhóm thực hiện dự án.',
];

export function AboutScreen({ store, onSaveStore }: AboutScreenProps) {
  const [editingTeam, setEditingTeam] = useState(false);
  const [draftTeam, setDraftTeam] = useState<TeamMemberRecord[]>(
    store.nhomThucHien
  );
  const [saving, setSaving] = useState(false);

  const handleSaveTeam = async () => {
    setSaving(true);
    try {
      await onSaveStore({ ...store, nhomThucHien: draftTeam });
      setEditingTeam(false);
    } finally {
      setSaving(false);
    }
  };

  const addMember = () => {
    setDraftTeam((prev) => [
      ...prev,
      {
        id: `TV${String(prev.length + 1).padStart(3, '0')}`,
        hoTen: null,
        maSinhVien: null,
        vaiTro: null,
      },
    ]);
  };

  const membersToDisplay = editingTeam ? draftTeam : store.nhomThucHien;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-[#DDD6C8] pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7C2D12]">
          Màn hình 6 · Hồ sơ dự án
        </p>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-[#1C1917] sm:text-4xl">
          Giới thiệu dự án BẢO TÀNG LS
        </h1>
        <p className="mt-2 max-w-2xl text-base text-[#44403C]">
          Chủ đề:{' '}
          <strong className="font-semibold text-[#1C1917]">
            Hồ sơ số cho 15 hiện vật tiêu biểu của Bảo tàng tỉnh Lạng Sơn
          </strong>
        </p>
      </div>

      {/* Objectives, Significance & Scope */}
      <section className="grid grid-cols-1 gap-8 border-b border-[#DDD6C8] py-10 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
              Mục tiêu và ý nghĩa của dự án
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#44403C]">
              Dự án BẢO TÀNG LS hướng tới xây dựng một hệ thống hồ sơ số chuẩn
              hóa cho 15 hiện vật tiêu biểu của Bảo tàng tỉnh Lạng Sơn. Thông
              qua việc số hóa cấu trúc thông tin theo chuẩn Dublin Core và các
              trường kiểm kê chuyên ngành, nền tảng giúp cán bộ bảo tàng thuận
              tiện trong quản lý dữ liệu, đồng thời tạo điều kiện để nhà nghiên
              cứu, giảng viên, sinh viên và công chúng tiếp cận tri thức di sản
              một cách khoa học, minh bạch.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
              Phạm vi triển khai
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#44403C]">
              <li>
                · Quy mô giai đoạn 1: Thiết lập khung hệ thống cho 15 hồ sơ hiện
                vật định danh từ <span className="font-mono text-[#1C1917]">HS001</span>{' '}
                đến <span className="font-mono text-[#1C1917]">HS015</span>.
              </li>
              <li>
                · Chuẩn dữ liệu: Áp dụng 15 trường siêu dữ liệu Dublin Core kết
                hợp hệ thống trường nhận diện, đặc điểm vật lý, lịch sử – giá
                trị, thông tin số hóa và quyền công bố.
              </li>
              <li>
                · Nguyên tắc kiểm chứng: Tuyệt đối không tạo dữ liệu giả hoặc sử
                dụng hình ảnh do AI tạo ra thay thế tư liệu bảo tàng thật.
              </li>
            </ul>
          </div>
        </div>

        {/* Nhóm thực hiện */}
        <div className="lg:col-span-5">
          <div className="border border-[#DDD6C8] bg-[#FFFFFF] p-6">
            <div className="flex items-center justify-between gap-2 border-b border-[#EFECE6] pb-3">
              <div>
                <h2 className="font-serif text-xl font-semibold text-[#1C1917]">
                  Nhóm thực hiện
                </h2>
                <p className="mt-0.5 text-xs text-[#57534E]">
                  Họ tên và mã sinh viên sẽ được cập nhật khi cung cấp chính
                  thức.
                </p>
              </div>
              {!editingTeam ? (
                <button
                  type="button"
                  onClick={() => {
                    setDraftTeam(
                      JSON.parse(
                        JSON.stringify(store.nhomThucHien)
                      ) as TeamMemberRecord[]
                    );
                    setEditingTeam(true);
                  }}
                  className="rounded border border-[#C7BEB0] px-2.5 py-1 text-xs font-medium text-[#1C1917] hover:bg-[#F4F0E8] cursor-pointer"
                >
                  Cập nhật
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingTeam(false)}
                    className="rounded border border-[#C7BEB0] px-2.5 py-1 text-xs text-[#57534E] cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveTeam}
                    className="inline-flex items-center gap-1 rounded bg-[#7C2D12] px-2.5 py-1 text-xs font-medium text-[#FBF9F5] cursor-pointer"
                  >
                    <Save className="h-3 w-3" />
                    <span>Lưu</span>
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {membersToDisplay.map((member, idx) => (
                <div
                  key={member.id}
                  className="border border-[#EFECE6] bg-[#FBF9F5] p-3.5 text-xs"
                >
                  {editingTeam ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[#57534E]">
                          {member.id}
                        </span>
                        <button
                          type="button"
                          disabled={draftTeam.length <= 1}
                          onClick={() =>
                            setDraftTeam((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                          className="text-[#57534E] hover:text-[#991B1B] disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={member.hoTen ?? ''}
                        placeholder="Họ và tên (Còn thiếu dữ liệu)"
                        onChange={(e) => {
                          const next = [...draftTeam];
                          next[idx] = {
                            ...member,
                            hoTen: e.target.value || null,
                          };
                          setDraftTeam(next);
                        }}
                        className="w-full rounded border border-[#C7BEB0] bg-white px-2.5 py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        value={member.maSinhVien ?? ''}
                        placeholder="Mã sinh viên (Còn thiếu dữ liệu)"
                        onChange={(e) => {
                          const next = [...draftTeam];
                          next[idx] = {
                            ...member,
                            maSinhVien: e.target.value || null,
                          };
                          setDraftTeam(next);
                        }}
                        className="w-full rounded border border-[#C7BEB0] bg-white px-2.5 py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        value={member.vaiTro ?? ''}
                        placeholder="Vai trò thực hiện (Còn thiếu dữ liệu)"
                        onChange={(e) => {
                          const next = [...draftTeam];
                          next[idx] = {
                            ...member,
                            vaiTro: e.target.value || null,
                          };
                          setDraftTeam(next);
                        }}
                        className="w-full rounded border border-[#C7BEB0] bg-white px-2.5 py-1.5 text-xs"
                      />
                    </div>
                  ) : (
                    <dl className="space-y-1.5">
                      <div className="flex justify-between gap-2">
                        <dt className="text-[#57534E]">Họ và tên</dt>
                        <dd className="font-medium text-[#1C1917]">
                          {displayValue(member.hoTen)}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-[#57534E]">Mã sinh viên</dt>
                        <dd className="font-mono text-[#1C1917]">
                          {displayValue(member.maSinhVien)}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-[#57534E]">Vai trò</dt>
                        <dd className="text-[#44403C]">
                          {displayValue(member.vaiTro)}
                        </dd>
                      </div>
                    </dl>
                  )}
                </div>
              ))}

              {editingTeam && (
                <button
                  type="button"
                  onClick={addMember}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded border border-dashed border-[#C7BEB0] py-2 text-xs font-medium text-[#57534E] hover:text-[#1C1917] cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Thêm thành viên</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Completed vs Missing Matrix */}
      <section className="grid grid-cols-1 gap-8 pt-10 lg:grid-cols-2">
        <div className="border border-[#DDD6C8] bg-[#FFFFFF] p-6">
          <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-[#14532D]">
            <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>Những nội dung đã thực hiện</span>
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#44403C]">
            {COMPLETED_ITEMS.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="font-mono text-xs font-semibold text-[#14532D] mt-0.5 tabular-nums">
                  {String(i + 1).padStart(2, '0')}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-[#DDD6C8] bg-[#F4F0E8]/70 p-6">
          <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-[#92400E]">
            <Clock className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>Những nội dung còn thiếu hoặc chưa hoàn thành</span>
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#44403C]">
            {PENDING_ITEMS.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="font-mono text-xs font-semibold text-[#92400E] mt-0.5 tabular-nums">
                  {String(i + 1).padStart(2, '0')}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
