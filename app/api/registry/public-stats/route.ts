import { NextResponse } from "next/server";

import { fetchLandingPublicStats } from "@/lib/landing-public-stats";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET() {
  try {
    const stats = await fetchLandingPublicStats();
    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[public-stats]", error);
    return NextResponse.json(
      {
        worksRegistered: 0,
        artistsOnboarded: 0,
        valueFilings: 0,
        provenanceEvents: 0,
        fetchedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
