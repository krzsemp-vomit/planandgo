import type { TravelPlan } from "./generatePlan";

// jsPDF works in Node via canvas — we generate base64 PDF
// and return it as Buffer for email attachment

export async function generatePDF(plan: TravelPlan): Promise<Buffer> {
  // Dynamic import so it only loads server-side
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
  const margin = 16;
  let y = 0;

  function addPage() {
    doc.addPage();
    y = margin;
  }

  function checkY(needed: number) {
    if (y + needed > H - margin) addPage();
  }

  // ——— COVER ———
  doc.setFillColor(26, 23, 16);
  doc.rect(0, 0, W, H, "F");

  doc.setFillColor(201, 168, 76);
  doc.rect(0, 0, 6, H, "F");

  // Logo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(201, 168, 76);
  doc.text("PLAN&GO", 18, 24);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 96, 90);
  doc.text("planandgo.pl", 18, 31);

  // City
  doc.setFontSize(52);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(250, 247, 242);
  const cityText = plan.city.toUpperCase();
  doc.text(cityText, 18, 100);

  // Tagline
  doc.setFontSize(14);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(138, 132, 121);
  doc.text(plan.tagline, 18, 114);

  // Gold divider
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.5);
  doc.line(18, 122, 130, 122);

  // Stats
  const totalAtt = plan.days.reduce((s, d) => s + d.attractions.length, 0);
  const stats = [
    `${plan.days.length} ${plan.days.length === 1 ? "dzień" : plan.days.length < 5 ? "dni" : "dni"} zwiedzania`,
    `${totalAtt} atrakcji do odkrycia`,
    `Wygenerowano: ${new Date().toLocaleDateString("pl-PL")}`,
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(138, 132, 121);
  stats.forEach((s, i) => doc.text(s, 18, 132 + i * 9));

  // Bottom note
  doc.setFontSize(8.5);
  doc.setTextColor(60, 56, 50);
  doc.text(
    "Plan przygotowany specjalnie dla Ciebie · Miłego zwiedzania!",
    18,
    H - 18
  );
  doc.setTextColor(80, 76, 70);
  doc.text(
    "Zalecamy weryfikację godzin otwarcia przed wizytą.",
    18,
    H - 12
  );

  // ——— DAYS ———
  const typeIcons: Record<string, string> = {
    muzeum: "[M]",
    park: "[P]",
    zabytek: "[Z]",
    galeria: "[G]",
    kościół: "[K]",
    rynek: "[R]",
    inne: "[i]",
  };

  plan.days.forEach((day) => {
    addPage();

    // Day header
    doc.setFillColor(26, 23, 16);
    doc.rect(0, 0, W, 44, "F");

    doc.setFillColor(201, 168, 76);
    doc.rect(0, 0, 6, 44, "F");

    // Day badge
    doc.setFillColor(201, 168, 76);
    doc.roundedRect(14, 9, 46, 10, 5, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(26, 23, 16);
    doc.text(`DZIEŃ ${day.dayNum}`, 37, 15.5, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(250, 247, 242);
    doc.text(day.theme, 66, 19);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(138, 132, 121);
    doc.text(`Łączny czas: ok. ${day.totalHours} godzin`, 66, 30);

    y = 54;

    // Attractions
    day.attractions.forEach((a) => {
      checkY(38);

      doc.setFillColor(250, 249, 246);
      doc.roundedRect(margin, y, W - margin * 2, 32, 3, 3, "F");
      doc.setDrawColor(230, 226, 218);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, W - margin * 2, 32, 3, 3, "S");

      // Number
      doc.setFillColor(232, 212, 154);
      doc.circle(margin + 8, y + 8, 4.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(26, 23, 16);
      doc.text(String(a.num), margin + 8, y + 10, { align: "center" });

      // Name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(26, 23, 16);
      const icon = typeIcons[a.type] || "[i]";
      doc.text(`${icon} ${a.name}`, margin + 16, y + 9);

      // Description
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(90, 86, 80);
      const descLines = doc.splitTextToSize(
        a.description,
        W - margin * 2 - 18
      );
      doc.text(descLines.slice(0, 2), margin + 16, y + 16);

      // Badges
      let bx = margin + 16;
      const isFree =
        a.price?.toLowerCase().includes("bezpłat") ||
        a.price === "0" ||
        a.price?.toLowerCase() === "free";

      const badges = [
        { text: `${a.duration}`, bg: [240, 237, 231] as [number, number, number], fg: [100, 96, 90] as [number, number, number] },
        {
          text: isFree ? `Wstep wolny` : `${a.price}`,
          bg: isFree ? ([234, 240, 234] as [number, number, number]) : ([255, 245, 232] as [number, number, number]),
          fg: isFree ? ([80, 120, 80] as [number, number, number]) : ([160, 80, 30] as [number, number, number]),
        },
      ];

      badges.forEach((b) => {
        doc.setFillColor(...b.bg);
        const tw = doc.getTextWidth(b.text) + 6;
        doc.roundedRect(bx, y + 25.5, tw, 5, 2, 2, "F");
        doc.setFontSize(7);
        doc.setTextColor(...b.fg);
        doc.text(b.text, bx + 3, y + 29);
        bx += tw + 4;
      });

      // Address (right-aligned, small)
      if (a.address) {
        doc.setFontSize(7);
        doc.setTextColor(150, 146, 140);
        doc.text(a.address, W - margin - 2, y + 9, { align: "right" });
      }

      y += 36;
    });

    // Restaurants
    if (day.restaurants?.length) {
      checkY(14);
      y += 6;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(26, 23, 16);
      doc.text("Polecane restauracje", margin, y);
      y += 7;

      const cols = 3;
      const colW = (W - margin * 2) / cols;
      const rows = Math.ceil(day.restaurants.length / cols);

      for (let r = 0; r < rows; r++) {
        checkY(14);
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          if (idx >= day.restaurants.length) break;
          const rest = day.restaurants[idx];
          const rx = margin + c * colW;

          doc.setFillColor(250, 249, 246);
          doc.roundedRect(rx, y, colW - 3, 12, 2, 2, "F");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(26, 23, 16);
          doc.text(rest.name, rx + 3, y + 5.5);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(138, 132, 121);
          doc.text(rest.type, rx + 3, y + 10);
        }
        y += 14;
      }
    }

    // Transport
    if (day.transport?.length) {
      checkY(12 + day.transport.length * 14);
      y += 6;

      doc.setFillColor(26, 23, 16);
      const transportH = 10 + day.transport.length * 14;
      doc.roundedRect(margin, y, W - margin * 2, transportH, 3, 3, "F");

      doc.setFillColor(201, 168, 76);
      doc.rect(margin, y, 4, transportH, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(201, 168, 76);
      doc.text("Transport", margin + 8, y + 7);

      day.transport.forEach((t, i) => {
        const ty = y + 14 + i * 14;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(250, 247, 242);
        doc.text(t.name, margin + 8, ty);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(138, 132, 121);
        doc.text(t.price, margin + 8, ty + 6);
      });

      y += transportH + 4;
    }

    // Page footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(180, 176, 170);
    doc.text(
      `Plan&Go · ${plan.city} · Dzień ${day.dayNum} z ${plan.days.length}`,
      W / 2,
      H - 8,
      { align: "center" }
    );
  });

  // ——— TIPS PAGE ———
  if (plan.tips?.length) {
    addPage();

    doc.setFillColor(26, 23, 16);
    doc.rect(0, 0, W, 40, "F");
    doc.setFillColor(201, 168, 76);
    doc.rect(0, 0, 6, 40, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(250, 247, 242);
    doc.text("Wskazowki praktyczne", 18, 24);

    y = 50;
    plan.tips.forEach((tip) => {
      checkY(20);
      doc.setFillColor(250, 249, 246);
      const tipLines = doc.splitTextToSize(tip, W - margin * 2 - 14);
      const tipH = Math.max(14, tipLines.length * 5 + 8);
      doc.roundedRect(margin, y, W - margin * 2, tipH, 3, 3, "F");
      doc.setFillColor(201, 168, 76);
      doc.rect(margin, y, 4, tipH, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(40, 36, 30);
      doc.text(tipLines, margin + 10, y + 6);
      y += tipH + 6;
    });

    // Back cover note
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(180, 176, 170);
    doc.text("Plan&Go · planandgo.pl", W / 2, H - 8, { align: "center" });
  }

  // Return as Buffer
  const pdfOutput = doc.output("arraybuffer");
  return Buffer.from(pdfOutput);
}
