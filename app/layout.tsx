import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plan&Go — Wirtualne Plany Podróży po Polsce",
  description:
    "Spersonalizowane plany zwiedzania polskich miast. Twój city break zaplanowany w minutę.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
