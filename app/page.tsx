"use client";
import { useState } from "react";

interface ChipConfig { val: string; label: string; }

const INTERESTS: ChipConfig[] = [
  { val: "historia", label: "🏛️ Historia" },
  { val: "sztuka", label: "🎨 Sztuka" },
  { val: "kultura", label: "🎭 Kultura" },
  { val: "gastronomia", label: "🍽️ Gastronomia" },
  { val: "architektura", label: "🏗️ Architektura" },
  { val: "przyroda", label: "🌿 Przyroda" },
  { val: "sport", label: "⚽ Sport" },
  { val: "muzyka", label: "🎵 Muzyka" },
  { val: "zakupy", label: "🛍️ Zakupy" },
  { val: "relaks", label: "🧘 Relaks" },
];

const STYLES: ChipConfig[] = [
  { val: "rodzina", label: "👨‍👩‍👧 Z dziećmi" },
  { val: "para", label: "💑 Romantycznie" },
  { val: "solo", label: "🧍 Solo" },
  { val: "przyjaciele", label: "👥 Z przyjaciółmi" },
  { val: "intensywnie", label: "⚡ Intensywnie" },
  { val: "spokojnie", label: "☕ Spokojnie" },
];

const CUISINES: ChipConfig[] = [
  { val: "polska", label: "🥘 Polska" },
  { val: "włoska", label: "🍕 Włoska" },
  { val: "azjatycka", label: "🍜 Azjatycka" },
  { val: "śródziemnomorska", label: "🫒 Śródziemnomorska" },
  { val: "street food", label: "🌮 Street food" },
  { val: "fine dining", label: "🍷 Fine dining" },
  { val: "kawiarnie", label: "☕ Kawiarnie" },
  { val: "burgery", label: "🍔 Burgery" },
];

const DIETARY = [
  { val: "wszystkożerca", label: "🍖 Wszystkożerca", desc: "Brak ograniczeń" },
  { val: "wegetarianin", label: "🥗 Wegetarianin", desc: "Bez mięsa" },
  { val: "weganin", label: "🌱 Weganin", desc: "Bez produktów zwierzęcych" },
  { val: "bezglutenowo", label: "🌾 Bezglutenowo", desc: "Bez glutenu" },
];

const BUDGET_LABELS: Record<number, { val: string; desc: string }> = {
  1: { val: "Oszczędny (~100 zł)", desc: "Darmowe atrakcje, budżetowe jedzenie" },
  2: { val: "Średni (~200 zł)", desc: "Sprawdzone restauracje, płatne atrakcje" },
  3: { val: "Komfortowy (~400 zł+)", desc: "Fine dining, premium doświadczenia" },
};

const EASYCART_BASE_URL = "https://buy.easycart.pl/YOUR_PRODUCT_SLUG";

