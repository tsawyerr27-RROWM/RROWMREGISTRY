export default function Navbar() {
  const registryHref = "/field/explorer/records";

  return (

    <div className="w-full border-b border-white/10 bg-neutral-950">

      <div className="max-w-7xl mx-auto px-12 py-6 flex items-center justify-between">

        {/* Logo */}

        <a
          href="/"
          className="text-sm text-white"
        >
          RROWM
        </a>

        {/* Navigation */}

        <div className="flex gap-10 text-sm text-white/70">

          <a
            href={registryHref}
            className="hover:text-white"
          >
            Registry
          </a>

        </div>

      </div>

    </div>

  );

}