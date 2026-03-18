# Plan&Go — Setup Guide

## Stack
- **Next.js 14** (App Router) — frontend + API routes
- **Vercel** — hosting + Cron Jobs
- **Vercel KV** (Redis) — order queue
- **Anthropic Claude** — plan generation
- **jsPDF** — PDF generation (server-side)
- **Resend** — email delivery
- **Easycart** — payment processing

---

## 1. Vercel — pierwsze kroki

```bash
npm i -g vercel
vercel login
vercel link   # w folderze projektu
```

---

## 2. Vercel KV (Redis) — kolejka zamówień

W Vercel Dashboard:
1. Wejdź w swój projekt → zakładka **Storage**
2. Kliknij **Create Database** → wybierz **KV**
3. Vercel automatycznie doda zmienne środowiskowe do projektu:
   - `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`

---

## 3. Zmienne środowiskowe

W Vercel Dashboard → projekt → **Settings → Environment Variables** dodaj:

| Zmienna | Wartość |
|---|---|
| `ANTHROPIC_API_KEY` | sk-ant-... (z console.anthropic.com) |
| `RESEND_API_KEY` | re_... (z resend.com) |
| `RESEND_FROM` | plany@planandgo.pl (zweryfikowana domena w Resend) |
| `EASYCART_WEBHOOK_SECRET` | losowy string (to samo wpisz w Easycart) |
| `CRON_SECRET` | `openssl rand -hex 32` |

---

## 4. Resend — konfiguracja domeny

1. Załóż konto na [resend.com](https://resend.com)
2. Dodaj domenę `planandgo.pl` → dodaj rekordy DNS
3. Stwórz API Key → wklej do `RESEND_API_KEY`
4. Adres `RESEND_FROM` musi być z zweryfikowanej domeny

---

## 5. Easycart — konfiguracja produktu

1. Utwórz produkt "Plan podróży — personalizowany" za 19 zł
2. W ustawieniach produktu dodaj **Custom Fields** (metadata):
   - `city` — pole tekstowe ("Miasto")
   - `days` — pole select (1/2/3/4/5)
   - `budget` — pole select (1/2/3)
   - `interests` — pole tekstowe (ukryte, wypełniane przez URL param)
   - `styles` — pole tekstowe (ukryte)
   - `extras` — pole tekstowe opcjonalne

3. W **Webhooks** ustaw:
   - URL: `https://planandgo.pl/api/webhook`
   - Event: `order.completed`
   - Secret: ten sam co `EASYCART_WEBHOOK_SECRET`

4. Skopiuj URL swojego koszyka i wklej do `app/page.tsx`:
   ```ts
   const EASYCART_BASE_URL = "https://buy.easycart.pl/TWOJ_SLUG";
   ```

### Jak działa przekazywanie parametrów

Strona Plan&Go buduje URL do Easycart z parametrami:
```
https://buy.easycart.pl/SLUG?city=Kraków&days=2&budget=2&interests=historia,sztuka
```

Easycart przekazuje te parametry jako `metadata` w webhooku.

---

## 6. Deploy

```bash
vercel --prod
```

---

## 7. Testowanie bez 4h delay

Użyj endpointu `/api/generate` (wymaga `x-admin-secret` header = `CRON_SECRET`):

```bash
curl -X POST https://planandgo.pl/api/generate \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: TWOJ_CRON_SECRET" \
  -d '{
    "email": "test@example.com",
    "customerName": "Krzysiek",
    "city": "Kraków",
    "days": 2,
    "budget": "2",
    "interests": ["historia", "gastronomia"],
    "styles": ["para"],
    "extras": ""
  }'
```

---

## 8. Cron Job

`vercel.json` konfiguruje cron co 30 minut:
```json
{ "path": "/api/cron", "schedule": "*/30 * * * *" }
```

Vercel automatycznie wywołuje endpoint z headerem `Authorization: Bearer {CRON_SECRET}`.

---

## Flow zamówienia

```
1. Klient wypełnia formularz na planandgo.pl
2. Klik "Zamów plan" → redirect do Easycart z parametrami w URL
3. Klient płaci (BLIK/karta) → Easycart wysyła webhook do /api/webhook
4. Webhook zapisuje zamówienie w KV z timestamp + 4h delay
5. Cron co 30min sprawdza czy są zamówienia gotowe do wysłania
6. Dla gotowych: Claude generuje plan → jsPDF tworzy PDF → Resend wysyła email
7. Klient dostaje PDF na maila
```

---

## Struktura projektu

```
planandgo/
├── app/
│   ├── layout.tsx              ← Root layout
│   ├── page.tsx                ← Landing page + formularz
│   └── api/
│       ├── webhook/route.ts    ← Easycart webhook
│       ├── generate/route.ts   ← Manual trigger (admin/test)
│       └── cron/route.ts       ← Scheduled job (co 30min)
├── lib/
│   ├── generatePlan.ts         ← Claude API
│   ├── generatePDF.ts          ← jsPDF server-side
│   ├── sendEmail.ts            ← Resend
│   └── queue.ts                ← Vercel KV helpers
├── vercel.json                 ← Cron config
├── .env.local.example          ← Template zmiennych
└── package.json
```
