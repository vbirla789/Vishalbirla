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

/* Before first paint: if the intro loader is going to play, lay a solid
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
    /* `dark` is hard-coded rather than toggled: the site is dark only, so it
       ships in the server HTML and there is nothing to detect before paint —
       which is what the old inline theme script existed to do.

       The class stays because it is still the mechanism, not a preference.
       globals.css declares `@custom-variant dark (&:where(.dark, .dark *))`,
       so roughly two dozen `dark:` utilities across the case study page,
       WorkSection and others resolve through it. Remove the class and those
       silently fall back to their light pairings. */
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${geistSans.variable} ${geistMono.variable} ${geistPixel.variable} antialiased`}
    >
      <head>
        {/* Must be a raw inline script: it has to run before first paint,
            which rules out async. next/script's beforeInteractive was tried
            and is worse here — it renders a sync script that React 19 rejects
            the same way, and placing it outside <head> produces invalid HTML.
            React's "script tag while rendering" complaint is a
            development-only warning; it is not present in the production React
            build, and the script does execute from the SSR HTML exactly as
            intended. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_INIT }} />
      </head>
      <body
        className="min-h-screen"
        style={{ backgroundColor: colors.background, color: colors.primary }}
      >
        {/* Dithered backdrop. Deliberately outside #page-shell, so the Ask
            panel's slide-and-scale moves the page across it instead of
            dragging it along. Decorative — see .dither in globals.css. */}
        <div className="dither" aria-hidden="true" />
        {/* NerdModeProvider wraps the page rather than sitting beside it, so
            the toggle in the header can reach the state through context. The
            overlay itself is still portalled to <body>. Press "n" anywhere. */}
        <NerdModeProvider>
          {/* Everything the Ask AI panel scales back sits inside #page-shell.
              The panel itself is portalled to <body>, so it stays outside and
              doesn't shrink with the page. See .ask-open in globals.css. */}
          <div id="page-shell">{children}</div>
        </NerdModeProvider>
        {/* Visual tuning overlay — dev only. Press Option+D (Alt+D) to toggle. */}
        <Retune />
      </body>
    </html>
  );
}
