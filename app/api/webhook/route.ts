import { NextRequest, NextResponse } from "next/server";
import { enqueueOrder } from "@/lib/queue";
import type { OrderParams } from "@/lib/generatePlan";

// Easycart sends a POST webhook on successful payment.
// Payload shape (simplified — adjust field names to match your Easycart product setup):
// {
//   event: "order.completed",
//   order: {
//     id: "...",
//     customer: { email: "...", name: "..." },
//     metadata: {          <-- custom fields you configure in Easycart product
//       city, days, budget, interests, styles, extras
//     }
//   }
// }

export async function POST(req: NextRequest) {
  try {
    // Optional: verify webhook secret header
    const secret = req.headers.get("x-easycart-secret");
    if (
      process.env.EASYCART_WEBHOOK_SECRET &&
      secret !== process.env.EASYCART_WEBHOOK_SECRET
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Only process completed orders
    if (body.event !== "order.completed") {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const order = body.order;
    const customer = order?.customer;
    const meta = order?.metadata || {};

    if (!customer?.email) {
      return NextResponse.json({ error: "No customer email" }, { status: 400 });
    }

    // Parse metadata sent from your Easycart product form
    // You configure these as custom fields in Easycart product settings
    const params: OrderParams = {
      email: customer.email,
      customerName: customer.name || "",
      city: meta.city || "",
      days: parseInt(meta.days, 10) || 2,
      budget: meta.budget || "2",
      interests: meta.interests ? meta.interests.split(",").map((s: string) => s.trim()) : [],
      styles: meta.styles ? meta.styles.split(",").map((s: string) => s.trim()) : [],
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
