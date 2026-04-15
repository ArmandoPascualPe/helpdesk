"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { pb } from "@/lib/pocketbase";

export default function ConfirmPasswordResetPage() {
  const params = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get token from route param first
    const tokenParam = params.token as string;
    if (tokenParam) {
      setToken(tokenParam);
      return;
    }
    
    // Fallback: check hash (PocketBase uses hash routing)
    const hash = window.location.hash;
    if (hash.includes("confirm-password-reset/")) {
      const tokenFromHash = hash.split("confirm-password-reset/")[1]?.replace("#", "");
      if (tokenFromHash) {
        setToken(tokenFromHash);
      }
    }
  }, [params.token]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!token) {
      setMessage("Token inválido");
      setLoading(false);
      return;
    }

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
      await pb.collection("usuarios").confirmPasswordReset(token, password, confirmPassword);
      setSuccess(true);
      setMessage("Contraseña actualizada correctamente.");
    } catch (err: any) {
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
            {success ? "Listo" : "Nueva Contraseña"}
          </h1>
        </div>

        <div className="rounded-3xl p-10 shadow-xl border opacity-0 animate-fade-in-up animation-delay-200 bg-[rgba(253,252,249,0.8)]" style={{ borderColor: 'rgba(212, 196, 168, 0.3)' }}>
          {message && (
            <div className={`py-3 px-4 rounded-lg text-center text-sm mb-6 ${success ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
              {message}
            </div>
          )}

          {!token && !message && (
            <div className="text-center py-4">
              <p className="text-gray-600">Cargando...</p>
            </div>
          )}

          {!success && token && (
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

          {success && (
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