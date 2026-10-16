"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Bike,
  LogOut,
  ChevronRight,
  Shield,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { RiderLayout } from "@/components/rider-layout";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <RiderLayout title="Profile">
      <div className="px-4 py-5 space-y-5">
        {/* Profile Card */}
        <div className="card p-5 text-center">
          <div className="w-20 h-20 rounded-full gradient-navy flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl font-bold text-white">
              {user?.fullName
                ? user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "R"}
            </span>
          </div>
          <h1 className="text-lg font-bold text-navy-900">
            {user?.fullName || "Rider"}
          </h1>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium capitalize">
            {user?.role || "rider"}
          </span>
        </div>

        {/* Info Sections */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide px-1">
            Personal Info
          </h2>
          <div className="card divide-y divide-slate-100">
            <div className="flex items-center gap-3 p-4">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400">Full Name</p>
                <p className="text-sm font-medium text-navy-900 truncate">
                  {user?.fullName || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Phone className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400">Phone</p>
                <p className="text-sm font-medium text-navy-900 truncate">
                  {user?.phone || "—"}
                </p>
              </div>
              {user?.phone && (
                <a
                  href={`tel:${user.phone}`}
                  className="touch-target text-slate-300"
                >
                  <ChevronRight className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide px-1">
            Vehicle Info
          </h2>
          <div className="card divide-y divide-slate-100">
            <div className="flex items-center gap-3 p-4">
              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                <Bike className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400">Vehicle Type</p>
                <p className="text-sm font-medium text-navy-900 truncate">
                  {user?.vehicleType || "Motorcycle"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4">
              <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                <Shield className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400">Plate Number</p>
                <p className="text-sm font-medium text-navy-900 truncate">
                  {user?.vehiclePlate || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full card p-4 flex items-center gap-3 active:bg-red-50 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
              {loggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin text-red-600" />
              ) : (
                <LogOut className="w-4 h-4 text-red-600" />
              )}
            </div>
            <span className="text-sm font-medium text-red-600 group-active:text-red-700">
              {loggingOut ? "Signing out..." : "Sign Out"}
            </span>
          </button>
        </div>
      </div>
    </RiderLayout>
  );
}
