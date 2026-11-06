import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_ORIGIN ?? "http://localhost:3000"),
  title: {
    default: "CyberWatch OAU | Report. Track. Learn.",
    template: "%s | CyberWatch OAU",
  },
  description:
    "An independent academic prototype for reporting, tracking, and learning from cyber incidents affecting the OAU community.",
  applicationName: "CyberWatch OAU",
  keywords: ["cybersecurity", "incident reporting", "phishing", "OAU", "SIWES"],
  robots: { index: true, follow: true },
  openGraph: {
    title: "CyberWatch OAU",
    description: "Report suspicious activity, track your case, and learn the next safe action.",
    type: "website",
    locale: "en_NG",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
