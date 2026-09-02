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
    <div className="bg-[#f8fafc] text-slate-900 min-h-screen flex flex-col antialiased">
      {/* Top Header Bar: Clean, Restrained, Authoritative */}
      <header className="h-14 bg-white border-b border-slate-200 px-5 flex items-center justify-between z-30 sticky top-0">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-600 transition-colors">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 tracking-tight">
                ECDAT
              </span>
              <span className="text-[11px] font-medium text-slate-400">/</span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Post-Quantum Cryptographic Analysis
              </span>
            </div>
          </Link>
        </div>

        {/* Right Header Status & Navigation */}
        <div className="flex items-center gap-3 text-xs">
          {/* Quick Search Shortcut */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 text-xs w-60">
            <Search className="w-3.5 h-3.5" />
            <span className="flex-1 text-[11px]">Search assets, ciphers...</span>
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-white border border-slate-200 rounded text-slate-500">
              ⌘K
            </kbd>
          </div>

          {/* NTRO Evaluator Mode */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-medium text-[11px]">
            <span>Evaluator:</span>
            <strong className="text-slate-900 font-semibold">NTRO (PMO India)</strong>
          </div>

          {/* Engine Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600 text-[11px]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                backendOnline ? "bg-emerald-500" : "bg-indigo-500"
              }`}
            />
            <span className="font-medium">
              {backendOnline ? "API Live" : "Demo Engine"}
            </span>
          </div>

          {/* Public Portal Link */}
          <Link
            href="/"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors text-[11px] font-medium"
          >
            <span>Public Site</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          {/* User Profile Avatar */}
          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] ml-1">
            AG
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Navigation */}
        <aside className="w-60 bg-white border-r border-slate-200 p-3.5 flex flex-col justify-between hidden md:flex shrink-0">
          <div className="space-y-5">
            {NAV_GROUPS.map((group) => (
              <div key={group.group} className="space-y-1">
                <p className="text-[10px] font-semibold text-slate-400 px-2.5 uppercase tracking-wider mb-1.5">
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
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? "bg-slate-900 text-white shadow-xs font-semibold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? "text-white" : "text-slate-400"
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
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-[11px]">
            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span>Standard</span>
              <span className="text-slate-900 font-semibold">CycloneDX 1.6</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span>PQC Baseline</span>
              <span className="text-slate-900 font-semibold">NIST FIPS 203/204</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-5 md:p-7 bg-[#f8fafc]">
          <div className="max-w-6xl mx-auto space-y-5">{children}</div>
        </main>
      </div>
    </div>
  );
}
