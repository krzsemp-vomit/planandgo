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
  ticketUrl?: string;  // direct ticket/booking URL if known
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
  budget: string;
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

export async function generateTravelPlan(params: OrderParams): Promise<TravelPlan> {
  const prompt = `Jesteś doświadczonym lokalnym przewodnikiem i entuzjastą podróży. Stwórz szczegółowy, praktyczny plan zwiedzania miasta "${params.city}" na ${params.days} ${params.days === 1 ? "dzień" : "dni"}.

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
      "theme": "Temat dnia (np. Stare Miasto i historia)",
      "totalHours": 8,
      "attractions": [
        {
          "num": 1,
          "name": "Pełna oficjalna nazwa atrakcji",
          "description": "2-3 zdania pisane jak polecenie od znajomego który tam był — konkretne, subiektywne, z detalem którego nie ma na Wikipedii. Co koniecznie zobaczyć, kiedy najlepiej przyjść, czego nie przegapić.",
          "address": "ul. Przykładowa 1, 00-000 Miasto",
          "duration": "ok. 1,5 godziny",
          "price": "25 zł / 15 zł ulgowy",
          "type": "muzeum",
          "ticketUrl": "https://..." 
        }
      ],
      "restaurants": [
        { "name": "Nazwa restauracji", "type": "kuchnia polska, śniadania" }
      ],
      "transport": [
        { "name": "Tramwaj / autobus", "price": "ok. 4 zł/przejazd" },
        { "name": "Bolt / Uber", "price": "ok. 8-15 zł za kurs" }
      ]
    }
  ],
  "tips": ["konkretna wskazówka 1", "konkretna wskazówka 2", "konkretna wskazówka 3", "konkretna wskazówka 4", "konkretna wskazówka 5"]
}

Zasady których MUSISZ przestrzegać:
- Podawaj WYŁĄCZNIE prawdziwe, istniejące atrakcje — żadnych wymyślonych miejsc
- Ułóż atrakcje w logicznej kolejności geograficznej — minimalizuj czas przejść, zacznij od jednego końca i idź do drugiego
- Minimum 5, maksimum 7 atrakcji na dzień
- Minimum 5 restauracji na dzień — zróżnicowane, prawdziwe lokale
- Opisy pisz żywym językiem — jak polecenie od znajomego, nie jak Wikipedia
- Podaj realną godzinę otwarcia jeśli znasz (np. "czynne od 9:00")
- ticketUrl: podaj PRAWDZIWY link do biletów jeśli znasz (bilety.muzeumwarszawy.pl, bilety.wawel.krakow.pl itp.) — jeśli nie jesteś pewien zostaw pusty string ""
- Ceny i adresy muszą być realistyczne i aktualne
- tips: 5 bardzo konkretnych wskazówek (np. "Wawel — bilety tylko online, wyprzedają się 2 tygodnie wcześniej"), nie ogólników
- type to jedno z: muzeum | park | zabytek | galeria | kościół | rynek | inne`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 5000,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText = response.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("");
  const clean = rawText.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as TravelPlan;
}
