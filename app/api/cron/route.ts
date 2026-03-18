import { NextRequest, NextResponse } from "next/server";
import {
  getPendingOrders,
  markOrderProcessing,
  markOrderDone,
  markOrderError,
} from "@/lib/queue";
import { generateTravelPlan } from "@/lib/generatePlan";
import { generatePDF } from "@/lib/generatePDF";
import { sendPlanEmail } from "@/lib/sendEmail";

// Vercel calls this every 30 minutes (configured in vercel.json)
// Protected by CRON_SECRET header which Vercel sets automatically

export async function GET(req: NextRequest) {
  // Verify it's coming from Vercel Cron
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pending = await getPendingOrders();
  console.log(`[cron] Found ${pending.length} orders ready to process`);

  const results = [];

  for (const order of pending) {
    try {
      await markOrderProcessing(order.id);
      console.log(`[cron] Processing ${order.id} for ${order.params.email}`);

      // 1. Generate plan via Claude
      const plan = await generateTravelPlan(order.params);

      // 2. Generate PDF
      const pdfBuffer = await generatePDF(plan);

      // 3. Send email with PDF attachment
      await sendPlanEmail({
        to: order.params.email,
        customerName: order.params.customerName,
        city: plan.city,
        days: order.params.days,
        pdfBuffer,
      });

      await markOrderDone(order.id);
      console.log(`[cron] Done: ${order.id}`);
      results.push({ id: order.id, status: "done" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[cron] Error on ${order.id}:`, msg);
      await markOrderError(order.id, msg);
      results.push({ id: order.id, status: "error", error: msg });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
