"use client";

import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen p-6 gap-6 overflow-hidden">
      <Sidebar />

      <main className="flex-1 ml-24 flex flex-col animate-fade-in relative h-[calc(100vh-48px)]">
        {/* Main content container */}
        <div className="flex-1 glass rounded-[40px] overflow-hidden flex flex-col relative">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <circle cx="80" cy="20" r="40" fill="url(#grad1)" />
              <defs>
                <radialGradient
                  id="grad1"
                  cx="50%"
                  cy="50%"
                  r="50%"
                  fx="50%"
                  fy="50%"
                >
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          <div className="relative z-10 h-full flex flex-col">
            {/* Page content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
