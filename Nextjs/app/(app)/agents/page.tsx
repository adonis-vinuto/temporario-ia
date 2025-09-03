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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentModule } = useModule();

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      setError(null);
      setAgentes([]); // Reset para array vazio
      
      try {
        console.log('Buscando agentes para módulo:', currentModule);
        const agents = await listAgents(currentModule);
        
        console.log('Resposta recebida no componente:', {
          tipo: typeof agents,
          isArray: Array.isArray(agents),
          length: Array.isArray(agents) ? agents.length : 'N/A',
          content: agents
        });
        
        // Triple check: garantir que é array
        if (Array.isArray(agents)) {
          setAgentes(agents);
          console.log(`✅ ${agents.length} agentes carregados com sucesso`);
        } else {
          console.error('❌ Resposta não é um array:', agents);
          setError('Formato de dados inválido recebido da API');
          setAgentes([]);
        }
        
      } catch (err) {
        console.error("❌ Erro ao buscar agentes:", err);
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao buscar agentes";
        setError(errorMessage);
        setAgentes([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentModule !== undefined && currentModule !== null) {
      fetchAgents();
    }
  }, [currentModule]);

  // Função para renderizar cada agente com tratamento de erro individual
  const renderAgentCard = (agente: AgentData, index: number) => {
    try {
      return (
        <AgentCard
          key={agente.id || `agent-${index}`}
          id={agente.id}
          Icon={BotIcon}
          title={agente.name || 'Sem nome'}
          description={agente.description || 'Sem descrição'}
        />
      );
    } catch (cardError) {
      console.error('Erro ao renderizar card do agente:', cardError, agente);
      return (
        <div key={`error-${index}`} className="p-4 border border-red-300 bg-red-50 rounded-md">
          <p className="text-red-600 text-sm">Erro ao carregar agente</p>
        </div>
      );
    }
  };

  return (
    <div className="flex bg-background text-foreground">
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold">Agentes</h2>
          <CreateAgente />
        </header>
        
        {/* Debug info - remover em produção */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
            <p>Debug: currentModule = {currentModule}, agentes.length = {agentes?.length || 0}</p>
          </div>
        )} */}
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-zinc-400 border-t-transparent rounded-full"></div>
              <p className="text-zinc-400">Carregando agentes...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-red-400 mb-2">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : !Array.isArray(agentes) ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-orange-400">Dados inválidos recebidos. Verifique o console para mais detalhes.</p>
          </div>
        ) : agentes.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <BotIcon size={48} className="mx-auto mb-2 text-zinc-400" />
              <p className="text-zinc-400">Nenhum agente encontrado.</p>
              <p className="text-zinc-500 text-sm mt-1">Crie seu primeiro agente para começar.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {agentes.map((agente, index) => renderAgentCard(agente, index))}
            </div>
            
            <div className="text-center text-zinc-400 text-sm mt-6">
              {agentes.length === 1 ? '1 agente encontrado' : `${agentes.length} agentes encontrados`}
            </div>
          </>
        )}
      </main>
    </div>
  );
}