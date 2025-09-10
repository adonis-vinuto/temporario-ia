"use client";
import { useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
   const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session && status === "authenticated") {
      signOut({ redirect: false }).then(() => {
      });
      return;
    }

    if (status === "unauthenticated") {
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