"use client";

import { useEffect } from "react";
import { pb } from "@/lib/pocketbase";

export default function LogoutPage() {
  useEffect(() => {
    localStorage.removeItem("pb_auth");
    pb.authStore.clear();
    window.location.href = "/auth/login";
  }, []);

  return <div className="p-8">Cerrando sesión...</div>;
}