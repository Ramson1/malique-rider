"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  CheckCircle,
  Clock,
  Wallet,
  Loader2,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api/client";
import { RiderLayout } from "@/components/rider-layout";
import { StatBar } from "@/components/stat-bar";

interface DashboardStats {
  todayDeliveries: number;
  completedToday: number;
  pendingToday: number;
  todayEarnings: number;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.get<DashboardStats>("/deliveries/stats/today");
      setStats(data);
    } catch {
      // Set defaults if API fails
      setStats({
        todayDeliveries: 0,
        completedToday: 0,
        pendingToday: 0,
        todayEarnings: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchStats();
    }
  }, [authLoading, fetchStats]);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchStats();
  }

  if (authLoading || loading) {
    return (
      <RiderLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      </RiderLayout>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <RiderLayout>
      <div className="px-4 py-5 space-y-6">
        {/* Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-navy-900">
              {greeting()},
            </h1>
            <p className="text-sm text-slate-500">
              {user?.fullName || "Rider"}
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

        {/* Today's Stats */}
        <StatBar
          stats={[
            {
              label: "Assigned",
              value: stats?.todayDeliveries ?? 0,
              icon: Package,
              color: "bg-blue-100",
            },
            {
              label: "Completed",
              value: stats?.completedToday ?? 0,
              icon: CheckCircle,
              color: "bg-emerald-100",
            },
            {
              label: "Pending",
              value: stats?.pendingToday ?? 0,
              icon: Clock,
              color: "bg-amber-100",
            },
          ]}
        />

        {/* Today's Earnings Card */}
        <div className="card p-5 gradient-navy border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Today&apos;s Earnings</p>
              <p className="text-3xl font-bold text-white mt-1">
                ₦{(stats?.todayEarnings ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-600/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Quick Actions
          </h2>

          <button
            onClick={() => router.push("/dashboard/active")}
            className="w-full card p-4 flex items-center gap-4 active:bg-slate-50 transition-colors"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-navy-900">
                Active Deliveries
              </p>
              <p className="text-xs text-slate-500">
                View and manage pending deliveries
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300" />
          </button>

          <button
            onClick={() => router.push("/dashboard/earnings")}
            className="w-full card p-4 flex items-center gap-4 active:bg-slate-50 transition-colors"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-navy-900">
                View Earnings
              </p>
              <p className="text-xs text-slate-500">
                Track your daily and weekly income
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300" />
          </button>

          <button
            onClick={() => router.push("/dashboard/history")}
            className="w-full card p-4 flex items-center gap-4 active:bg-slate-50 transition-colors"
          >
            <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-navy-900">
                Delivery History
              </p>
              <p className="text-xs text-slate-500">
                Browse past completed deliveries
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300" />
          </button>
        </div>
      </div>
    </RiderLayout>
  );
}
