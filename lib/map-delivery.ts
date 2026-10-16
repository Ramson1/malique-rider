// Shared mapper for the rider app. The deliveries API returns a paginated
// `{ data: [...] }` envelope of NESTED rows (delivery.order.items[].product,
// delivery.order.customer), while the rider UI wants a flat list. This turns a
// raw response into `Delivery[]` and keeps the DB status enum intact so the
// one-tap flow can advance it precisely.

export type RiderStatus =
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "failed"
  | "returned";

export interface DeliveryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Delivery {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  latitude?: number;
  longitude?: number;
  items: DeliveryItem[];
  deliveryFee: number;
  totalAmount: number;
  status: RiderStatus;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt: string;
  deliveredAt?: string | null;
}

// Statuses that still need the rider's attention.
export const ACTIVE_STATUSES: RiderStatus[] = [
  "assigned",
  "picked_up",
  "in_transit",
];

const TERMINAL_STATUSES: RiderStatus[] = ["delivered", "failed", "returned"];

function label(productName: unknown, sizeKg: unknown): string {
  const name = (productName as string) || "Item";
  const kg = Number(sizeKg);
  return kg > 0 ? `${name} ${kg}kg` : name;
}

export function mapDelivery(raw: any): Delivery {
  const order = raw?.order ?? {};
  const customer = order?.customer ?? {};
  const items: DeliveryItem[] = (order?.items ?? []).map((i: any) => ({
    id: i.id,
    name: label(i.product?.name, i.sizeKg),
    quantity: Number(i.quantity) || 0,
    price: Number(i.unitPrice) || 0,
  }));

  const lat = Number(raw?.deliveryLat);
  const lng = Number(raw?.deliveryLng);

  return {
    id: raw.id,
    orderId: raw.orderId ?? order?.id ?? "",
    orderNumber: order?.orderNumber ?? "—",
    customerName: customer?.fullName ?? "—",
    customerPhone: customer?.phone ?? "",
    deliveryAddress: raw?.deliveryAddress ?? customer?.address ?? "",
    latitude: Number.isFinite(lat) && lat !== 0 ? lat : undefined,
    longitude: Number.isFinite(lng) && lng !== 0 ? lng : undefined,
    items,
    deliveryFee: Number(raw?.deliveryFee) || 0,
    totalAmount: Number(order?.totalAmount) || 0,
    status: raw?.status as RiderStatus,
    paymentMethod: order?.paymentMethod,
    paymentStatus: order?.paymentStatus,
    createdAt: raw?.createdAt ? new Date(raw.createdAt).toISOString() : "",
    deliveredAt: raw?.deliveredAt ? new Date(raw.deliveredAt).toISOString() : null,
  };
}

// Accepts either the paginated `{ data: [...] }` envelope or a bare array.
export function mapDeliveries(payload: any): Delivery[] {
  const rows = Array.isArray(payload) ? payload : payload?.data ?? [];
  return rows.map(mapDelivery);
}

export function isActive(d: Delivery): boolean {
  return ACTIVE_STATUSES.includes(d.status);
}

export function isTerminal(d: Delivery): boolean {
  return TERMINAL_STATUSES.includes(d.status);
}
