import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "КиберЩит: Беларусь — игра о кибербезопасности",
  description: "Стань оперативником управления по противодействию киберпреступности. Раскрывай дела по всей Беларуси, допрашивай мошенников и расти от стажёра до полковника.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;600;700;900&family=Russo+One&display=swap&subset=cyrillic" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛡️</text></svg>" />
      </head>
      <body className="bg-slate-950 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
