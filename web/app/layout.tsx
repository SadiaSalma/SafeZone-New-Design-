/**
 * layout.tsx - the frame around EVERY page of the website.
 *
 * It loads the fonts, the colours (globals.css), the language/theme memory
 * (PreferencesProvider), and puts the header, footer, phone bottom bar and
 * theme picker around whatever page is being shown ({children}).
 */
import type { Metadata } from "next";
import { Hind_Siliguri, Poppins } from "next/font/google";
import "./globals.css";
import { PreferencesProvider } from "@/components/PreferencesProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";
import { ThemePicker } from "@/components/ThemePicker";
import { SplashScreen } from "@/components/SplashScreen";

// English font. next/font downloads it once and serves it from our own site.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Bangla font, so বাংলা text looks clean.
const hind = Hind_Siliguri({
  variable: "--font-hind",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SafeZone · Verified theft alerts for Dhaka",
  description: "Verified theft alerts, crime statistics and area safety for Dhaka.",
};

// Runs before the page is painted, so a saved theme/language shows without a flash.
const restorePrefs = `try{var t=localStorage.getItem('sz-theme');if(t)document.documentElement.dataset.theme=t;var l=localStorage.getItem('sz-lang');if(l)document.documentElement.lang=l;}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="sage"
      suppressHydrationWarning
      className={`${poppins.variable} ${hind.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: restorePrefs }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <PreferencesProvider>
          <SplashScreen />
          <Header />
          {/* pt-16 leaves room for the fixed header, pb-28 for the phone bottom bar */}
          <main className="flex-1 pt-16 pb-28 md:pb-0">{children}</main>
          <Footer />
          <MobileNav />
          <ThemePicker />
        </PreferencesProvider>
      </body>
    </html>
  );
}
