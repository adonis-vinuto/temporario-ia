"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AgentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Verificação adicional no cliente
  useEffect(() => {
    if (status === "loading") return; // Ainda carregando
    
    if (status === "unauthenticated" || !session) {
      console.log("Não autenticado, redirecionando...");
      router.push("/login");
    }
  }, [session, status, router]);

  // Mostra loading enquanto verifica
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Verificando autenticação...</div>
      </div>
    );
  }

  // Se não tem sessão, não renderiza nada (vai redirecionar)
  if (!session) {
    return null;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Agentes</h1>
      
      {/* Debug info */}
      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="font-semibold mb-2">Informações de Debug:</h2>
        <pre className="text-sm">
          {JSON.stringify({
            authenticated: status === "authenticated",
            user: session?.user,
            hasToken: !!session?.accessToken
          }, null, 2)}
        </pre>
      </div>
      
      <div className="mt-6">
        <p className="text-muted-foreground">
          Esta página está protegida e só pode ser acessada por usuários autenticados.
        </p>
      </div>
    </div>
  );
}