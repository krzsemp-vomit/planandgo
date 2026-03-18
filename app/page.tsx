"use client";

import { useState } from "react";

// ——— TYPES ———
interface ChipConfig {
  val: string;
  label: string;
}

const INTERESTS: ChipConfig[] = [
  { val: "historia", label: "🏛️ Historia" },
  { val: "sztuka", label: "🎨 Sztuka" },
  { val: "kultura", label: "🎭 Kultura" },
  { val: "gastronomia", label: "🍽️ Gastronomia" },
  { val: "architektura", label: "🏗️ Architektura" },
  { val: "przyroda", label: "🌿 Przyroda & parki" },
  { val: "sport", label: "⚽ Sport & aktywność" },
  { val: "muzyka", label: "🎵 Muzyka & nightlife" },
  { val: "zakupy", label: "🛍️ Zakupy" },
  { val: "relaks", label: "🧘 Relaks & spa" },
];

const STYLES: ChipConfig[] = [
  { val: "rodzina", label: "👨‍👩‍👧 Z dziećmi" },
  { val: "para", label: "💑 Romantycznie" },
  { val: "solo", label: "🧍 Solo" },
  { val: "przyjaciele", label: "👥 Z przyjaciółmi" },
  { val: "intensywnie", label: "⚡ Intensywnie" },
  { val: "spokojnie", label: "☕ Spokojnie" },
];

const BUDGET_LABELS: Record<number, { val: string; desc: string }> = {
  1: { val: "Oszczędny (~100 zł)", desc: "Darmowe atrakcje, tanie jadłodajnie" },
  2: { val: "Średni (~200 zł)", desc: "Sprawdzone restauracje, płatne atrakcje" },
  3: { val: "Komfortowy (~400 zł+)", desc: "Fine dining, premium doświadczenia" },
};

// ——— YOUR EASYCART PRODUCT URL ———
// Replace with your actual Easycart product checkout URL.
// Easycart allows passing custom metadata via URL params.
const EASYCART_BASE_URL = "https://buy.easycart.pl/YOUR_PRODUCT_SLUG";

