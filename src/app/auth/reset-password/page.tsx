"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  const tokenFromHash = hash.includes("confirm-password-reset/") 
    ? hash.split("confirm-password-reset/")[1] 
    : null;
  const token = searchParams.get("token") || tokenFromHash;
  const [mode, setMode] = useState<"request" | "form" | "success" | "error">("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    let tokenToUse = token;
    
    if (hash.includes("confirm-password-reset/")) {
      const tokenFromHash = hash.split("confirm-password-reset/")[1]?.replace("#", "");
      if (tokenFromHash) {
        tokenToUse = tokenFromHash;
      }
    }
    
    if (tokenToUse) {
      setMode("form");
    }
  }, [token]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await pb.collection("usuarios").requestPasswordReset(email);
      setMode("success");
      setMessage("Te hemos enviado un email con las instrucciones para restablecer tu contraseña.");
    } catch (err: any) {
      setMessage(err.message || "Error al solicitar reset de contraseña");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setMessage("La contraseña debe tener al menos 8 caracteres");
      setLoading(false);
      return;
    }

    try {
      await pb.collection("usuarios").confirmPasswordReset(token!, password);
      setMode("success");
      setMessage("Contraseña actualizada correctamente.");
    } catch (err: any) {
      setMode("error");
      setMessage(err.message || "Error al restablecer contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--beige-light)]">
      <div className="absolute inset-0 opacity-30 bg-[var(--beige-light)]">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(139, 154, 109, 0.2)' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(107, 122, 77, 0.1)' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-8">
        <div className="text-center mb-12 opacity-0 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 bg-[var(--olive-dark)]">
            <svg className="w-8 h-8 text-[var(--beige-light)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--olive-deep)]" style={{ fontFamily: "var(--font-cormorant)" }}>
            {mode === "form" ? "Nueva Contraseña" : mode === "success" ? "Listo" : "Recuperar Contraseña"}
          </h1>
        </div>

        <div className="rounded-3xl p-10 shadow-xl border opacity-0 animate-fade-in-up animation-delay-200 bg-[rgba(253,252,249,0.8)]" style={{ borderColor: 'rgba(212, 196, 168, 0.3)' }}>
          {message && (
            <div className={`py-3 px-4 rounded-lg text-center text-sm mb-6 ${mode === "error" ? "bg-red-50 text-red-700 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"}`}>
              {message}
            </div>
          )}

          {mode === "request" && (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl border bg-white text-sm transition-all duration-300 placeholder:text-gray-400"
                  style={{ borderColor: 'rgba(212, 196, 168, 0.5)', color: 'var(--text-primary)' }}
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl font-medium tracking-wide transition-all duration-300 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed bg-[var(--olive-dark)] text-[var(--beige-light)]"
              >
                {loading ? "Enviando..." : "Enviar Instrucciones"}
              </button>
            </form>
          )}

          {mode === "form" && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Nueva Contraseña</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="w-full px-4 py-3 rounded-xl border bg-white text-sm transition-all duration-300 placeholder:text-gray-400"
                  style={{ borderColor: 'rgba(212, 196, 168, 0.5)', color: 'var(--text-primary)' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Confirmar Contraseña</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="w-full px-4 py-3 rounded-xl border bg-white text-sm transition-all duration-300 placeholder:text-gray-400"
                  style={{ borderColor: 'rgba(212, 196, 168, 0.5)', color: 'var(--text-primary)' }}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl font-medium tracking-wide transition-all duration-300 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed bg-[var(--olive-dark)] text-[var(--beige-light)]"
              >
                {loading ? "Actualizando..." : "Cambiar Contraseña"}
              </button>
            </form>
          )}

          {mode === "success" && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <a
                href="/auth/login"
                className="mt-6 inline-block px-6 py-3 rounded-xl bg-[var(--olive-dark)] text-[var(--beige-light)]"
              >
                Ir al Login
              </a>
            </div>
          )}

          <div className="mt-8 pt-6 text-center border-t border-[rgba(212,196,168,0.2)]">
            <p className="text-sm text-[var(--text-muted)]">
              <a href="/auth/login" className="font-medium transition-colors text-[var(--olive-medium)] hover:text-[var(--olive-dark)]">
                Volver al Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}