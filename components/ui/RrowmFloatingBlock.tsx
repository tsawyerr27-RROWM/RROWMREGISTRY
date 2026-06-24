"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import {
  rrowmFloatingBlockClass,
  type RrowmFloatingBlockSize,
  type RrowmZone,
} from "@/styles/rrowm-theme";

type OwnProps = {
  children: ReactNode;
  /** Zone accent for border tint — inherits CSS vars when inside a zone root */
  zone?: RrowmZone;
  size?: RrowmFloatingBlockSize;
  /** Subtle hover lift — for clickable cards */
  interactive?: boolean;
  className?: string;
};

type PolymorphicProps<T extends ElementType> = OwnProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof OwnProps | "as">;

export function RrowmFloatingBlock<T extends ElementType = "div">({
  as,
  children,
  zone,
  size = "default",
  interactive = false,
  className = "",
  ...rest
}: PolymorphicProps<T>) {
  const Component = as ?? "div";
  const zoneClass = zone ? `rrowm-zone-${zone}` : "";

  return (
    <Component
      className={`${rrowmFloatingBlockClass(size, interactive)} ${zoneClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function RrowmFloatingLink({
  href,
  children,
  zone,
  size = "default",
  className = "",
  ...rest
}: OwnProps & { href: string } & Omit<ComponentPropsWithoutRef<typeof Link>, keyof OwnProps | "href">) {
  return (
    <Link
      href={href}
      className={`${rrowmFloatingBlockClass(size, true)} ${zone ? `rrowm-zone-${zone}` : ""} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Link>
  );
}
