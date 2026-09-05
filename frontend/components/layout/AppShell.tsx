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
  BrainCircuit,
  FileSpreadsheet,
  Shield,
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
      { name: "AI Code Remediator", href: "/remediation", icon: BrainCircuit },
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
    <div className="bg-[#F5F0E8] text-[#1C1917] min-h-screen flex flex-col antialiased relative selection:bg-amber-500/20 selection:text-amber-900">
      {/* Background Living Warm Luxury Atmosphere */}
      <CyberBackground />

      {/* Top Header Bar: Clean, Warm Luxury Command Bar */}
      <header className="h-16 bg-[#F5F0E8]/90 backdrop-blur-md border-b border-[#E8E2D5] px-6 flex items-center justify-between z-30 sticky top-0">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#E8E2D5] flex items-center justify-center text-[#1C1917] shadow-2xs group-hover:border-[#D5CBB9] transition-all">
              <Shield className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-[#1C1917] tracking-tight">
                ECDAT
              </span>
              <span className="text-[10px] text-[#78716C] font-medium tracking-tight -mt-0.5">
                Post-Quantum Cryptographic Analysis
              </span>
            </div>
          </Link>
        </div>

        {/* Right Header Controls & Status */}
        <div className="flex items-center gap-2.5 text-xs">
          {/* Evaluator Pill */}
          <div className="hidden lg:flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E2D5] text-[#57534E] font-medium text-[11px] shadow-2xs">
            <span>Evaluator:</span>
            <strong className="text-[#1C1917] font-semibold">NTRO (PMO India)</strong>
            <span className="text-[10px] text-[#A8A29E] ml-0.5">▾</span>
          </div>

          {/* Engine Status Pill */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E2D5] text-[#1C1917] text-[11px] shadow-2xs">
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline ? "bg-emerald-600" : "bg-[#8B5E34]"
              }`}
            />
            <span className="font-semibold text-[#1C1917]">
              {backendOnline ? "API Live" : "Demo Engine"}
            </span>
          </div>

          {/* Public Portal Link */}
          <Link
            href="/"
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#E8E2D5] text-[#57534E] hover:text-[#1C1917] transition-all text-[11px] font-medium shadow-2xs"
          >
            <span>Public Site</span>
            <ExternalLink className="w-3 h-3 text-[#A8A29E]" />
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Left Sidebar Navigation: Warm Ivory Console */}
        <aside className="w-60 bg-[#F5F0E8] border-r border-[#E8E2D5] p-4 flex flex-col justify-between hidden md:flex shrink-0 z-20">
          <div className="space-y-6">
            {NAV_GROUPS.map((group) => (
              <div key={group.group} className="space-y-1">
                <p className="text-[10px] font-bold text-[#78716C] px-2.5 uppercase tracking-wider mb-2">
                  {group.group}
                </p>

                <nav className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        prefetch={true}
                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-all ${
                          isActive
                            ? "bg-white text-[#1C1917] border border-[#E8E2D5] font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.03)] rounded-2xl"
                            : "text-[#57534E] hover:bg-white/60 hover:text-[#1C1917] rounded-xl"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? "text-[#1C1917]" : "text-[#78716C]"
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

          {/* Sidebar Footer Info Card matching screenshot */}
          <div className="p-3 rounded-2xl bg-white border border-[#E8E2D5] space-y-2 text-[11px] shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[#57534E] font-medium">
                <span>CycloneDX 1.6</span>
              </div>
              <div className="text-[10px] text-[#78716C]">
                NIST PQC Baseline
              </div>
              <div className="font-bold text-[#1C1917] font-mono text-[10px] tracking-wide">
                NIST FIPS 203/204
              </div>
            </div>

            <div className="pt-2 border-t border-[#E8E2D5] text-[10px] text-[#A8A29E]">
              <p>© 2026 ECDAT</p>
              <p className="text-[9px] text-[#78716C] mt-0.5">Secure. Analyze. Remediate.</p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6 bg-transparent relative z-10">
          <div className="max-w-6xl mx-auto space-y-5">{children}</div>
        </main>
      </div>
    </div>
  );
}
