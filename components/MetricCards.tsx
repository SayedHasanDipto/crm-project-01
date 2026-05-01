"use client";
import { useMemo } from "react";
import { differenceInDays } from "date-fns";

interface Lead {
  _id: string;
  name: string;
  email: string;
  company?: string;
  status: string;
  lastContactedAt: string;
}

interface Props { leads: Lead[]; }

function MetricCard({
  label, value, sub, accent
}: { label: string; value: number | string; sub?: string; accent: string }) {
  return (
    <div className={`relative bg-base-200 border border-white/[0.07] rounded-xl p-5 overflow-hidden`}>
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${accent}`} />
      <p className="font-mono text-[10px] uppercase tracking-widest text-base-content/40 mb-2">{label}</p>
      <p className={`text-3xl font-bold leading-none ${accent === "bg-error" ? "text-error" : accent === "bg-success" ? "text-success" : accent === "bg-warning" ? "text-warning" : "text-secondary"}`}>
        {value}
      </p>
      {sub && <p className="font-mono text-[11px] text-base-content/30 mt-1">{sub}</p>}
    </div>
  );
}

export function MetricCards({ leads }: Props) {
  const stats = useMemo(() => {
    const overdue = leads.filter(l => differenceInDays(new Date(), new Date(l.lastContactedAt)) >= 3);
    const recentWeek = leads.filter(l => differenceInDays(new Date(), new Date(l.lastContactedAt)) <= 7);
    const qualified = leads.filter(l => l.status === "qualified");
    return { total: leads.length, overdue: overdue.length, recentWeek: recentWeek.length, qualified: qualified.length };
  }, [leads]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
      <MetricCard label="Total leads" value={stats.total} sub="in pipeline" accent="bg-secondary" />
      <MetricCard label="Needs follow-up" value={stats.overdue} sub="3+ days silent" accent="bg-error" />
      <MetricCard label="Active this week" value={stats.recentWeek} sub="contacted ≤7d" accent="bg-success" />
      <MetricCard label="Qualified" value={stats.qualified} sub="ready to close" accent="bg-warning" />
    </div>
  );
}
