// app/(app)/agents/[id]/page.tsx

"use client";

import { use, useState } from "react";
import { buscarAgentePorId } from "./agente/actions/getAgenteId";
import { useQuery } from "@tanstack/react-query";
import { useModule } from "@/lib/context/ModuleContext";
import AgentChatRefactored from "@/components/AgentChatRefactored";
import { ModuleType } from "@/lib/interface/Chat";

// Assumindo que você tem uma forma de obter o userId
// Se não tiver, pode usar um valor padrão ou buscar de outro lugar
const getUserId = () => {
  // Implementar conforme sua lógica de autenticação
  // Por exemplo, buscar da sessão, contexto, etc.
  return "user-default"; // Placeholder
};

export default function AgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { currentModule } = useModule();
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const userId = getUserId();

  const { data: agent } = useQuery({
    queryKey: ["agent", id],
    queryFn: () => buscarAgentePorId(currentModule, id),
  });

  // Converter o módulo para o tipo esperado pela API
  const moduleType: ModuleType = currentModule === 1 ? 'people' : 
                                  currentModule === 2 ? 'sales' : 
                                  'finance';

  const handleNewSession = (newSessionId: string) => {
    setCurrentSessionId(newSessionId);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <AgentChatRefactored
        module={moduleType}
        agentId={id}
        userId={userId}
        agentName={agent?.name}
        initialSessionId={currentSessionId}
        onNewSession={handleNewSession}
      />
    </div>
  );
}