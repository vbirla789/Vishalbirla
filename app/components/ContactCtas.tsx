"use client";

import { useState, useEffect, useRef } from "react";
import { playHover } from "../lib/sound";

export default function ContactCtas() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile viewport for responsive width
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 400);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText("vishalbirla789@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExploreClick = () => {
    const funSection = document.getElementById("fun");
    if (funSection) {
      funSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Expanded dimensions tuned for balanced horizontal and vertical spacing
  const expandedWidth = isMobile ? Math.min(window.innerWidth - 48, 320) : 320;
  const expandedHeight = 236;
  const innerContentWidth = expandedWidth - 32; // 16px padding on left & right

  return (
    <div className="mt-8 flex items-center gap-3">
      {/* Layout anchor: reserves exact 116px x 38px inline space */}
      <div ref={containerRef} className="relative" style={{ width: 116, height: 38 }}>
        <div
          id="hero-contact"
          className="absolute left-0 top-0 z-40 overflow-hidden bg-[#171717] text-[#FAFAFA] [will-change:width,height,border-radius,box-shadow] transition-[width,height,border-radius,box-shadow] duration-[340ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            width: isOpen ? expandedWidth : 116,
            height: isOpen ? expandedHeight : 38,
            borderRadius: isOpen ? 20 : 19,
            boxShadow: isOpen
              ? "0 20px 35px -10px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)"
              : "none",
          }}
        >
          {/* Collapsed Pill Button */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            onMouseEnter={playHover}
            tabIndex={isOpen ? -1 : 0}
            className={`absolute inset-0 flex items-center justify-center gap-2 text-[14px] font-medium tracking-[-0.01em] outline-none transition-[opacity,filter] duration-150 ease-out ${
              isOpen ? "pointer-events-none opacity-0 blur-[2px]" : "opacity-100 blur-0 delay-75"
            }`}
          >
            <span className="-ml-0.5 flex text-zinc-300">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M22 2L11 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 2L15 22L11 13L2 9L22 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Contact
          </button>

          {/* Expanded Card Container */}
          <div
            className={`absolute inset-0 p-4 transition-[opacity,filter] duration-150 ease-out ${
              isOpen
                ? "pointer-events-auto opacity-100 blur-0 delay-100"
                : "pointer-events-none opacity-0 blur-[2px]"
            }`}
          >
            {/* Fixed-width inner wrapper prevents text reflow/re-wrapping during container width expansion */}
            <div className="flex h-full flex-col justify-between" style={{ width: innerContentWidth }}>
              {/* Header */}
              <div className="flex items-center justify-between px-1 pt-0.5 pb-1">
                <p className="text-[12px] font-medium tracking-wide text-white/50 uppercase">
                  Get in touch
                </p>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  onMouseEnter={playHover}
                  aria-label="Close"
                  tabIndex={isOpen ? 0 : -1}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M18 6L6 18M6 6L18 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              {/* List Rows */}
              <div className="space-y-1">
                {/* Email Row */}
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  onMouseEnter={playHover}
                  tabIndex={isOpen ? 0 : -1}
                  className="group/row flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/[0.08]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/50 transition-colors group-hover/row:bg-white/10 group-hover/text-white">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.75" />
                        <path d="M22 7L13.03 12.7C12.4 13.1 11.6 13.1 10.97 12.7L2 7" stroke="currentColor" strokeWidth="1.75" />
                      </svg>
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-[11px] font-medium tracking-tight text-white/45">Email</span>
                      <span className="truncate text-[13.5px] font-medium tracking-tight text-white">
                        vishalbirla789@gmail.com
                      </span>
                    </div>
                  </div>
                  <div className="relative flex h-6 w-6 shrink-0 items-center justify-center text-white/50 group-hover/row:text-white">
                    <span
                      className={`absolute transition-all duration-200 ${
                        copied ? "scale-75 opacity-0" : "scale-100 opacity-100"
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.75" />
                        <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="currentColor" strokeWidth="1.75" />
                      </svg>
                    </span>
                    <span
                      className={`absolute transition-all duration-200 ${
                        copied ? "scale-100 opacity-100" : "scale-75 opacity-0"
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M20 6L9 17L4 12" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </button>

                {/* LinkedIn Row */}
                <a
                  href="https://www.linkedin.com/in/vishal-birla-587235187/"
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={playHover}
                  tabIndex={isOpen ? 0 : -1}
                  className="group/row flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/[0.08]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/50 transition-colors group-hover/row:bg-white/10 group-hover/text-white">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.75a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9z" />
                      </svg>
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-[11px] font-medium tracking-tight text-white/45">LinkedIn</span>
                      <span className="truncate text-[13.5px] font-medium tracking-tight text-white">
                        @vishal-birla
                      </span>
                    </div>
                  </div>
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center text-white/50 transition-transform group-hover/row:translate-x-0.5 group-hover/row:-translate-y-0.5 group-hover/row:text-white">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </a>

                {/* X / Twitter Row */}
                <a
                  href="https://x.com/VishalB10042696"
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={playHover}
                  tabIndex={isOpen ? 0 : -1}
                  className="group/row flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/[0.08]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/50 transition-colors group-hover/row:bg-white/10 group-hover/text-white">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-[11px] font-medium tracking-tight text-white/45">X (Twitter)</span>
                      <span className="truncate text-[13.5px] font-medium tracking-tight text-white">
                        @VishalB10042696
                      </span>
                    </div>
                  </div>
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center text-white/50 transition-transform group-hover/row:translate-x-0.5 group-hover/row:-translate-y-0.5 group-hover/row:text-white">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explore Button */}
      <button
        type="button"
        onClick={handleExploreClick}
        onMouseEnter={playHover}
        className="inline-flex h-[38px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[#efefef] px-4 py-0 text-[14px] font-medium leading-none tracking-[-0.01em] text-[#171717] transition-colors hover:bg-[#EAEAEA] outline-none focus-visible:ring-2 focus-visible:ring-[#171717]/40 focus-visible:ring-offset-2"
      >
        Explore
      </button>
    </div>
  );
}
