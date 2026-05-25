import type { ReactNode } from "react";

type IntroStep = {
  title: string;
  body: ReactNode;
  icon?: ReactNode;
};

const VerifyIcon = (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-emerald-600">
    <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    <path stroke="currentColor" strokeWidth="1.5" d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" />
  </svg>
);

const ArtworkIcon = (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-violet-600">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="m3 16 5-5 4 4 3-3 6 6" />
  </svg>
);

const CertificateIcon = (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-amber-600">
    <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 16h6M17 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z" />
    <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M9 8h6" />
  </svg>
);

const InviteIcon = (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-blue-600">
    <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="m2 7 10 6 10-6" />
  </svg>
);

const ProvenanceIcon = (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-teal-600">
    <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
    <path stroke="currentColor" strokeWidth="1.5" d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" />
  </svg>
);

const PrivacyIcon = (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-neutral-600">
    <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path stroke="currentColor" strokeWidth="1.5" d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const artistIntroSteps: IntroStep[] = [
  {
    title: "Your studio",
    body: (
      <p>
        This is your private workspace. From here you can register artworks,
        manage verified records, and track your catalogue as it builds over time.
      </p>
    ),
    icon: ArtworkIcon,
  },
  {
    title: "Register and verify",
    body: (
      <p>
        Each work you register receives a unique registry ID. Once verified — either
        by you or through an institutional filing — a cryptographic certificate is
        generated and attached to the record permanently.
      </p>
    ),
    icon: VerifyIcon,
  },
  {
    title: "Certificates and provenance",
    body: (
      <p>
        Certificates are generated automatically when authorship is authenticated.
        Ownership transfers create a provenance chain that follows the work across
        custodians, building a tamper-evident chronology.
      </p>
    ),
    icon: CertificateIcon,
  },
  {
    title: "Privacy by default",
    body: (
      <p>
        Your visibility settings are off by default. You control exactly what
        appears on your public profile. Visit <strong>My Account</strong> to
        adjust what the public sees.
      </p>
    ),
    icon: PrivacyIcon,
  },
];

export const collectorIntroSteps: IntroStep[] = [
  {
    title: "Your collection",
    body: (
      <p>
        This is your private workspace for tracking custody of works in your
        collection. Everything here is recorded on the registry chronology.
      </p>
    ),
    icon: ArtworkIcon,
  },
  {
    title: "Ownership and transfers",
    body: (
      <p>
        When a work is transferred to you — by an artist, gallery, or another
        collector — you confirm receipt here. Accepting a transfer extends the
        provenance chain and generates a certificate to the work&apos;s owner.
      </p>
    ),
    icon: ProvenanceIcon,
  },
  {
    title: "Declared values",
    body: (
      <p>
        You can file declared values against works you hold. These are private by
        default and only visible to the public if you explicitly enable value
        visibility in your account settings.
      </p>
    ),
    icon: CertificateIcon,
  },
  {
    title: "Your privacy",
    body: (
      <p>
        Collection profiles default to private. You choose whether to appear
        publicly, anonymously, or remain hidden entirely.
        Visit <strong>My Account</strong> to manage these settings.
      </p>
    ),
    icon: PrivacyIcon,
  },
];

export const galleryIntroSteps: IntroStep[] = [
  {
    title: "Your institutional studio",
    body: (
      <p>
        This dashboard is where you manage your roster and file works on behalf of
        represented artists. Records are attributed to your institution on the
        public catalogue.
      </p>
    ),
    icon: ArtworkIcon,
  },
  {
    title: "Invite and authenticate artists",
    body: (
      <p>
        Send representation invitations to artists you work with. Once they join,
        you can also send per-artwork authentication requests — when an artist
        verifies, a certificate is issued automatically.
      </p>
    ),
    icon: InviteIcon,
  },
  {
    title: "Works, values, and chronology",
    body: (
      <p>
        Register works with prices, mediums, and dimensions. Verified records
        receive certificates and appear on the public registry. Provenance
        transfers can be initiated when ownership changes hands.
      </p>
    ),
    icon: CertificateIcon,
  },
  {
    title: "Institutional presence",
    body: (
      <p>
        Your gallery has a public page on the registry. Control its visibility,
        description, and represented artists from <strong>My Account</strong>.
        All activity is logged in the console sidebar.
      </p>
    ),
    icon: PrivacyIcon,
  },
];
