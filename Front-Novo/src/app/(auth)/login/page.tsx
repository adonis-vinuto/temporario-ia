"use client";
import { useEffect } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  useEffect(() => {
    signIn("keycloak", { callbackUrl: "/agents" });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <p>Redirecionando para login...</p>
      </div>
    </div>
  );
}