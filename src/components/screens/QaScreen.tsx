import { useState, type FormEvent } from 'react';
import {
  AlertCircle,
  BookMarked,
  Info,
  Send,
  ShieldCheck,
} from 'lucide-react';
import type { GeminiSystemStatus } from '../../types/artifact';

interface QaScreenProps {
  geminiStatus: GeminiSystemStatus | null;
  onSelectArtifact: (maHoSo: string) => void;
}

interface QaMessage {
  id: string;
  question: string;
  answer: string;
  citedCodes: string[];
  hasEvidence: boolean;
  activated: boolean;
  reason?: string;
}

const SAMPLE_STRUCTURED_QUERIES = [
  'Bia Thủy Môn Đình (HS001) được tạo tác vào năm nào và có kích thước ra sao?',
  'Hiện vật HS003 có số hiệu đăng ký và chất liệu gì?',
  'Những hiện vật nào do gia đình bà Mông Thị Thơm hiến tặng?',
];

export function QaScreen({ geminiStatus, onSelectArtifact }: QaScreenProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<QaMessage[]>([]);

  const canAnswerFromData = Boolean(
    geminiStatus?.hasAnyData && geminiStatus?.apiConfigured
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/gemini/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(
          data?.error || 'Không thể kết nối tới điểm xử lý tra cứu.'
        );
        return;
      }

      setHistory((prev) => [
        {
          id: `${Date.now()}`,
          question: trimmed,
          answer: data.answer || 'Chưa có tư liệu để trả lời câu hỏi này',
          citedCodes: Array.isArray(data.citedCodes) ? data.citedCodes : [],
          hasEvidence: Boolean(data.hasEvidence),
          activated: Boolean(data.activated),
          reason: data.reason,
        },
        ...prev,
      ]);
      setQuestion('');
    } catch {
      setErrorMsg('Lỗi kết nối máy chủ khi gửi câu hỏi tra cứu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-[#DDD6C8] pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7C2D12]">
          Màn hình 4 · Tra cứu học thuật có kiểm chứng
        </p>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-[#1C1917] sm:text-4xl">
          Tra cứu và hỏi đáp về 15 hiện vật
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#57534E]">
          Cổng hỏi đáp được thiết kế để tra cứu trực tiếp trên dữ liệu hồ sơ{' '}
          <span className="font-mono text-[#1C1917]">hienvat.json</span> và nguồn
          tư liệu đã xác minh. Hệ thống không sử dụng kiến thức bên ngoài để suy
          diễn thông tin chưa có căn cứ.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left: Readiness Status & Rules */}
        <aside className="space-y-6 lg:col-span-4">
          <div className="border border-[#DDD6C8] bg-[#FFFFFF] p-5">
            <h2 className="font-serif text-lg font-semibold text-[#1C1917]">
              Trạng thái kích hoạt hệ thống
            </h2>

            <dl className="mt-4 divide-y divide-[#EFECE6] text-xs">
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-[#57534E]">Hồ sơ xác minh mức nguồn</dt>
                <dd className="font-mono font-semibold text-[#1C1917] tabular-nums">
                  {geminiStatus?.verifiedRecordsCount ?? 0} / 15
                </dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-[#57534E]">Hồ sơ đã nhập dữ liệu</dt>
                <dd className="font-mono text-[#1C1917] tabular-nums">
                  {geminiStatus?.activeRecordsCount ?? 0} / 15
                </dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-[#57534E]">Chế độ trả lời Gemini</dt>
                <dd className="font-medium text-[#1C1917]">
                  {canAnswerFromData
                    ? 'Đang hoạt động (theo tư liệu hiện có)'
                    : 'Chờ dữ liệu & cấu hình'}
                </dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-[#57534E]">Cổng xử lý máy chủ</dt>
                <dd className="font-mono text-[#57534E]">/api/gemini/qa</dd>
              </div>
            </dl>

            {!canAnswerFromData && (
              <div className="mt-4 border border-[#DDD6C8] bg-[#F4F0E8] p-3.5 text-xs leading-relaxed text-[#44403C]">
                <p className="flex items-center gap-1.5 font-semibold text-[#92400E]">
                  <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Chưa kích hoạt trả lời AI</span>
                </p>
                <p className="mt-1.5">
                  Hiện tại chưa có hồ sơ hiện vật thực tế nào trong dữ liệu hoặc
                  chưa có cấu hình API hợp lệ. Mọi câu hỏi gửi trong giai đoạn
                  này sẽ trả về đúng thông điệp quy chuẩn: “Chưa có tư liệu để
                  trả lời câu hỏi này”.
                </p>
              </div>
            )}
          </div>

          <div className="border border-[#DDD6C8] bg-[#FFFFFF] p-5">
            <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-[#1C1917]">
              <ShieldCheck className="h-4 w-4 text-[#7C2D12]" aria-hidden="true" />
              <span>Nguyên tắc trả lời bắt buộc</span>
            </h2>
            <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-[#57534E]">
              <li>
                1. Chỉ trả lời dựa trên dữ liệu thực tế trong tệp{' '}
                <span className="font-mono text-[#1C1917]">hienvat.json</span>{' '}
                và tài liệu nguồn đã xác minh.
              </li>
              <li>
                2. Mỗi câu trả lời phải dẫn rõ mã hồ sơ liên quan (ví dụ{' '}
                <span className="font-mono text-[#1C1917]">HS001</span>).
              </li>
              <li>
                3. Không tự bổ sung niên đại, chất liệu, nguồn gốc từ bên ngoài.
              </li>
              <li>
                4. Nếu không có thông tin trong dữ liệu, trả lời:{' '}
                <strong className="text-[#1C1917]">
                  “Chưa có tư liệu để trả lời câu hỏi này”
                </strong>
                .
              </li>
            </ul>
          </div>
        </aside>

        {/* Right: Question Input & Grounded Answers */}
        <section className="space-y-6 lg:col-span-8">
          <form
            onSubmit={handleSubmit}
            className="border border-[#DDD6C8] bg-[#FFFFFF] p-5 sm:p-6"
          >
            <label
              htmlFor="qa-question-input"
              className="block text-sm font-semibold text-[#1C1917]"
            >
              Đặt câu hỏi tra cứu hiện vật
            </label>
            <p className="mt-1 text-xs text-[#57534E]">
              Nhập câu hỏi cụ thể về tên, mã hồ sơ (HS001–HS015), chất liệu,
              niên đại hoặc quyền công bố của hiện vật.
            </p>

            <textarea
              id="qa-question-input"
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ví dụ: Hồ sơ HS001 thuộc loại hiện vật nào và được lưu giữ ở đâu?"
              className="mt-3 w-full rounded-md border border-[#C7BEB0] bg-[#FBF9F5] p-3 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#7C2D12] focus:outline-none"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {SAMPLE_STRUCTURED_QUERIES.map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setQuestion(sample)}
                    className="rounded border border-[#DDD6C8] bg-[#F4F0E8] px-2.5 py-1 text-xs text-[#44403C] hover:border-[#7C2D12] hover:text-[#1C1917] transition-colors cursor-pointer"
                  >
                    {sample}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-md bg-[#7C2D12] px-5 py-2 text-sm font-medium text-[#FBF9F5] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5E220D] transition-colors cursor-pointer"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                <span>{loading ? 'Đang kiểm tra tư liệu...' : 'Gửi câu hỏi'}</span>
              </button>
            </div>

            {errorMsg && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-[#991B1B]">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{errorMsg}</span>
              </p>
            )}
          </form>

          {/* Answer Thread */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-semibold text-[#1C1917]">
              Kết quả tra cứu
            </h2>

            {history.length === 0 ? (
              <div className="border border-dashed border-[#C7BEB0] bg-[#F4F0E8]/50 px-6 py-12 text-center">
                <BookMarked
                  className="mx-auto h-8 w-8 text-[#8C8377] stroke-[1.25]"
                  aria-hidden="true"
                />
                <p className="mt-3 font-serif text-lg font-medium text-[#1C1917]">
                  Chưa có phiên tra cứu nào
                </p>
                <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-[#57534E]">
                  Khi dữ liệu 15 hiện vật được bổ sung và xác minh, câu trả lời
                  sẽ hiển thị kèm trích dẫn mã hồ sơ (HS001–HS015) tại đây.
                </p>
              </div>
            ) : (
              history.map((item) => (
                <article
                  key={item.id}
                  className="border border-[#DDD6C8] bg-[#FFFFFF] p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">
                    Câu hỏi
                  </p>
                  <p className="mt-1 font-medium text-[#1C1917]">
                    {item.question}
                  </p>

                  <div className="mt-4 border-t border-[#EFECE6] pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#7C2D12]">
                      Phản hồi từ hệ thống hồ sơ
                    </p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#1C1917]">
                      {item.answer}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#EFECE6] pt-3 text-xs text-[#57534E]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span>Mã hồ sơ dẫn chiếu:</span>
                        {item.citedCodes.length > 0 ? (
                          item.citedCodes.map((code) => (
                            <button
                              key={code}
                              type="button"
                              onClick={() => onSelectArtifact(code)}
                              className="rounded border border-[#7C2D12]/30 bg-[#FBF9F5] px-2 py-0.5 font-mono font-semibold text-[#7C2D12] hover:bg-[#7C2D12] hover:text-[#FBF9F5] transition-colors cursor-pointer"
                            >
                              {code}
                            </button>
                          ))
                        ) : (
                          <span className="italic text-[#78716C]">
                            Không có mã hồ sơ phù hợp
                          </span>
                        )}
                      </div>

                      {!item.activated && (
                        <span>
                          Trạng thái: Chưa kích hoạt (thiếu dữ liệu xác minh hoặc
                          cấu hình API)
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
