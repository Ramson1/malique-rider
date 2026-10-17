"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  RefreshCw,
  History,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { RiderLayout } from "@/components/rider-layout";
import { DeliveryCard } from "@/components/delivery-card";
import { SkeletonDeliveryList } from "@/components/skeleton";
import { mapDeliveries, type Delivery } from "@/lib/map-delivery";

function HistoryInner() {
  const searchParams = useSearchParams();
  const initialDate = searchParams.get("date") || "";

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState(initialDate);
  const [totalEarnings, setTotalEarnings] = useState(0);

  const fetchHistory = useCallback(async () => {
    try {
      const payload = await api.get<any>("/deliveries?limit=200");
      let rows = mapDeliveries(payload).filter(
        (d) => d.status === "delivered",
      );
      if (dateFilter) {
        rows = rows.filter(
          (d) =>
            (d.deliveredAt || d.createdAt || "").slice(0, 10) === dateFilter,
        );
      }
      setDeliveries(rows);
      setTotalEarnings(
        rows.reduce((sum, d) => sum + (d.deliveryFee || 0), 0),
      );
    } catch {
      setDeliveries([]);
      setTotalEarnings(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchHistory();
  }

  return (
    <RiderLayout title="Delivery History">
      <div className="px-4 py-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-navy-900">
              Delivery History
            </h1>
            <p className="text-sm text-slate-500">
              {deliveries.length} completed delivery
              {deliveries.length !== 1 ? "ies" : "y"}
            </p>
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

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="flex-1 h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="h-10 px-3 rounded-lg bg-slate-100 text-sm text-slate-600 font-medium hover:bg-slate-200 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Earnings Summary */}
        {!loading && deliveries.length > 0 && (
          <div className="card p-4 bg-emerald-50 border-emerald-200">
            <p className="text-xs text-emerald-600 font-medium">
              Earnings {dateFilter ? `for ${dateFilter}` : "total"}
            </p>
            <p className="text-2xl font-bold text-emerald-700 mt-0.5">
              ₦{totalEarnings.toLocaleString()}
            </p>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <SkeletonDeliveryList count={4} />
        ) : deliveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <History className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-base font-semibold text-navy-900 mb-1">
              No deliveries found
            </h3>
            <p className="text-sm text-slate-500 max-w-[240px]">
              {dateFilter
                ? "No completed deliveries on this date."
                : "Your completed deliveries will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {deliveries.map((delivery) => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                showActions={false}
                compact
              />
            ))}
          </div>
        )}
      </div>
    </RiderLayout>
  );
}

export default function HistoryPage() {
  return (
    <Suspense
      fallback={
        <RiderLayout title="Delivery History">
          <div className="px-4 py-5">
            <SkeletonDeliveryList count={4} />
          </div>
        </RiderLayout>
      }
    >
      <HistoryInner />
    </Suspense>
  );
}
