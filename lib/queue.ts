import { kv } from "@vercel/kv";
import type { OrderParams } from "./generatePlan";

export interface QueuedOrder {
  id: string;
  params: OrderParams;
  createdAt: number;      // unix ms
  sendAfter: number;      // unix ms — createdAt + 4h
  status: "pending" | "processing" | "done" | "error";
  errorMsg?: string;
}

const DELAY_MS = 4 * 60 * 60 * 1000; // 4 hours
const QUEUE_KEY = "orders:pending";

export async function enqueueOrder(params: OrderParams): Promise<string> {
  const id = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = Date.now();

  const order: QueuedOrder = {
    id,
    params,
    createdAt: now,
    sendAfter: now + DELAY_MS,
    status: "pending",
  };

  // Store the order details
  await kv.set(`order:${id}`, order, { ex: 60 * 60 * 48 }); // expire after 48h

  // Add to pending set (sorted by sendAfter)
  await kv.zadd(QUEUE_KEY, { score: order.sendAfter, member: id });

  return id;
}

export async function getPendingOrders(): Promise<QueuedOrder[]> {
  const now = Date.now();

  // Get all orders whose sendAfter <= now
  const ids = await kv.zrangebyscore(QUEUE_KEY, 0, now);
  if (!ids || ids.length === 0) return [];

  const orders: QueuedOrder[] = [];
  for (const id of ids) {
    const order = await kv.get<QueuedOrder>(`order:${id}`);
    if (order && order.status === "pending") {
      orders.push(order);
    }
  }
  return orders;
}

export async function markOrderProcessing(id: string) {
  const order = await kv.get<QueuedOrder>(`order:${id}`);
  if (!order) return;
  await kv.set(`order:${id}`, { ...order, status: "processing" }, { ex: 60 * 60 * 48 });
}

export async function markOrderDone(id: string) {
  const order = await kv.get<QueuedOrder>(`order:${id}`);
  if (!order) return;
  await kv.set(`order:${id}`, { ...order, status: "done" }, { ex: 60 * 60 * 48 });
  // Remove from pending queue
  await kv.zrem(QUEUE_KEY, id);
}

export async function markOrderError(id: string, errorMsg: string) {
  const order = await kv.get<QueuedOrder>(`order:${id}`);
  if (!order) return;
  await kv.set(
    `order:${id}`,
    { ...order, status: "error", errorMsg },
    { ex: 60 * 60 * 48 }
  );
  await kv.zrem(QUEUE_KEY, id);
}
