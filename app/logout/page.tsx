"use client";

import { useEffect } from "react";

import { signOutAndRedirect } from "@/lib/auth-sign-out";

export default function LogoutPage() {
  useEffect(() => {
    void signOutAndRedirect("/login");
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center rrowm-bg-page px-6 py-24 pt-28">
      <p className="text-sm text-neutral-600">Signing you out…</p>
    </main>
  );
}
