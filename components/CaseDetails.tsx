
import React, { useState } from 'react';
import { CaseData, CaseType } from '../types';
import { 
  Calendar, User, FileText, CheckCircle2, Clock, Eye, X, 
  MapPin, Box, Layers, Archive, Info, ChevronDown, ChevronUp,
  ShieldCheck, Download, Maximize2
} from 'lucide-react';

interface CaseDetailsProps {
  data: CaseData;
}

const CaseDetails: React.FC<CaseDetailsProps> = ({ data }) => {
  const [showViewer, setShowViewer] = useState(false);
  const [showStorage, setShowStorage] = useState(false);
  const isGugatan = data.caseType === CaseType.GUGATAN;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-1 bg-blue-600"></div>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isGugatan ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {data.caseType}
              </span>
              {data.pdfUrl && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Digital Terarsip
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold mt-2 text-slate-800">{data.caseNumber}</h2>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => data.isArchived && setShowStorage(!showStorage)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold border transition-all active:scale-95 ${
                data.isArchived 
                  ? 'bg-green-600 text-white border-green-700 hover:bg-green-700 cursor-pointer shadow-lg shadow-green-100' 
                  : 'bg-amber-50 text-amber-700 border-amber-200 cursor-default'
              }`}
            >
              {data.isArchived ? (
                <>
                  <CheckCircle2 className="w-5 h-5" /> 
                  Sudah Minutasi
                  {showStorage ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                </>
              ) : (
                <><Clock className="w-5 h-5" /> Belum Minutasi</>
              )}
            </button>
          </div>
        </div>

        {/* Unified Archive Info Panel (Physical + Digital Embedded) */}
        {showStorage && data.isArchived && (
          <div className="mb-8 p-6 bg-slate-900 rounded-3xl text-white animate-in slide-in-from-top-4 duration-500 relative overflow-hidden border border-slate-800">
            {/* Background Decoration */}
            <div className="absolute -bottom-10 -right-10 opacity-5">
              <Archive className="w-64 h-64" />
            </div>

            <div className="relative z-10 space-y-6">
              {/* Header Title */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-xl">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white">Integrasi Arsip Perkara</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Data Lokasi Fisik & Berkas Elektronik (E-Doc)</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side: Physical Storage Information */}
                <div className="lg:col-span-4 flex flex-col justify-center space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <StorageDetail label="Ruang" value={data.storage?.roomNo} icon={<Archive className="w-4 h-4" />} />
                    <StorageDetail label="Lemari" value={data.storage?.shelfNo} icon={<Layers className="w-4 h-4" />} />
                    <StorageDetail label="Tingkat" value={data.storage?.levelNo} icon={<ChevronUp className="w-4 h-4" />} />
                    <StorageDetail label="No. Box" value={data.storage?.boxNo} icon={<Box className="w-4 h-4" />} />
                  </div>
                  
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Opsi Dokumen</p>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => setShowViewer(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all border border-white/10"
                      >
                        <Maximize2 className="w-3.5 h-3.5" /> Layar Penuh
                      </button>
                      {data.pdfUrl && (
                        <a 
                          href={data.pdfUrl} 
                          download={`${data.caseNumber.replace(/\//g, '_')}.pdf`}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all"
                        >
                          <Download className="w-3.5 h-3.5" /> Unduh PDF
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Embedded Digital File Preview */}
                <div className="lg:col-span-8">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative bg-slate-800 rounded-2xl border border-white/10 overflow-hidden aspect-[4/3] sm:aspect-video lg:aspect-auto lg:h-[350px]">
                      {data.pdfUrl ? (
                        <iframe 
                          src={`${data.pdfUrl}#toolbar=0&navpanes=0&view=FitH`} 
                          className="w-full h-full border-none opacity-90 hover:opacity-100 transition-opacity"
                          title="Pratinjau Mini"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 opacity-20" />
                          </div>
                          <p className="text-xs font-bold uppercase tracking-widest mb-1">E-Doc Kosong</p>
                          <p className="text-[10px] max-w-[200px]">Berkas digital untuk perkara ini belum diunggah ke server SI CANTIK.</p>
                        </div>
                      )}
                      
                      {/* Overlay Preview Label */}
                      {data.pdfUrl && (
                        <div className="absolute top-3 right-3 pointer-events-none">
                          <span className="bg-slate-900/80 backdrop-blur-md text-[9px] font-bold px-2 py-1 rounded border border-white/10 uppercase tracking-widest text-blue-400">
                            Pratinjau Berkas
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DetailItem 
            icon={<FileText className="w-5 h-5 text-slate-400" />} 
            label="Klasifikasi Perkara" 
            value={data.classification} 
          />
          <DetailItem 
            icon={<User className="w-5 h-5 text-slate-400" />} 
            label="Para Pihak" 
            value={data.parties} 
          />
          <DetailItem 
            icon={<Calendar className="w-5 h-5 text-slate-400" />} 
            label="Tanggal Putus" 
            value={new Date(data.decisionDate).toLocaleDateString('id-ID', { dateStyle: 'long' })} 
          />
          
          {isGugatan && (
            <DetailItem 
              icon={<Calendar className="w-5 h-5 text-slate-400" />} 
              label="Tanggal BHT" 
              value={data.bhtDate ? new Date(data.bhtDate).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'} 
            />
          )}
        </div>
      </div>

      {/* Full Screen PDF Viewer Modal */}
      {showViewer && data.pdfUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-2 sm:p-6 animate-in fade-in duration-300 backdrop-blur-md">
          <div className="bg-white w-full max-w-6xl h-full max-h-[96vh] rounded-3xl overflow-hidden flex flex-col relative shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">{data.caseNumber}</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Salinan Digital Terverifikasi</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowViewer(false)} 
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  title="Tutup"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content - PDF Viewer */}
            <div className="flex-1 bg-slate-100 relative overflow-hidden">
              <iframe 
                src={`${data.pdfUrl}#toolbar=1&view=FitH`} 
                className="w-full h-full border-none"
                title="Pratinjau Berkas"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Tampilan Dokumen Aktif (Cloud Server)
              </div>
              <button 
                onClick={() => setShowViewer(false)} 
                className="w-full sm:w-auto px-10 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1">{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{label}</p>
      <p className="text-slate-800 font-semibold leading-tight">{value}</p>
    </div>
  </div>
);

const StorageDetail = ({ label, value, icon }: { label: string, value: string | undefined, icon: React.ReactNode }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
      {icon}
      {label}
    </div>
    <div className="text-base font-bold text-white leading-none">{value || '-'}</div>
  </div>
);

export default CaseDetails;
