"use client";

import { createContext, useContext } from "react";

const RegistryCatalogueShellContext = createContext(false);

export function RegistryCatalogueShellProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RegistryCatalogueShellContext.Provider value>
      {children}
    </RegistryCatalogueShellContext.Provider>
  );
}

export function useRegistryCatalogueShell(): boolean {
  return useContext(RegistryCatalogueShellContext);
}
