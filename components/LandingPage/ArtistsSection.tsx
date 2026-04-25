import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";

const ARTIST_FEATURES = [
  "Register unlimited artworks",
  "Issue verified certificates",
  "Track ownership transfers",
  "Record value history",
  "Control visibility settings",
  "Export registry data",
];

export function ArtistsSection() {
  return (
    <section className="py-24 md:py-32">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <PageHeader
              title="Register and verify artworks"
              description="Artists and verified galleries can register artworks, issue certificates, and record complete provenance history with full control over visibility and access."
            />
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/get-started"
                className="px-8 py-4 rounded-xl bg-black text-white hover:bg-neutral-800 transition-all duration-300 text-center font-medium hover:shadow-xl"
              >
                Sign In
              </a>
              <a
                href="/get-started"
                className="px-8 py-4 rounded-xl border border-black/10 bg-white/50 backdrop-blur hover:bg-white/80 transition-all duration-300 text-center font-medium"
              >
                Create Account
              </a>
            </div>
          </div>

          <div className="space-y-4">
            {ARTIST_FEATURES.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-neutral-900"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-neutral-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

