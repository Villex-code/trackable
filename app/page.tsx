"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ChevronRightIcon, GlobeIcon, UserPlusIcon } from "lucide-react";

export default function LoginPage() {
  const { user, loginWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/home");
    }
  }, [user, loading, router]);

  const handleJoke = () => {
    alert("Of course we don't have support (yet)!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full flex bg-white overflow-hidden font-sans">
      {/* Left Panel: The Branding */}
      <div className="hidden lg:flex w-1/2 bg-[#2D2926] relative flex-col justify-between p-16 overflow-hidden rounded-r-[60px] shadow-[20px_0_60px_-15px_rgba(0,0,0,0.3)]">
        {/* Animated background subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-orange-500/5 rounded-full blur-[120px]" />

        {/* Top Tagline */}
        <div className="relative z-10">
          <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">
            Engine for your daily evolution
          </p>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mb-20">
          <h1 className="text-white text-[84px] font-bold leading-[0.95] tracking-tight mb-12">
            Manage <br />
            your growth
          </h1>

          {/* Phone Graphic Placeholder */}
          <div className="relative mt-12 transform hover:scale-105 transition-transform duration-700">
            <div className="absolute -inset-4 bg-brand-orange-500/20 rounded-[60px] blur-2xl" />
            <img
              src="/graphics/phone_mockup.png"
              alt="Trackable Mobile"
              className="relative w-80 shadow-2xl rounded-[48px] border-[8px] border-slate-900"
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=600";
              }}
            />
          </div>
        </div>

        {/* Bottom Logo/Indicator */}
        <div className="relative z-10 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-brand-orange-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
          </div>
          <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">
            System Online
          </span>
        </div>
      </div>

      {/* Right Panel: The Sign In */}
      <div className="w-full lg:w-1/2 flex flex-col p-10 lg:p-24 relative bg-white">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-32 w-full">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-100 border border-slate-50 p-2.5">
              <img
                src="/graphics/logo.png"
                alt="Trackable"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-black text-slate-800 tracking-tighter">
              Trackable
            </span>
          </div>

          <button
            onClick={handleJoke}
            className="flex items-center space-x-2 text-slate-400 hover:text-slate-800 transition-all font-bold text-sm group"
          >
            <UserPlusIcon
              size={18}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="uppercase tracking-widest text-[10px]">
              Sign Up
            </span>
          </button>
        </div>

        {/* Login Form Section */}
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <h2 className="text-[48px] font-black text-slate-800 mb-4 tracking-tighter leading-none">
            Sign In
          </h2>
          <p className="text-slate-400 font-medium mb-12 ml-1">
            Welcome back to your command center.
          </p>

          {/* Social Login ONLY */}
          <div className="space-y-8">
            <button
              onClick={loginWithGoogle}
              className="w-full group flex items-center justify-between bg-brand-orange-500 text-white pl-8 pr-6 py-5 rounded-full font-bold text-lg hover:bg-brand-orange-600 transition-all shadow-2xl shadow-brand-orange-500/30 transform hover:-translate-y-1 active:scale-95"
            >
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center p-1.5 shadow-inner">
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                </div>
                <span>Google Account</span>
              </div>
              <ChevronRightIcon
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

            <div className="flex flex-col items-center space-y-6">
              <button
                onClick={handleJoke}
                className="text-slate-400 font-bold hover:text-brand-orange-500 transition-colors text-[10px] uppercase tracking-widest"
              >
                Forgot password?
              </button>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="mt-auto flex flex-col sm:flex-row items-center justify-between text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] gap-6">
          <p>© 2026-2027 TRACKABLE INC.</p>

          <div className="flex items-center space-x-10">
            <button
              onClick={handleJoke}
              className="hover:text-slate-800 transition-colors"
            >
              Contact Us
            </button>
            <div className="flex items-center space-x-2 cursor-pointer hover:text-slate-800 transition-colors">
              <span>English</span>
              <GlobeIcon size={12} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
