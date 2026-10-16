"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  Navigation,
  CheckCircle,
  Truck,
  PackageCheck,
  X,
  Loader2,
} from "lucide-react";
import { type Delivery, type RiderStatus } from "@/lib/map-delivery";

export type { Delivery } from "@/lib/map-delivery";

// What the page receives when the rider submits a status change. It maps 1:1 to
// the PATCH /deliveries/:id/status body.
export interface StatusUpdate {
  status: RiderStatus;
  paymentMethod?: "cash" | "pos" | "transfer";
  amountCollected?: string;
  paymentReference?: string;
  riderNote?: string;
}

interface DeliveryCardProps {
  delivery: Delivery;
  onSubmit?: (delivery: Delivery, update: StatusUpdate) => Promise<void>;
  showActions?: boolean;
  compact?: boolean;
  busy?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  assigned: "Assigned",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  delivered: "Delivered",
  failed: "Failed",
  returned: "Returned",
};

const STATUS_COLORS: Record<string, string> = {
  assigned: "bg-slate-100 text-slate-700",
  picked_up: "bg-blue-100 text-blue-700",
  in_transit: "bg-amber-100 text-amber-700",
  delivered: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  returned: "bg-purple-100 text-purple-700",
};

type PayMethod = "cash" | "pos" | "transfer";

export function DeliveryCard({
  delivery,
  onSubmit,
  showActions = true,
  compact = false,
  busy = false,
}: DeliveryCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [method, setMethod] = useState<PayMethod>("cash");
  const [amount, setAmount] = useState(String(delivery.totalAmount || ""));
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const mapsUrl =
    delivery.latitude && delivery.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${delivery.latitude},${delivery.longitude}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(delivery.deliveryAddress)}`;

  const total =
    delivery.totalAmount ||
    delivery.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const settledOnline = delivery.paymentStatus === "paid";

  async function quickAdvance(status: RiderStatus) {
    if (!onSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit(delivery, { status });
    } finally {
      setSubmitting(false);
    }
  }

  function openHandover() {
    setAmount(String(delivery.totalAmount || ""));
    setModalOpen(true);
  }

  async function submitDelivered() {
    if (!onSubmit) return;
    setSubmitting(true);
    try {
      // Online-paid orders close without collecting anything at the door.
      if (settledOnline) {
        await onSubmit(delivery, { status: "delivered" });
      } else {
        await onSubmit(delivery, {
          status: "delivered",
          paymentMethod: method,
          amountCollected: amount || String(delivery.totalAmount || 0),
          ...(reference.trim() ? { paymentReference: reference.trim() } : {}),
          ...(note.trim() ? { riderNote: note.trim() } : {}),
        });
      }
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  const inFlight = submitting || busy;
  const label = STATUS_LABELS[delivery.status] ?? delivery.status;
  const color = STATUS_COLORS[delivery.status] ?? "bg-slate-100 text-slate-700";

  return (
    <div className="card p-4 animate-fade-in">
      {/* Header: Status + Customer Name */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-navy-900 truncate">
            {delivery.customerName}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{delivery.orderNumber}</p>
          <p className="text-sm text-slate-500 mt-0.5 flex items-start gap-1">
            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
            <span className="line-clamp-2">{delivery.deliveryAddress}</span>
          </p>
        </div>
        <span
          className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${color}`}
        >
          {label}
        </span>
      </div>

      {/* Items */}
      {!compact && delivery.items.length > 0 && (
        <div className="mb-3 space-y-1">
          {delivery.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-slate-600">
                {item.name}{" "}
                <span className="text-slate-400">x{item.quantity}</span>
              </span>
              <span className="text-slate-700 font-medium">
                ₦{(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Fee */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div>
          <p className="text-xs text-slate-400">Order Total</p>
          <p className="text-sm font-semibold text-navy-900">
            ₦{total.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Delivery Fee</p>
          <p className="text-sm font-semibold text-amber-600">
            ₦{delivery.deliveryFee.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Delivered but front desk hasn't confirmed the door payment */}
      {delivery.status === "delivered" && !settledOnline && (
        <p className="mt-3 text-xs font-medium text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          Awaiting front-desk payment confirmation
        </p>
      )}

      {/* Action Buttons */}
      {showActions && delivery.status !== "delivered" && delivery.status !== "failed" && delivery.status !== "returned" && (
        <div className="flex flex-wrap gap-2 mt-3">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 h-11 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            <Navigation className="w-4 h-4" />
            Navigate
          </a>
          <a
            href={`tel:${delivery.customerPhone}`}
            className="flex items-center justify-center gap-1.5 h-11 px-4 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 active:bg-slate-300 transition-colors"
          >
            <Phone className="w-4 h-4" />
            Call
          </a>

          {onSubmit && delivery.status === "assigned" && (
            <button
              disabled={inFlight}
              onClick={() => quickAdvance("picked_up")}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 h-11 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-900 active:bg-black transition-colors disabled:opacity-60"
            >
              {inFlight ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PackageCheck className="w-4 h-4" />
              )}
              Picked Up
            </button>
          )}

          {onSubmit && delivery.status === "picked_up" && (
            <button
              disabled={inFlight}
              onClick={() => quickAdvance("in_transit")}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 h-11 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 active:bg-amber-800 transition-colors disabled:opacity-60"
            >
              {inFlight ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Truck className="w-4 h-4" />
              )}
              In Transit
            </button>
          )}

          {onSubmit && delivery.status === "in_transit" && (
            <button
              disabled={inFlight}
              onClick={settledOnline ? () => quickAdvance("delivered") : openHandover}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 h-11 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 active:bg-emerald-800 transition-colors disabled:opacity-60"
            >
              {inFlight ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Delivered
            </button>
          )}
        </div>
      )}

      {/* Handover / payment verification modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-navy-900">
                Confirm handover
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-navy-900"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              How did{" "}
              <span className="font-medium text-navy-900">
                {delivery.customerName}
              </span>{" "}
              pay? Amount due ₦{total.toLocaleString()}.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {(["cash", "pos", "transfer"] as PayMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`h-11 rounded-lg text-sm font-medium capitalize transition-colors ${
                    method === m
                      ? "bg-navy-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {m === "pos" ? "POS" : m}
                </button>
              ))}
            </div>

            <label className="block text-xs font-medium text-slate-500 mb-1">
              Amount collected (₦)
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-11 rounded-lg border border-slate-200 px-3 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-amber-500 mb-3"
            />

            {method === "transfer" && (
              <>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Transfer reference (optional)
                </label>
                <input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. bank transfer ID"
                  className="w-full h-11 rounded-lg border border-slate-200 px-3 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-amber-500 mb-3"
                />
              </>
            )}

            <label className="block text-xs font-medium text-slate-500 mb-1">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Handed to customer at gate…"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4"
            />

            <button
              disabled={inFlight}
              onClick={submitDelivered}
              className="w-full h-12 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 active:bg-emerald-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {inFlight ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              Mark delivered
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
