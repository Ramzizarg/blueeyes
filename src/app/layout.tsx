import type { Metadata } from "next";
import { Manrope, Syne } from "next/font/google";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BLUEEYES | Websites designed to win clients",
  description:
    "BLUEEYES designs and builds premium websites that help you look sharp and connect with the right clients.",
  openGraph: {
    title: "BLUEEYES | Websites designed to win clients",
    description:
      "Custom website design and Next.js builds — made so clients find you and reach out.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ink text-frost">{children}</body>
    </html>
  );
}
