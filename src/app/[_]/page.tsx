"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UnderscoreRoute() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    
    if (hash.includes("confirm-password-reset/")) {
      const token = hash.split("confirm-password-reset/")[1]?.replace("#", "");
      if (token) {
        router.replace(`/auth/confirm-password-reset/${token}`);
        return;
      }
    }
    
    if (hash.includes("verify/")) {
      const token = hash.split("verify/")[1]?.replace("#", "");
      if (token) {
        router.replace(`/auth/verify?token=${token}`);
        return;
      }
    }
    
    router.replace("/auth/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--beige-light)]">
      <p className="text-[var(--text-muted)]">Cargando...</p>
    </div>
  );
}