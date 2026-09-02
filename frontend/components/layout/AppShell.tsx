"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScanLine,
  Flame,
  Layers,
  Hourglass,
  Sparkles,
  FileSpreadsheet,
  Shield,
  Search,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { checkBackendHealth } from "@/lib/api";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { CyberBackground } from "@/components/ui/CyberBackground";

const NAV_GROUPS = [
  {
    group: "Overview",
    items: [
      { name: "Executive Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    group: "Discovery & Analysis",
    items: [
      { name: "Codebase Scanner", href: "/scan", icon: ScanLine },
      { name: "Risk Heatmap", href: "/heatmap", icon: Flame },
      { name: "CBOM Inventory", href: "/inventory", icon: Layers },
      { name: "Mosca HNDL Timeline", href: "/mosca", icon: Hourglass },
    ],
  },
  {
    group: "Remediation & Reports",
    items: [
      { name: "AI Code Remediator", href: "/remediation", icon: Sparkles },
      { name: "Compliance Reports", href: "/reports", icon: FileSpreadsheet },
    ],
  },
];

const PUBLIC_ROUTES = ["/", "/features", "/architecture", "/standards", "/about"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    checkBackendHealth().then((isLive) => setBackendOnline(isLive));
  }, []);

  // Public marketing routes render their own layout (LandingHeader is in each page)
  if (PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="bg-[#050505] text-[#F5F5F5] min-h-screen flex flex-col antialiased relative selection:bg-purple-500/30 selection:text-purple-200">
      {/* Background Living Quantum Atmosphere & Grain (GPU-accelerated, non-intrusive) */}
      <CyberBackground />

      {/* Top Header Bar: Clean, Minimalist Quantum Command Bar */}
      <header className="h-14 bg-[#08080A]/90 backdrop-blur-md border-b border-white/[0.06] px-5 flex items-center justify-between z-30 sticky top-0 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-[0_0_12px_rgba(255,255,255,0.15)] group-hover:scale-105 transition-all">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white tracking-tight">
                ECDAT
              </span>
              <span className="text-[11px] font-medium text-white/20">/</span>
              <span className="text-xs text-[#A6A6AD] font-medium hidden sm:inline">
                Post-Quantum Cryptographic Analysis
              </span>
            </div>
          </Link>
        </div>

        {/* Right Header Status & Navigation */}
        <div className="flex items-center gap-2.5 text-xs">
          {/* Futuristic Command Prompt Search */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D0D11] border border-white/10 text-[#A6A6AD] text-xs w-60 focus-within:border-white/25 transition-colors shadow-inner">
            <Search className="w-3.5 h-3.5 text-[#71717A]" />
            <span className="flex-1 text-[11px] text-[#A6A6AD]">Search assets, ciphers...</span>
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-[#18181E] border border-white/10 rounded text-[#A6A6AD]">
              ⌘K
            </kbd>
          </div>

          {/* Evaluator Capsule Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111115] border border-white/10 text-[#A6A6AD] font-medium text-[11px]">
            <span>Evaluator:</span>
            <strong className="text-white font-semibold">NTRO (PMO India)</strong>
          </div>

          {/* Engine Status Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111115] border border-white/10 text-[#F5F5F5] text-[11px]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                backendOnline ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
              }`}
            />
            <span className="font-medium text-[#A6A6AD]">
              {backendOnline ? "API Live" : "Demo Engine"}
            </span>
          </div>

          {/* Public Portal Link */}
          <Link
            href="/"
            className="flex items-center gap-1 px-3 py-1 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 text-[#A6A6AD] hover:text-white transition-all text-[11px] font-medium"
          >
            <span>Public Site</span>
            <ExternalLink className="w-3 h-3 text-[#71717A]" />
          </Link>

          {/* User Profile Avatar Capsule */}
          <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center font-bold text-[11px] ml-1 shadow-[0_0_8px_rgba(255,255,255,0.1)]">
            AG
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Left Sidebar Navigation: Minimal Dark Console */}
        <aside className="w-60 bg-[#070709]/95 backdrop-blur-md border-r border-white/[0.06] p-3.5 flex flex-col justify-between hidden md:flex shrink-0 z-20">
          <div className="space-y-6">
            {NAV_GROUPS.map((group) => (
              <div key={group.group} className="space-y-1">
                <p className="text-[10px] font-semibold text-[#71717A] px-2.5 uppercase tracking-wider mb-1.5">
                  {group.group}
                </p>

                <nav className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-all ${
                          isActive
                            ? "bg-[#18181F] text-white border border-white/15 font-semibold shadow-[0_2px_12px_rgba(0,0,0,0.5)] rounded-xl"
                            : "text-[#A6A6AD] hover:bg-white/[0.04] hover:text-white rounded-xl"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? "text-white" : "text-[#71717A]"
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Sidebar Footer Info Card */}
          <div className="p-3 rounded-xl bg-[#0D0D11] border border-white/[0.06] space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-[#71717A] font-medium">
              <span>Standard</span>
              <span className="text-[#F5F5F5] font-semibold font-mono">CycloneDX 1.6</span>
            </div>
            <div className="flex items-center justify-between text-[#71717A] font-medium">
              <span>PQC Baseline</span>
              <span className="text-[#F5F5F5] font-semibold font-mono">NIST FIPS 203/204</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-5 md:p-7 bg-transparent relative z-10">
          <div className="max-w-6xl mx-auto space-y-5">{children}</div>
        </main>
      </div>
    </div>
  );
}
