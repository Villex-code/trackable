"use client";

import { useState, useEffect } from "react";
import PopupTransition from "@/components/global/PopupTransition";
import PopupLayout from "@/components/global/PopupLayout";
import { ClipboardIcon, CheckCircle2Icon, AlertCircleIcon, Loader2Icon } from "lucide-react";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<void>;
  title: string;
  expectedFields: string[];
}

export default function BulkImportModal({ isOpen, onClose, onImport, title, expectedFields }: BulkImportModalProps) {
  const [pastedData, setPastedData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPastedData([]);
      setError(null);
      setIsImporting(false);
    }
  }, [isOpen]);

  const handlePaste = (e: React.ClipboardEvent | ClipboardEvent) => {
    let text = "";
    if ('clipboardData' in e && e.clipboardData) {
      text = e.clipboardData.getData('text');
    }

    if (!text) return;

    try {
      const json = JSON.parse(text);
      const dataArray = Array.isArray(json) ? json : [json];
      
      // Basic validation
      const firstItem = dataArray[0];
      const missing = expectedFields.filter(f => !(f in firstItem));
      
      if (missing.length > 0) {
        setError(`Invalid format. Missing fields: ${missing.join(', ')}`);
        return;
      }

      setPastedData(dataArray);
      setError(null);
    } catch (err) {
      setError("Invalid JSON format. Please copy valid JSON data.");
    }
  };

  const executeImport = async () => {
    setIsImporting(true);
    try {
      await onImport(pastedData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to import data.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <PopupTransition open={isOpen} onClose={onClose}>
      <div className="relative w-full max-w-xl bg-white rounded-[40px] p-10 shadow-2xl border border-slate-100">
        <PopupLayout 
          title={`Bulk Import: ${title}`}
          description="Paste your JSON data anywhere in this window to start the import."
          footer={
            <>
              <button 
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={executeImport}
                disabled={pastedData.length === 0 || isImporting}
                className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold transition-all shadow-xl disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isImporting ? <Loader2Icon className="animate-spin" size={18} /> : <CheckCircle2Icon size={18} />}
                <span>Import {pastedData.length} Entries</span>
              </button>
            </>
          }
        >
          <div 
            className={`min-h-[200px] border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center p-8 transition-all ${
              error ? 'border-red-200 bg-red-50/30' : 
              pastedData.length > 0 ? 'border-emerald-200 bg-emerald-50/30' : 
              'border-slate-100 bg-slate-50/50'
            }`}
            onPaste={handlePaste}
            tabIndex={0} // Make it focusable for paste
          >
            {error ? (
              <div className="text-center space-y-3">
                <AlertCircleIcon size={40} className="text-red-400 mx-auto" />
                <p className="text-red-500 font-bold text-sm">{error}</p>
                <p className="text-slate-400 text-xs">Try copying a valid JSON array.</p>
              </div>
            ) : pastedData.length > 0 ? (
              <div className="text-center space-y-3">
                <CheckCircle2Icon size={40} className="text-emerald-400 mx-auto" />
                <p className="text-emerald-600 font-bold text-sm">Detected {pastedData.length} entries!</p>
                <div className="max-h-[100px] overflow-y-auto w-full max-w-xs mx-auto text-left bg-white/50 p-3 rounded-xl border border-emerald-100 text-[10px] font-mono text-slate-500">
                   {JSON.stringify(pastedData.slice(0, 2), null, 2)}
                   {pastedData.length > 2 && "\n..."}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mx-auto text-slate-300">
                  <ClipboardIcon size={32} />
                </div>
                <p className="text-slate-500 font-bold text-sm">Waiting for clipboard data...</p>
                <p className="text-slate-400 text-xs max-w-[200px]">Expected fields: {expectedFields.join(', ')}</p>
              </div>
            )}
          </div>
        </PopupLayout>
      </div>
    </PopupTransition>
  );
}
