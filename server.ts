import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import type {
  ArchiveMetadataStore,
  ArtifactRecord,
} from './src/types/artifact.ts';
import {
  computeRecordCompletion,
  createInitial15Records,
} from './src/utils/artifactHelpers.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const HIENVAT_PATH = path.resolve(DATA_DIR, 'hienvat.json');
const SOURCES_PATH = path.resolve(DATA_DIR, 'sources.json');
const MEDIA_BASE_DIR = path.resolve(__dirname, 'public', 'images', 'hien-vat');

const PORT = Number(process.env.PORT || 3000);
const GEMINI_MODEL = 'gemini-4-hydrogen';

function ensureDirectoriesAndFiles(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(MEDIA_BASE_DIR)) {
    fs.mkdirSync(MEDIA_BASE_DIR, { recursive: true });
  }
  for (let i = 1; i <= 15; i++) {
    const code = `HS${String(i).padStart(3, '0')}`;
    const slotDir = path.join(MEDIA_BASE_DIR, code);
    if (!fs.existsSync(slotDir)) {
      fs.mkdirSync(slotDir, { recursive: true });
    }
  }
  if (!fs.existsSync(HIENVAT_PATH)) {
    const initial = {
      duAn: 'BẢO TÀNG LS',
      chuDe: 'Hồ sơ số cho 15 hiện vật tiêu biểu của Bảo tàng tỉnh Lạng Sơn',
      soLuongHoSo: 15,
      hoSoHienVat: createInitial15Records(),
    };
    fs.writeFileSync(HIENVAT_PATH, JSON.stringify(initial, null, 2), 'utf-8');
  }
  if (!fs.existsSync(SOURCES_PATH)) {
    const initialSources: ArchiveMetadataStore = {
      nguonTuLieu: [
        {
          id: 'TL001',
          tenTaiLieu: null,
          coQuanPhatHanh: null,
          duongDanTruyCap: null,
          loaiNguon: null,
          noiDungSuDung: null,
          trangThaiXacMinh: 'chua_co_du_lieu',
        },
      ],
      quyenCongBo: [
        {
          id: 'Q001',
          tenNguoiHoacDonVi: null,
          vaiTro: null,
          ngayDongY: null,
          phamViCongBo: null,
          gioiHanSuDung: null,
        },
      ],
      nhomThucHien: [
        {
          id: 'TV001',
          hoTen: null,
          maSinhVien: null,
          vaiTro: null,
        },
      ],
    };
    fs.writeFileSync(
      SOURCES_PATH,
      JSON.stringify(initialSources, null, 2),
      'utf-8'
    );
  }
}

function readArtifactsFile(): ArtifactRecord[] {
  ensureDirectoriesAndFiles();
  const raw = fs.readFileSync(HIENVAT_PATH, 'utf-8');
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) {
    return parsed as ArtifactRecord[];
  }
  if (parsed && Array.isArray(parsed.hoSoHienVat)) {
    return parsed.hoSoHienVat as ArtifactRecord[];
  }
  return createInitial15Records();
}

function writeArtifactsFile(records: ArtifactRecord[]): void {
  ensureDirectoriesAndFiles();
  const payload = {
    duAn: 'BẢO TÀNG LS',
    chuDe: 'Hồ sơ số cho 15 hiện vật tiêu biểu của Bảo tàng tỉnh Lạng Sơn',
    soLuongHoSo: records.length,
    hoSoHienVat: records,
  };
  fs.writeFileSync(HIENVAT_PATH, JSON.stringify(payload, null, 2), 'utf-8');
}

function readSourcesFile(): ArchiveMetadataStore {
  ensureDirectoriesAndFiles();
  const raw = fs.readFileSync(SOURCES_PATH, 'utf-8');
  return JSON.parse(raw) as ArchiveMetadataStore;
}

