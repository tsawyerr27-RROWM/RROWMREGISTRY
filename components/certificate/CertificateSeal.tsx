import { RegistryTrustSeal, type RegistryTrustSealSize } from "@/components/Registry/RegistryTrustSeal";
import type { RegistryTrustLevel } from "@/lib/registry-trust-model";

type Props = {
  level: RegistryTrustLevel;
  size?: RegistryTrustSealSize;
  label?: string;
  sublabel?: string;
  className?: string;
};

/** Certificate document seal — preset wrapper over RegistryTrustSeal. */
export function CertificateSeal(props: Props) {
  return <RegistryTrustSeal {...props} />;
}
