import type { TravelPlan, Attraction } from "./generatePlan";

// Build Google Maps directions URL for a full day route
function buildMapsUrl(attractions: Attraction[]): string {
  const addresses = attractions
    .map((a) => encodeURIComponent(a.address))
    .join("/");
  return `https://www.google.com/maps/dir/${addresses}`;
}

// Build Google Maps search URL for a single attraction
function buildAttractionMapUrl(attraction: Attraction): string {
  const query = encodeURIComponent(`${attraction.name}`);
  return `https://www.google.com/maps/search/?q=${query}`;
}

// Transliterate Polish chars for contexts that need ASCII
function pl(text: string): string {
  if (!text) return "";
  return text
    .replace(/ą/g, "a").replace(/Ą/g, "A")
    .replace(/ć/g, "c").replace(/Ć/g, "C")
    .replace(/ę/g, "e").replace(/Ę/g, "E")
    .replace(/ł/g, "l").replace(/Ł/g, "L")
    .replace(/ń/g, "n").replace(/Ń/g, "N")
    .replace(/ó/g, "o").replace(/Ó/g, "O")
    .replace(/ś/g, "s").replace(/Ś/g, "S")
    .replace(/ź/g, "z").replace(/Ź/g, "Z")
    .replace(/ż/g, "z").replace(/Ż/g, "Z");
}

function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const typeLabels: Record<string, string> = {
  muzeum: "Muzeum",
  park: "Park",
  zabytek: "Zabytek",
  galeria: "Galeria",
  "kościół": "Kościół",
  kosciol: "Kościół",
  rynek: "Rynek",
  inne: "",
};

function renderAttractionCard(a: Attraction, index: number): string {
  const mapUrl = buildAttractionMapUrl(a);
  const isFree =
    (a.price || "").toLowerCase().includes("bezpłat") ||
    (a.price || "").toLowerCase().includes("wolny") ||
    a.price === "0" ||
    (a.price || "").toLowerCase() === "free";

  const priceClass = isFree ? "price-free" : "price-paid";
  const priceText = isFree ? "Wstęp wolny" : escapeHtml(a.price);
  const typeLabel = typeLabels[a.type] || "";

  return `
    <div class="attraction-card">
      <div class="attraction-num">${index}</div>
      <div class="attraction-content">
        ${typeLabel ? `<div class="attraction-type">${typeLabel}</div>` : ""}
        <div class="attraction-name">${escapeHtml(a.name)}</div>
        <div class="attraction-desc">${escapeHtml(a.description)}</div>
        <div class="attraction-address">📍 ${escapeHtml(a.address)}</div>
        <div class="attraction-meta">
          <span class="badge badge-time">⏱ ${escapeHtml(a.duration)}</span>
          <span class="badge ${priceClass}">🎟 ${priceText}</span>
        </div>
        <div class="attraction-links">
          ${a.ticketUrl ? `<a href="${escapeHtml(a.ticketUrl)}" class="btn btn-ticket">🎫 Kup bilety</a>` : ""}
          <a href="${escapeHtml(mapUrl)}" class="btn btn-map">🗺 Mapa</a>
        </div>
      </div>
    </div>`;
}

function renderDay(day: TravelPlan["days"][0]): string {
  const routeUrl = buildMapsUrl(day.attractions);

  const attractionsHtml = day.attractions
    .map((a, i) => renderAttractionCard(a, i + 1))
    .join("");

  const restaurantsHtml = day.restaurants
    .map(
      (r) => `
      <div class="restaurant-item">
        <div class="restaurant-name">${escapeHtml(r.name)}</div>
        <div class="restaurant-type">${escapeHtml(r.type)}</div>
      </div>`
    )
    .join("");

  const transportHtml = day.transport
    .map(
      (t) => `
      <div class="transport-item">
        <span class="transport-name">${escapeHtml(t.name)}</span>
        <span class="transport-price">${escapeHtml(t.price)}</span>
      </div>`
    )
    .join("");

  return `
    <div class="day-section">
      <div class="day-header">
        <div class="day-header-left">
          <div class="day-badge">DZIEŃ ${day.dayNum}</div>
          <div class="day-theme">${escapeHtml(day.theme)}</div>
          <div class="day-hours">⏱ ok. ${day.totalHours} godzin</div>
        </div>
        <a href="${escapeHtml(routeUrl)}" class="btn-route">
          🗺 Otwórz trasę dnia w Google Maps
        </a>
      </div>

      <div class="attractions-grid">
        ${attractionsHtml}
      </div>

      <div class="day-extras">
        <div class="restaurants-block">
          <div class="block-title">🍽 Polecane restauracje</div>
          <div class="restaurants-grid">${restaurantsHtml}</div>
        </div>

        ${day.transport.length ? `
        <div class="transport-block">
          <div class="block-title">🚌 Transport</div>
          <div class="transport-list">${transportHtml}</div>
        </div>` : ""}
      </div>
    </div>`;
}

