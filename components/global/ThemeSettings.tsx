"use client";

import { CheckIcon, ImageIcon, PaintbrushIcon, UploadIcon, PipetteIcon } from "lucide-react";
import { useRef } from "react";

interface ThemePickerProps {
  onSelect: (type: string) => void;
  current: string;
}

const presets = [
  {
    id: "ember",
    name: "Ember",
    style: { background: "linear-gradient(135deg, #431407 0%, #9a3412 100%)" },
  },
  {
    id: "midnight",
    name: "Midnight",
    style: { background: "linear-gradient(135deg, #020617 0%, #0f172a 100%)" },
  },
  {
    id: "obsidian",
    name: "Obsidian",
    style: { background: "linear-gradient(135deg, #09090b 0%, #1c1917 100%)" },
  },
  {
    id: "crimson",
    name: "Crimson",
    style: { background: "linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)" },
  },
  {
    id: "abyss",
    name: "Abyss",
    style: { background: "linear-gradient(135deg, #042f2e 0%, #134e4a 100%)" },
  },
  {
    id: "void",
    name: "Void",
    style: { background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)" },
  },
  {
    id: "dusk",
    name: "Dusk",
    style: { background: "linear-gradient(135deg, #1c1007 0%, #292524 100%)" },
  },
  {
    id: "default",
    name: "Original",
    style: { background: "#fffcf9" },
    light: true,
  },
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
      {/* Dark Presets */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
          Color Presets
        </p>
        <div className="grid grid-cols-4 gap-3">
          {presets.map((p) => {
            const isActive = current === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className={`group relative h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                  isActive
                    ? "border-brand-orange-500 scale-105 shadow-lg shadow-brand-orange-200/50"
                    : "border-transparent hover:border-white/40 hover:scale-102"
                }`}
              >
                <div className="absolute inset-0" style={p.style} />

                {/* Shine overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />

                {/* Name label */}
                <div
                  className={`absolute bottom-1.5 left-2 text-[9px] font-black uppercase tracking-wide ${
                    (p as any).light ? "text-slate-500" : "text-white/80"
                  }`}
                >
                  {p.name}
                </div>

                {isActive && (
                  <div className="absolute top-1.5 right-1.5 bg-brand-orange-500 text-white p-0.5 rounded-full shadow-sm">
                    <CheckIcon size={8} strokeWidth={4} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
        {/* Solid Color Picker */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <PipetteIcon size={12} className="text-slate-400" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Solid Color
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
            <input
              type="color"
              value={current.startsWith("#") ? current : "#1a1a2e"}
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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Local Image
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-200 rounded-xl py-2 transition-colors group"
          >
            <UploadIcon
              size={14}
              className="text-slate-400 group-hover:text-brand-orange-500 transition-colors"
            />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
              Upload
            </span>
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
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            External URL
          </p>
        </div>
        <input
          type="text"
          value={
            current.startsWith("http") && !current.startsWith("data:")
              ? current
              : ""
          }
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
