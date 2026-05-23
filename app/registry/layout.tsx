import { SignedInCatalogueShellLayout } from "@/components/Studio/SignedInCatalogueShellLayout";

export default function RegistryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SignedInCatalogueShellLayout>{children}</SignedInCatalogueShellLayout>;
}
