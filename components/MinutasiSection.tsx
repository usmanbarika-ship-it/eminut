
import React, { useState, useRef, useEffect } from 'react';
import { CaseData, StorageLocation } from '../types';
import { Box, MapPin, Layers, Archive, FileUp, FileText, ChevronDown, ChevronUp, X, Eye, FileCheck, Save, Loader2, Check, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MinutasiSectionProps {
  caseData: CaseData;
  onUpdate: (updatedCase: CaseData) => void;
  onSaveSuccess?: () => void;
}

const MinutasiSection: React.FC<MinutasiSectionProps> = ({ caseData, onUpdate, onSaveSuccess }) => {
  const [showLocationForm, setShowLocationForm] = useState(caseData.isArchived);
  const [showViewer, setShowViewer] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [formData, setFormData] = useState<StorageLocation>(
    caseData.storage || { roomNo: '', shelfNo: '', levelNo: '', boxNo: '' }
  );
  
  const [tempPdfUrl, setTempPdfUrl] = useState<string | undefined>(caseData.pdfUrl);
  
  useEffect(() => {
    setFormData(caseData.storage || { roomNo: '', shelfNo: '', levelNo: '', boxNo: '' });
    setTempPdfUrl(caseData.pdfUrl);
    setShowLocationForm(caseData.isArchived);
    setSaveSuccess(false);
  }, [caseData.id, caseData.pdfUrl, caseData.isArchived]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleStatus = () => {
    const nextArchived = !caseData.isArchived;
    onUpdate({
      ...caseData,
      isArchived: nextArchived,
      storage: nextArchived ? formData : undefined
    });
    setShowLocationForm(nextArchived);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSaveSuccess(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Mohon unggah berkas dalam format PDF saja.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadstart = () => setIsSaving(true);
      reader.onloadend = () => {
        setTempPdfUrl(reader.result as string);
        setSaveSuccess(false);
        setIsSaving(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    // Simulate server processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onUpdate({
      ...caseData,
      storage: formData,
      pdfUrl: tempPdfUrl
    });
    
    setIsSaving(false);
    setSaveSuccess(true);
    
    // Trigger redirection after a short delay so the user sees the success state
    if (onSaveSuccess) {
      setTimeout(() => {
        onSaveSuccess();
      }, 1000);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const isNewUpload = tempPdfUrl && tempPdfUrl !== caseData.pdfUrl;

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Archive className="w-6 h-6 text-blue-600" />
          Status Minutasi & Lokasi Arsip
        </h3>
        <button
          onClick={toggleStatus}
          className={`w-full sm:w-auto px-6 py-2 rounded-full font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
            caseData.isArchived 
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
              : 'bg-green-600 text-white hover:bg-green-700 shadow-green-100'
          }`}
        >
          {caseData.isArchived ? 'Batalkan Minutasi' : 'Tandai Sudah Minutasi'}
        </button>
      </div>

      {showLocationForm && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Informasi Lokasi Fisik
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InputField label="No. Ruang" name="roomNo" value={formData.roomNo} onChange={handleInputChange} placeholder="Ex: R-01" />
                <InputField label="No. Lemari/Rak" name="shelfNo" value={formData.shelfNo} onChange={handleInputChange} placeholder="Ex: L-10" />
                <InputField label="No. Tingkat" name="levelNo" value={formData.levelNo} onChange={handleInputChange} placeholder="Ex: 5" />
                <InputField label="No. Box" name="boxNo" value={formData.boxNo} onChange={handleInputChange} placeholder="Ex: B-22" />
              </div>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between overflow-hidden relative border border-white/5">
              {tempPdfUrl && (
                <div className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg ${
                  isNewUpload ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  <FileCheck className="w-3 h-3" /> {isNewUpload ? 'BELUM DISIMPAN' : 'TERVERIFIKASI'}
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">E-Document (PDF)</h4>
                <p className="text-slate-300 text-sm mb-6 italic leading-relaxed">
                  {tempPdfUrl 
                    ? (isNewUpload ? 'Berkas PDF baru dipilih. Klik simpan untuk memperbarui database.' : 'Dokumen PDF sudah sinkron dengan database pusat.') 
                    : 'Wajib unggah berkas dalam format PDF untuk minutasi digital.'}
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handleFileUpload} />
                
                <button 
                  onClick={() => tempPdfUrl ? setShowViewer(true) : alert('Silakan unggah berkas PDF terlebih dahulu.')}
                  disabled={!tempPdfUrl}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                    tempPdfUrl 
                      ? 'bg-white text-slate-900 hover:bg-slate-100 cursor-pointer shadow-lg' 
                      : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10'
                  }`}
                >
                  <Eye className="w-5 h-5" />
                  Lihat Berkas PDF
                </button>
                
                <button 
                  onClick={triggerUpload}
                  className="flex items-center justify-center gap-2 border border-white/20 text-white py-3 rounded-xl font-bold hover:bg-white/10 transition-colors"
                >
                  <FileUp className="w-5 h-5" />
                  {tempPdfUrl ? 'Ganti PDF' : 'Upload / Scan PDF'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all shadow-xl active:scale-95 ${
                saveSuccess 
                  ? 'bg-emerald-500 text-white shadow-emerald-200' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
              }`}
            >
              {isSaving ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
              ) : saveSuccess ? (
                <><Check className="w-5 h-5" /> Data Tersimpan</>
              ) : (
                <><Save className="w-5 h-5" /> Simpan Data Minutasi</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {showViewer && tempPdfUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-2 sm:p-8 animate-in fade-in duration-200 backdrop-blur-md">
          <div className="bg-white w-full max-w-6xl h-full max-h-[96vh] rounded-3xl overflow-hidden flex flex-col relative shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base truncate max-w-[180px] sm:max-w-md">
                    {caseData.caseNumber}
                  </h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    {isNewUpload ? 'Preview Berkas PDF Baru' : 'Dokumen PDF Terverifikasi'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowViewer(false)} 
                className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 bg-slate-200 overflow-hidden flex flex-col">
              <iframe 
                src={`${tempPdfUrl}#toolbar=1&view=FitH`} 
                className="w-full h-full border-none"
                title="PDF Preview"
              />
            </div>
            
            <div className="p-4 bg-slate-50 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-slate-500">
                {isNewUpload ? (
                   <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
                     <AlertCircle className="w-3 h-3" />
                     BELUM DISIMPAN KE DATABASE
                   </div>
                ) : (
                  <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    SUDAH TERVERIFIKASI
                  </div>
                )}
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setShowViewer(false)}
                  className="flex-1 sm:flex-none px-10 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                >
                  Tutup Viewer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InputField = ({ label, name, value, onChange, placeholder }: any) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
    />
  </div>
);

export default MinutasiSection;
