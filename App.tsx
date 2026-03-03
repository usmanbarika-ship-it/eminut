import React, { useState, useEffect } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { 
  Search, QrCode, FileSearch, Scale, AlertCircle, Loader2, 
  PlusCircle, LayoutDashboard, ListFilter, CheckCircle2, X, LogOut, LogIn 
} from 'lucide-react';

// Inisialisasi Firebase
import './services/firebase'; 
import { 
  saveCaseToFirestore, 
  getAllCases, 
  findCaseByNumber, 
  updateCaseInFirestore, 
  deleteCaseFromFirestore 
} from './services/databaseService';

import { CaseData, CaseType, SearchParams } from './types';
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
  
  const [cases, setCases] = useState<CaseData[]>([]);
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

  // Load data dari Firestore saat aplikasi dimulai atau saat view 'list' dibuka
  useEffect(() => {
    if (isLoggedIn) {
      fetchCases();
    }
  }, [isLoggedIn, view]);

  const fetchCases = async () => {
    const data = await getAllCases();
    setCases(data);
  };

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

  // Pencarian Menggunakan Firestore
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!params.caseNumber) return;

    setLoading(true);
    setError(null);
    setActiveCase(null);
    setView('search');
    
    try {
      const formattedCaseNum = params.caseNumber.includes('/') 
        ? params.caseNumber 
        : `${params.caseNumber}/${params.caseType === CaseType.GUGATAN ? 'Pdt.G' : 'Pdt.P'}/${params.year}/PA.Pbm`;
      
      const found = await findCaseByNumber(formattedCaseNum);
      
      if (found) {
        setActiveCase(found);
      } else {
        setError(`Perkara nomor ${formattedCaseNum} tidak ditemukan di database.`);
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mencari data di cloud.");
    } finally {
      setLoading(false);
    }
  };

  // Simpan atau Update ke Firestore
  const handleSaveOrUpdateCase = async (finalCase: CaseData) => {
    setLoading(true);
    try {
      const isUpdate = !!finalCase.id && cases.some(c => c.id === finalCase.id);
      
      if (isUpdate) {
        await updateCaseInFirestore(finalCase.id, finalCase);
      } else {
        // Hilangkan ID sementara jika ada agar Firestore generate ID baru
        const { id, ...dataToSave } = finalCase;
        await saveCaseToFirestore(dataToSave);
      }

      await fetchCases(); // Refresh data
      triggerToast(isUpdate ? "Data Diperbarui ke Cloud" : "Data Tersimpan di Cloud");
      setView('list');
      setActiveCase(null);
    } catch (err) {
      triggerToast("Gagal menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  // Hapus dari Firestore
  const handleDeleteCase = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus data ini dari cloud?")) return;
    
    try {
      await deleteCaseFromFirestore(id);
      setCases(prev => prev.filter(c => c.id !== id));
      if (activeCase?.id === id) setActiveCase(null);
      triggerToast("Data Berhasil Dihapus");
      setView('list');
    } catch (err) {
      triggerToast("Gagal menghapus data");
    }
  };

  const handleScanSuccess = (result: string) => {
    setParams(prev => ({ ...prev, caseNumber: result }));
    setShowScanner(false);
    setTimeout(() => handleSearch(), 200);
  };

  return (
    <Router>
      <div className="min-h-screen pb-20 bg-slate-50">
        {showToast.show && (
          <div className="fixed top-24 right-4 z-[100] animate-in slide-in-from-right-10">
            <div className="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-bold text-sm">{showToast.message}</span>
              <button onClick={() => setShowToast({show: false, message: ''})} className="ml-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <header className="bg-slate-900 text-white py-4 shadow-xl sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => {setView('search'); setActiveCase(null);}}>
              <div className="bg-blue-600 p-2 rounded-xl">
                <Scale className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold uppercase">SI CANTIK</h1>
                <p className="text-slate-400 text-[10px] font-bold">PA PRABUMULIH KELAS II</p>
              </div>
            </div>

            <nav className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl">
              <button 
                onClick={() => {setView('search'); setActiveCase(null);}}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${view === 'search' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </button>
              
              {isLoggedIn && (
                <>
                  <button 
                    onClick={() => setView('list')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${view === 'list' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
                  >
                    <ListFilter className="w-4 h-4" /> Berkas
                  </button>
                  <button 
                    onClick={() => {setView('add'); setActiveCase(null);}}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${view === 'add' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                  >
                    <PlusCircle className="w-4 h-4" /> Input
                  </button>
                  <button onClick={handleLogout} className="text-red-400 px-4 py-2 font-bold text-sm hover:bg-red-500/10 rounded-lg">
                    <LogOut className="w-4 h-4 inline mr-2" /> Logout
                  </button>
                </>
              )}
              {!isLoggedIn && (
                <button onClick={() => setShowLoginModal(true)} className="bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold">
                  <LogIn className="w-4 h-4 inline mr-2" /> Login
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
              onCancel={() => setView('list')} 
            />
          ) : view === 'list' && isLoggedIn ? (
            <CaseList 
              cases={cases} 
              onSelectCase={(c) => {setActiveCase(c); setView('add');}}
              onDeleteCase={handleDeleteCase}
              onUpdateCase={handleSaveOrUpdateCase}
            />
          ) : (
            <>
              <section className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-8">
                <div className="p-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                <div className="p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Cari Berkas Perkara</h2>
                      <p className="text-slate-500 text-sm">Sistem Informasi Catatan Arsip Terintegrasi (SI CANTIK).</p>
                    </div>
                    <button onClick={() => setShowScanner(true)} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
                      <QrCode className="w-5 h-5" /> Scan QR
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
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Jenis</label>
                      <select 
                        value={params.caseType}
                        onChange={e => setParams({...params, caseType: e.target.value as CaseType})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
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
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <div className="md:col-span-4 mt-2">
                      <button 
                        type="submit"
                        disabled={loading || !params.caseNumber}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSearch className="w-5 h-5" />}
                        Cari Data Perkara
                      </button>
                    </div>
                  </form>
                </div>
              </section>

              {error && (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-start gap-4 text-amber-800 mb-8">
                  <AlertCircle className="w-6 h-6 shrink-0" />
                  <div>
                    <h4 className="font-bold">Tidak Ditemukan</h4>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              {activeCase ? (
                <CaseDetails data={activeCase} />
              ) : !loading && !error && (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                  <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-800">Sistem Digital PA Prabumulih</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto">Input nomor perkara untuk melacak lokasi fisik berkas arsip.</p>
                </div>
              )}
            </>
          )}
        </main>

        {showScanner && <Scanner onScan={handleScanSuccess} onClose={() => setShowScanner(false)} />}
        {showLoginModal && <LoginModal onSuccess={handleLoginSuccess} onClose={() => setShowLoginModal(false)} />}
      </div>
    </Router>
  );
};

export default App;
