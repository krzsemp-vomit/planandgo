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
  ticketUrl?: string;
  pros: string[];
  cons: string[];
  tip?: string;
}

export interface Restaurant {
  name: string;
  cuisine: string;
  priceRange: string; // "$" | "$$" | "$$$"
  description: string;
  dietaryOptions?: string[]; // ["wegetariańskie", "wegańskie", "bezglutenowe"]
}

export interface Transport {
  name: string;
  price: string;
  app?: string;
  tip?: string;
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
  cityDescription: string;
  cityHistory: string;
  cityTips: string[];
  days: DayPlan[];
  tips: string[];
}

export interface OrderParams {
  city: string;
  days: number;
  budget: string;
  interests: string[];
  styles: string[];
  dietary: string;      // "wszystkożerca" | "wegetarianin" | "weganin" | "bezglutenowo"
  cuisines: string[];   // ["polska", "włoska", "azjatycka", ...]
  extras: string;
  email: string;
  customerName?: string;
}

const budgetLabels: Record<string, string> = {
  "1": "oszczędny (~100 zł/dzień)",
  "2": "średni (~200 zł/dzień)",
  "3": "komfortowy (~400 zł+/dzień)",
};

export async function generateTravelPlan(params: OrderParams): Promise<TravelPlan> {
  const prompt = `Jesteś doświadczonym lokalnym przewodnikiem — piszesz jak ktoś kto tam mieszka i szczerze poleca znajomym. Stwórz kompletny plan zwiedzania miasta "${params.city}" na ${params.days} ${params.days === 1 ? "dzień" : "dni"}.

Parametry:
- Budżet: ${budgetLabels[params.budget] || "średni"}
- Zainteresowania: ${params.interests.length ? params.interests.join(", ") : "ogólne"}
- Styl podróży: ${params.styles.length ? params.styles.join(", ") : "standardowy"}
- Dieta: ${params.dietary || "wszystkożerca"}
- Preferowane kuchnie: ${params.cuisines.length ? params.cuisines.join(", ") : "różnorodne"}
- Dodatkowe uwagi: ${params.extras || "brak"}

Odpowiedz WYŁĄCZNIE poprawnym JSON (bez markdown, bez komentarzy):
{
  "city": "Nazwa miasta",
  "tagline": "krótki poetycki podtytuł (max 8 słów)",
  "cityDescription": "3-4 zdania o charakterze miasta — dla kogo jest, jaki ma klimat, co go wyróżnia na tle innych polskich miast. Pisz jak lokalny entuzjasta, nie jak Wikipedia.",
  "cityHistory": "2-3 zdania najciekawszego kontekstu historycznego — nie suchych dat, ale tego co naprawdę kształtuje to miasto dziś.",
  "cityTips": [
    "konkretny pro tip specyficzny dla tego miasta (np. aplikacja, karta miejska, coś czego turyści nie wiedzą)",
    "kolejny tip",
    "kolejny tip"
  ],
  "days": [
    {
      "dayNum": 1,
      "theme": "Temat dnia (np. Stare Miasto i historia)",
      "totalHours": 8,
      "attractions": [
        {
          "num": 1,
          "name": "Pełna oficjalna nazwa atrakcji",
          "description": "2-3 zdania pisane jak polecenie od znajomego — konkretne, subiektywne, z detalem. Co koniecznie zobaczyć, kiedy najlepiej przyjść.",
          "address": "ul. Przykładowa 1, 00-000 Miasto",
          "duration": "ok. 1,5 godziny",
          "price": "25 zł / 15 zł ulgowy",
          "type": "muzeum",
          "ticketUrl": "https://... lub puste jeśli nie znasz",
          "pros": ["konkretny plus (np. niesamowity widok z wieży)", "kolejny plus"],
          "cons": ["konkretny minus (np. tłoczno w weekendy)", "kolejny minus jeśli jest"],
          "tip": "jedna praktyczna wskazówka specyficzna dla tej atrakcji (opcjonalna)"
        }
      ],
      "restaurants": [
        {
          "name": "Nazwa restauracji",
          "cuisine": "kuchnia polska",
          "priceRange": "$$",
          "description": "jedno zdanie — co warto zamówić lub dlaczego warto tu przyjść",
          "dietaryOptions": ["wegetariańskie"]
        }
      ],
      "transport": [
        {
          "name": "Tramwaj / autobus",
          "price": "od 3,40 zł/przejazd, 24h bilet ok. 15 zł",
          "app": "Jakdojade",
          "tip": "kup bilet w aplikacji, unikniesz dopłaty za kasownik"
        },
        {
          "name": "Bolt / Uber",
          "price": "ok. 8-15 zł za kurs w centrum",
          "app": "Bolt"
        },
        {
          "name": "Wynajem auta",
          "price": "od 80 zł/dzień",
          "app": "Kayak lub Rentalcars"
        }
      ]
    }
  ],
  "tips": [
    "praktyczna wskazówka 1",
    "praktyczna wskazówka 2",
    "praktyczna wskazówka 3",
    "praktyczna wskazówka 4",
    "praktyczna wskazówka 5"
  ]
}

Zasady których MUSISZ przestrzegać:
- TYLKO prawdziwe, istniejące miejsca — żadnych wymyślonych
- Ułóż atrakcje geograficznie — minimalizuj czas przejść, zacznij od jednego końca dzielnicy
- Minimum 5, maksimum 7 atrakcji na dzień
- Dokładnie 10 restauracji na dzień — zróżnicowane kuchnie, dostosowane do diety "${params.dietary || "wszystkożerca"}"
- Jeśli dieta to wegetarianin/weganin — WSZYSTKIE restauracje muszą mieć odpowiednie opcje
- Jeśli są preferowane kuchnie — min. 5 z 10 restauracji musi pasować do preferencji
- priceRange: "$" to do 30 zł/os, "$$" to 30-80 zł/os, "$$$" to powyżej 80 zł/os
- pros: minimum 2 plusy na atrakcję, cons: minimum 1 minus (bądź szczery!)
- cityTips: 3-5 tipów SPECYFICZNYCH dla tego miasta, nie ogólnych
- transport: zawsze minimum 3 opcje z konkretnymi cenami i aplikacjami
- Opisy pisz żywym językiem — jak polecenie od znajomego, nie jak Wikipedia
- ticketUrl: podaj PRAWDZIWY link jeśli znasz, jeśli nie — zostaw pusty string ""`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 6000,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText = response.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("");
  const clean = rawText.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as TravelPlan;
}
