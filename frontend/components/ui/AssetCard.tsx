import React from "react";
import { CryptoAsset } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { FileCode, ShieldAlert, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface AssetCardProps {
  asset: CryptoAsset;
  onSelect?: (asset: CryptoAsset) => void;
  selected?: boolean;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  onSelect,
  selected = false,
}) => {
  const getQarsColor = (score: number) => {
    if (score >= 80) return "bg-red-500 text-red-400";
    if (score >= 50) return "bg-yellow-500 text-yellow-400";
    return "bg-emerald-500 text-emerald-400";
  };

  return (
    <div
      onClick={() => onSelect && onSelect(asset)}
      className={`rounded-xl p-4 transition-all duration-200 cursor-pointer border ${
        selected
          ? "bg-navy-800 border-cyan-500 shadow-cyber-cyan"
          : "bg-navy-850/80 border-navy-700 hover:border-slate-600 hover:bg-navy-800"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-mono font-bold text-slate-100 text-base">
              {asset.algorithm}
            </h4>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase">
              {asset.type}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400 flex items-center gap-1 mt-1 truncate max-w-md">
            <FileCode className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="text-cyan-400">{asset.file}</span>
            {asset.line > 0 && <span className="text-slate-500">:L{asset.line}</span>}
          </p>
        </div>
        <StatusBadge status={asset.quantum_status} size="sm" />
      </div>

      {/* QARS Risk Score bar */}
      <div className="my-3 bg-navy-950/70 p-2.5 rounded-lg border border-navy-700">
        <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
          <span className="text-slate-400 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            QARS Risk Score:
          </span>
          <span className={`font-bold ${getQarsColor(asset.qars_score).split(" ")[1]}`}>
            {asset.qars_score}/100
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              getQarsColor(asset.qars_score).split(" ")[0]
            }`}
            style={{ width: `${asset.qars_score}%` }}
          />
        </div>
      </div>

      {/* Replacement info & Attack vector */}
      <div className="text-xs space-y-1.5 pt-1 font-mono">
        <div className="text-slate-300 flex items-center justify-between">
          <span className="text-slate-500">NIST PQC Fix:</span>
          <span className="text-emerald-400 font-semibold text-right truncate ml-2">
            {asset.replacement}
          </span>
        </div>
        <div className="text-slate-400 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">Threat:</span>
          <span className="text-red-400 text-right truncate ml-2">
            {asset.attack_vector}
          </span>
        </div>
      </div>

      {/* Remediation Action Link */}
      <div className="mt-3 pt-2.5 border-t border-navy-700/60 flex items-center justify-between">
        <span className="text-[11px] font-mono text-purple-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-400" />
          AI Fix Ready
        </span>
        <Link
          href={`/remediation?asset_id=${asset.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-mono font-medium flex items-center gap-1 hover:underline"
        >
          View Diff <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
