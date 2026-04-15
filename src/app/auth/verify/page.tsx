"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verificando tu email...");

  useEffect(() => {
    const hash = window.location.hash;
    let tokenToUse = searchParams.get("token");
    
    if (hash.includes("confirm-verification/")) {
      const tokenFromHash = hash.split("confirm-verification/")[1]?.replace("#", "");
      if (tokenFromHash) {
        tokenToUse = tokenFromHash;
      }
    }
    
    if (!tokenToUse) {
      setStatus("error");
      setMessage("Token de verificación no proporcionado");
      return;
    }

    const verify = async () => {
      try {
        await pb.collection("usuarios").confirmVerification(tokenToUse!);
        setStatus("success");
        setMessage("¡Email verificado correctamente!");
        setTimeout(() => router.push("/auth/login"), 3000);
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Error al verificar email");
      }
    };

    verify();
  }, [router, tokenToUse]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--beige-light)]">
      <div className="absolute inset-0 opacity-30 bg-[var(--beige-light)]">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(139, 154, 109, 0.2)' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(107, 122, 77, 0.1)' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-8">
        <div className="rounded-3xl p-10 shadow-xl border bg-[rgba(253,252,249,0.8)]" style={{ borderColor: 'rgba(212, 196, 168, 0.3)' }}>
          <div className="text-center">
            {status === "loading" && (
              <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-[var(--olive-light)]">
                <svg className="animate-spin h-8 w-8 text-[var(--olive-dark)]" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}
            {status === "success" && (
              <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {status === "error" && (
              <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-red-100">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}

            <h1 className="text-2xl font-medium mb-4 text-[var(--olive-deep)]" style={{ fontFamily: "var(--font-cormorant)" }}>
              {status === "success" ? "Verificación Exitosa" : status === "error" ? "Error de Verificación" : "Verificando"}
            </h1>
            <p className="text-[var(--text-secondary)]">{message}</p>

            {status === "success" && (
              <p className="mt-4 text-sm text-[var(--text-muted)]">
                Serás redirigido al login en unos segundos...
              </p>
            )}

            {status === "error" && (
              <a
                href="/auth/login"
                className="mt-6 inline-block px-6 py-2 rounded-xl bg-[var(--olive-dark)] text-[var(--beige-light)]"
              >
                Volver al Login
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}