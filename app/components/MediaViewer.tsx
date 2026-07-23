"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/* ----------------------------------------------------------------------------
 * Global media lightbox.
 * - Any container wrapped in <Zoomable> opens ITSELF, enlarged, in an overlay.
 *   The whole container is captured (its background, padding, frame and media)
 *   and scaled up uniformly to fit the viewport — so it reads as the same card,
 *   just bigger, rather than a bare frame.
 * - Dark, blurred backdrop; closes on backdrop click, the ✕ button, or Escape.
 * - Locks page scroll while open. Cursor turns to a pointer on hover.
 * --------------------------------------------------------------------------*/

const EASE = [0.22, 1, 0.36, 1] as const;

// How much of the viewport the enlarged container may fill, and the largest
// zoom factor allowed (keeps raster screenshots from getting too soft).
const FIT_W = 0.92;
const FIT_H = 0.9;
const MAX_SCALE = 3;

type Content = {
  node: React.ReactNode;
  className?: string;
  // When fit !== false, the node is captured at natural size (w×h) and scaled
  // up uniformly to fill the viewport. When fit === false, the node sizes
  // itself (used for interactive content like the tab switcher).
  w?: number;
  h?: number;
  fit?: boolean;
};

type Ctx = { open: (content: Content) => void };

const MediaViewerContext = createContext<Ctx>({ open: () => {} });

export function useMediaViewer() {
  return useContext(MediaViewerContext);
}

export function MediaViewerProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<Content | null>(null);

  const open = useCallback((next: Content) => setContent(next), []);
  const close = useCallback(() => setContent(null), []);

  useEffect(() => {
    if (content == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [content, close]);

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const fitted = content ? content.fit !== false : false;

  // Uniform zoom factor so the whole captured container fits the viewport.
  let scale = 1;
  if (content && fitted && content.w && content.h && typeof window !== "undefined") {
    const s = Math.min(
      (window.innerWidth * FIT_W) / content.w,
      (window.innerHeight * FIT_H) / content.h,
      MAX_SCALE,
    );
    if (Number.isFinite(s) && s > 0) scale = s;
  }

  return (
    <MediaViewerContext.Provider value={{ open }}>
      {children}

      <AnimatePresence>
        {content != null ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            onClick={close}
            aria-modal
            role="dialog"
          >
            {/* close */}
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="fixed right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            {fitted ? (
              /* the whole container, at its natural size, scaled up uniformly */
              <motion.div
                onClick={stop}
                style={{ width: content.w, height: content.h, transformOrigin: "center" }}
                className={content.className}
                initial={{ scale: scale * 0.96, opacity: 0 }}
                animate={{ scale, opacity: 1 }}
                exit={{ scale: scale * 0.96, opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                {content.node}
              </motion.div>
            ) : (
              /* self-sizing content (e.g. the tab switcher) */
              <motion.div
                onClick={stop}
                className={`flex max-h-[94vh] max-w-[94vw] items-center justify-center overflow-auto ${content.className ?? ""}`}
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.97, opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                {content.node}
              </motion.div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </MediaViewerContext.Provider>
  );
}

/**
 * Wraps a media container so clicking it opens the whole thing, enlarged, in the
 * overlay. Cursor turns to a pointer on hover.
 */
export function Zoomable({
  label,
  className,
  children,
}: {
  label?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { open } = useMediaViewer();
  const ref = useRef<HTMLDivElement>(null);

  const trigger = () => {
    const r = ref.current?.getBoundingClientRect();
    open({ node: children, className, w: r?.width ?? 0, h: r?.height ?? 0 });
  };

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={label ? `Enlarge ${label}` : "Enlarge media"}
      onClick={trigger}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          trigger();
        }
      }}
      className={`cursor-pointer outline-none ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
