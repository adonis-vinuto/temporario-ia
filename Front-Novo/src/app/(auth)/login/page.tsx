"use client";
import { useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
   const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Se tem sessão ativa, limpa ela primeiro
    if (session && status === "authenticated") {
      console.log("Limpando sessão anterior...");
      signOut({ redirect: false }).then(() => {
        console.log("Sessão limpa");
      });
      return;
    }

    // Se não tem sessão e não está carregando, redireciona para Keycloak
    if (status === "unauthenticated") {
      console.log("Redirecionando para Keycloak...");
      signIn("keycloak", { callbackUrl: "/agents" });
    }
  }, [session, status, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <p>Redirecionando para login...</p>
      </div>
    </div>
  );
}