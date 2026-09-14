import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { colors } from "./theme";
import { Retune } from "retune";
import NerdModeProvider from "./components/NerdMode";

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

/* Also before first paint: if the intro loader is going to play, lay a solid
   cover over the page NOW.

   Without this the homepage flashes first. IntroPuzzle is a client component
   whose `show` starts false, so the server sends the page, the browser paints
   it, and only after hydration does the effect flip `show` — the loader lands
   on top of a page the visitor has already seen.

   Unconditional, because the loader now plays on every full page load — no
   sessionStorage key (that one stuck for a whole tab), no document.hidden
   check (that one disabled it outright), and no reduced-motion check
   (those visitors get a motion-free variant rather than nothing). Every
   condition that used to live here turned into a way for the loader to
   silently not appear.

   IntroPuzzle still clears the class the moment its exit begins or if it
   declines to run, and the timeout below is a last-resort backstop so a JS
   error can never leave the site hidden. */
const INTRO_INIT = `
(function(){try{
  var r=document.documentElement;
  r.classList.add("intro-pending");
  setTimeout(function(){r.classList.remove("intro-pending");},8000);
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
        {/* Order matters: the theme class must be on <html> before this runs,
            so the cover paints in the right background colour. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_INIT }} />
      </head>
      <body
        className="min-h-screen"
        style={{ backgroundColor: colors.background, color: colors.primary }}
      >
        {/* Dithered backdrop, sitting outside #page-shell so the page layers
            over it rather than carrying it. Decorative — see .dither. */}
        <div className="dither" aria-hidden="true" />
        {/* NerdModeProvider wraps the page rather than sitting beside it, so
            the toggle in the header can reach the state through context. The
            overlay itself is still portalled to <body>. Press "n" anywhere. */}
        <NerdModeProvider>
          {/* Still needed with the Ask panel gone: globals.css gives this
              position:relative and z-index:1 so the page paints above the
              dither. That also makes it a stacking context, which is why
              full-screen overlays portal to <body> — a z-index inside here
              can never outrank something outside it. IntroPuzzle learned
              that the hard way. */}
          <div id="page-shell">{children}</div>
        </NerdModeProvider>
        {/* Visual tuning overlay — dev only. Press Option+D (Alt+D) to toggle. */}
        <Retune />
      </body>
    </html>
  );
}
