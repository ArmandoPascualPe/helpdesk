"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const authData = await pb.collection('usuarios').authWithPassword(email, password);
      if (authData.token) {
        const authObj = {
          token: authData.token,
          model: authData.record
        };
        localStorage.setItem("pb_auth", JSON.stringify(authObj));
        document.cookie = `pb_auth=${encodeURIComponent(JSON.stringify(authObj))}; path=/; max-age=604800`;
        router.push("/dashboard/tickets");
      }
    } catch (err: any) {
      setError(err.message || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--beige-light)]">
      <div className="absolute inset-0 opacity-30 bg-[var(--beige-light)]">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(139, 154, 109, 0.2)' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(107, 122, 77, 0.1)' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl" style={{ backgroundColor: 'rgba(232, 223, 208, 0.3)' }}></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md px-8">
        <div className="text-center mb-12 opacity-0 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 animate-float bg-[var(--olive-dark)]">
            <svg className="w-8 h-8 text-[var(--beige-light)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h1 className="text-5xl font-semibold tracking-tight text-[var(--olive-deep)]" style={{ fontFamily: "var(--font-cormorant)" }}>
            Help Desk
          </h1>
          <p className="mt-4 text-2xl tracking-wide text-[var(--text-secondary)]" style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}>
            Sistema de gestión de tickets
          </p>
        </div>

        <div className="rounded-3xl p-10 shadow-xl border opacity-0 animate-fade-in-up animation-delay-200 bg-[rgba(253,252,249,0.8)]" style={{ boxShadow: '0 20px 40px rgba(46, 58, 32, 0.05)', borderColor: 'rgba(212, 196, 168, 0.3)' }}>
          <h2 className="text-3xl font-medium mb-8 text-center text-[var(--olive-deep)]" style={{ fontFamily: "var(--font-cormorant)" }}>
            Bienvenido
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="py-3 px-4 rounded-lg text-center text-sm bg-red-50 text-red-700 border border-red-100">
                {error}
              </div>
            )}
            
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
            
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Contraseña</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border bg-white text-sm transition-all duration-300 placeholder:text-gray-400"
                style={{ borderColor: 'rgba(212, 196, 168, 0.5)', color: 'var(--text-primary)' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="text-right">
              <a href="/auth/reset-password" className="text-xs text-[var(--text-muted)] hover:text-[var(--olive-medium)] transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-medium tracking-wide transition-all duration-300 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed bg-[var(--olive-dark)] text-[var(--beige-light)]"
              style={{ boxShadow: '0 10px 30px rgba(46, 58, 32, 0.1)' }}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Ingresando...
                </span>
              ) : "Iniciar Sesión"}
            </button>
          </form>
          
          <div className="mt-8 pt-6 text-center border-t border-[rgba(212,196,168,0.2)]">
            <p className="text-sm text-[var(--text-muted)]">
              ¿No tienes cuenta?{" "}
              <a href="/auth/register" className="font-medium transition-colors text-[var(--olive-medium)] hover:text-[var(--olive-dark)]">
                Regístrate
              </a>
            </p>
          </div>
        </div>
        
        <p className="text-center mt-8 text-xs opacity-0 animate-fade-in-up animation-delay-400 text-[rgba(139,154,109,0.6)]">
          TechSupport Solutions S.A.
        </p>
      </div>
    </div>
  );
}