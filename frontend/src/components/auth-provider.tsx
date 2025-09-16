"use client";

import { SessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Assurer que le composant est monté côté client avant de rendre le contenu
  // mais toujours envelopper dans SessionProvider pour éviter les erreurs
  if (!mounted) {
    return (
      <SessionProvider>
        <div style={{ visibility: "hidden" }}>{children}</div>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}