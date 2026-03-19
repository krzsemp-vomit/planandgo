import type { TravelPlan, Attraction, Restaurant } from "./generatePlan";

function buildMapsUrl(attractions: Attraction[]): string {
  const addresses = attractions.map((a) => encodeURIComponent(a.address)).join("/");
  return `https://www.google.com/maps/dir/${addresses}`;
}
function buildAttractionMapUrl(a: Attraction): string {
  return `https://www.google.com/maps/search/?q=${encodeURIComponent(a.name + " " + a.address)}`;
}
function buildRestaurantMapUrl(r: Restaurant): string {
  return `https://www.google.com/maps/search/?q=${encodeURIComponent(r.name + " restauracja")}`;
}
function escapeHtml(text: string): string {
  if (!text) return "";
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const typeLabels: Record<string, string> = {
  muzeum: "Muzeum", park: "Park", zabytek: "Zabytek",
  galeria: "Galeria", "kościół": "Kościół", kosciol: "Kościół",
  rynek: "Rynek", inne: "",
};

function renderAttractionCard(a: Attraction, index: number): string {
  const mapUrl = buildAttractionMapUrl(a);
  const isFree = (a.price || "").toLowerCase().includes("bezpłat") ||
    (a.price || "").toLowerCase().includes("wolny") ||
    a.price === "0" || (a.price || "").toLowerCase() === "free";
  const typeLabel = typeLabels[a.type] || "";
  const prosHtml = (a.pros || []).map(p => `<span class="pro">✓ ${escapeHtml(p)}</span>`).join("");
  const consHtml = (a.cons || []).map(c => `<span class="con">✗ ${escapeHtml(c)}</span>`).join("");

  return `<div class="attraction-card">
      <div class="attraction-num">${index}</div>
      <div class="attraction-content">
        ${typeLabel ? `<div class="attraction-type">${typeLabel}</div>` : ""}
        <div class="attraction-name">${escapeHtml(a.name)}</div>
        <div class="attraction-desc">${escapeHtml(a.description)}</div>
        ${a.tip ? `<div class="attraction-tip">💡 ${escapeHtml(a.tip)}</div>` : ""}
        <div class="attraction-address">📍 ${escapeHtml(a.address)}</div>
        <div class="attraction-meta">
          <span class="badge badge-time">⏱ ${escapeHtml(a.duration)}</span>
          <span class="badge ${isFree ? "price-free" : "price-paid"}">🎟 ${isFree ? "Wstęp wolny" : escapeHtml(a.price)}</span>
        </div>
        ${prosHtml || consHtml ? `<div class="pros-cons">${prosHtml}${consHtml}</div>` : ""}
        <div class="attraction-links">
          ${a.ticketUrl ? `<a href="${escapeHtml(a.ticketUrl)}" class="btn btn-ticket">🎫 Kup bilety</a>` : ""}
          <a href="${escapeHtml(mapUrl)}" class="btn btn-map">🗺 Mapa</a>
        </div>
      </div>
    </div>`;
}

function renderDayHeader(day: TravelPlan["days"][0], routeUrl: string): string {
  return `<div class="day-header">
      <div class="day-header-left">
        <div class="day-badge">DZIEŃ ${day.dayNum}</div>
        <div class="day-theme">${escapeHtml(day.theme)}</div>
        <div class="day-hours">⏱ ok. ${day.totalHours} godzin</div>
      </div>
      <a href="${escapeHtml(routeUrl)}" class="btn-route">🗺 Otwórz trasę dnia w Google Maps</a>
    </div>`;
}

function renderDay(day: TravelPlan["days"][0]): string {
  const routeUrl = buildMapsUrl(day.attractions);
  const header = renderDayHeader(day, routeUrl);

  // Chunk attractions 4 per page
  const CARDS_PER_PAGE = 4;
  const chunks: Attraction[][] = [];
  for (let i = 0; i < day.attractions.length; i += CARDS_PER_PAGE) {
    chunks.push(day.attractions.slice(i, i + CARDS_PER_PAGE));
  }

  const attractionPages = chunks.map((chunk, pageIdx) => {
    const cards = chunk.map((a, i) => renderAttractionCard(a, pageIdx * CARDS_PER_PAGE + i + 1)).join("");
    const isLast = pageIdx === chunks.length - 1;
    return `<div class="day-page">
      ${header}
      <div class="attractions-grid">${cards}</div>
      ${isLast ? "" : '<div class="hard-break"></div>'}
    </div>`;
  }).join("");

  const restaurantsHtml = day.restaurants.map((r) => {
    const mapUrl = buildRestaurantMapUrl(r);
    return `<a href="${escapeHtml(mapUrl)}" class="restaurant-item">
        <div class="restaurant-name">${escapeHtml(r.name)}</div>
        <div class="restaurant-type">${escapeHtml(r.cuisine || "")}${r.priceRange ? " · " + r.priceRange : ""}</div>
        ${r.description ? `<div class="restaurant-desc">${escapeHtml(r.description)}</div>` : ""}
      </a>`;
  }).join("");

  const transportHtml = day.transport.map((t) => `
    <div class="transport-item">
      <div class="transport-name">${escapeHtml(t.name)}${t.app ? ` <span class="transport-app">${escapeHtml(t.app)}</span>` : ""}</div>
      <div class="transport-price">${escapeHtml(t.price)}</div>
      ${t.tip ? `<div class="transport-tip">${escapeHtml(t.tip)}</div>` : ""}
    </div>`).join("");

  return `<div class="day-section">
    ${attractionPages}
    <div class="day-extras-page">
      ${header}
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
    </div>
  </div>`;
}

function buildHtml(plan: TravelPlan): string {
  const totalAtt = plan.days.reduce((s, d) => s + d.attractions.length, 0);
  const daysLabel = plan.days.length === 1 ? "dzień" : "dni";
  const dateStr = new Date().toLocaleDateString("pl-PL");
  const cityTipsHtml = (plan.cityTips || []).map(t => `<div class="city-tip">✦ ${escapeHtml(t)}</div>`).join("");
  const tipsHtml = plan.tips.map(t => `<div class="tip-item">→ ${escapeHtml(t)}</div>`).join("");
  const daysHtml = plan.days.map((day, i) => {
    const isLast = i === plan.days.length - 1;
    return renderDay(day) + (isLast ? "" : '<div class="hard-break"></div>');
  }).join("");

  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<title>Plan&Go — ${escapeHtml(plan.city)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@300;400;500;600;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',sans-serif; background:#FAF7F2; color:#1A1710; font-size:13px; line-height:1.5; }
  a { color:inherit; text-decoration:none; }

  .hard-break { page-break-after:always; break-after:page; }

  /* COVER */
  .cover { background:#1A1710; min-height:100vh; padding:48px; position:relative; display:flex; flex-direction:column; page-break-after:always; break-after:page; }
  .cover-gold-bar { position:absolute; left:0; top:0; bottom:0; width:8px; background:#C9A84C; }
  .cover-logo { font-size:13px; font-weight:700; color:#C9A84C; letter-spacing:2px; text-transform:uppercase; padding-bottom:48px; }
  .cover-city { font-family:'Playfair Display',serif; font-size:64px; font-weight:900; color:#FAF7F2; line-height:1; margin-bottom:12px; }
  .cover-tagline { font-size:16px; font-style:italic; color:#8A8479; margin-bottom:28px; }
  .cover-divider { width:100px; height:2px; background:#C9A84C; margin-bottom:24px; }
  .cover-desc { font-size:14px; color:#C8C4BC; line-height:1.75; max-width:520px; margin-bottom:20px; }
  .cover-history { font-size:13px; color:#6B6560; line-height:1.7; max-width:520px; margin-bottom:28px; font-style:italic; border-left:3px solid #C9A84C; padding-left:16px; }
  .cover-stats { display:flex; gap:36px; margin-bottom:28px; }
  .stat-num { font-family:'Playfair Display',serif; font-size:32px; font-weight:700; color:#C9A84C; }
  .stat-label { font-size:11px; color:#8A8479; margin-top:2px; }
  .cover-city-tips { display:flex; flex-direction:column; gap:6px; margin-bottom:auto; }
  .city-tip { font-size:12px; color:#8A8479; line-height:1.5; }
  .cover-footer { font-size:11px; color:#4A4740; padding-top:32px; }

  /* DAY */
  .day-section { }
  .day-page { padding:32px 40px 24px; }
  .day-extras-page { padding:32px 40px; page-break-inside:avoid; break-inside:avoid; }
  .day-header { background:#1A1710; padding:20px 24px; display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; position:relative; border-radius:4px; }
  .day-header::before { content:''; position:absolute; left:0; top:0; bottom:0; width:5px; background:#C9A84C; border-radius:4px 0 0 4px; }
  .day-badge { display:inline-block; background:#C9A84C; color:#1A1710; font-size:9px; font-weight:700; letter-spacing:1.5px; padding:3px 12px; border-radius:100px; margin-bottom:5px; }
  .day-theme { font-family:'Playfair Display',serif; font-size:19px; font-weight:700; color:#FAF7F2; margin-bottom:2px; }
  .day-hours { font-size:11px; color:#8A8479; }
  .btn-route { background:#C9A84C; color:#1A1710 !important; font-size:11px; font-weight:700; padding:8px 16px; border-radius:8px; white-space:nowrap; flex-shrink:0; }

  /* ATTRACTIONS */
  .attractions-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:0; }
  .attraction-card { background:#FFFFFF; border:1px solid #E8E4DC; border-radius:10px; padding:14px; display:flex; gap:10px; page-break-inside:avoid; break-inside:avoid; }
  .attraction-num { width:24px; height:24px; background:#E8D49A; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:#1A1710; flex-shrink:0; margin-top:1px; }
  .attraction-content { flex:1; min-width:0; }
  .attraction-type { font-size:8.5px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#B0AC9F; margin-bottom:2px; }
  .attraction-name { font-size:13px; font-weight:700; color:#1A1710; margin-bottom:4px; line-height:1.3; }
  .attraction-desc { font-size:10.5px; color:#6B6560; line-height:1.6; margin-bottom:6px; }
  .attraction-tip { font-size:10px; color:#8A6A2A; background:#FFF8E8; border-radius:5px; padding:4px 7px; margin-bottom:6px; line-height:1.5; }
  .attraction-address { font-size:9.5px; color:#B0AC9F; margin-bottom:7px; }
  .attraction-meta { display:flex; gap:4px; margin-bottom:7px; flex-wrap:wrap; }
  .badge { font-size:9px; font-weight:600; padding:2px 7px; border-radius:100px; }
  .badge-time { background:#F0EDE7; color:#8A8479; }
  .price-free { background:#EAF2EA; color:#3D7A4F; }
  .price-paid { background:#FFF4E8; color:#B85C2C; }
  .pros-cons { display:flex; flex-wrap:wrap; gap:3px; margin-bottom:7px; }
  .pro { font-size:9px; color:#3D7A4F; background:#EAF2EA; padding:2px 6px; border-radius:100px; }
  .con { font-size:9px; color:#B85C2C; background:#FFF0E8; padding:2px 6px; border-radius:100px; }
  .attraction-links { display:flex; gap:5px; }
  .btn { font-size:9.5px; font-weight:600; padding:3px 9px; border-radius:5px; display:inline-block; }
  .btn-ticket { background:#1A1710; color:#C9A84C !important; }
  .btn-map { background:#F0EDE7; color:#1A1710 !important; }

  /* EXTRAS */
  .day-extras { display:grid; grid-template-columns:2fr 1fr; gap:16px; }
  .block-title { font-size:12px; font-weight:700; color:#1A1710; margin-bottom:10px; }
  .restaurants-block { background:#FFFFFF; border:1px solid #E8E4DC; border-radius:10px; padding:14px; }
  .restaurants-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
  .restaurant-item { background:#FAF7F2; border-radius:7px; padding:7px 9px; display:block; page-break-inside:avoid; break-inside:avoid; }
  .restaurant-name { font-size:11px; font-weight:600; color:#1A1710; }
  .restaurant-type { font-size:9.5px; color:#8A8479; margin-top:1px; }
  .restaurant-desc { font-size:9px; color:#B0AC9F; margin-top:2px; line-height:1.4; }
  .transport-block { background:#1A1710; border-radius:10px; padding:14px; }
  .transport-block .block-title { color:#C9A84C; }
  .transport-item { margin-bottom:10px; padding-left:9px; border-left:3px solid #C9A84C; }
  .transport-item:last-child { margin-bottom:0; }
  .transport-name { font-size:11px; font-weight:600; color:#FAF7F2; }
  .transport-app { font-size:9px; background:rgba(201,168,76,0.2); color:#C9A84C; padding:1px 5px; border-radius:4px; margin-left:4px; }
  .transport-price { font-size:10px; color:#8A8479; margin-top:1px; }
  .transport-tip { font-size:9px; color:#6B6560; margin-top:2px; font-style:italic; }

  /* TIPS */
  .tips-section { padding:32px 40px; }
  .tips-header { background:#1A1710; padding:16px 24px; border-radius:10px; margin-bottom:14px; position:relative; }
  .tips-header::before { content:''; position:absolute; left:0; top:0; bottom:0; width:5px; background:#C9A84C; border-radius:10px 0 0 10px; }
  .tips-header h2 { font-family:'Playfair Display',serif; font-size:19px; font-weight:700; color:#FAF7F2; padding-left:10px; }
  .tip-item { background:#FFFFFF; border:1px solid #E8E4DC; border-left:4px solid #C9A84C; border-radius:8px; padding:10px 14px; font-size:11.5px; color:#3A3630; line-height:1.6; margin-bottom:8px; page-break-inside:avoid; break-inside:avoid; }

  .page-footer { text-align:center; padding:16px 40px; font-size:10px; color:#B0AC9F; border-top:1px solid #E8E4DC; margin-top:16px; }
</style>
</head>
<body>

<div class="cover">
  <div class="cover-gold-bar"></div>
  <div class="cover-logo">Plan&amp;Go · planandgo.pl</div>
  <div class="cover-city">${escapeHtml(plan.city)}</div>
  <div class="cover-tagline">${escapeHtml(plan.tagline)}</div>
  <div class="cover-divider"></div>
  ${plan.cityDescription ? `<div class="cover-desc">${escapeHtml(plan.cityDescription)}</div>` : ""}
  ${plan.cityHistory ? `<div class="cover-history">${escapeHtml(plan.cityHistory)}</div>` : ""}
  <div class="cover-stats">
    <div><div class="stat-num">${plan.days.length}</div><div class="stat-label">${daysLabel} zwiedzania</div></div>
    <div><div class="stat-num">${totalAtt}</div><div class="stat-label">atrakcji</div></div>
    <div><div class="stat-num">${dateStr}</div><div class="stat-label">data generowania</div></div>
  </div>
  ${cityTipsHtml ? `<div class="cover-city-tips">${cityTipsHtml}</div>` : ""}
  <div class="cover-footer">Plan przygotowany specjalnie dla Ciebie · Miłego zwiedzania!<br>Zalecamy weryfikację godzin otwarcia przed wizytą.</div>
</div>

${daysHtml}

${plan.tips.length ? `
<div class="tips-section">
  <div class="tips-header"><h2>💡 Wskazówki praktyczne</h2></div>
  ${tipsHtml}
  <div class="page-footer">Plan&amp;Go · planandgo.pl · ${escapeHtml(plan.city)} · ${plan.days.length} ${daysLabel}</div>
</div>` : `<div class="page-footer">Plan&amp;Go · planandgo.pl · ${escapeHtml(plan.city)} · ${plan.days.length} ${daysLabel}</div>`}

</body>
</html>`;
}

export async function generatePDF(plan: TravelPlan): Promise<Buffer> {
  const html = buildHtml(plan);
  const apiKey = process.env.PDFSHIFT_API_KEY;
  if (!apiKey) throw new Error("PDFSHIFT_API_KEY is not set");

  const response = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source: html,
      format: "A4",
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`PDFShift error: ${response.status} — ${err}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
