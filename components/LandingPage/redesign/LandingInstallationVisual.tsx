import { LandingMinimalPortraitFigure } from "./LandingMinimalPortraitFigure";

export type InstallationVariant = "cobalt" | "lime" | "ember";
export type InstallationComposition = "abstract" | "portrait";

export function LandingInstallationVisual({
  variant,
  composition = "abstract",
  className = "",
}: {
  variant: InstallationVariant;
  composition?: InstallationComposition;
  className?: string;
}) {
  const portrait = composition === "portrait";

  return (
    <div
      className={`landing-installation landing-installation--${variant} ${
        portrait ? "landing-installation--portrait" : ""
      } ${className}`}
      aria-hidden
    >
      <div className="landing-installation__base" />
      {portrait ? (
        <div className="landing-installation__portrait">
          <LandingMinimalPortraitFigure />
        </div>
      ) : null}
      <div className="landing-installation__halftone" />
      <div className="landing-installation__screen" />
      <div className="landing-installation__scan" />
      <div className="landing-installation__ink" />
      <div className="landing-installation__motion" />
      <div className="landing-installation__leak" />
      <div className="landing-installation__grain" />
    </div>
  );
}
