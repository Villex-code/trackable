"use client";

import { CheckIcon, ImageIcon, PaintbrushIcon, UploadIcon, PipetteIcon } from "lucide-react";
import { useRef } from "react";

interface ThemePickerProps {
  onSelect: (type: string) => void;
  current: string;
}

const presets = [
  { id: 'default', name: 'Original', style: { background: '#fffcf9' }, darkText: true },
  { id: 'soft-peach', name: 'Soft Peach', style: { background: 'linear-gradient(135deg, #fffaf5 0%, #fff1e6 100%)' }, darkText: true },
  { id: 'misty-rose', name: 'Misty Rose', style: { background: 'linear-gradient(135deg, #fff5f5 0%, #ffe4e1 100%)' }, darkText: true },
  { id: 'powder-blue', name: 'Powder Blue', style: { background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }, darkText: true },
  { id: 'sage-light', name: 'Pale Sage', style: { background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }, darkText: true },
  { id: 'lavender-mist', name: 'Lavender', style: { background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' }, darkText: true },
  { id: 'sunset-soft', name: 'Sunset', style: { background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' }, darkText: true },
];

export default function ThemePicker({ onSelect, current }: ThemePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Soft Presets</p>
        <div className="grid grid-cols-3 gap-3">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`group relative h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                current === p.id 
                  ? 'border-brand-orange-500 scale-105 shadow-md' 
                  : 'border-slate-100 hover:border-brand-orange-200'
              }`}
            >
              <div className="absolute inset-0" style={p.style} />
              <div className={`absolute bottom-1.5 left-1.5 text-[9px] font-bold uppercase tracking-tighter ${p.darkText ? 'text-slate-600' : 'text-white/80'}`}>
                {p.name}
              </div>
              {current === p.id && (
                <div className="absolute top-1 right-1 bg-brand-orange-500 text-white p-0.5 rounded-full">
                  <CheckIcon size={8} strokeWidth={4} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
        {/* Color Picker */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <PipetteIcon size={12} className="text-slate-400" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Solid Color</p>
          </div>
          <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
            <input 
              type="color" 
              value={current.startsWith("#") ? current : "#ffffff"}
              onChange={(e) => onSelect(e.target.value)}
              className="w-8 h-8 rounded-lg overflow-hidden border-0 p-0 bg-transparent cursor-pointer"
            />
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
              {current.startsWith("#") ? current : "Pick color"}
            </span>
          </div>
        </div>

        {/* Local Upload */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <UploadIcon size={12} className="text-slate-400" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Local Image</p>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-200 rounded-xl py-2 transition-colors group"
          >
            <UploadIcon size={14} className="text-slate-400 group-hover:text-brand-orange-500 transition-colors" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Upload</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100">
         <div className="flex items-center space-x-2 mb-3">
           <ImageIcon size={12} className="text-slate-400" />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">External URL</p>
         </div>
         <input 
           type="text" 
           value={current.startsWith("http") && !current.startsWith("data:") ? current : ""}
           placeholder="Paste image URL..."
           className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange-300 focus:bg-white transition-all text-slate-600 placeholder:text-slate-300"
           onChange={(e) => {
             onSelect(e.target.value || "default");
           }}
         />
      </div>
    </div>
  );
}