function writeSourcesFile(store: ArchiveMetadataStore): void {
  ensureDirectoriesAndFiles();
  fs.writeFileSync(SOURCES_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(
    key && key.trim().length > 10 && key.trim() !== 'MY_GEMINI_API_KEY'
  );
}

function createGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  ensureDirectoriesAndFiles();

  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Serve dedicated artifact image directory
  app.use('/images', express.static(path.resolve(__dirname, 'public', 'images')));

  app.get('/api/artifacts', (_req, res) => {
    try {
      const records = readArtifactsFile();
      res.json({ hoSoHienVat: records });
    } catch (err) {
      console.error('Error reading hienvat.json:', err);
      res.status(500).json({ error: 'Không thể đọc tệp dữ liệu hienvat.json.' });
    }
  });

  app.put('/api/artifacts', (req, res) => {
    try {
      const incoming = req.body?.hoSoHienVat;
      if (!Array.isArray(incoming) || incoming.length !== 15) {
        res.status(400).json({
          error: 'Dữ liệu phải gồm đủ 15 hồ sơ (HS001 đến HS015).',
        });
        return;
      }
      writeArtifactsFile(incoming as ArtifactRecord[]);
      res.json({ hoSoHienVat: incoming });
    } catch (err) {
      console.error('Error saving hienvat.json:', err);
      res.status(500).json({ error: 'Không thể lưu tệp dữ liệu hienvat.json.' });
    }
  });

  app.put('/api/artifacts/:maHoSo', (req, res) => {
    try {
      const code = req.params.maHoSo.toUpperCase();
      const updatedRecord = req.body as ArtifactRecord;
      const records = readArtifactsFile();
      const idx = records.findIndex((r) => r.maHoSo === code);
      if (idx === -1) {
        res.status(404).json({ error: `Không tìm thấy mã hồ sơ ${code}.` });
        return;
      }
      records[idx] = {
        ...updatedRecord,
        maHoSo: code,
        dublinCore: {
          ...updatedRecord.dublinCore,
          identifier: code,
        },
        ngayCapNhat: new Date().toISOString().slice(0, 10),
      };
      writeArtifactsFile(records);
      res.json({ record: records[idx], hoSoHienVat: records });
    } catch (err) {
      console.error('Error updating artifact:', err);
      res.status(500).json({ error: 'Không thể cập nhật hồ sơ hiện vật.' });
    }
  });

  app.post('/api/artifacts/:maHoSo/upload-image', (req, res) => {
    try {
      const code = req.params.maHoSo.toUpperCase();
      if (!/^HS(0[1-9]|1[0-5])$/.test(code)) {
        res.status(400).json({ error: 'Mã hồ sơ không hợp lệ.' });
        return;
      }
      const filenameRaw = String(req.body?.filename ?? 'anh-hien-vat.jpg');
      const dataUrl = String(req.body?.dataUrl ?? '');
      const match = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/i);
      if (!match) {
        res.status(400).json({
          error: 'Định dạng ảnh không hợp lệ (chỉ hỗ trợ JPG, PNG, WEBP).',
        });
        return;
      }
      const ext = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase();
      const safeBase = filenameRaw
        .replace(/\.[^.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .slice(0, 48) || 'hien-vat';
      const targetName = `${safeBase}-${Date.now()}.${ext}`;
      const targetDir = path.join(MEDIA_BASE_DIR, code);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const buffer = Buffer.from(match[2], 'base64');
      fs.writeFileSync(path.join(targetDir, targetName), buffer);
      res.json({ url: `/images/hien-vat/${code}/${targetName}` });
    } catch (err) {
      console.error('Error uploading artifact image:', err);
      res.status(500).json({ error: 'Không thể lưu tệp ảnh vào thư mục hồ sơ.' });
    }
  });

  app.post('/api/artifacts/reset', (_req, res) => {
    try {
      const emptyRecords = createInitial15Records();
      writeArtifactsFile(emptyRecords);
      res.json({ hoSoHienVat: emptyRecords });
    } catch (err) {
      console.error('Error resetting hienvat.json:', err);
      res.status(500).json({ error: 'Không thể khôi phục khung dữ liệu rỗng.' });
    }
  });

  app.get('/api/sources', (_req, res) => {
    try {
      res.json(readSourcesFile());
    } catch (err) {
      console.error('Error reading sources.json:', err);
      res.status(500).json({ error: 'Không thể đọc tệp nguồn tư liệu.' });
    }
  });

  app.put('/api/sources', (req, res) => {
    try {
      const body = req.body as ArchiveMetadataStore;
      if (
        !body ||
        !Array.isArray(body.nguonTuLieu) ||
        !Array.isArray(body.quyenCongBo) ||
        !Array.isArray(body.nhomThucHien)
      ) {
        res.status(400).json({ error: 'Cấu trúc nguồn tư liệu không hợp lệ.' });
        return;
      }
      writeSourcesFile(body);
      res.json(body);
    } catch (err) {
      console.error('Error saving sources.json:', err);
      res.status(500).json({ error: 'Không thể lưu tệp nguồn tư liệu.' });
    }
  });

  app.get('/api/gemini/status', (_req, res) => {
    try {
      const records = readArtifactsFile();
      const activeRecords = records.filter(
        (r) => computeRecordCompletion(r).hasAnyInput
      );
      const verifiedRecords = records.filter(
        (r) =>
          r.mucKiemChung === 'da_xac_minh' &&
          computeRecordCompletion(r).hasAnyInput
      );

      res.json({
        apiConfigured: isGeminiConfigured(),
        hasVerifiedData: verifiedRecords.length > 0,
        hasAnyData: activeRecords.length > 0,
        activeRecordsCount: activeRecords.length,
        verifiedRecordsCount: verifiedRecords.length,
        model: GEMINI_MODEL,
      });
    } catch (err) {
      console.error('Error checking Gemini status:', err);
      res.status(500).json({ error: 'Không thể kiểm tra trạng thái tích hợp.' });
    }
  });

  // Gemini Function 1: Grounded Artifact Q&A
  app.post('/api/gemini/qa', async (req, res) => {
    try {
      const question = String(req.body?.question ?? '').trim();
      if (!question) {
        res.status(400).json({ error: 'Vui lòng nhập câu hỏi tra cứu.' });
        return;
      }

      const records = readArtifactsFile();
      const sources = readSourcesFile();

      const activeRecords = records.filter(
        (r) => computeRecordCompletion(r).hasAnyInput
      );
      const activeSources = sources.nguonTuLieu.filter((s) => s.tenTaiLieu);

      // Strict constraint: do not activate answers when no real data exists
      if (activeRecords.length === 0 && activeSources.length === 0) {
        res.json({
          activated: false,
          hasEvidence: false,
          answer: 'Chưa có tư liệu để trả lời câu hỏi này',
          citedCodes: [],
          reason: 'no_verified_data',
        });
        return;
      }

      if (!isGeminiConfigured()) {
        res.json({
          activated: false,
          hasEvidence: false,
          answer: 'Chưa có tư liệu để trả lời câu hỏi này',
          citedCodes: [],
          reason: 'api_not_configured',
        });
        return;
      }

      const ai = createGeminiClient();
      const contextPayload = {
        hoSoHienVat: activeRecords,
        nguonTuLieu: activeSources,
        quyenCongBo: sources.quyenCongBo,
      };

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `DỮ LIỆU HỒ SƠ VÀ TƯ LIỆU HIỆN CÓ:\n${JSON.stringify(contextPayload, null, 2)}\n\nCÂU HỎI CỦA NGƯỜI DÙNG:\n${question}`,
        config: {
          systemInstruction: `Bạn là trợ lý tra cứu học thuật của Bảo tàng tỉnh Lạng Sơn (BẢO TÀNG LS).
QUY TẮC BẮT BUỘC:
1. CHỈ trả lời dựa trên dữ liệu thực tế có trong JSON "hoSoHienVat", "nguonTuLieu" và "quyenCongBo" được cung cấp ở trên.
2. Mọi thông tin trong câu trả lời PHẢI dẫn rõ mã hồ sơ hiện vật liên quan (ví dụ: HS001, HS003, HS007).
3. Phân biệt rõ mức kiểm chứng: nếu hồ sơ có mucKiemChung là "cho_xac_minh", cần ghi chú rõ đây là dữ liệu mô tả ban đầu đang chờ đối chiếu/bổ sung thêm (như số đăng ký, tình trạng bản gốc, quyền công bố).
4. TUYỆT ĐỐI KHÔNG tự bổ sung thông tin từ kiến thức bên ngoài, không suy đoán các trường đang là null (ví dụ số đăng ký còn thiếu, tình trạng bản gốc còn thiếu, kích thước còn thiếu, người cho phép công bố còn thiếu).
5. Nếu câu hỏi hỏi về một thông tin không có trong dữ liệu hoặc trường đó đang là null/rỗng, hãy đặt hasEvidence = false, citedCodes = [], và trả lời chính xác: "Chưa có tư liệu để trả lời câu hỏi này" (hoặc nêu rõ mã hồ sơ liên quan hiện còn thiếu dữ liệu trường đó nếu câu hỏi nhắc đích danh hồ sơ).
6. Không tiết lộ thông tin thuộc trường "phanKhongCongBo".`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hasEvidence: {
                type: Type.BOOLEAN,
                description: 'True nếu có đủ dữ liệu xác minh để trả lời.',
              },
              answer: {
                type: Type.STRING,
                description:
                  'Câu trả lời tiếng Việt chuẩn xác có dẫn mã hồ sơ, hoặc đúng chuỗi "Chưa có tư liệu để trả lời câu hỏi này".',
              },
              citedCodes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Danh sách mã hồ sơ đã dẫn (ví dụ HS001).',
              },
            },
            required: ['hasEvidence', 'answer', 'citedCodes'],
          },
        },
      });

      const rawText = (response.text ?? '').trim();
      const parsed = JSON.parse(rawText) as {
        hasEvidence: boolean;
        answer: string;
        citedCodes: string[];
      };

      res.json({
        activated: true,
        hasEvidence: Boolean(parsed.hasEvidence),
        answer: parsed.hasEvidence
          ? parsed.answer
          : 'Chưa có tư liệu để trả lời câu hỏi này',
        citedCodes: Array.isArray(parsed.citedCodes) ? parsed.citedCodes : [],
        reason: parsed.hasEvidence ? 'ok' : 'not_found_in_records',
      });
    } catch (err) {
      console.error('Gemini Q&A error:', err);
      res.status(500).json({
        error:
          'Không thể xử lý yêu cầu tra cứu phía máy chủ. Vui lòng kiểm tra lại cấu hình API.',
      });
    }
  });

  // Gemini Function 2: Editorial Description Standardization Assistant
  app.post('/api/gemini/assist-description', async (req, res) => {
    try {
      const record = req.body?.record as ArtifactRecord | undefined;
      if (!record || !record.maHoSo) {
        res.status(400).json({ error: 'Thiếu dữ liệu hồ sơ cần hỗ trợ biên tập.' });
        return;
      }

      // Collect strictly non-empty factual fields entered by curator
      const enteredFacts: Record<string, string> = {};
      const candidateFields: Array<[string, string | null | undefined]> = [
        ['Mã hồ sơ', record.maHoSo],
        ['Tên hiện vật', record.tenHienVat],
        ['Tên gọi khác', record.tenGoiKhac],
        ['Loại hiện vật', record.loaiHienVat],
        ['Chất liệu', record.chatLieu],
        ['Kích thước', record.kichThuoc],
        ['Trọng lượng', record.trongLuong],
        ['Niên đại', record.nienDai],
        ['Tình trạng bảo quản', record.tinhTrangBaoQuan],
        ['Mô tả đặc điểm hình thái đã nhập', record.moTaHinhThai],
        ['Nguồn gốc', record.nguonGoc],
        ['Bối cảnh lịch sử', record.boiCanhLichSu],
        ['Giá trị lịch sử', record.giaTriLichSu],
        ['Giá trị văn hóa', record.giaTriVanHoa],
        ['Giá trị khoa học', record.giaTriKhoaHoc],
      ];

      for (const [label, value] of candidateFields) {
        if (typeof value === 'string' && value.trim().length > 0) {
          enteredFacts[label] = value.trim();
        }
      }

      if (Object.keys(enteredFacts).length <= 1) {
        res.status(400).json({
          error:
            'Chưa có thông tin chuyên môn nào được nhập trong hồ sơ này để Gemini hỗ trợ chuẩn hóa diễn đạt.',
        });
        return;
      }

      if (!isGeminiConfigured()) {
        res.status(503).json({
          error:
            'Cấu hình Gemini API phía máy chủ chưa được kích hoạt. Vui lòng kiểm tra biến môi trường GEMINI_API_KEY ở phần Secrets.',
        });
        return;
      }

      const ai = createGeminiClient();
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Thông tin hiện vật do cán bộ đã nhập:\n${JSON.stringify(enteredFacts, null, 2)}\n\nHãy biên tập lại thành một đoạn mô tả chuẩn mực văn phong hồ sơ bảo tàng Việt Nam dựa CHỈ trên các dữ kiện trên.`,
        config: {
          systemInstruction: `Bạn là biên tập viên chuẩn hóa văn phong hồ sơ bảo tàng.
QUY TẮC NGHIÊM NGẶT:
1. CHỈ sử dụng các dữ kiện có trong danh sách đầu vào.
2. KHÔNG tự xác định, bổ sung hay suy đoán niên đại, nguồn gốc, chất liệu, kích thước hoặc giá trị lịch sử nếu không có trong dữ liệu đầu vào.
3. Nếu thiếu dữ kiện nào thì bỏ qua, không tự điền vào văn bản.
4. Viết ngắn gọn, trang trọng, chuẩn học thuật bằng tiếng Việt có dấu.`,
        },
      });

      res.json({
        suggestion: (response.text ?? '').trim(),
        label: 'Nội dung đề xuất – Chưa kiểm chứng',
        requiresHumanReview: true,
        autoSaved: false,
      });
    } catch (err) {
      console.error('Gemini assist error:', err);
      res.status(500).json({
        error:
          'Không thể tạo đề xuất mô tả từ Gemini API. Vui lòng thử lại sau.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BẢO TÀNG LS server listening on http://localhost:${PORT}`);
  });
}

startServer();
