"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, useDisclosure } from "@heroui/react";
import { signOut, useSession } from "@/lib/auth-client";
import { MetricCards } from "@/components/MetricCards";
import { LeadTable } from "@/components/LeadTable";
import { AddLeadModal } from "@/components/AddLeadModal";
import toast from "react-hot-toast";

interface Lead {
  _id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  status: "new" | "contacted" | "qualified" | "lost";
  lastContactedAt: string;
  notes?: string;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-base-300 rounded-lg ${className}`} />;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/leads");
      if (res.status === 401) { router.push("/login"); return; }
      const data = await res.json();
      setLeads(data);
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!isPending && !session) { router.push("/login"); return; }
    if (session) fetchLeads();
  }, [session, isPending, fetchLeads, router]);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  const overdueCount = leads.filter(l => {
    const diff = Math.floor((Date.now() - new Date(l.lastContactedAt).getTime()) / 86400000);
    return diff >= 3;
  }).length;

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-base-100/90 backdrop-blur border-b border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center font-bold text-base-100 text-sm">P</div>
            <span className="font-semibold tracking-tight text-sm">Pipeline</span>
            <div className="hidden sm:flex items-center gap-1.5 ml-4 bg-base-200 border border-white/[0.07] rounded-full px-3 py-1">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-base-content/30">
                <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
              </svg>
              <span className="font-mono text-[11px] text-base-content/40">
                {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {overdueCount > 0 && (
              <div className="badge badge-error badge-sm font-mono text-[10px] gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {overdueCount} overdue
              </div>
            )}
            <span className="text-sm text-base-content/40 font-mono hidden md:block">
              {session?.user?.name ?? session?.user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="btn btn-ghost btn-xs font-mono text-base-content/30 hover:text-base-content"
            >
              sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Page header */}
        <div className="flex items-end justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Lead tracker</h1>
            <p className="font-mono text-xs text-base-content/30 mt-1">
              {loading ? "Loading..." : `${leads.length} leads in pipeline`}
            </p>
          </div>
          <Button
            color="primary"
            onPress={onOpen}
            className="font-semibold"
            startContent={
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            }
          >
            Add lead
          </Button>
        </div>

        {/* Metrics */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : (
          <MetricCards leads={leads} />
        )}

        {/* Overdue alert */}
        {!loading && overdueCount > 0 && (
          <div className="alert bg-error/10 border border-error/20 rounded-xl mb-5 py-3 px-4">
            <div className="flex items-center gap-2.5">
              <div className="pulse-dot flex-shrink-0" />
              <p className="font-mono text-xs text-error">
                <span className="font-semibold">{overdueCount} lead{overdueCount > 1 ? "s" : ""}</span>
                {" "}haven't been contacted in 3+ days — highlighted below
              </p>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : (
          <LeadTable leads={leads} onRefresh={fetchLeads} />
        )}
      </main>

      <AddLeadModal isOpen={isOpen} onClose={onClose} onCreated={fetchLeads} />
    </div>
  );
}