export default function HomePage() {
  const [city, setCity] = useState("");
  const [days, setDays] = useState(2);
  const [budget, setBudget] = useState(2);
  const [interests, setInterests] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>(["intensywnie"]);
  const [dietary, setDietary] = useState("wszystkożerca");
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [extras, setExtras] = useState("");
  const [error, setError] = useState("");

  function toggle(val: string, selected: string[], setSelected: (v: string[]) => void) {
    setSelected(selected.includes(val) ? selected.filter(s => s !== val) : [...selected, val]);
  }

  function handleSubmit() {
    setError("");
    if (!city.trim()) { setError("Podaj nazwę miasta."); return; }
    const params = new URLSearchParams({
      city: city.trim(), days: String(days), budget: String(budget),
      interests: interests.join(","), styles: styles.join(","),
      dietary, cuisines: cuisines.join(","), extras: extras.trim(),
    });
    window.location.href = `${EASYCART_BASE_URL}?${params.toString()}`;
  }

  const budgetPct = ((budget - 1) / 2) * 100;

  const s: Record<string, React.CSSProperties> = {
    body: { fontFamily: "'Inter',system-ui,sans-serif", background: "#FAF7F2", color: "#1A1710", minHeight: "100vh" },
    header: { background: "#1A1710", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72, position: "sticky" as const, top: 0, zIndex: 100 },
    logo: { fontFamily: "Georgia,serif", fontSize: 26, fontWeight: 900, color: "#FAF7F2" },
    hero: { background: "#1A1710", padding: "72px 48px 88px", position: "relative" as const, overflow: "hidden" },
    section: { maxWidth: 860, margin: "0 auto", padding: "0 24px 80px" },
    label: { fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8, color: "#1A1710" },
    input: { width: "100%", padding: "13px 16px", borderRadius: 10, border: "1.5px solid #E0DDD7", fontSize: 15, fontFamily: "inherit", outline: "none", background: "#fff" },
    chip: (active: boolean) => ({
      padding: "7px 16px", borderRadius: 100, cursor: "pointer",
      border: `1.5px solid ${active ? "#1A1710" : "#E0DDD7"}`,
      background: active ? "#1A1710" : "#fff",
      color: active ? "#C9A84C" : "#8A8479",
      fontSize: 13, fontWeight: 500, fontFamily: "inherit", transition: "all 0.15s",
    }),
  };

  return (
    <div style={s.body}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');`}</style>

      {/* HEADER */}
      <header style={s.header}>
        <div style={s.logo}>Plan<span style={{ color: "#C9A84C" }}>&</span>Go</div>
        <nav style={{ display: "flex", gap: 32 }}>
          {["Gotowe plany", "O nas", "Kontakt"].map(l => (
            <a key={l} href="#" style={{ color: "#8A8479", textDecoration: "none", fontSize: 14 }}>{l}</a>
          ))}
        </nav>
      </header>

      {/* HERO */}
      <section style={s.hero}>
        <div style={{ position: "absolute", top: -60, right: -80, width: 400, height: 400, background: "radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C", fontSize: 12, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase" as const, padding: "6px 14px", borderRadius: 100, marginBottom: 28 }}>✦ Powered by AI</div>
        <h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(40px,6vw,68px)", fontWeight: 900, color: "#FAF7F2", lineHeight: 1.1, maxWidth: 640, marginBottom: 20 }}>
          Twój idealny<br /><em style={{ color: "#C9A84C" }}>city break</em><br />w minutę.
        </h1>
        <p style={{ color: "#8A8479", fontSize: 17, maxWidth: 500, lineHeight: 1.7, marginBottom: 40 }}>
          Opisz czego szukasz — dostaniesz gotowy plan na maila w kilka godzin. Klikalne mapy, bilety, restauracje dobrane do Ciebie.
        </p>
        <div style={{ display: "flex", gap: 40 }}>
          {[["500+", "polskich miast"], ["~4h", "czas dostawy"], ["PDF", "z linkami"]].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 30, fontWeight: 700, color: "#C9A84C" }}>{n}</div>
              <div style={{ fontSize: 12, color: "#8A8479", marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "56px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 56 }}>
          {[
            ["1", "Wypełnij formularz", "Miasto, dni, zainteresowania, dieta — im więcej powiesz, tym lepszy plan."],
            ["2", "Zapłać bezpiecznie", "BLIK, karta, Apple Pay przez Easycart."],
            ["3", "Odbierz PDF na email", "Plan z klikalną mapą, linkami do biletów i restauracjami dla Ciebie."],
          ].map(([num, title, desc]) => (
            <div key={num} style={{ background: "#fff", border: "1px solid #EDEAE4", borderRadius: 14, padding: 22 }}>
              <div style={{ width: 34, height: 34, background: "#E8D49A", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>{num}</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 12.5, color: "#8A8479", lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FORM */}
      <section style={s.section}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: "#C9A84C", marginBottom: 10 }}>Zamów swój plan</div>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: 32, fontWeight: 700, marginBottom: 6 }}>Opowiedz nam o swojej podróży</h2>
        <p style={{ color: "#8A8479", fontSize: 15, marginBottom: 36 }}>Im więcej szczegółów, tym bardziej personalny plan.</p>

        {/* City + Days */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 20 }}>
          <div>
            <label style={s.label}>Miasto <span style={{ color: "#B85C2C" }}>*</span></label>
            <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="np. Kraków, Gdańsk, Wrocław…" style={s.input} />
          </div>
          <div>
            <label style={s.label}>Liczba dni</label>
            <select value={days} onChange={e => setDays(Number(e.target.value))} style={{ ...s.input, cursor: "pointer" }}>
              {[1,2,3,4,5].map(d => <option key={d} value={d}>{d} {d === 1 ? "dzień" : "dni"}</option>)}
            </select>
          </div>
        </div>

        {/* Budget */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <label style={{ ...s.label, marginBottom: 0 }}>Budżet dzienny na osobę</label>
            <span style={{ fontSize: 13, color: "#C9A84C", fontWeight: 600 }}>{BUDGET_LABELS[budget].val}</span>
          </div>
          <div style={{ fontSize: 12, color: "#8A8479", marginBottom: 10 }}>{BUDGET_LABELS[budget].desc}</div>
          <input type="range" min={1} max={3} step={1} value={budget} onChange={e => setBudget(Number(e.target.value))}
            style={{ width: "100%", height: 4, borderRadius: 2, cursor: "pointer", background: `linear-gradient(to right, #C9A84C 0%, #C9A84C ${budgetPct}%, #E0DDD7 ${budgetPct}%, #E0DDD7 100%)`, border: "none", outline: "none", appearance: "none" as const }} />
        </div>

        {/* Dietary */}
        <div style={{ marginBottom: 24 }}>
          <label style={s.label}>Dieta</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {DIETARY.map(({ val, label, desc }) => (
              <div key={val} onClick={() => setDietary(val)}
                style={{ padding: "12px 14px", borderRadius: 12, cursor: "pointer", border: `1.5px solid ${dietary === val ? "#1A1710" : "#E0DDD7"}`, background: dietary === val ? "#1A1710" : "#fff", transition: "all 0.15s" }}>
                <div style={{ fontSize: 16, marginBottom: 4 }}>{label.split(" ")[0]}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: dietary === val ? "#C9A84C" : "#1A1710" }}>{label.split(" ").slice(1).join(" ")}</div>
                <div style={{ fontSize: 11, color: dietary === val ? "#8A8479" : "#B0AC9F", marginTop: 2 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div style={{ marginBottom: 24 }}>
          <label style={s.label}>Zainteresowania</label>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
            {INTERESTS.map(({ val, label }) => (
              <button key={val} onClick={() => toggle(val, interests, setInterests)} style={s.chip(interests.includes(val))}>{label}</button>
            ))}
          </div>
        </div>

        {/* Cuisines */}
        <div style={{ marginBottom: 24 }}>
          <label style={s.label}>Preferowane kuchnie <span style={{ fontWeight: 400, color: "#8A8479" }}>(opcjonalnie)</span></label>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
            {CUISINES.map(({ val, label }) => (
              <button key={val} onClick={() => toggle(val, cuisines, setCuisines)} style={s.chip(cuisines.includes(val))}>{label}</button>
            ))}
          </div>
        </div>

        {/* Styles */}
        <div style={{ marginBottom: 24 }}>
          <label style={s.label}>Styl podróżowania</label>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
            {STYLES.map(({ val, label }) => (
              <button key={val} onClick={() => toggle(val, styles, setStyles)} style={s.chip(styles.includes(val))}>{label}</button>
            ))}
          </div>
        </div>

        {/* Extras */}
        <div style={{ marginBottom: 32 }}>
          <label style={s.label}>Coś jeszcze? <span style={{ fontWeight: 400, color: "#8A8479" }}>(opcjonalnie)</span></label>
          <textarea value={extras} onChange={e => setExtras(e.target.value)} placeholder="np. mam psa, poruszam się na wózku, interesuję się fotografią, szukam miejsc off-the-beaten-path…" rows={3}
            style={{ ...s.input, resize: "vertical" as const }} />
        </div>

        {error && <div style={{ background: "#FFF0ED", border: "1px solid #FFCFC5", borderRadius: 10, padding: "14px 18px", color: "#B85C2C", fontSize: 14, marginBottom: 16 }}>⚠️ {error}</div>}

        {/* CTA */}
        <div style={{ background: "#1A1710", borderRadius: 16, padding: "28px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: "#8A8479", marginBottom: 4 }}>Cena planu</div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 34, fontWeight: 900, color: "#FAF7F2" }}>19 zł</div>
            <div style={{ fontSize: 11, color: "#8A8479", marginTop: 4 }}>PDF z mapą i linkami · BLIK, karta, Apple Pay</div>
          </div>
          <button onClick={handleSubmit} style={{ padding: "16px 36px", background: "#C9A84C", color: "#1A1710", border: "none", borderRadius: 12, fontFamily: "inherit", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
            Zamów plan →
          </button>
        </div>
        <p style={{ fontSize: 11.5, color: "#B0AC9F", textAlign: "center" as const, marginTop: 14, lineHeight: 1.6 }}>
          Po kliknięciu zostaniesz przekierowany do bezpiecznej płatności Easycart.<br />Plan dostaniesz na maila w ciągu kilku godzin.
        </p>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#1A1710", color: "#8A8479", textAlign: "center" as const, padding: 32, fontSize: 13 }}>
        <strong style={{ color: "#C9A84C" }}>Plan&Go</strong> — Wirtualne plany podróży po Polsce
        <div style={{ fontSize: 11, opacity: 0.5, marginTop: 6 }}>Plany generowane przy pomocy AI · Zawsze warto zweryfikować godziny otwarcia przed wizytą.</div>
      </footer>
    </div>
  );
}
