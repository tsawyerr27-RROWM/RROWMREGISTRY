"use client";

import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  variant?: "light" | "dark";
};

export default function Card({
  children,
  className = "",
  variant = "light",
}: CardProps) {
  const isDark = variant === "dark";

  return (
    <div
      className={
        isDark
          ? `liquid-glass-tile-dark relative p-8 rrowm-ds-transition hover:shadow-[0_10px_32px_-24px_rgba(0,0,0,0.4)] ${className}`
          : `liquid-glass-tile relative p-8 rrowm-ds-transition hover:shadow-[0_14px_40px_-28px_rgba(15,23,42,0.12)] ${className}`
      }
    >
      <div className="relative z-10 space-y-3">
        {children}
      </div>
    </div>
  );
}
