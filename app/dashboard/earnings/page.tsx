"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  Wallet,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { RiderLayout } from "@/components/rider-layout";
import { SkeletonStats, SkeletonDeliveryList } from "@/components/skeleton";

interface EarningsSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
}

interface EarningsEntry {
  id: string;
  deliveryId: string;
  customerName: string;
  deliveryFee: number;
  deliveredAt: string;
}

export default function EarningsPage() {
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [entries, setEntries] = useState<EarningsEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEarnings = useCallback(async () => {
    try {
      const data = await api.get<{
        summary: EarningsSummary;
        entries: EarningsEntry[];
      }>("/deliveries/earnings");
      setSummary(data.summary);
      setEntries(data.entries);
    } catch {
      setSummary({ today: 0, thisWeek: 0, thisMonth: 0 });
      setEntries([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchEarnings();
  }

  if (loading) {
    return (
      <RiderLayout title="Earnings">
        <div className="px-4 py-5 space-y-6">
          <SkeletonStats />
          <SkeletonDeliveryList count={3} />
        </div>
      </RiderLayout>
    );
  }

  return (
    <RiderLayout title="Earnings">
      <div className="px-4 py-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-navy-900">Earnings</h1>
            <p className="text-sm text-slate-500">Track your income</p>
          </div>
          <button
            onClick={handleRefresh}
            className="touch-target text-slate-400 hover:text-navy-900 transition-colors"
            aria-label="Refresh"
          >
            <RefreshCw
              className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="space-y-3">
          {/* Today */}
          <div className="card p-4 gradient-navy border-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Today</p>
                <p className="text-2xl font-bold text-white">
                  ₦{(summary?.today ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Week + Month */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-xs text-slate-500 font-medium">This Week</p>
              </div>
              <p className="text-xl font-bold text-navy-900">
                ₦{(summary?.thisWeek ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  This Month
                </p>
              </div>
              <p className="text-xl font-bold text-navy-900">
                ₦{(summary?.thisMonth ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Earnings List */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Recent Earnings
          </h2>

          {entries.length === 0 ? (
            <div className="card p-6 text-center">
              <Wallet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                No earnings recorded yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="card p-3 flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy-900 truncate">
                      {entry.customerName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(entry.deliveredAt).toLocaleDateString(
                        "en-NG",
                        {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-emerald-600 shrink-0 ml-3">
                    +₦{entry.deliveryFee.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RiderLayout>
  );
}
