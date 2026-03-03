
import React, { useState } from 'react';
import { QrCode, X, Camera } from 'lucide-react';

interface ScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);

  const simulateScan = () => {
    setIsScanning(true);
    // Simulate camera delay and return a result for PA Prabumulih
    setTimeout(() => {
      onScan("123/Pdt.G/2023/PA.Pbm");
      setIsScanning(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 border-b flex justify-between items-center bg-slate-900 text-white">
          <h3 className="font-bold flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Scan QR Perkara
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="aspect-square bg-slate-100 flex flex-col items-center justify-center p-8 relative">
          <div className="w-64 h-64 border-2 border-dashed border-blue-500 rounded-xl flex items-center justify-center relative overflow-hidden">
            {isScanning ? (
              <div className="absolute inset-0 bg-blue-500/10 animate-pulse flex items-center justify-center">
                <div className="w-full h-1 bg-blue-500 absolute top-0 animate-[scan_2s_ease-in-out_infinite]"></div>
                <Camera className="w-12 h-12 text-blue-500 animate-bounce" />
              </div>
            ) : (
              <QrCode className="w-20 h-20 text-slate-300" />
            )}
          </div>
          
          <style>{`
            @keyframes scan {
              0% { transform: translateY(0); }
              50% { transform: translateY(256px); }
              100% { transform: translateY(0); }
            }
          `}</style>

          <p className="mt-6 text-sm text-slate-500 text-center font-medium">
            Dekatkan QR Code perkara PA Prabumulih pada kotak pemindai.
          </p>
          
          {!isScanning && (
            <button 
              onClick={simulateScan}
              className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Buka Kamera
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scanner;
