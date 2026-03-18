import { NextRequest, NextResponse } from "next/server";
import { generateTravelPlan } from "@/lib/generatePlan";
import { generatePDF } from "@/lib/generatePDF";
import { sendPlanEmail } from "@/lib/sendEmail";
import type { OrderParams } from "@/lib/generatePlan";

// POST /api/generate
// Use this to manually trigger generation (e.g. for testing or admin panel)
// Body: OrderParams
// Protected by a simple admin secret

export async function POST(req: NextRequest) {
  const adminSecret = req.headers.get("x-admin-secret");
  if (adminSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params: OrderParams = await req.json();

    if (!params.city || !params.email) {
      return NextResponse.json(
        { error: "city and email are required" },
        { status: 400 }
      );
    }

    const plan = await generateTravelPlan(params);
    const pdfBuffer = await generatePDF(plan);
    await sendPlanEmail({
      to: params.email,
      customerName: params.customerName,
      city: plan.city,
      days: params.days,
      pdfBuffer,
    });

    return NextResponse.json({ ok: true, city: plan.city });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[generate] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
