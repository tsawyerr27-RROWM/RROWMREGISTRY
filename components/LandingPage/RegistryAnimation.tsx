"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Folder from "./Folder";
import LiquidGlassSeal from "./LiquidGlassSeal";

type FolderItem = {
  label: string;
};

const FOLDERS: FolderItem[] = [
  { label: "Artworks" },
  { label: "Registry" },
  { label: "Provenance" },
  { label: "Authentication" },
  { label: "Certificates" },
];

export const REGISTRY_ANIMATION_MAX_STEP = FOLDERS.length + 2;

const stackY = (i: number) => i * -36;
const stackX = (i: number) => i * -26;

const folderMotion = {
  hidden: {
    opacity: 0,
    y: 52,
    x: 10,
    scale: 0.93,
    rotateZ: -4,
  },
  visible: (i: number) => ({
    opacity: 1,
    y: stackY(i),
    x: stackX(i),
    scale: 1,
    rotateZ: i * 0.35,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
      mass: 0.7,
    },
  }),
};

type Props = {
  mounted?: boolean;
  onNetworkStart?: () => void;
  /**
   * When set (0…REGISTRY_ANIMATION_MAX_STEP), drives state from parent — e.g. hero scroll.
   * When omitted, plays the timed sequence once after `mounted`.
   */
  externalStep?: number;
};

export default function RegistryAnimation({
  mounted = false,
  onNetworkStart,
  externalStep,
}: Props) {
  const [internalStep, setInternalStep] = useState(0);
  const networkOnce = useRef(false);
  const scrollDriven = externalStep !== undefined;
  const step = scrollDriven ? externalStep : internalStep;

  useEffect(() => {
    if (scrollDriven || !mounted) return;

    let cancelled = false;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        setTimeout(() => resolve(), ms);
      });

    const sequence = async () => {
      await wait(280);
      if (cancelled) return;
      for (let i = 0; i < FOLDERS.length; i++) {
        setInternalStep(i + 1);
        await wait(i === 0 ? 420 : 460);
        if (cancelled) return;
      }
      await wait(320);
      if (cancelled) return;
      setInternalStep(FOLDERS.length + 1);
      await wait(720);
      if (cancelled) return;
      setInternalStep(FOLDERS.length + 2);
      if (!networkOnce.current) {
        networkOnce.current = true;
        onNetworkStart?.();
      }
    };

    sequence();
    return () => {
      cancelled = true;
    };
  }, [mounted, scrollDriven, onNetworkStart]);

  useEffect(() => {
    if (
      scrollDriven &&
      step >= FOLDERS.length + 2 &&
      onNetworkStart &&
      !networkOnce.current
    ) {
      networkOnce.current = true;
      onNetworkStart();
    }
  }, [scrollDriven, step, onNetworkStart]);

  const journeyComplete = step >= FOLDERS.length + 2;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ perspective: 1400 }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden
      >
        <div className="absolute left-1/2 top-1/2 h-[min(100%,520px)] w-[min(100%,420px)] -translate-x-1/2 -translate-y-1/2 rounded-[40%] bg-gradient-to-br from-violet-200/25 via-transparent to-amber-100/20 blur-3xl" />
      </div>

      <motion.div
        className="relative flex h-full w-full items-center justify-center"
        animate={journeyComplete ? { y: [0, -5, 0] } : { y: 0 }}
        transition={
          journeyComplete
            ? {
                y: {
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
            : { duration: 0.4 }
        }
      >
        <div className="relative flex h-full w-full items-center justify-center">
          {FOLDERS.map((folder, index) =>
            step > index ? (
              <motion.div
                key={folder.label}
                className="absolute"
                custom={index}
                initial="hidden"
                animate="visible"
                variants={folderMotion}
                style={{
                  zIndex: index,
                  transformStyle: "preserve-3d",
                }}
              >
                <Folder label={folder.label} showText={step === index + 1} />
              </motion.div>
            ) : null
          )}

          <AnimatePresence mode="wait">
            {step > FOLDERS.length ? (
              <motion.div
                key="seal"
                className="absolute z-50"
                initial={{ opacity: 0, scale: 0.2, rotate: -10 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: 0,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 18,
                  },
                }}
              >
                <motion.div
                  animate={
                    journeyComplete ? { scale: [1, 1.04, 1] } : { scale: 1 }
                  }
                  transition={
                    journeyComplete
                      ? { duration: 4.2, repeat: Infinity, ease: "easeInOut" }
                      : {}
                  }
                >
                  <LiquidGlassSeal />
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