function buildHtml(plan: TravelPlan): string {
  const totalAtt = plan.days.reduce((s, d) => s + d.attractions.length, 0);
  const daysLabel = plan.days.length === 1 ? "dzień" : "dni";
  const dateStr = new Date().toLocaleDateString("pl-PL");

  const daysHtml = plan.days.map(renderDay).join('<div class="page-break"></div>');

  const tipsHtml = plan.tips
    .map((tip) => `<div class="tip-item">→ ${escapeHtml(tip)}</div>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Plan&Go — ${escapeHtml(plan.city)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@300;400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', sans-serif;
    background: #FAF7F2;
    color: #1A1710;
    font-size: 13px;
    line-height: 1.5;
  }

  a { color: inherit; text-decoration: none; }

  /* ——— COVER ——— */
  .cover {
    background: #1A1710;
    min-height: 100vh;
    padding: 48px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    page-break-after: always;
  }

  .cover-logo {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #C9A84C;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .cover-gold-bar {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 8px;
    background: #C9A84C;
  }

  .cover-body { padding: 60px 0; }

  .cover-city {
    font-family: 'Playfair Display', serif;
    font-size: 72px;
    font-weight: 900;
    color: #FAF7F2;
    line-height: 1;
    margin-bottom: 16px;
  }

  .cover-tagline {
    font-size: 18px;
    font-style: italic;
    color: #8A8479;
    margin-bottom: 40px;
  }

  .cover-divider {
    width: 120px;
    height: 2px;
    background: #C9A84C;
    margin-bottom: 32px;
  }

  .cover-stats {
    display: flex;
    gap: 40px;
  }

  .stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    font-weight: 700;
    color: #C9A84C;
  }

  .stat-label {
    font-size: 12px;
    color: #8A8479;
    margin-top: 2px;
  }

  .cover-footer {
    font-size: 11px;
    color: #4A4740;
  }

  /* ——— DAY SECTION ——— */
  .day-section {
    padding: 0 0 40px;
  }

  .day-header {
    background: #1A1710;
    padding: 24px 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
    position: relative;
  }

  .day-header::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 6px;
    background: #C9A84C;
  }

  .day-badge {
    display: inline-block;
    background: #C9A84C;
    color: #1A1710;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    padding: 4px 14px;
    border-radius: 100px;
    margin-bottom: 8px;
  }

  .day-theme {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
    color: #FAF7F2;
    margin-bottom: 4px;
  }

  .day-hours {
    font-size: 12px;
    color: #8A8479;
  }

  .btn-route {
    background: #C9A84C;
    color: #1A1710 !important;
    font-size: 12px;
    font-weight: 700;
    padding: 10px 20px;
    border-radius: 8px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* ——— ATTRACTIONS ——— */
  .attractions-grid {
    padding: 0 48px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 32px;
  }

  .attraction-card {
    background: #FFFFFF;
    border: 1px solid #E8E4DC;
    border-radius: 12px;
    padding: 18px;
    display: flex;
    gap: 14px;
  }

  .attraction-num {
    width: 28px;
    height: 28px;
    background: #E8D49A;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: #1A1710;
    flex-shrink: 0;
  }

  .attraction-content { flex: 1; }

  .attraction-type {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #B0AC9F;
    margin-bottom: 3px;
  }

  .attraction-name {
    font-size: 14px;
    font-weight: 700;
    color: #1A1710;
    margin-bottom: 6px;
    line-height: 1.3;
  }

  .attraction-desc {
    font-size: 11.5px;
    color: #6B6560;
    line-height: 1.6;
    margin-bottom: 8px;
  }

  .attraction-address {
    font-size: 10.5px;
    color: #B0AC9F;
    margin-bottom: 10px;
  }

  .attraction-meta {
    display: flex;
    gap: 6px;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }

  .badge {
    font-size: 10px;
    font-weight: 600;
    padding: 3px 9px;
    border-radius: 100px;
  }

  .badge-time { background: #F0EDE7; color: #8A8479; }
  .price-free { background: #EAF2EA; color: #3D7A4F; }
  .price-paid { background: #FFF4E8; color: #B85C2C; }

  .attraction-links {
    display: flex;
    gap: 8px;
  }

  .btn {
    font-size: 10.5px;
    font-weight: 600;
    padding: 5px 12px;
    border-radius: 6px;
    display: inline-block;
  }

  .btn-ticket {
    background: #1A1710;
    color: #C9A84C !important;
  }

  .btn-map {
    background: #F0EDE7;
    color: #1A1710 !important;
  }

  /* ——— EXTRAS ——— */
  .day-extras {
    padding: 0 48px;
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
  }

  .block-title {
    font-size: 13px;
    font-weight: 700;
    color: #1A1710;
    margin-bottom: 12px;
  }

  .restaurants-block {
    background: #FFFFFF;
    border: 1px solid #E8E4DC;
    border-radius: 12px;
    padding: 18px;
  }

  .restaurants-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .restaurant-item {
    background: #FAF7F2;
    border-radius: 8px;
    padding: 8px 12px;
  }

  .restaurant-name {
    font-size: 12px;
    font-weight: 600;
    color: #1A1710;
  }

  .restaurant-type {
    font-size: 10.5px;
    color: #8A8479;
    margin-top: 2px;
  }

  .transport-block {
    background: #1A1710;
    border-radius: 12px;
    padding: 18px;
  }

  .transport-block .block-title {
    color: #C9A84C;
  }

  .transport-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-bottom: 10px;
    padding-left: 8px;
    border-left: 3px solid #C9A84C;
  }

  .transport-name {
    font-size: 12px;
    font-weight: 600;
    color: #FAF7F2;
  }

  .transport-price {
    font-size: 11px;
    color: #8A8479;
  }

  /* ——— TIPS ——— */
  .tips-section {
    padding: 48px;
    page-break-before: always;
  }

  .tips-header {
    background: #1A1710;
    padding: 20px 32px;
    border-radius: 12px;
    margin-bottom: 20px;
    position: relative;
    overflow: hidden;
  }

  .tips-header::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 6px;
    background: #C9A84C;
  }

  .tips-header h2 {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
    color: #FAF7F2;
    padding-left: 12px;
  }

  .tip-item {
    background: #FFFFFF;
    border: 1px solid #E8E4DC;
    border-left: 4px solid #C9A84C;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 12.5px;
    color: #3A3630;
    line-height: 1.6;
    margin-bottom: 10px;
  }

  /* ——— FOOTER ——— */
  .page-footer {
    text-align: center;
    padding: 20px 48px;
    font-size: 10px;
    color: #B0AC9F;
    border-top: 1px solid #E8E4DC;
    margin-top: 20px;
  }

  .page-break { page-break-after: always; }
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-gold-bar"></div>
  <div class="cover-logo">Plan&Go · planandgo.pl</div>
  <div class="cover-body">
    <div class="cover-city">${escapeHtml(plan.city)}</div>
    <div class="cover-tagline">${escapeHtml(plan.tagline)}</div>
    <div class="cover-divider"></div>
    <div class="cover-stats">
      <div>
        <div class="stat-num">${plan.days.length}</div>
        <div class="stat-label">${daysLabel} zwiedzania</div>
      </div>
      <div>
        <div class="stat-num">${totalAtt}</div>
        <div class="stat-label">atrakcji</div>
      </div>
      <div>
        <div class="stat-num">${dateStr}</div>
        <div class="stat-label">data generowania</div>
      </div>
    </div>
  </div>
  <div class="cover-footer">
    Plan przygotowany specjalnie dla Ciebie · Miłego zwiedzania!<br>
    Zalecamy weryfikację godzin otwarcia przed wizytą.
  </div>
</div>

<!-- DAYS -->
${daysHtml}

<!-- TIPS -->
${plan.tips.length ? `
<div class="tips-section">
  <div class="tips-header"><h2>💡 Wskazówki praktyczne</h2></div>
  ${tipsHtml}
</div>` : ""}

<div class="page-footer">
  Plan&Go · planandgo.pl · ${escapeHtml(plan.city)} · ${plan.days.length} ${daysLabel}
</div>

</body>
</html>`;
}

export async function generatePDF(plan: TravelPlan): Promise<Buffer> {
  const html = buildHtml(plan);

  // Use html-pdf-node to convert HTML to PDF
  const htmlPdf = await import("html-pdf-node");

  const file = { content: html };
  const options = {
    format: "A4",
    printBackground: true,
    margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  };

  const pdfBuffer = await htmlPdf.generatePdf(file, options);
  return pdfBuffer;
}
