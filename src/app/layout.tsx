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
  title: "BLUEEYES | Websites that make brands unforgettable",
  description:
    "BLUEEYES designs cinematic websites that look premium, feel inevitable, and help the right clients find you.",
  applicationName: "BLUEEYES",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
  openGraph: {
    title: "BLUEEYES | Websites that make brands unforgettable",
    description:
      "Custom website design and Next.js builds — clear, cinematic, and made to be remembered.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "blueeyes." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BLUEEYES | Websites that make brands unforgettable",
    description:
      "Custom website design and Next.js builds — clear, cinematic, and made to be remembered.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-ink">{children}</body>
    </html>
  );
}
