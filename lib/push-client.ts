"use client";

import { api } from "./api/client";

// Registers the service worker and subscribes the device to web push so the
// rider gets an instant alert the moment a job is assigned — even when the app
// is backgrounded. Safe to call on every layout mount; it degrades silently if
// the platform lacks support or the user denies notification permission.
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const str = base64String.replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(str);
  const buffer = new ArrayBuffer(raw.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) {
    bytes[i] = raw.charCodeAt(i);
  }
  return bytes;
}

export async function enablePush(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return false;

    const { key } = await api.get<{ key: string }>("/push/vapid-public-key");
    if (!key) return false;

    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      }));

    await api.post("/push/subscribe", subscription.toJSON());
    return true;
  } catch {
    // Push is an enhancement — never block the rider on a failure here.
    return false;
  }
}

export async function disablePush(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    const sub = await registration?.pushManager.getSubscription();
    if (sub) {
      await api.post("/push/unsubscribe", { endpoint: sub.endpoint });
      await sub.unsubscribe();
    }
  } catch {
    /* best-effort cleanup */
  }
}
