"use client";

import React, { useState } from "react";
import { FileCode, Search, Sparkles, FileSpreadsheet, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function PipelineFlowDiagram() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      step: 1,
      title: "1. Multi-Engine Ingestion",
      icon: FileCode,
      tag: "AST & Certs",
      summary: "Python AST, Java Bytecode, OpenSSL Certs & Nginx/SSH Configs",
      output: "Raw Cryptographic Primitives Stream",
    },
    {
      step: 2,
      title: "2. QARS & Mosca Risk",
      icon: Search,
      tag: "Quantum Classifier",
      summary: "Shor's / Grover's vulnerability classification and 0-100 scoring",
      output: "15 Cryptographic Assets Normalized",
    },
    {
      step: 3,
      title: "3. Gemini AI Remediator",
      icon: Sparkles,
      tag: "USP 1 & 2",
      summary: "Semantic cipher detection + NIST FIPS 203/204 Git diff generation",
      output: "Quantum-Safe Lattice Patches",
    },
    {
      step: 4,
      title: "4. CycloneDX 1.6 CBOM",
      icon: FileSpreadsheet,
      tag: "ECMA-424 Export",
      summary: "Standardized CBOM JSON, WeasyPrint Executive PDF & CSV reports",
      output: "Audit-Ready Compliance Package",
    },
  ];

  return (
    <div className="retro-card w-full space-y-5 p-5 md:p-6 border border-cyan-500/30 shadow-cyber-cyan">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Automated 4-Stage Discovery Pipeline
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              End-to-End Cryptographic Transformation Flow
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40">
          Live Flow
        </span>
      </div>

      {/* Step Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = activeStep === s.step;
          return (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                isActive
                  ? "bg-white text-black border-white shadow-lg"
                  : "bg-black/40 text-slate-400 border-white/10 hover:border-white/30"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-black" : "text-cyan-400"}`} />
                <span className="text-[9px] font-bold uppercase">{s.tag}</span>
              </div>
              <div className="text-[11px] font-bold truncate">{s.title}</div>
            </button>
          );
        })}
      </div>

      {/* Selected Step Detail Panel */}
      <div className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-cyan-400 font-bold">Stage {activeStep} Specification:</span>
          <span className="text-[10px] text-slate-400">Step {activeStep} of 4</span>
        </div>
        <p className="text-xs text-white/90 leading-relaxed">
          {steps[activeStep - 1].summary}
        </p>

        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/10">
          <span className="text-slate-400">Artifact Emitted:</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {steps[activeStep - 1].output}
          </span>
        </div>
      </div>

      {/* Action */}
      <div className="flex justify-between items-center pt-1 font-mono text-xs">
        <span className="text-[11px] text-slate-400">Ready for automated scanning?</span>
        <Link
          href="/scan"
          className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold text-xs"
        >
          <span>Run Repository Scan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
