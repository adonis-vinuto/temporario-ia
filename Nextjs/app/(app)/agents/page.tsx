"use client";

import { useEffect, useState } from "react";
import AgentCard from "@/components/agentCard";
import CreateAgente from "@/components/createAgente";
import { listAgents } from "./api/getAgents";
import { BotIcon } from "lucide-react";
import { AgentData } from "@/lib/interface/Agent";
import { useModule } from "@/lib/context/ModuleContext";

export default function AgentsPage() {
  const [agentes, setAgentes] = useState<AgentData[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentModule } = useModule();

  useEffect(() => {
    listAgents(currentModule)
      .then(setAgentes)
      .catch((err) => {
        console.error("Erro ao buscar agentes:", err);
        setAgentes([]);
      })
      .finally(() => setLoading(false));
  }, [currentModule]);

  return (
    <div className="flex bg-background text-foreground">
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold">Agentes</h2>
          <CreateAgente />
        </header>

        {loading ? (
          <p className="text-zinc-400">Carregando agentes...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {agentes.map((agente) => (
              <AgentCard
                key={agente.id}
                id={agente.id}
                Icon={BotIcon}
                title={agente.name}
                description={agente.description}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
