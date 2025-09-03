"use server";
import { Module, ModuleNames } from "@/lib/enums/module";
import { AgentData } from "@/lib/interface/Agent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface ApiResponse {
  totalPaginas?: number;
  totalItens?: number;
  indice?: number;
  tamanhoPagina?: number;
  itens?: any;
  // Campos alternativos caso a estrutura seja diferente
  data?: any[];
  agents?: any[];
  results?: any[];
}

export async function listAgents(module: Module): Promise<AgentData[]> {
  // Obter a sessão do servidor para pegar o token
  const session = await getServerSession(authOptions);
 
  if (!session?.accessToken) {
    throw new Error("Token de autenticação não encontrado. Por favor, faça login novamente.");
  }
  
  const response = await fetch(
    `${process.env.API_URL}/api/${ModuleNames[module]}/agents`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Adicionar o token no header Authorization
        "Authorization": `Bearer ${session.accessToken}`,
      },
    }
  );
  
  if (!response.ok) {
    // Se o erro for 401, provavelmente o token expirou
    if (response.status === 401) {
      throw new Error("Sessão expirada. Por favor, faça login novamente.");
    }
    throw new Error(`Erro ao buscar agentes: ${response.status} ${response.statusText}`);
  }
  
  const rawResponse: ApiResponse = await response.json();
  
  // Debug: log da resposta para entender a estrutura
  console.log('=== RESPOSTA DA API ===');
  console.log(JSON.stringify(rawResponse, null, 2));
  
  // Função helper para extrair agentes de diferentes estruturas possíveis
  function extractAgents(response: any): AgentData[] {
    // Caso 1: Resposta paginada com itens como array de arrays
    if (response?.itens && Array.isArray(response.itens)) {
      if (response.itens.length > 0 && Array.isArray(response.itens[0])) {
        console.log('Estrutura: itens[0] é array');
        return response.itens[0];
      }
      
      // Caso 2: Resposta paginada com itens como array direto
      if (response.itens.length > 0 && typeof response.itens[0] === 'object' && response.itens[0].id) {
        console.log('Estrutura: itens é array direto de objetos');
        return response.itens;
      }
    }
    
    // Caso 3: Array direto (não paginado)
    if (Array.isArray(response)) {
      console.log('Estrutura: array direto');
      return response;
    }
    
    // Caso 4: Campos alternativos
    if (response?.data && Array.isArray(response.data)) {
      console.log('Estrutura: campo data');
      return response.data;
    }
    
    if (response?.agents && Array.isArray(response.agents)) {
      console.log('Estrutura: campo agents');
      return response.agents;
    }
    
    if (response?.results && Array.isArray(response.results)) {
      console.log('Estrutura: campo results');
      return response.results;
    }
    
    console.log('Estrutura não reconhecida, retornando array vazio');
    return [];
  }
  
  let agents = extractAgents(rawResponse);
  
  // Validação final: garantir que é um array
  if (!Array.isArray(agents)) {
    console.error('Resultado não é um array:', typeof agents, agents);
    agents = [];
  }
  
  // Validar estrutura dos objetos no array
  agents = agents.filter(agent => {
    if (!agent || typeof agent !== 'object') {
      console.warn('Item inválido encontrado:', agent);
      return false;
    }
    
    // Verificar se tem os campos obrigatórios
    if (!agent.name && !agent.description) {
      console.warn('Item sem campos obrigatórios:', agent);
      return false;
    }
    
    return true;
  });
  
  console.log(`Agentes extraídos e validados: ${agents.length} items`);
  console.log('Primeiro agente:', agents[0]);
  
  return agents;
}

// Função para casos onde você precisa dos dados de paginação completos
export async function listAgentsWithPagination(
  module: Module,
  page: number = 0,
  pageSize: number = 10
): Promise<{agents: AgentData[], pagination: any}> {
  
  const session = await getServerSession(authOptions);
 
  if (!session?.accessToken) {
    throw new Error("Token de autenticação não encontrado.");
  }
  
  const url = `${process.env.API_URL}/api/${ModuleNames[module]}/agent?page=${page}&size=${pageSize}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.accessToken}`,
    },
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Sessão expirada. Por favor, faça login novamente.");
    }
    throw new Error(`Erro ao buscar agentes: ${response.status}`);
  }
  
  const rawResponse = await response.json();
  const agents = await listAgents(module); // Reutiliza a lógica de extração
  
  return {
    agents,
    pagination: {
      totalPages: rawResponse.totalPaginas || 0,
      totalItems: rawResponse.totalItens || 0,
      currentPage: rawResponse.indice || 0,
      pageSize: rawResponse.tamanhoPagina || 10
    }
  };
}