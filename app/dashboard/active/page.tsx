"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, RefreshCw, Package, Bell } from "lucide-react";
import { api } from "@/lib/api/client";
import { RiderLayout } from "@/components/rider-layout";
import {
  DeliveryCard,
  type StatusUpdate,
} from "@/components/delivery-card";
import {
  mapDeliveries,
  isActive,
  type Delivery,
} from "@/lib/map-delivery";

export default function ActiveDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const seenIds = useRef<Set<string> | null>(null);

  const fetchDeliveries = useCallback(async (announceNew = false) => {
    try {
      // No status query params — the enum is assigned|picked_up|in_transit|...
      // and the endpoint returns `{ data: [...] }`; filter active client-side.
      const payload = await api.get<any>("/deliveries?limit=100");
      const active = mapDeliveries(payload).filter(isActive);

      if (announceNew && seenIds.current) {
        const freshOnes = active.filter((d) => !seenIds.current!.has(d.id));
        if (freshOnes.length > 0) {
          const names = freshOnes
            .map((d) => d.orderNumber)
            .filter(Boolean)
            .join(", ");
          setToast(`New delivery assigned${names ? ` · ${names}` : ""}`);
          if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission === "granted") {
              new Notification("New delivery assigned", {
                body: `${freshOnes.length} job(s) waiting. Open to start.`,
              });
            }
          }
          setTimeout(() => setToast(null), 6000);
        }
      }
      seenIds.current = new Set(active.map((d) => d.id));
      setDeliveries(active);
    } catch {
      setDeliveries([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
    // Foreground fallback: poll every 30s and announce newly assigned jobs.
    const id = setInterval(() => fetchDeliveries(true), 30000);
    return () => clearInterval(id);
  }, [fetchDeliveries]);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchDeliveries();
  }

  async function handleSubmit(delivery: Delivery, update: StatusUpdate) {
    setBusyId(delivery.id);
    try {
      await api.patch(`/deliveries/${delivery.id}/status`, update);
      if (update.status === "delivered") {
        // Leave the active list; history picks it up after front-desk flow.
        setDeliveries((prev) => prev.filter((d) => d.id !== delivery.id));
        setToast("Delivery closed — awaiting front-desk confirmation");
        setTimeout(() => setToast(null), 5000);
      } else {
        setDeliveries((prev) =>
          prev.map((d) =>
            d.id === delivery.id ? { ...d, status: update.status } : d,
          ),
        );
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <RiderLayout title="Active Deliveries">
      <div className="px-4 py-5 space-y-4">
        {/* New-assignment toast */}
        {toast && (
          <div className="flex items-center gap-2 rounded-lg bg-navy-900 text-white text-sm px-4 py-3 shadow-lg animate-fade-in">
            <Bell className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="flex-1">{toast}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-navy-900">
              Active Deliveries
            </h1>
            <p className="text-sm text-slate-500">
              {deliveries.length} delivery{deliveries.length !== 1 ? "ies" : "y"}{" "}
              to handle
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

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : deliveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-base font-semibold text-navy-900 mb-1">
              No active deliveries
            </h3>
            <p className="text-sm text-slate-500 max-w-[240px]">
              You&apos;re all caught up. New deliveries will appear here when
              assigned.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {deliveries.map((delivery) => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                onSubmit={handleSubmit}
                busy={busyId === delivery.id}
                showActions
              />
            ))}
          </div>
        )}
      </div>
    </RiderLayout>
  );
}
