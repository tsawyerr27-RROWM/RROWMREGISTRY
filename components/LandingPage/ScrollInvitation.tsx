"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/** Gentle invitation to scroll — fades once the journey begins */
export function ScrollInvitation() {
  const [visible, setVisible] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 72) {
        setVisible(false);
        window.removeEventListener("scroll", onScroll);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none fixed bottom-10 left-1/2 z-20 flex -translate-x-1/2 transform-gpu flex-col items-center gap-3 [backface-visibility:hidden]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        >
          <span className="text-sm font-medium text-neutral-600/85">
            Scroll
          </span>
          <motion.span
            className="flex h-9 w-9 transform-gpu items-center justify-center rounded-full border border-black/10 bg-white/40 text-neutral-500 shadow-sm backdrop-blur-sm [backface-visibility:hidden]"
            animate={reduceMotion ? undefined : { y: [0, 5, 0] }}
            transition={
              reduceMotion
                ? undefined
                : {
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
