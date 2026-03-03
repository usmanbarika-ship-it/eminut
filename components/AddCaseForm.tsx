
import React, { useState, useRef } from 'react';
import { CaseData, CaseType, StorageLocation } from '../types';
import { Save, X, FilePlus2, Calendar, Archive, MapPin, FileUp, Loader2, RotateCcw, Trash2, CheckCircle2 } from 'lucide-react';

interface AddCaseFormProps {
  onSave: (newCase: CaseData) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  initialData?: CaseData | null;
}

const AddCaseForm: React.FC<AddCaseFormProps> = ({ onSave, onCancel, onDelete, initialData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Add year to form state to support construction of case numbers from partial input
  const [formData, setFormData] = useState<Partial<CaseData> & { year?: string }>(
    (initialData as any) || {
      caseType: CaseType.GUGATAN,
      year: new Date().getFullYear().toString(),
      decisionDate: new Date().toISOString().split('T')[0],
      isArchived: false
    }
  );

  const [storage, setStorage] = useState<StorageLocation>(
    initialData?.storage || { roomNo: '', shelfNo: '', levelNo: '', boxNo: '' }
  );

  const [pdfUrl, setPdfUrl] = useState<string | undefined>(initialData?.pdfUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPdfUrl(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.caseNumber || !formData.classification || !formData.parties) return;

    setIsSubmitting(true);

    let fullCaseNum = formData.caseNumber || '';
    if (!fullCaseNum.includes('/')) {
       fullCaseNum = `${formData.caseNumber}/${formData.caseType === CaseType.GUGATAN ? 'Pdt.G' : 'Pdt.P'}/${formData.year || new Date().getFullYear()}/PA.Pbm`;
    }

    const finalCase: CaseData = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      caseNumber: fullCaseNum,
      caseType: (formData.caseType as CaseType) || CaseType.GUGATAN,
      classification: formData.classification as string,
      parties: formData.parties as string,
      decisionDate: formData.decisionDate as string,
      bhtDate: formData.caseType === CaseType.GUGATAN ? formData.bhtDate : undefined,
      isArchived: !!formData.isArchived,
      storage: formData.isArchived ? storage : undefined,
      pdfUrl: pdfUrl
    };

    // Simulasi delay penyimpanan ke "database"
    setTimeout(() => {
      onSave(finalCase);
      setIsSubmitting(false);
    }, 600);
  };

  const handleResetMinutasi = () => {
    if (initialData) {
      const resetCase: CaseData = {
        ...initialData,
        isArchived: false,
        storage: undefined,
        pdfUrl: undefined
      };
      onSave(resetCase);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <div className={`p-1 bg-gradient-to-r ${initialData ? 'from-blue-600 to-indigo-600' : 'from-emerald-600 to-teal-600'}`}></div>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className={`${initialData ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'} p-2 rounded-xl`}>
              {initialData ? <Archive className="w-6 h-6" /> : <FilePlus2 className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {initialData ? 'Update & Minutasi Perkara' : 'Input Perkara Baru'}
              </h2>
              <p className="text-slate-500 text-sm">
                Data akan otomatis tersimpan ke daftar Berkas Terinput.
              </p>
            </div>
          </div>
          <button type="button" onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Identitas Perkara</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nomor Perkara</label>
                  <input 
                    type="text" required placeholder="Contoh: 1234"
                    disabled={!!initialData}
                    defaultValue={initialData ? initialData.caseNumber.split('/')[0] : ''}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium disabled:opacity-50"
                    onChange={e => setFormData({...formData, caseNumber: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Jenis</label>
                    <select 
                      disabled={!!initialData}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium appearance-none disabled:opacity-50"
                      value={formData.caseType}
                      onChange={e => setFormData({...formData, caseType: e.target.value as CaseType})}
                    >
                      <option value={CaseType.GUGATAN}>Gugatan</option>
                      <option value={CaseType.PERMOHONAN}>Permohonan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tahun</label>
                    <input 
                      type="number" disabled={!!initialData}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium disabled:opacity-50"
                      value={formData.year}
                      // Fixed: Changed setParams to setFormData
                      onChange={e => setFormData({...formData, year: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Klasifikasi Perkara</label>
                  <input 
                    type="text" required placeholder="Cerai Gugat"
                    value={formData.classification}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    onChange={e => setFormData({...formData, classification: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pihak / Pemohon</label>
                  <input 
                    type="text" required placeholder="Nama Pihak"
                    value={formData.parties}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    onChange={e => setFormData({...formData, parties: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tanggal Putus</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="date" required
                    value={formData.decisionDate}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    onChange={e => setFormData({...formData, decisionDate: e.target.value})}
                  />
                </div>
              </div>
              {formData.caseType === CaseType.GUGATAN && (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tanggal BHT / Inkracht</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="date"
                      value={formData.bhtDate || ''}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                      onChange={e => setFormData({...formData, bhtDate: e.target.value})}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${formData.isArchived ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Status Minutasi</h3>
                  <p className="text-xs text-slate-500">Berkas sudah masuk ke ruang arsip fisik?</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={formData.isArchived}
                  onChange={e => setFormData({...formData, isArchived: e.target.checked})}
                />
                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            {formData.isArchived && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Lokasi Fisik
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <StorageInput label="Ruang" value={storage.roomNo} onChange={v => setStorage({...storage, roomNo: v})} />
                    <StorageInput label="Lemari" value={storage.shelfNo} onChange={v => setStorage({...storage, shelfNo: v})} />
                    <StorageInput label="Tingkat" value={storage.levelNo} onChange={v => setStorage({...storage, levelNo: v})} />
                    <StorageInput label="Box" value={storage.boxNo} onChange={v => setStorage({...storage, boxNo: v})} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <FileUp className="w-3 h-3" /> Berkas PDF
                  </h4>
                  <div className="flex flex-col gap-3">
                    <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handleFileUpload} />
                    {pdfUrl ? (
                      <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <span className="text-xs font-bold text-slate-600 truncate">Dokumen_Terunggah.pdf</span>
                        </div>
                        <button type="button" onClick={() => setPdfUrl(undefined)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-6 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all bg-white"
                      >
                        {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileUp className="w-6 h-6" />}
                        <span className="text-xs font-bold">Pilih PDF Berkas</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
            {initialData && (
              <button 
                type="button" 
                onClick={() => onDelete && onDelete(initialData.id)}
                className="flex items-center justify-center gap-2 px-6 py-4 border border-red-100 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all"
              >
                <Trash2 className="w-5 h-5" />
                Hapus
              </button>
            )}
            <div className="flex-1 flex gap-4 w-full">
              <button type="button" onClick={onCancel} className="flex-1 py-4 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all">
                Batal
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`flex-[2] py-4 rounded-xl font-bold transition-all shadow-xl flex items-center justify-center gap-2 text-white ${
                  initialData ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
                } disabled:opacity-70`}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {initialData ? 'Simpan Perubahan' : 'Simpan ke Berkas Terinput'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const StorageInput = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
  <div>
    <label className="block text-[10px] text-slate-500 font-bold mb-1 ml-1">{label}</label>
    <input 
      type="text" value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
    />
  </div>
);

export default AddCaseForm;
