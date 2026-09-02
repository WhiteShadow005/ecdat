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
      className={`rounded-2xl p-4 transition-all duration-200 cursor-pointer border ${
        selected
          ? "bg-purple-500/10 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.18)]"
          : "bg-[#0A0A0D] border-white/[0.08] hover:border-white/20 hover:bg-[#121217]"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-mono font-bold text-white text-base">
              {asset.algorithm}
            </h4>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#18181E] text-[#A6A6AD] border border-white/10 uppercase">
              {asset.type}
            </span>
          </div>
          <p className="text-xs font-mono text-[#71717A] flex items-center gap-1 mt-1 truncate max-w-md">
            <FileCode className="w-3.5 h-3.5 text-[#52525B] shrink-0" />
            <span className="text-[#A6A6AD]">{asset.file}</span>
            {asset.line > 0 && <span className="text-[#52525B]">:L{asset.line}</span>}
          </p>
        </div>
        <StatusBadge status={asset.quantum_status} size="sm" />
      </div>

      {/* QARS Risk Score bar */}
      <div className="my-3 bg-[#0D0D11] p-2.5 rounded-xl border border-white/[0.06]">
        <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
          <span className="text-[#71717A] flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-[#71717A]" />
            QARS Risk Score:
          </span>
          <span className={`font-bold ${getQarsColor(asset.qars_score).split(" ")[1]}`}>
            {asset.qars_score}/100
          </span>
        </div>
        <div className="w-full bg-[#18181E] rounded-full h-1.5 overflow-hidden">
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
        <div className="text-[#A6A6AD] flex items-center justify-between">
          <span className="text-[#71717A]">NIST PQC Fix:</span>
          <span className="text-emerald-400 font-semibold text-right truncate ml-2">
            {asset.replacement}
          </span>
        </div>
        <div className="text-[#71717A] flex items-center justify-between text-[11px]">
          <span className="text-[#52525B]">Threat:</span>
          <span className="text-rose-400 text-right truncate ml-2">
            {asset.attack_vector}
          </span>
        </div>
      </div>

      {/* Remediation Action Link */}
      <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
        <span className="text-[11px] font-mono text-purple-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-400" />
          AI Fix Ready
        </span>
        <Link
          href={`/remediation?asset_id=${asset.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-[#F5F5F5] hover:text-purple-300 font-mono font-medium flex items-center gap-1 hover:underline"
        >
          View Diff <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
