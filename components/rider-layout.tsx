"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { enablePush } from "@/lib/push-client";
import { BottomNav } from "./bottom-nav";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface RiderLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function RiderLayout({ children, title }: RiderLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Once signed in, register the SW + subscribe this device to push so new
  // assignments alert instantly, even with the app closed.
  useEffect(() => {
    if (user) void enablePush();
  }, [user]);

  async function handleLogout() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="gradient-navy sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Malique Oil and Gas logo" className="w-8 h-8 rounded-full" />
            <div>
              <p className="text-white text-sm font-semibold leading-tight">
                {title || "Malique Rider"}
              </p>
              {user && (
                <p className="text-slate-400 text-[11px] leading-tight">
                  {user.fullName}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="touch-target text-slate-400 hover:text-white transition-colors"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-24 overflow-y-auto">
        {children}

        {/* Footer credit */}
        <footer className="pt-8 pb-4 px-4 flex flex-col items-center gap-1 text-center">
          <div className="flex flex-wrap items-center justify-center gap-1 text-[11px] text-slate-400">
            <span>Designed &amp; Developed by</span>
            <a
              href="https://blackboxtech.online"
              target="_blank"
              rel="noopener noreferrer"
              title="Black-Box Tech — info@blackboxtech.online"
              className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-amber-600 transition-colors"
            >
              <img src="/blackbox-tech.jpg" alt="Black-Box Tech logo" className="w-3.5 h-3.5 rounded-sm" />
              Black-Box Tech
            </a>
            <span className="text-slate-300">&bull;</span>
            <a
              href="mailto:info@blackboxtech.online"
              className="hover:text-amber-600 transition-colors"
            >
              info@blackboxtech.online
            </a>
          </div>
        </footer>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
