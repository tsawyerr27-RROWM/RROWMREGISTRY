import Image from "next/image";

/**
 * RROWM wordmark (`public/rrowm.svg`) and header mobile mark (`public/rrowm-mobile.png`).
 * SVG stays vector-crisp at desktop; mobile header uses the stacked mark asset.
 */
const WORDMARK_WIDTH = 256;
const WORDMARK_HEIGHT = 100;
const MOBILE_MARK_SIZE = 160;

export type RrowmLogoProps = {
  className?: string;
  /** Max rendered width hints for responsive selection (logical CSS px). */
  sizes: string;
  priority?: boolean;
  /**
   * - `wordmark` (default): SVG wordmark only.
   * - `header`: mobile mark below md, wordmark SVG at md+.
   * - `mark`: stacked mark asset at every breakpoint.
   */
  variant?: "wordmark" | "header" | "mark";
};

const logoImgProps = {
  alt: "RROWM",
  draggable: false as const,
};

export function RrowmLogo({
  className = "",
  sizes,
  priority = false,
  variant = "wordmark",
}: RrowmLogoProps) {
  const crisp = "rrowm-logo-crisp object-contain object-left";
  const motion =
    "transition-opacity duration-500 group-hover:opacity-90 motion-reduce:transition-none";

  if (variant === "mark") {
    return (
      <Image
        {...logoImgProps}
        src="/rrowm-mobile.png"
        width={MOBILE_MARK_SIZE}
        height={MOBILE_MARK_SIZE}
        sizes={sizes}
        priority={priority}
        className={`${crisp} ${motion} ${className}`}
      />
    );
  }

  if (variant === "header") {
    return (
      <>
        <Image
          {...logoImgProps}
          src="/rrowm-mobile.png"
          width={MOBILE_MARK_SIZE}
          height={MOBILE_MARK_SIZE}
          sizes="(max-width: 767px) 88px, 0px"
          priority={priority}
          className={`${crisp} ${motion} h-[88px] w-[88px] shrink-0 -translate-y-1 md:hidden ${className}`}
        />
        <Image
          {...logoImgProps}
          src="/rrowm.svg"
          width={WORDMARK_WIDTH}
          height={WORDMARK_HEIGHT}
          sizes={sizes}
          unoptimized
          priority={priority}
          className={`${crisp} ${motion} hidden h-11 w-[200px] max-w-[200px] md:block ${className}`}
        />
      </>
    );
  }

  return (
    <Image
      {...logoImgProps}
      src="/rrowm.svg"
      width={WORDMARK_WIDTH}
      height={WORDMARK_HEIGHT}
      sizes={sizes}
      unoptimized
      priority={priority}
      className={`${crisp} ${className}`}
    />
  );
}
