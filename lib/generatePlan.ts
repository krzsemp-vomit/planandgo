import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface Attraction {
  num: number;
  name: string;
  description: string;
  address: string;
  duration: string;
  price: string;
  type: string;
}

export interface Restaurant {
  name: string;
  type: string;
}

export interface Transport {
  name: string;
  price: string;
}

export interface DayPlan {
  dayNum: number;
  theme: string;
  totalHours: number;
  attractions: Attraction[];
  restaurants: Restaurant[];
  transport: Transport[];
}

export interface TravelPlan {
  city: string;
  tagline: string;
  days: DayPlan[];
  tips: string[];
}

export interface OrderParams {
  city: string;
  days: number;
  budget: string; // "1" | "2" | "3"
  interests: string[];
  styles: string[];
  extras: string;
  email: string;
  customerName?: string;
}

const budgetLabels: Record<string, string> = {
  "1": "oszczędny (~100 zł/dzień)",
  "2": "średni (~200 zł/dzień)",
  "3": "komfortowy (~400 zł+/dzień)",
};

export async function generateTravelPlan(
  params: OrderParams
): Promise<TravelPlan> {
  const prompt = `Stwórz szczegółowy plan zwiedzania miasta "${params.city}" na ${params.days} ${params.days === 1 ? "dzień" : "dni"}.

Parametry:
- Budżet: ${budgetLabels[params.budget] || "średni"}
- Zainteresowania: ${params.interests.length ? params.interests.join(", ") : "ogólne"}
- Styl: ${params.styles.length ? params.styles.join(", ") : "standardowy"}
- Dodatkowe uwagi: ${params.extras || "brak"}

Odpowiedz WYŁĄCZNIE poprawnym JSON (bez markdown, bez komentarzy):
{
  "city": "Nazwa miasta",
  "tagline": "krótki poetycki podtytuł (max 8 słów)",
  "days": [
    {
      "dayNum": 1,
      "theme": "Temat dnia (np. Stare Miasto & historia)",
      "totalHours": 8,
      "attractions": [
        {
          "num": 1,
          "name": "Pełna nazwa atrakcji",
          "description": "2-3 zdania opisu — co warto zobaczyć, dlaczego to wyjątkowe miejsce",
          "address": "ul. Przykładowa 1, Miasto",
          "duration": "1-2 godziny",
          "price": "bezpłatny",
          "type": "muzeum"
        }
      ],
      "restaurants": [
        { "name": "Nazwa restauracji", "type": "kuchnia lokalna" }
      ],
      "transport": [
        { "name": "Komunikacja miejska", "price": "ok. 3-5 zł/przejazd" }
      ]
    }
  ],
  "tips": ["tip 1", "tip 2", "tip 3"]
}

Zasady:
- Podawaj PRAWDZIWE, istniejące atrakcje w tym mieście
- Minimum 5 atrakcji na dzień, maksimum 8
- Minimum 5 restauracji na dzień
- Ceny i adresy realistyczne
- Każdy opis atrakcji minimum 2 zdania
- type to jedno z: muzeum | park | zabytek | galeria | kościół | rynek | inne`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText = response.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("");
  const clean = rawText.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as TravelPlan;
}
