import { useCallback, useEffect, useState } from 'react';
import bundledArtifactsJson from '../data/hienvat.json';
import bundledSourcesJson from '../data/sources.json';
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
import {
  computeRecordCompletion,
  createInitial15Records,
} from './utils/artifactHelpers';

const STORAGE_ARTIFACTS_KEY = 'baotang_ls_hienvat_v1';
const STORAGE_SOURCES_KEY = 'baotang_ls_sources_v1';

const BUNDLED_RECORDS: ArtifactRecord[] = Array.isArray(
  bundledArtifactsJson?.hoSoHienVat
)
  ? (bundledArtifactsJson.hoSoHienVat as ArtifactRecord[])
  : createInitial15Records();

const BUNDLED_SOURCES: ArchiveMetadataStore =
  bundledSourcesJson as ArchiveMetadataStore;

function getInitialRecords(): ArtifactRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_ARTIFACTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 15) {
        return parsed as ArtifactRecord[];
      }
    }
  } catch {
    // Ignore localStorage parse errors
  }
  return BUNDLED_RECORDS;
}

function getInitialSources(): ArchiveMetadataStore {
  try {
    const saved = localStorage.getItem(STORAGE_SOURCES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.nguonTuLieu)) {
        return parsed as ArchiveMetadataStore;
      }
    }
  } catch {
    // Ignore localStorage parse errors
  }
  return BUNDLED_SOURCES;
}

function computeStaticGeminiStatus(
  records: ArtifactRecord[]
): GeminiSystemStatus {
  const activeRecords = records.filter(
    (r) => computeRecordCompletion(r).hasAnyInput
  );
  const verifiedRecords = records.filter(
    (r) =>
      r.mucKiemChung === 'da_xac_minh' &&
      computeRecordCompletion(r).hasAnyInput
  );
  return {
    apiConfigured: false,
    hasVerifiedData: verifiedRecords.length > 0,
    hasAnyData: activeRecords.length > 0,
    activeRecordsCount: activeRecords.length,
    verifiedRecordsCount: verifiedRecords.length,
    model: 'gemini-4-hydrogen',
  };
}

function isJsonResponse(res: Response): boolean {
  const ct = res.headers.get('content-type') || '';
  return res.ok && ct.toLowerCase().includes('application/json');
}

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

  const [records, setRecords] = useState<ArtifactRecord[]>(getInitialRecords);
  const [sourcesStore, setSourcesStore] =
    useState<ArchiveMetadataStore>(getInitialSources);
  const [geminiStatus, setGeminiStatus] = useState<GeminiSystemStatus | null>(
    () => computeStaticGeminiStatus(getInitialRecords())
  );
  const [loading, setLoading] = useState(true);

  // List Screen filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [eraFilter, setEraFilter] = useState('all');
  const [materialFilter, setMaterialFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchAllData = useCallback(async () => {
    try {
      const [artRes, srcRes, gemRes] = await Promise.all([
        fetch('/api/artifacts'),
        fetch('/api/sources'),
        fetch('/api/gemini/status'),
      ]);

      let activeList = getInitialRecords();

      if (isJsonResponse(artRes)) {
        const artData = await artRes.json();
        if (Array.isArray(artData.hoSoHienVat)) {
          activeList = artData.hoSoHienVat;
          setRecords(activeList);
        }
      }
      if (isJsonResponse(srcRes)) {
        const srcData = await srcRes.json();
        if (srcData && Array.isArray(srcData.nguonTuLieu)) {
          setSourcesStore(srcData);
        }
      }
      if (isJsonResponse(gemRes)) {
        const gemData = await gemRes.json();
        setGeminiStatus(gemData);
      } else {
        setGeminiStatus(computeStaticGeminiStatus(activeList));
      }
    } catch {
      // On static deployments (e.g. Vercel without Express backend),
      // seamlessly rely on bundled hienvat.json / sources.json + localStorage
      setGeminiStatus(computeStaticGeminiStatus(getInitialRecords()));
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshGeminiStatus = useCallback(
    async (latestRecords?: ArtifactRecord[]) => {
      try {
        const res = await fetch('/api/gemini/status');
        if (isJsonResponse(res)) {
          setGeminiStatus(await res.json());
          return;
        }
      } catch {
        // Fallback to static status calculation
      }
      setGeminiStatus(computeStaticGeminiStatus(latestRecords ?? records));
    },
    [records]
  );

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
    const nextLocal = records.map((r) =>
      r.maHoSo === updated.maHoSo
        ? {
            ...updated,
            ngayCapNhat: new Date().toISOString().slice(0, 10),
          }
        : r
    );
    try {
      const res = await fetch(`/api/artifacts/${updated.maHoSo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (Array.isArray(data.hoSoHienVat)) {
          setRecords(data.hoSoHienVat);
          localStorage.removeItem(STORAGE_ARTIFACTS_KEY);
          await refreshGeminiStatus(data.hoSoHienVat);
          return;
        }
      }
    } catch {
      // Static host fallback below
    }
    localStorage.setItem(STORAGE_ARTIFACTS_KEY, JSON.stringify(nextLocal));
    setRecords(nextLocal);
    await refreshGeminiStatus(nextLocal);
  };

  const handleReplaceAllRecords = async (nextRecords: ArtifactRecord[]) => {
    try {
      const res = await fetch('/api/artifacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hoSoHienVat: nextRecords }),
      });
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (Array.isArray(data.hoSoHienVat)) {
          setRecords(data.hoSoHienVat);
          localStorage.removeItem(STORAGE_ARTIFACTS_KEY);
          await refreshGeminiStatus(data.hoSoHienVat);
          return;
        }
      }
    } catch {
      // Static host fallback below
    }
    localStorage.setItem(STORAGE_ARTIFACTS_KEY, JSON.stringify(nextRecords));
    setRecords(nextRecords);
    await refreshGeminiStatus(nextRecords);
  };

  const handleResetEmptyRecords = async () => {
    const empty = createInitial15Records();
    try {
      const res = await fetch('/api/artifacts/reset', { method: 'POST' });
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (Array.isArray(data.hoSoHienVat)) {
          setRecords(data.hoSoHienVat);
          localStorage.removeItem(STORAGE_ARTIFACTS_KEY);
          await refreshGeminiStatus(data.hoSoHienVat);
          return;
        }
      }
    } catch {
      // Static host fallback below
    }
    localStorage.setItem(STORAGE_ARTIFACTS_KEY, JSON.stringify(empty));
    setRecords(empty);
    await refreshGeminiStatus(empty);
  };

  const handleSaveSourcesStore = async (next: ArchiveMetadataStore) => {
    try {
      const res = await fetch('/api/sources', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
      if (isJsonResponse(res)) {
        const saved = await res.json();
        setSourcesStore(saved);
        localStorage.removeItem(STORAGE_SOURCES_KEY);
        await refreshGeminiStatus();
        return;
      }
    } catch {
      // Static host fallback below
    }
    localStorage.setItem(STORAGE_SOURCES_KEY, JSON.stringify(next));
    setSourcesStore(next);
    await refreshGeminiStatus();
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FBF9F5] text-[#1C1917]">
      <TopBar currentScreen={currentScreen} onNavigate={(s) => navigate(s)} />

      <main className="flex-1">
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
