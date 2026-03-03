
import React, { useState, useEffect } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { 
  Search, QrCode, FileSearch, Scale, AlertCircle, Loader2, 
  PlusCircle, LayoutDashboard, ListFilter, CheckCircle2, X, LogOut, LogIn 
} from 'lucide-react';
import { CaseData, CaseType, SearchParams } from './types';
import { MOCK_CASES } from './constants';
import CaseDetails from './components/CaseDetails';
import Scanner from './components/Scanner';
import AddCaseForm from './components/AddCaseForm';
import CaseList from './components/CaseList';
import LoginModal from './components/LoginModal';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('si_cantik_auth') === 'true';
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const [cases, setCases] = useState<CaseData[]>(() => {
    const saved = localStorage.getItem('e_minutasi_cases');
    return saved ? JSON.parse(saved) : MOCK_CASES;
  });
  
  const [view, setView] = useState<'search' | 'add' | 'list'>('search');
  const [params, setParams] = useState<SearchParams>({
    caseNumber: '',
    caseType: CaseType.GUGATAN,
    year: new Date().getFullYear().toString()
  });
  
  const [activeCase, setActiveCase] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showToast, setShowToast] = useState<{show: boolean, message: string}>({ show: false, message: '' });

  // Sinkronisasi database lokal ke Storage
  useEffect(() => {
    localStorage.setItem('e_minutasi_cases', JSON.stringify(cases));
  }, [cases]);

  // Handler Notifikasi
  const triggerToast = (message: string) => {
    setShowToast({ show: true, message });
    setTimeout(() => setShowToast({ show: false, message: '' }), 3000);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('si_cantik_auth', 'true');
    setShowLoginModal(false);
    triggerToast("Login Berhasil");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('si_cantik_auth');
    setView('search');
    triggerToast("Berhasil Logout");
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!params.caseNumber) return;

    setLoading(true);
    setError(null);
    setActiveCase(null);
    setView('search');
    
    setTimeout(() => {
      try {
        const formattedCaseNum = params.caseNumber.includes('/') 
          ? params.caseNumber 
          : `${params.caseNumber}/${params.caseType === CaseType.GUGATAN ? 'Pdt.G' : 'Pdt.P'}/${params.year}/PA.Pbm`;
        
        const found = cases.find(c => c.caseNumber.toLowerCase() === formattedCaseNum.toLowerCase());
        
        if (found) {
          setActiveCase(found);
        } else {
          setError(`Perkara nomor ${formattedCaseNum} tidak ditemukan. Pastikan data sudah diinput di menu "Berkas Terinput".`);
        }
      } catch (err) {
        setError("Terjadi kesalahan saat mencari data.");
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleSaveOrUpdateCase = (finalCase: CaseData) => {
    const isUpdate = cases.some(c => c.id === finalCase.id);
    
    setCases(prev => {
      if (isUpdate) {
        return prev.map(c => c.id === finalCase.id ? finalCase : c);
      } else {
        return [finalCase, ...prev]; // Tambahkan di paling atas
      }
    });
    
    if (activeCase?.id === finalCase.id) {
      setActiveCase(finalCase);
    }

    triggerToast(isUpdate ? "Data Berhasil Diperbarui" : "Data Berhasil Tersimpan di Berkas Terinput");
    setView('list');
    setActiveCase(null);
  };

  const handleDeleteCase = (id: string) => {
    setCases(prev => prev.filter(c => c.id !== id));
    if (activeCase?.id === id) {
      setActiveCase(null);
    }
    triggerToast("Data Berhasil Dihapus");
    setView('list');
  };

  const handleScanSuccess = (result: string) => {
    setParams(prev => ({ ...prev, caseNumber: result }));
    setTimeout(() => handleSearch(), 100);
  };

  const selectCaseForEdit = (caseData: CaseData) => {
    setActiveCase(caseData);
    setView('add');
  };

  return (
    <Router>
      <div className="min-h-screen pb-20 bg-slate-50 animate-in fade-in duration-700">
        {/* Success Toast */}
        {showToast.show && (
          <div className="fixed top-24 right-4 z-[100] animate-in slide-in-from-right-10 duration-300">
            <div className="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-bold text-sm">{showToast.message}</span>
              <button onClick={() => setShowToast({show: false, message: ''})} className="ml-2 hover:bg-emerald-500 rounded-full p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="bg-slate-900 text-white py-4 shadow-xl sticky top-0 z-40 border-b border-white/5">
          <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-900/20">
                <Scale className="w-8 h-8" />
              </div>
              <div onClick={() => {setView('search'); setActiveCase(null); setError(null);}} className="cursor-pointer group">
                <h1 className="text-xl font-bold leading-tight group-hover:text-blue-400 transition-colors uppercase tracking-tight">SI CANTIK</h1>
                <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">PA PRABUMULIH KELAS II</p>
              </div>
            </div>

            <nav className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl overflow-x-auto no-scrollbar">
              <button 
                onClick={() => {setView('search'); setActiveCase(null); setError(null);}}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                  view === 'search' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              
              {isLoggedIn ? (
                <>
                  <button 
                    onClick={() => {setView('list'); setError(null);}}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                      view === 'list' ? 'bg-slate-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <ListFilter className="w-4 h-4" />
                    Berkas Terinput
                  </button>
                  <button 
                    onClick={() => {setView('add'); setActiveCase(null); setError(null);}}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                      view === 'add' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Input Perkara
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap text-red-400 hover:text-white hover:bg-red-600/20"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap bg-slate-700 text-white hover:bg-slate-600"
                >
                  <LogIn className="w-4 h-4" />
                  Admin Login
                </button>
              )}
            </nav>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 pt-8">
          {view === 'add' && isLoggedIn ? (
            <AddCaseForm 
              initialData={activeCase}
              onSave={handleSaveOrUpdateCase} 
              onDelete={handleDeleteCase}
              onCancel={() => {setView('list'); setActiveCase(null);}} 
            />
          ) : view === 'list' && isLoggedIn ? (
            <CaseList 
              cases={cases} 
              onSelectCase={selectCaseForEdit}
              onDeleteCase={handleDeleteCase}
              onUpdateCase={handleSaveOrUpdateCase}
            />
          ) : (
            <>
              {/* Search Card Section */}
              <section className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-8 transition-all hover:shadow-xl">
                <div className="p-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                <div className="p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Cari Berkas Perkara</h2>
                      <p className="text-slate-500 text-sm">Informasi status dan lokasi fisik arsip terintegrasi melalui sistem SI CANTIK.</p>
                    </div>
                    <button 
                      onClick={() => setShowScanner(true)}
                      className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                    >
                      <QrCode className="w-5 h-5" />
                      Scan QR Perkara
                    </button>
                  </div>

                  <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nomor Perkara</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input 
                          type="text" 
                          placeholder="Contoh: 123"
                          value={params.caseNumber}
                          onChange={e => setParams({...params, caseNumber: e.target.value})}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 font-medium"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Jenis</label>
                      <select 
                        value={params.caseType}
                        onChange={e => setParams({...params, caseType: e.target.value as CaseType})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 font-medium appearance-none"
                      >
                        <option value={CaseType.GUGATAN}>Gugatan</option>
                        <option value={CaseType.PERMOHONAN}>Permohonan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tahun</label>
                      <input 
                        type="number" 
                        value={params.year}
                        onChange={e => setParams({...params, year: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 font-medium"
                      />
                    </div>

                    <div className="md:col-span-4 mt-2">
                      <button 
                        type="submit"
                        disabled={loading || !params.caseNumber}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-blue-100"
                      >
                        {loading ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> Sedang Mencari...</>
                        ) : (
                          <><FileSearch className="w-5 h-5" /> Cari Data Perkara</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </section>

              {error && (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-start gap-4 text-amber-800 mb-8 animate-in fade-in slide-in-from-top-2 shadow-sm">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <AlertCircle className="w-6 h-6 shrink-0" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Tidak Ditemukan</h4>
                    <p className="font-medium opacity-90">{error}</p>
                  </div>
                </div>
              )}

              {activeCase ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <CaseDetails data={activeCase} />
                </div>
              ) : !loading && !error && (
                <div className="text-center py-20 px-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">SI CANTIK Digital System</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">Silakan cari nomor perkara untuk melihat status minutasi dan lokasi fisik berkas di ruang arsip melalui Sistem Informasi Catatan Arsip.</p>
                </div>
              )}
            </>
          )}
        </main>

        {showScanner && (
          <Scanner onScan={handleScanSuccess} onClose={() => setShowScanner(false)} />
        )}

        {showLoginModal && (
          <LoginModal 
            onSuccess={handleLoginSuccess} 
            onClose={() => setShowLoginModal(false)} 
          />
        )}

        <footer className="mt-12 py-12 border-t border-slate-200 bg-white">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">SI CANTIK - Sistem Informasi Arsip Digital &copy; 2024</p>
            <p className="text-slate-500 text-sm mt-2 font-medium">Pengadilan Agama Prabumulih Kelas II</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
