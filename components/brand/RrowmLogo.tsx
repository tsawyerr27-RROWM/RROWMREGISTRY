import Image from "next/image";

/**
 * Inline RROWM wordmark from `public/rrowm.svg`.
 * SVG stays vector-crisp at any DPR; `unoptimized` avoids Next/Image raster pipelines.
 * `width` / `height` set the intrinsic aspect ratio used for layout (2× nominal display box).
 */
const INTRINSIC_WIDTH = 256;
const INTRINSIC_HEIGHT = 100;

export type RrowmLogoProps = {
  className?: string;
  /** Max rendered width hints for responsive selection (logical CSS px). */
  sizes: string;
  priority?: boolean;
};

export function RrowmLogo({
  className,
  sizes,
  priority = false,
}: RrowmLogoProps) {
  return (
    <Image
      src="/rrowm.svg"
      alt="RROWM"
      width={INTRINSIC_WIDTH}
      height={INTRINSIC_HEIGHT}
      sizes={sizes}
      unoptimized
      priority={priority}
      draggable={false}
      className={className}
    />
  );
}
