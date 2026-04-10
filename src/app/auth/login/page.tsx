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
      console.log("login success:", authData.token ? "YES" : "NO");
      console.log("login record:", authData.record?.id);
      if (authData.token) {
        const authObj = {
          token: authData.token,
          model: authData.record
        };
        localStorage.setItem("pb_auth", JSON.stringify(authObj));
        console.log("localStorage set:", localStorage.getItem("pb_auth") ? "YES" : "NO");
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Help Desk - Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa tus credenciales
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </button>
          </div>
          
          <div className="text-center">
            <a href="/auth/register" className="text-sm text-blue-600 hover:text-blue-500">
              ¿No tienes cuenta? Regístrate
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
