import { useEffect, useState } from 'react';
import { Frame, Lock, Maximize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import type { ArtifactImageItem } from '../types/artifact';
import { MISSING_DATA_TEXT, NO_IMAGE_TEXT } from '../utils/artifactHelpers';

interface ArtifactPhotoFrameProps {
  maHoSo: string;
  images: ArtifactImageItem[];
  defaultCaption: string | null;
  defaultSource: string | null;
  compact?: boolean;
  enableInspector?: boolean;
}

export function ArtifactPhotoFrame({
  maHoSo,
  images,
  defaultCaption,
  defaultSource,
  compact = false,
  enableInspector = false,
}: ArtifactPhotoFrameProps) {
  const permittedImages = images.filter(
    (img) => img.url && img.url.trim().length > 0 && img.duocPhepCongBo
  );

  const [selectedView, setSelectedView] = useState<'all' | 'toan_canh' | 'chi_tiet'>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setZoom(1);
    setActiveIndex(0);
    setSelectedView('all');
    setLoadError(false);
  }, [maHoSo]);

  const filteredImages =
    selectedView === 'all'
      ? permittedImages
      : permittedImages.filter((img) => img.loaiAnh === selectedView);

  const activeList = filteredImages.length > 0 ? filteredImages : permittedImages;
  const activeImage = activeList[activeIndex] ?? activeList[0] ?? null;
  const hasUsableImage = Boolean(activeImage && !loadError);

  const captionText = activeImage?.chuThich || defaultCaption || MISSING_DATA_TEXT;
  const sourceText = activeImage?.nguonAnh || defaultSource || MISSING_DATA_TEXT;

  const handleZoomIn = () => setZoom((z) => Math.min(3, Number((z + 0.35).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(1, Number((z - 0.35).toFixed(2))));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="space-y-3">
      {/* View switcher & zoom controls when in Detail Inspector mode */}
      {enableInspector && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DDD6C8] pb-3">
          <div
            role="group"
            aria-label="Chế độ xem ảnh hiện vật"
            className="inline-flex items-center gap-1 rounded-md border border-[#DDD6C8] bg-[#F4F0E8] p-1"
          >
            <button
              type="button"
              onClick={() => {
                setSelectedView('all');
                setActiveIndex(0);
              }}
              className={`rounded px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedView === 'all'
                  ? 'bg-[#FBF9F5] text-[#1C1917] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Tất cả ({permittedImages.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedView('toan_canh');
                setActiveIndex(0);
              }}
              className={`rounded px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedView === 'toan_canh'
                  ? 'bg-[#FBF9F5] text-[#1C1917] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Ảnh toàn cảnh
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedView('chi_tiet');
                setActiveIndex(0);
              }}
              className={`rounded px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedView === 'chi_tiet'
                  ? 'bg-[#FBF9F5] text-[#1C1917] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Ảnh chi tiết
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={!hasUsableImage || zoom <= 1}
              onClick={handleZoomOut}
              aria-label="Thu nhỏ ảnh"
              className="inline-flex h-9 w-9 items-center justify-center rounded border border-[#DDD6C8] bg-[#FBF9F5] text-[#1C1917] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F4F0E8] cursor-pointer"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="min-w-[48px] text-center font-mono text-xs text-[#57534E] tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              disabled={!hasUsableImage || zoom >= 3}
              onClick={handleZoomIn}
              aria-label="Phóng to ảnh"
              className="inline-flex h-9 w-9 items-center justify-center rounded border border-[#DDD6C8] bg-[#FBF9F5] text-[#1C1917] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F4F0E8] cursor-pointer"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={!hasUsableImage || zoom === 1}
              onClick={handleResetZoom}
              aria-label="Khôi phục kích thước gốc"
              className="inline-flex h-9 w-9 items-center justify-center rounded border border-[#DDD6C8] bg-[#FBF9F5] text-[#1C1917] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F4F0E8] cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={!hasUsableImage}
              onClick={() => setLightboxOpen(true)}
              aria-label="Mở khung xem toàn màn hình"
              className="inline-flex h-9 items-center gap-1.5 rounded border border-[#DDD6C8] bg-[#FBF9F5] px-2.5 text-xs font-medium text-[#1C1917] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F4F0E8] cursor-pointer"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mở rộng</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Frame */}
      <div
        className={`relative overflow-hidden border border-[#DDD6C8] bg-[#F4F0E8] ${
          compact ? 'aspect-[4/3]' : 'aspect-[4/3] min-h-[280px] sm:min-h-[380px]'
        }`}
      >
        {hasUsableImage && activeImage ? (
          <div className="flex h-full w-full items-center justify-center overflow-auto bg-[#EBE6DF] p-2">
            <img
              src={activeImage.url}
              alt={`Ảnh hiện vật ${maHoSo}: ${captionText}`}
              referrerPolicy="no-referrer"
              onError={() => setLoadError(true)}
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
              }}
              className="max-h-full max-w-full object-contain transition-transform duration-150 ease-out"
            />
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
            <div className="flex h-full w-full flex-col items-center justify-center border border-dashed border-[#C7BEB0] bg-[#FBF9F5]/60 px-4 py-6">
              <Frame
                className={`${
                  compact ? 'h-7 w-7' : 'h-10 w-10'
                } text-[#8C8377] stroke-[1.25]`}
                aria-hidden="true"
              />
              <p
                className={`mt-3 font-serif font-medium text-[#44403C] ${
                  compact ? 'text-sm' : 'text-lg'
                }`}
              >
                {NO_IMAGE_TEXT}
              </p>
              <p className="mt-1 font-mono text-[11px] text-[#78716C]">
                Thư mục lưu trữ: /images/hien-vat/{maHoSo}/
              </p>
              {enableInspector && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#78716C]">
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    Công cụ phóng to / thu nhỏ chỉ kích hoạt khi có ảnh thực tế
                    được phép công bố.
                  </span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail strip if multiple permitted images exist */}
      {enableInspector && activeList.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {activeList.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => {
                setActiveIndex(i);
                setZoom(1);
                setLoadError(false);
              }}
              className={`h-16 w-20 shrink-0 overflow-hidden border p-0.5 transition-colors cursor-pointer ${
                i === activeIndex
                  ? 'border-[#7C2D12] bg-[#FBF9F5]'
                  : 'border-[#DDD6C8] bg-[#F4F0E8] opacity-75 hover:opacity-100'
              }`}
            >
              <img
                src={img.url}
                alt={img.chuThich || `${maHoSo} ảnh ${i + 1}`}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Mandatory Source & Caption directly below every image frame */}
      <div className="space-y-1 text-xs leading-relaxed text-[#57534E]">
        {!compact && (
          <p className="font-serif italic text-[#44403C]">
            Chú thích ảnh: {captionText}
          </p>
        )}
        <p>
          <span className="font-medium text-[#1C1917]">Nguồn ảnh:</span>{' '}
          <span>{sourceText}</span>
        </p>
      </div>

      {/* Lightbox Modal when user expands real permitted image */}
      {lightboxOpen && hasUsableImage && activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Xem chi tiết ảnh ${maHoSo}`}
          className="fixed inset-0 z-50 flex flex-col bg-[#1C1917]/95 p-4 text-[#FBF9F5]"
        >
          <div className="flex items-center justify-between border-b border-white/15 pb-3">
            <div className="text-sm">
              <span className="font-mono font-medium">{maHoSo}</span>
              <span className="mx-2 text-white/40">·</span>
              <span>
                {activeImage.loaiAnh === 'chi_tiet'
                  ? 'Ảnh chi tiết'
                  : 'Ảnh toàn cảnh'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleZoomOut}
                className="rounded border border-white/25 px-3 py-1.5 text-xs hover:bg-white/10 cursor-pointer"
              >
                Thu nhỏ
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                className="rounded border border-white/25 px-3 py-1.5 text-xs hover:bg-white/10 cursor-pointer"
              >
                Phóng to
              </button>
              <button
                type="button"
                onClick={() => {
                  setLightboxOpen(false);
                  setZoom(1);
                }}
                className="rounded bg-[#FBF9F5] px-3 py-1.5 text-xs font-medium text-[#1C1917] hover:bg-[#EBE6DF] cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center overflow-auto p-4">
            <img
              src={activeImage.url}
              alt={captionText}
              referrerPolicy="no-referrer"
              style={{ transform: `scale(${zoom})` }}
              className="max-h-full max-w-full object-contain transition-transform duration-150"
            />
          </div>
          <div className="border-t border-white/15 pt-3 text-center text-xs text-white/80">
            <p>{captionText}</p>
            <p className="mt-1 text-white/60">Nguồn ảnh: {sourceText}</p>
          </div>
        </div>
      )}
    </div>
  );
}
