import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/studio/creative",
        permanent: true,
      },
      {
        source: "/gallery-dashboard",
        destination: "/studio/organisation",
        permanent: true,
      },
      {
        source: "/gallery/onboarding",
        destination: "/institutional-studio/onboarding",
        permanent: true,
      },
      {
        source: "/gallery/:slug",
        destination: "/field/organisation/:slug",
        permanent: true,
      },
      {
        source: "/collector/:slug",
        destination: "/collector-studio/:slug",
        permanent: true,
      },
      {
        source: "/studio/artwork/:registry_id",
        destination: "/collector-studio/artwork/:registry_id",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