export default function HomePage() {
  const [city, setCity] = useState("");
  const [days, setDays] = useState(2);
  const [budget, setBudget] = useState(2);
  const [interests, setInterests] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>(["intensywnie"]);
  const [extras, setExtras] = useState("");
  const [error, setError] = useState("");

  function toggleChip(
    val: string,
    selected: string[],
    setSelected: (v: string[]) => void
  ) {
    setSelected(
      selected.includes(val)
        ? selected.filter((s) => s !== val)
        : [...selected, val]
    );
  }

  function handleSubmit() {
    setError("");
    if (!city.trim()) {
      setError("Podaj nazwę miasta.");
      return;
    }

    // Build URL with metadata for Easycart
    // Easycart will pass these back in the webhook payload as order.metadata
    const params = new URLSearchParams({
      // These become metadata fields in Easycart
      city: city.trim(),
      days: String(days),
      budget: String(budget),
      interests: interests.join(","),
      styles: styles.join(","),
      extras: extras.trim(),
    });

    const checkoutUrl = `${EASYCART_BASE_URL}?${params.toString()}`;
    window.location.href = checkoutUrl;
  }

  const budgetPct = ((budget - 1) / 2) * 100;

  return (
    <>
      <style>{`
        :root {
          --cream: #FAF7F2; --ink: #1A1710; --gold: #C9A84C;
          --gold-light: #E8D49A; --rust: #B85C2C;
          --warm-gray: #8A8479; --sage: #6B7B5E;
        }
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'DM Sans',system-ui,sans-serif; background:var(--cream); color:var(--ink); }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
      `}</style>

      {/* HEADER */}
      <header style={{
        background: "var(--ink)", padding: "0 48px", display: "flex",
        alignItems: "center", justifyContent: "space-between",
        height: 72, position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, color: "#FAF7F2" }}>
          Plan<span style={{ color: "#C9A84C" }}>&</span>Go
        </div>
        <nav style={{ display: "flex", gap: 32 }}>
          {["Gotowe plany", "O nas", "Kontakt"].map((l) => (
            <a key={l} href="#" style={{ color: "var(--warm-gray)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>{l}</a>
          ))}
        </nav>
      </header>

      {/* HERO */}
      <section style={{ background: "var(--ink)", padding: "80px 48px 100px", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: -60, right: -80, width: 500, height: 500,
          background: "radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)",
          color: "#C9A84C", fontSize: 12, fontWeight: 600, letterSpacing: "1.5px",
          textTransform: "uppercase", padding: "6px 14px", borderRadius: 100, marginBottom: 28,
        }}>✦ Powered by AI</div>

        <h1 style={{
          fontFamily: "'Playfair Display',serif", fontSize: "clamp(42px,6vw,72px)",
          fontWeight: 900, color: "#FAF7F2", lineHeight: 1.08, maxWidth: 700, marginBottom: 24,
        }}>
          Twój idealny<br /><em style={{ fontStyle: "italic", color: "#C9A84C" }}>city break</em><br />w minutę.
        </h1>

        <p style={{ color: "var(--warm-gray)", fontSize: 18, maxWidth: 520, lineHeight: 1.65, marginBottom: 44 }}>
          Opisz czego szukasz — dostaniesz gotowy plan zwiedzania na maila w ciągu kilku godzin.
          Dopasowany do Ciebie, gotowy do druku.
        </p>

        <div style={{ display: "flex", gap: 48 }}>
          {[["500+", "polskich miast"], ["~4h", "czas dostawy na email"], ["PDF", "gotowy do druku"]].map(([num, label]) => (
            <div key={label}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: "#C9A84C" }}>{num}</div>
              <div style={{ fontSize: 13, color: "var(--warm-gray)", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px 0" }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#C9A84C", marginBottom: 12 }}>
          Jak to działa?
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginBottom: 60 }}>
          {[
            ["1", "Wypełnij formularz", "Powiedz nam o mieście, czasie i zainteresowaniach."],
            ["2", "Zapłać bezpiecznie", "Płatność przez Easycart — BLIK, karta, Apple Pay."],
            ["3", "Odbierz plan na email", "W ciągu kilku godzin dostaniesz PDF z gotowym planem."],
          ].map(([num, title, desc]) => (
            <div key={num} style={{ background: "#fff", border: "1px solid #EDEAE4", borderRadius: 14, padding: 24 }}>
              <div style={{
                width: 36, height: 36, background: "#E8D49A", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 15, marginBottom: 14,
              }}>{num}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{title}</div>
              <div style={{ fontSize: 13, color: "var(--warm-gray)", lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FORM */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#C9A84C", marginBottom: 12 }}>
          Zamów swój plan
        </div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 700, marginBottom: 8 }}>
          Opowiedz nam o swojej podróży
        </h2>
        <p style={{ color: "var(--warm-gray)", fontSize: 16, marginBottom: 40 }}>
          Wypełnij formularz, zapłać — i czekaj na maila z planem.
        </p>

        {/* City + Days */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
              Miasto <span style={{ color: "#B85C2C" }}>*</span>
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="np. Kraków, Gdańsk, Wrocław…"
              style={{
                width: "100%", padding: "13px 16px", borderRadius: 10,
                border: "1.5px solid #E0DDD7", fontSize: 15, fontFamily: "inherit",
                outline: "none", background: "#fff",
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>Liczba dni</label>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              style={{
                width: "100%", padding: "13px 16px", borderRadius: 10,
                border: "1.5px solid #E0DDD7", fontSize: 15, fontFamily: "inherit",
                outline: "none", background: "#fff", cursor: "pointer",
              }}
            >
              {[1, 2, 3, 4, 5].map((d) => (
                <option key={d} value={d}>{d} {d === 1 ? "dzień" : "dni"}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Budget */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Budżet dzienny na osobę</span>
            <span style={{ fontSize: 13, color: "#C9A84C", fontWeight: 600 }}>{BUDGET_LABELS[budget].val}</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--warm-gray)", marginBottom: 10 }}>{BUDGET_LABELS[budget].desc}</div>
          <input
            type="range" min={1} max={3} step={1} value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            style={{
              width: "100%", height: 4, borderRadius: 2, cursor: "pointer",
              background: `linear-gradient(to right, #C9A84C 0%, #C9A84C ${budgetPct}%, #E0DDD7 ${budgetPct}%, #E0DDD7 100%)`,
              border: "none", outline: "none", appearance: "none" as const,
            }}
          />
        </div>

        {/* Interests */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Zainteresowania (wybierz dowolne)</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {INTERESTS.map(({ val, label }) => {
              const active = interests.includes(val);
              return (
                <button
                  key={val}
                  onClick={() => toggleChip(val, interests, setInterests)}
                  style={{
                    padding: "7px 16px", borderRadius: 100, cursor: "pointer",
                    border: `1.5px solid ${active ? "var(--ink)" : "#E0DDD7"}`,
                    background: active ? "var(--ink)" : "#fff",
                    color: active ? "#C9A84C" : "var(--warm-gray)",
                    fontSize: 13, fontWeight: 500, fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >{label}</button>
              );
            })}
          </div>
        </div>

        {/* Styles */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Styl podróżowania</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {STYLES.map(({ val, label }) => {
              const active = styles.includes(val);
              return (
                <button
                  key={val}
                  onClick={() => toggleChip(val, styles, setStyles)}
                  style={{
                    padding: "7px 16px", borderRadius: 100, cursor: "pointer",
                    border: `1.5px solid ${active ? "var(--ink)" : "#E0DDD7"}`,
                    background: active ? "var(--ink)" : "#fff",
                    color: active ? "#C9A84C" : "var(--warm-gray)",
                    fontSize: 13, fontWeight: 500, fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >{label}</button>
              );
            })}
          </div>
        </div>

        {/* Extras */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
            Dodatkowe preferencje{" "}
            <span style={{ fontWeight: 400, color: "var(--warm-gray)" }}>(opcjonalnie)</span>
          </label>
          <textarea
            value={extras}
            onChange={(e) => setExtras(e.target.value)}
            placeholder="np. unikam muzeów, interesuje mnie street art, mam psa, poruszam się na wózku…"
            rows={3}
            style={{
              width: "100%", padding: "13px 16px", borderRadius: 10,
              border: "1.5px solid #E0DDD7", fontSize: 15, fontFamily: "inherit",
              outline: "none", background: "#fff", resize: "vertical",
            }}
          />
        </div>

        {error && (
          <div style={{
            background: "#FFF0ED", border: "1px solid #FFCFC5", borderRadius: 10,
            padding: "14px 18px", color: "#B85C2C", fontSize: 14, marginBottom: 16,
          }}>⚠️ {error}</div>
        )}

        {/* Price + CTA */}
        <div style={{
          background: "var(--ink)", borderRadius: 16, padding: "28px 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 20,
        }}>
          <div>
            <div style={{ fontSize: 13, color: "var(--warm-gray)", marginBottom: 4 }}>Cena planu</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 900, color: "#FAF7F2" }}>
              19 zł
            </div>
            <div style={{ fontSize: 12, color: "var(--warm-gray)", marginTop: 4 }}>
              PDF na maila · BLIK, karta, Apple Pay
            </div>
          </div>
          <button
            onClick={handleSubmit}
            style={{
              padding: "16px 36px", background: "#C9A84C", color: "var(--ink)",
              border: "none", borderRadius: 12, fontFamily: "inherit",
              fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: 0.3,
            }}
          >
            Zamów plan →
          </button>
        </div>

        <p style={{ fontSize: 12, color: "var(--warm-gray)", textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
          Po kliknięciu zostaniesz przekierowany do bezpiecznej strony płatności Easycart.<br />
          Plan dostaniesz na podany email w ciągu kilku godzin.
        </p>
      </section>

      {/* FOOTER */}
      <footer style={{
        background: "var(--ink)", color: "var(--warm-gray)",
        textAlign: "center", padding: 32, fontSize: 13,
      }}>
        <strong style={{ color: "#C9A84C" }}>Plan&Go</strong> — Wirtualne plany podróży po Polsce
        <div style={{ fontSize: 11, opacity: 0.5, marginTop: 6 }}>
          Plany generowane przy pomocy AI · Zawsze warto zweryfikować godziny otwarcia przed wizytą.
        </div>
      </footer>
    </>
  );
}
