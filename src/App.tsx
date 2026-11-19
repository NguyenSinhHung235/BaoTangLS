import { useCallback, useEffect, useState } from 'react';
import { Footer } from './components/Footer';
import { TopBar } from './components/TopBar';
import { AboutScreen } from './components/screens/AboutScreen';
import { ArtifactDetailScreen } from './components/screens/ArtifactDetailScreen';
import { ArtifactListScreen } from './components/screens/ArtifactListScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { ManageDataScreen } from './components/screens/ManageDataScreen';
import { QaScreen } from './components/screens/QaScreen';
import { SourcesScreen } from './components/screens/SourcesScreen';
import type {
  ArchiveMetadataStore,
  ArtifactRecord,
  GeminiSystemStatus,
  ScreenId,
} from './types/artifact';
import { createInitial15Records } from './utils/artifactHelpers';

const INITIAL_STORE: ArchiveMetadataStore = {
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

function parseHashRoute(): { screen: ScreenId; maHoSo: string } {
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return { screen: 'home', maHoSo: 'HS001' };

  const [seg, param] = hash.split('/');
  const validScreens: ScreenId[] = [
    'home',
    'list',
    'detail',
    'qa',
    'sources',
    'about',
    'manage',
  ];
  const screen = validScreens.includes(seg as ScreenId)
    ? (seg as ScreenId)
    : 'home';
  const maHoSo =
    param && /^HS(0[1-9]|1[0-5])$/i.test(param) ? param.toUpperCase() : 'HS001';
  return { screen, maHoSo };
}

export default function App() {
  const initialRoute = parseHashRoute();
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(
    initialRoute.screen
  );
  const [selectedMaHoSo, setSelectedMaHoSo] = useState<string>(
    initialRoute.maHoSo
  );
  const [manageInitialCode, setManageInitialCode] = useState<string>('HS001');

  const [records, setRecords] = useState<ArtifactRecord[]>(() =>
    createInitial15Records()
  );
  const [sourcesStore, setSourcesStore] =
    useState<ArchiveMetadataStore>(INITIAL_STORE);
  const [geminiStatus, setGeminiStatus] = useState<GeminiSystemStatus | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // List Screen filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [eraFilter, setEraFilter] = useState('all');
  const [materialFilter, setMaterialFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchAllData = useCallback(async () => {
    try {
      setLoadError(null);
      const [artRes, srcRes, gemRes] = await Promise.all([
        fetch('/api/artifacts'),
        fetch('/api/sources'),
        fetch('/api/gemini/status'),
      ]);

      if (artRes.ok) {
        const artData = await artRes.json();
        if (Array.isArray(artData.hoSoHienVat)) {
          setRecords(artData.hoSoHienVat);
        }
      }
      if (srcRes.ok) {
        const srcData = await srcRes.json();
        if (srcData && Array.isArray(srcData.nguonTuLieu)) {
          setSourcesStore(srcData);
        }
      }
      if (gemRes.ok) {
        const gemData = await gemRes.json();
        setGeminiStatus(gemData);
      }
    } catch {
      setLoadError(
        'Không thể tải dữ liệu từ máy chủ cục bộ. Đang hiển thị khung 15 hồ sơ rỗng mặc định.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshGeminiStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/gemini/status');
      if (res.ok) {
        setGeminiStatus(await res.json());
      }
    } catch {
      // Ignore transient status refresh error
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    const onHashChange = () => {
      const next = parseHashRoute();
      setCurrentScreen(next.screen);
      setSelectedMaHoSo(next.maHoSo);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (screen: ScreenId, code?: string) => {
    const nextCode = code || selectedMaHoSo;
    if (code) setSelectedMaHoSo(code);
    setCurrentScreen(screen);
    window.location.hash =
      screen === 'detail' ? `detail/${nextCode}` : screen;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectArtifact = (maHoSo: string) => {
    navigate('detail', maHoSo);
  };

  const handleSearchToList = (query: string, category?: string) => {
    setSearchQuery(query);
    setCategoryFilter(category || 'all');
    setEraFilter('all');
    setMaterialFilter('all');
    setStatusFilter('all');
    navigate('list');
  };

  const handleEditInManager = (maHoSo: string) => {
    setManageInitialCode(maHoSo);
    navigate('manage');
  };

  const handleSaveSingleRecord = async (updated: ArtifactRecord) => {
    const res = await fetch(`/api/artifacts/${updated.maHoSo}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (!res.ok) throw new Error('Save failed');
    const data = await res.json();
    if (Array.isArray(data.hoSoHienVat)) {
      setRecords(data.hoSoHienVat);
    }
    await refreshGeminiStatus();
  };

  const handleReplaceAllRecords = async (nextRecords: ArtifactRecord[]) => {
    const res = await fetch('/api/artifacts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hoSoHienVat: nextRecords }),
    });
    if (!res.ok) throw new Error('Bulk save failed');
    const data = await res.json();
    if (Array.isArray(data.hoSoHienVat)) {
      setRecords(data.hoSoHienVat);
    }
    await refreshGeminiStatus();
  };

  const handleResetEmptyRecords = async () => {
    const res = await fetch('/api/artifacts/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Reset failed');
    const data = await res.json();
    if (Array.isArray(data.hoSoHienVat)) {
      setRecords(data.hoSoHienVat);
    }
    await refreshGeminiStatus();
  };

  const handleSaveSourcesStore = async (next: ArchiveMetadataStore) => {
    const res = await fetch('/api/sources', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    });
    if (!res.ok) throw new Error('Save sources failed');
    setSourcesStore(await res.json());
    await refreshGeminiStatus();
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FBF9F5] text-[#1C1917]">
      <TopBar currentScreen={currentScreen} onNavigate={(s) => navigate(s)} />

      <main className="flex-1">
        {loadError && (
          <div className="mx-auto mt-4 max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="border border-[#DDD6C8] bg-[#F4F0E8] px-4 py-2.5 text-xs text-[#57534E]">
              {loadError}
            </div>
          </div>
        )}

        {loading ? (
          <div className="mx-auto max-w-[1280px] px-4 py-16 text-center text-sm text-[#57534E]">
            Đang tải cấu trúc hồ sơ số BẢO TÀNG LS...
          </div>
        ) : (
          <>
            {currentScreen === 'home' && (
              <HomeScreen
                records={records}
                onNavigate={(s) => navigate(s)}
                onSearchToList={handleSearchToList}
                onSelectArtifact={handleSelectArtifact}
              />
            )}

            {currentScreen === 'list' && (
              <ArtifactListScreen
                records={records}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                eraFilter={eraFilter}
                onEraFilterChange={setEraFilter}
                materialFilter={materialFilter}
                onMaterialFilterChange={setMaterialFilter}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onSelectArtifact={handleSelectArtifact}
              />
            )}

            {currentScreen === 'detail' && (
              <ArtifactDetailScreen
                records={records}
                selectedMaHoSo={selectedMaHoSo}
                onSelectArtifact={handleSelectArtifact}
                onBackToList={() => navigate('list')}
                onEditInManager={handleEditInManager}
              />
            )}

            {currentScreen === 'qa' && (
              <QaScreen
                geminiStatus={geminiStatus}
                onSelectArtifact={handleSelectArtifact}
              />
            )}

            {currentScreen === 'sources' && (
              <SourcesScreen
                store={sourcesStore}
                onSaveStore={handleSaveSourcesStore}
              />
            )}

            {currentScreen === 'about' && (
              <AboutScreen
                store={sourcesStore}
                onSaveStore={handleSaveSourcesStore}
              />
            )}

            {currentScreen === 'manage' && (
              <ManageDataScreen
                key={manageInitialCode}
                records={records}
                initialEditMaHoSo={manageInitialCode}
                onSaveSingleRecord={handleSaveSingleRecord}
                onReplaceAllRecords={handleReplaceAllRecords}
                onResetEmptyRecords={handleResetEmptyRecords}
                onOpenDetail={handleSelectArtifact}
              />
            )}
          </>
        )}
      </main>

      <Footer onNavigate={(s) => navigate(s)} />
    </div>
  );
}
