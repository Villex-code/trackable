"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
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

  const getBgStyle = () => {
    if (!mounted) return { backgroundColor: "#fffcf9" };
    // Image (URL or Data URL)
    if (bgType.startsWith("http") || bgType.startsWith("data:")) {
      return {
        backgroundImage: `url(${bgType})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }

    // Solid Color
    if (bgType.startsWith("#")) {
      return { backgroundColor: bgType };
    }

    const gradients: Record<string, string> = {
      "soft-peach": "linear-gradient(135deg, #fffaf5 0%, #fff1e6 100%)",
      "misty-rose": "linear-gradient(135deg, #fff5f5 0%, #ffe4e1 100%)",
      "powder-blue": "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
      "sage-light": "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
      "lavender-mist": "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
      "sunset-soft": "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
      "midnight-subtle": "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      carbon: "linear-gradient(135deg, #334155 0%, #1e293b 100%)",
      sunset: "linear-gradient(135deg, #fb923c 0%, #ec4899 50%, #e11d48 100%)",
      midnight:
        "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)",
      emerald: "linear-gradient(135deg, #10b981 0%, #0d9488 50%, #0891b2 100%)",
      ocean: "linear-gradient(135deg, #60a5fa 0%, #6366f1 50%, #8b5cf6 100%)",
      warm: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 50%, #fdba74 100%)",
      default: "#fffcf9",
    };

    return { background: gradients[bgType] || gradients.default };
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
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

      {/* Sidebar - Sticky on desktop, overlay on mobile */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out lg:p-6">
        <div className="flex-1 w-full max-w-[1600px] mx-auto glass rounded-t-[40px] lg:rounded-[48px] overflow-hidden flex flex-col relative bg-white/40 shadow-sm border border-brand-orange-100/30 backdrop-blur-md">
          {/* Decorative background elements - Strictly Orange */}
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none overflow-hidden">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute -top-1/4 -right-1/4 w-full h-full rotate-12 scale-150"
            >
              <circle cx="50" cy="50" r="40" fill="url(#grad1)" />
              <defs>
                <radialGradient
                  id="grad1"
                  cx="50%"
                  cy="50%"
                  r="50%"
                  fx="50%"
                  fy="50%"
                >
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          <div className="relative z-10 h-full flex flex-col overflow-hidden">
            {/* Page content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white/80 backdrop-blur-sm p-4 lg:p-8 pt-4">
              {children}
            </div>
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
