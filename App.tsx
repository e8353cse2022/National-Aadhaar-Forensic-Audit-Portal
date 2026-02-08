
import React, { useState } from 'react';
import { parseCSV, detectAnomalies } from './utils/dataProcessor';
import { analyzeFraudPatterns, getRegionalIntel, verifyLocationContext } from './services/geminiService';
import { AadhaarDataRow, AnomalyResult, DatasetStats, AnalysisStatus, SearchIntel, LocationVerification, LoginData, ActionRecord } from './types';
import { Dashboard } from './components/Dashboard';
import { LoginPage } from './components/LoginPage';
import { LocationHub } from './components/LocationHub';
import { StateGovHub } from './components/StateGovHub';
import { ActionCenter } from './components/ActionCenter';

const App: React.FC = () => {
  const [data, setData] = useState<AadhaarDataRow[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyResult[]>([]);
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [regionalIntel, setRegionalIntel] = useState<SearchIntel | null>(null);
  const [locationVerif, setLocationVerif] = useState<LocationVerification | null>(null);
  const [currentUser, setCurrentUser] = useState<LoginData | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.UNAUTHENTICATED);
  const [aiStatus, setAiStatus] = useState<'idle' | 'loading' | 'completed' | 'error'>('idle');
  const [isSearching, setIsSearching] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'audit' | 'location' | 'stateInfo' | 'action'>('audit');
  const [selectedPerson, setSelectedPerson] = useState<AadhaarDataRow | null>(null);
  const [actionPerson, setActionPerson] = useState<{person: AadhaarDataRow, reasons: string[]} | null>(null);
  const [actionHistory, setActionHistory] = useState<ActionRecord[]>([]);

  const handleLogin = (loginData: LoginData) => {
    setCurrentUser(loginData);
    setStatus(AnalysisStatus.IDLE);
  };

  const triggerAIAnalysis = async (currentAnomalies: AnomalyResult[]) => {
    if (currentAnomalies.length === 0) return;
    setAiStatus('loading');
    try {
      const res = await analyzeFraudPatterns(currentAnomalies);
      setAiAnalysis(res);
      setAiStatus('completed');
    } catch (err) {
      console.error("Analysis failed", err);
      setAiStatus('error');
    }
  };

  const handleSearchIntel = async (location: string) => {
    setIsSearching(true);
    try {
      const intel = await getRegionalIntel(location);
      setRegionalIntel(intel);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleVerifyLocation = async (district: string, state: string) => {
    if (!district) {
      setLocationVerif(null);
      return;
    }
    setIsVerifying(true);
    try {
      const verif = await verifyLocationContext(district, state);
      setLocationVerif({ ...verif, district });
    } catch (err) {
      console.error("Location check failed", err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setStatus(AnalysisStatus.PROCESSING);
    setAiStatus('idle');
    setAiAnalysis(null);
    setRegionalIntel(null);
    setLocationVerif(null);
    setError(null);
    const fileList = Array.from(files) as File[];
    let combinedRows: AadhaarDataRow[] = [];
    try {
      const filePromises = fileList.map(file => {
        return new Promise<AadhaarDataRow[]>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const text = e.target?.result as string;
              resolve(parseCSV(text));
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = () => reject(new Error(`Could not read file: ${file.name}`));
          reader.readAsText(file);
        });
      });
      const parsedFiles = await Promise.all(filePromises);
      combinedRows = parsedFiles.flat();
      if (combinedRows.length === 0) throw new Error("File is empty.");
      const { anomalies: detectedAnomalies, stats: calculatedStats } = detectAnomalies(combinedRows);
      setData(combinedRows);
      setAnomalies(detectedAnomalies);
      setStats(calculatedStats);
      setStatus(AnalysisStatus.COMPLETED);
      if (detectedAnomalies.length > 0) {
        triggerAIAnalysis(detectedAnomalies);
      }
    } catch (err: any) {
      setError(err.message || "Upload error.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleStatusUpdate = (id: string, newStatus: 'fixed') => {
    setActionHistory(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const logout = () => {
    setData([]);
    setAnomalies([]);
    setStats(null);
    setCurrentUser(null);
    setStatus(AnalysisStatus.UNAUTHENTICATED);
    setActiveTab('audit');
    setSelectedPerson(null);
    setActionPerson(null);
  };

  const renderAuditPortal = () => {
    if (status === AnalysisStatus.IDLE) {
      return (
        <div className="max-w-3xl mx-auto py-6 animate-in fade-in duration-500">
          <div className="uidai-card p-8 text-center bg-white border-t-4 border-t-[#005dab]">
            <div className="mb-6 flex justify-center">
               <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-[#005dab]">
                 <i className="fas fa-file-circle-check text-3xl"></i>
               </div>
            </div>
            <h2 className="text-2xl font-black text-[#333] mb-2 tracking-tight">Check Aadhaar Files</h2>
            <p className="text-gray-500 mb-8 font-medium">Upload files to find mistakes in Aadhaar enrollments.</p>
            <div className="flex justify-center mb-8">
               <label className="cursor-pointer group w-full max-w-md">
                <div className="p-10 border-2 border-dashed border-blue-100 bg-blue-50/20 hover:border-[#005dab] hover:bg-blue-50/50 transition-all rounded-lg flex flex-col items-center">
                  <i className="fas fa-upload text-2xl text-blue-300 mb-3 group-hover:text-[#005dab]"></i>
                  <span className="text-sm font-bold text-gray-700">Click to Upload CSV Files</span>
                  <input type="file" accept=".csv" multiple onChange={handleFileUpload} className="hidden" />
                </div>
              </label>
            </div>
          </div>
        </div>
      );
    }
    if (status === AnalysisStatus.PROCESSING) {
      return (
        <div className="flex flex-col items-center justify-center py-24 space-y-6 animate-in fade-in">
          <div className="w-12 h-12 border-4 border-blue-50 border-t-[#005dab] rounded-full animate-spin"></div>
          <div className="text-center">
            <p className="text-base font-black text-[#005dab] tracking-tight">CHECKING YOUR FILES...</p>
            <p className="text-[10px] text-gray-400 font-bold mt-1">Please wait a moment</p>
          </div>
        </div>
      );
    }
    if (status === AnalysisStatus.COMPLETED && stats) {
      return (
        <Dashboard 
          fullData={data}
          stats={stats} 
          anomalies={anomalies} 
          aiAnalysis={aiAnalysis} 
          aiStatus={aiStatus}
          onRetryAI={() => triggerAIAnalysis(anomalies)}
          regionalIntel={regionalIntel}
          onSearchIntel={handleSearchIntel}
          locationVerif={locationVerif}
          onVerifyLocation={handleVerifyLocation}
          isVerifying={isVerifying}
          isSearching={isSearching}
          onSelectPerson={(person) => {
            setSelectedPerson(person);
            setActiveTab('stateInfo');
          }}
          onTakeAction={(person, reasons) => {
            setActionPerson({person, reasons});
            setActiveTab('action');
          }}
        />
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#f5f8fa]">
      <div className="uidai-header-top">
        <div className="max-w-[1280px] mx-auto px-6 flex justify-between items-center font-bold">
           <div className="flex gap-4">
              <span>Government of India</span>
           </div>
        </div>
      </div>
      <header className="bg-white py-3 px-6 border-b">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <div className="official-logo-container flex items-center gap-4">
             <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="GOI Emblem" className="h-12" />
             <div className="h-10 w-[1px] bg-gray-200"></div>
             <div className="flex flex-col">
                <h1 className="text-base font-black text-[#005dab] leading-none tracking-tight">UIDAI</h1>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tight mt-1">Audit Tool</span>
             </div>
          </div>
          <div className="flex items-center gap-6">
             <img src="https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Aadhaar_Logo.svg/1200px-Aadhaar_Logo.svg.png" alt="Aadhaar" className="h-10" />
             {status !== AnalysisStatus.UNAUTHENTICATED && (
               <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded border border-gray-100">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-[#005dab] uppercase">{currentUser?.identifier}</p>
                    <p className="text-[8px] text-gray-400 font-bold">STAFF</p>
                  </div>
                  <button onClick={logout} className="h-7 w-7 bg-white border rounded flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors">
                    <i className="fas fa-power-off text-[10px]"></i>
                  </button>
               </div>
             )}
          </div>
        </div>
      </header>
      {status !== AnalysisStatus.UNAUTHENTICATED && (
        <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
          <div className="max-w-[1280px] mx-auto px-6 flex gap-1">
            <button onClick={() => setActiveTab('audit')} className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'audit' ? 'border-[#005dab] text-[#005dab]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              <i className="fas fa-home mr-2"></i> Home
            </button>
            <button onClick={() => setActiveTab('location')} className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'location' ? 'border-[#005dab] text-[#005dab]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              <i className="fas fa-map mr-2"></i> Map Check
            </button>
            <button onClick={() => setActiveTab('stateInfo')} className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'stateInfo' ? 'border-[#005dab] text-[#005dab]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              <i className="fas fa-info-circle mr-2"></i> State Info
            </button>
            <button onClick={() => setActiveTab('action')} className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'action' ? 'border-[#005dab] text-[#005dab]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              <i className="fas fa-bolt mr-2"></i> Action Center 
              {actionHistory.filter(h => h.status === 'waiting').length > 0 && (
                <span className="ml-2 bg-amber-400 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                  {actionHistory.filter(h => h.status === 'waiting').length}
                </span>
              )}
            </button>
          </div>
        </nav>
      )}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 py-4">
        {status === AnalysisStatus.UNAUTHENTICATED ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <>
            {activeTab === 'audit' && renderAuditPortal()}
            {activeTab === 'location' && <LocationHub />}
            {activeTab === 'stateInfo' && <StateGovHub selectedPerson={selectedPerson} onClearSelection={() => setSelectedPerson(null)} />}
            {activeTab === 'action' && (
              <ActionCenter 
                person={actionPerson?.person || null} 
                reasons={actionPerson?.reasons || []}
                history={actionHistory}
                onFinish={(record) => {
                  setActionHistory([record, ...actionHistory]);
                  // Stay in Action tab to see history, but clear selection
                  setActionPerson(null);
                }}
                onUpdateStatus={handleStatusUpdate}
                onCancel={() => {
                  setActiveTab('audit');
                  setActionPerson(null);
                }}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
