"use client";

function isDarkHex(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ThemePicker from "@/components/global/ThemeSettings";
import PopupTransition from "@/components/global/PopupTransition";
import PopupLayout from "@/components/global/PopupLayout";

import { DashboardProvider, useDashboard } from "@/lib/DashboardContext";
import { TimerProvider } from "@/lib/TimerContext";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { isSettingsOpen, setIsSettingsOpen } = useDashboard();
  const [bgType, setBgType] = useState("default");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("dashboard-bg");
    if (saved) setBgType(saved);
  }, []);

  const handleBgChange = (type: string) => {
    setBgType(type);
    localStorage.setItem("dashboard-bg", type);
  };

  const darkPresets = new Set([
    "ember", "midnight", "obsidian", "crimson", "abyss", "void", "dusk",
  ]);
  const isDark = darkPresets.has(bgType) || (bgType.startsWith("#") && isDarkHex(bgType));

  const getBgStyle = () => {
    if (!mounted) return { backgroundColor: "#fffcf9" };
    if (bgType.startsWith("http") || bgType.startsWith("data:")) {
      return {
        backgroundImage: `url(${bgType})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    if (bgType.startsWith("#")) {
      return { backgroundColor: bgType };
    }
    const gradients: Record<string, string> = {
      // Dark presets
      ember:    "linear-gradient(135deg, #431407 0%, #9a3412 100%)",
      midnight: "linear-gradient(135deg, #020617 0%, #0f172a 100%)",
      obsidian: "linear-gradient(135deg, #09090b 0%, #1c1917 100%)",
      crimson:  "linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)",
      abyss:    "linear-gradient(135deg, #042f2e 0%, #134e4a 100%)",
      void:     "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
      dusk:     "linear-gradient(135deg, #1c1007 0%, #292524 100%)",
      // Legacy light presets
      "soft-peach":    "linear-gradient(135deg, #fffaf5 0%, #fff1e6 100%)",
      "misty-rose":    "linear-gradient(135deg, #fff5f5 0%, #ffe4e1 100%)",
      "powder-blue":   "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
      "sage-light":    "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
      "lavender-mist": "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
      "sunset-soft":   "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
      warm:            "linear-gradient(135deg, #ffedd5 0%, #fed7aa 50%, #fdba74 100%)",
      default: "#fffcf9",
    };
    return { background: gradients[bgType] || gradients.default };
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffcf9]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange-500"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      data-dark={isDark ? "true" : "false"}
      className="flex min-h-screen overflow-hidden relative transition-all duration-1000"
      style={getBgStyle()}
    >
      <PopupTransition open={isSettingsOpen} setOpen={setIsSettingsOpen}>
        <div className="bg-white rounded-[48px] p-10 max-w-2xl w-full mx-4 shadow-2xl border border-brand-orange-100/20">
          <PopupLayout
            title="Appearance"
            description="Personalize your dashboard with a custom background or gradient."
            footer={
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="btn-orange w-full"
              >
                Save & Close
              </button>
            }
          >
            <ThemePicker onSelect={handleBgChange} current={bgType} />
          </PopupLayout>
        </div>
      </PopupTransition>

      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out">
        <div className={`flex-1 w-full overflow-hidden flex flex-col relative backdrop-blur-sm min-h-0 transition-colors duration-1000 ${isDark ? "bg-white/30" : "bg-white/65"}`}>
          {/* Decorative orange circle */}
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.025] pointer-events-none overflow-hidden">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute -top-1/4 -right-1/4 w-full h-full rotate-12 scale-150"
            >
              <circle cx="50" cy="50" r="40" fill="url(#grad1)" />
              <defs>
                <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          <div className="relative z-10 flex-1 flex flex-col min-h-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TimerProvider>
      <DashboardProvider>
        <DashboardContent>{children}</DashboardContent>
      </DashboardProvider>
    </TimerProvider>
  );
}
