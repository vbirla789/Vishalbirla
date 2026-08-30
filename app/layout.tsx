import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { colors } from "./theme";
import { Retune } from "retune";
import NerdMode from "./components/NerdMode";
import CursorFollower from "./components/CursorFollower";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Used only for the small uppercase section labels (ABOUT, WORK, CONTEXT, …).
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Geist Pixel — display font, not on Google Fonts. Files come from
// github.com/vercel/geist-pixel-font (OFL 1.1); "Square" variant.
const geistPixel = localFont({
  src: "../public/fonts/GeistPixel-Square.woff2",
  variable: "--font-geist-pixel",
  display: "swap",
  weight: "400",
  style: "normal",
});

export const metadata: Metadata = {
  title: "Vishal Birla · Product Designer & Framer Expert",
  description:
    "Product designer based out of India, currently at noon. I shape how things look, then bring them to life with AI, and I'm a Framer expert too.",
};

/* Runs before first paint so a dark-mode visitor never sees a white flash.
   Reads the saved choice, falling back to the OS preference. Kept as a raw
   string because it must execute ahead of hydration. */
const THEME_INIT = `
(function(){try{
  var s=localStorage.getItem("theme");
  var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;
  if(d)document.documentElement.classList.add("dark");
}catch(e){}})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${geistPixel.variable} antialiased`}
    >
      <head>
        {/* Must be a raw inline script: it has to run before first paint to
            avoid a light flash, which rules out async. next/script's
            beforeInteractive was tried and is worse here — it renders a sync
            script that React 19 rejects the same way, and placing it outside
            <head> produces invalid HTML. React's "script tag while rendering"
            complaint is a development-only warning; it is not present in the
            production React build, and the script does execute from the SSR
            HTML exactly as intended. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body
        className="min-h-screen"
        style={{ backgroundColor: colors.background, color: colors.primary }}
      >
        {/* Everything the Ask AI panel scales back sits inside #page-shell.
            The panel itself is portalled to <body>, so it stays outside and
            doesn't shrink with the page. See .ask-open in globals.css. */}
        <div id="page-shell">{children}</div>
        {/* Inspect overlay — bottom-right toggle, or press "n". */}
        <NerdMode />
        {/* Custom cursor + trailing label. Desktop pointers only. */}
        <CursorFollower />
        {/* Visual tuning overlay — dev only. Press Option+D (Alt+D) to toggle. */}
        <Retune />
      </body>
    </html>
  );
}
