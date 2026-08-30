/* ----------------------------------------------------------------------------
 * Typewriter — vendored from the fancy registry (fancycomponents.dev), i.e.
 * the component behind `shadcn add @fancy/typewriter`.
 *
 * Added by hand rather than via the CLI: this project has no components.json,
 * so `shadcn init` would have scaffolded a config, its own lib/utils and an
 * import restructure for the sake of one component.
 *
 * Two changes from the original: it imports framer-motion instead of `motion`
 * (same library, already a dependency — installing `motion` would ship a
 * second copy of the same animation runtime), and `cn` comes from app/lib.
 * --------------------------------------------------------------------------*/

"use client";

import { ElementType, useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";

import { cn } from "../../lib/utils";

interface TypewriterProps {
  /** Text or array of texts to type out */
  text: string | string[];
  /** HTML tag to render as. @default div */
  as?: ElementType;
  /** Speed of typing in ms. @default 50 */
  speed?: number;
  /** Initial delay before typing starts. @default 0 */
  initialDelay?: number;
  /** Time to wait between typing and deleting. @default 2000 */
  waitTime?: number;
  /** Speed of deleting characters. @default 30 */
  deleteSpeed?: number;
  /** Whether to loop through the texts array. @default true */
  loop?: boolean;
  className?: string;
  /** Whether to show the cursor. @default true */
  showCursor?: boolean;
  /** Hide cursor while typing. @default false */
  hideCursorOnType?: boolean;
  /** Character or node to use as the cursor. @default "|" */
  cursorChar?: string | React.ReactNode;
  cursorClassName?: string;
  cursorAnimationVariants?: {
    initial: Variants["initial"];
    animate: Variants["animate"];
  };
}

const Typewriter = ({
  text,
  as: Tag = "div",
  speed = 50,
  initialDelay = 0,
  waitTime = 2000,
  deleteSpeed = 30,
  loop = true,
  className,
  showCursor = true,
  hideCursorOnType = false,
  cursorChar = "|",
  cursorClassName = "ml-1",
  cursorAnimationVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.01,
        repeat: Infinity,
        repeatDelay: 0.4,
        repeatType: "reverse",
      },
    },
  },
  ...props
}: TypewriterProps & React.HTMLAttributes<HTMLElement>) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const texts = Array.isArray(text) ? text : [text];

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const currentText = texts[currentTextIndex];

    const startTyping = () => {
      if (isDeleting) {
        if (displayText === "") {
          setIsDeleting(false);
          if (currentTextIndex === texts.length - 1 && !loop) {
            return;
          }
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
          setCurrentIndex(0);
          timeout = setTimeout(() => {}, waitTime);
        } else {
          timeout = setTimeout(() => {
            setDisplayText((prev) => prev.slice(0, -1));
          }, deleteSpeed);
        }
      } else {
        if (currentIndex < currentText.length) {
          timeout = setTimeout(() => {
            setDisplayText((prev) => prev + currentText[currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          }, speed);
        } else if (texts.length > 1) {
          timeout = setTimeout(() => {
            setIsDeleting(true);
          }, waitTime);
        }
      }
    };

    // Apply the initial delay only at the very start
    if (currentIndex === 0 && !isDeleting && displayText === "") {
      timeout = setTimeout(startTyping, initialDelay);
    } else {
      startTyping();
    }

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentIndex,
    displayText,
    isDeleting,
    speed,
    deleteSpeed,
    waitTime,
    currentTextIndex,
    loop,
  ]);

  return (
    <Tag className={cn("inline whitespace-pre-wrap tracking-tight", className)} {...props}>
      <span>{displayText}</span>
      {showCursor ? (
        <motion.span
          variants={cursorAnimationVariants}
          className={cn(
            cursorClassName,
            hideCursorOnType &&
              (currentIndex < texts[currentTextIndex].length || isDeleting)
              ? "hidden"
              : "",
          )}
          initial="initial"
          animate="animate"
        >
          {cursorChar}
        </motion.span>
      ) : null}
    </Tag>
  );
};

export default Typewriter;
