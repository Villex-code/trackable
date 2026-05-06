"use client";

import { useState, useEffect } from "react";
import PopupTransition from "@/components/global/PopupTransition";
import PopupLayout from "@/components/global/PopupLayout";
import { ClipboardIcon, CheckCircle2Icon, AlertCircleIcon, Loader2Icon, SparklesIcon, CopyIcon } from "lucide-react";

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
  const [showPrompt, setShowPrompt] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPastedData([]);
      setError(null);
      setIsImporting(false);
      setShowPrompt(false);
      setCopySuccess(false);
    }
  }, [isOpen]);

  const handlePaste = (e: React.ClipboardEvent | ClipboardEvent) => {
    let text = "";
    if ('clipboardData' in e && e.clipboardData) {
      text = e.clipboardData.getData('text');
    }

    if (!text) return;

    try {
      const startIdx = text.indexOf('[');
      const endIdx = text.lastIndexOf(']');
      
      let jsonText = text;
      if (startIdx !== -1 && endIdx !== -1) {
        jsonText = text.substring(startIdx, endIdx + 1);
      }

      const json = JSON.parse(jsonText);
      const dataArray = Array.isArray(json) ? json : [json];
      
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

  const getAiPrompt = () => {
    const schemas: Record<string, string> = {
      "Work Sessions": `I want to track my work sessions. Please provide me with a JSON array of work sessions in the following format:
[
  { "duration": 3600, "comment": "Focus Session: Project X", "logged_at": "2024-05-05T09:00:00Z" }
]
Duration is in seconds. logged_at is optional. Generate a realistic log for me based on [Describe your activities].`,
      "Daily Meals": `I want to track my diet and activities. Please provide me with a JSON array of entries in the following format:
[
  { "amount": 500, "type": "input", "description": "Lunch: Chicken Pasta", "logged_at": "2024-05-05T13:00:00Z" },
  { "amount": 300, "type": "output", "description": "30min Running", "logged_at": "2024-05-05T18:00:00Z" }
]
Type 'input' is for food, 'output' is for exercise. Generate a realistic log for me based on [Describe your day].`,
      "Financial Transactions": `I want to track my finances. Please provide me with a JSON array of transactions in the following format:
[
  { 
    "amount": 12.50, 
    "type": "expense", 
    "category": "Food", 
    "description": "Lunch", 
    "is_recurring": false,
    "logged_at": "2024-05-05T12:00:00Z" 
  },
  { 
    "amount": 14.99, 
    "type": "expense", 
    "category": "Subscription", 
    "description": "Netflix", 
    "is_recurring": true,
    "logged_at": "2024-05-01T10:00:00Z" 
  }
]
- type: must be either 'income' or 'expense'.
- is_recurring: boolean (true for recurring subscriptions, false for one-time payments).
Generate a realistic log for me based on [Describe your recent spending].`
    };

    return schemas[title] || `Please provide me with a JSON array for ${title} using these fields: ${expectedFields.join(', ')}.`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getAiPrompt());
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <PopupTransition open={isOpen} onClose={onClose}>
      <div className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden">
        <PopupLayout 
          title={`Bulk Import: ${title}`}
          description="Paste your JSON data anywhere in this window."
          className="p-10"
          footer={
            <div className="flex w-full gap-4 pt-4 bg-white border-t border-slate-50">
              <button 
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all text-sm uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={executeImport}
                disabled={pastedData.length === 0 || isImporting}
                className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold transition-all shadow-xl disabled:opacity-50 flex items-center justify-center space-x-2 text-sm uppercase tracking-widest"
              >
                {isImporting ? <Loader2Icon className="animate-spin" size={18} /> : <CheckCircle2Icon size={18} />}
                <span>Import {pastedData.length} Entries</span>
              </button>
            </div>
          }
        >
          <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
            <div 
              className={`min-h-[140px] border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center p-8 transition-all focus:outline-none focus:ring-2 focus:ring-slate-100 ${
                error ? 'border-red-200 bg-red-50/30' : 
                pastedData.length > 0 ? 'border-emerald-200 bg-emerald-50/30' : 
                'border-slate-100 bg-slate-50/50'
              }`}
              onPaste={handlePaste}
              tabIndex={0}
            >
              {error ? (
                <div className="text-center space-y-3">
                  <AlertCircleIcon size={32} className="text-red-400 mx-auto" />
                  <p className="text-red-500 font-bold text-xs">{error}</p>
                </div>
              ) : pastedData.length > 0 ? (
                <div className="text-center space-y-3 w-full">
                  <CheckCircle2Icon size={32} className="text-emerald-400 mx-auto" />
                  <p className="text-emerald-600 font-bold text-xs">Detected {pastedData.length} entries!</p>
                  <div className="max-h-[80px] overflow-y-auto w-full text-left bg-white/80 p-3 rounded-xl border border-emerald-100 text-[9px] font-mono text-slate-500">
                    <pre>{JSON.stringify(pastedData.slice(0, 1), null, 2)}</pre>
                    {pastedData.length > 1 && "\n..."}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mx-auto text-slate-300">
                    <ClipboardIcon size={24} />
                  </div>
                  <p className="text-slate-500 font-bold text-xs">Waiting for clipboard...</p>
                  <p className="text-slate-400 text-[10px] max-w-[200px]">Command+V to paste</p>
                </div>
              )}
            </div>

            {/* AI Prompt Section */}
            <div className="bg-blue-50/30 border border-blue-100 rounded-[32px] p-6 space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                     <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                        <SparklesIcon size={16} />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">AI Prompt Assistant</span>
                  </div>
                  <button 
                    onClick={() => setShowPrompt(!showPrompt)}
                    className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:underline"
                  >
                    {showPrompt ? "Hide" : "Show Guide"}
                  </button>
               </div>

               {showPrompt && (
                  <div className="space-y-4 animate-fade-in pb-2">
                     <p className="text-[11px] text-slate-500 font-medium">Copy this prompt for perfectly formatted data.</p>
                     <div className="relative group">
                        <div className="bg-white/80 border border-blue-100 rounded-2xl p-4 text-[10px] font-mono text-slate-600 pr-10 leading-relaxed max-h-[120px] overflow-y-auto custom-scrollbar">
                           {getAiPrompt()}
                        </div>
                        <button 
                          onClick={copyToClipboard}
                          className={`absolute top-2 right-2 p-2 rounded-xl transition-all ${copySuccess ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400 hover:bg-blue-500 hover:text-white'}`}
                        >
                           {copySuccess ? <CheckCircle2Icon size={14} /> : <CopyIcon size={14} />}
                        </button>
                     </div>
                  </div>
               )}
            </div>
          </div>
        </PopupLayout>
      </div>
    </PopupTransition>
  );
}
