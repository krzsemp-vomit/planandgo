import { NextRequest, NextResponse } from "next/server";
import { enqueueOrder } from "@/lib/queue";
import type { OrderParams } from "@/lib/generatePlan";

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-easycart-secret");
    if (process.env.EASYCART_WEBHOOK_SECRET && secret !== process.env.EASYCART_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (body.event !== "order.completed") {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const order = body.order;
    const customer = order?.customer;
    const meta = order?.metadata || {};

    if (!customer?.email) {
      return NextResponse.json({ error: "No customer email" }, { status: 400 });
    }

    const params: OrderParams = {
      email: customer.email,
      customerName: customer.name || "",
      city: meta.city || "",
      days: parseInt(meta.days, 10) || 2,
      budget: meta.budget || "2",
      interests: meta.interests ? meta.interests.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      styles: meta.styles ? meta.styles.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      dietary: meta.dietary || "wszystkożerca",
      cuisines: meta.cuisines ? meta.cuisines.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      extras: meta.extras || "",
    };

    if (!params.city) {
      return NextResponse.json({ error: "No city in metadata" }, { status: 400 });
    }

    const orderId = await enqueueOrder(params);
    console.log(`[webhook] Enqueued order ${orderId} for ${params.email} → ${params.city}`);
    return NextResponse.json({ ok: true, orderId });
  } catch (err) {
    console.error("[webhook] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
