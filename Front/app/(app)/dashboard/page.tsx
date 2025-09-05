import React from "react";
import AgenteInfo from "@/components/agenteInfo";
// import { User, Calendar, Briefcase, DollarSign, Clock } from "lucide-react";
import {
  AgentType,
  AgentTypeLabel,
  AgentTypeIcon,
} from "@/lib/enums/agentType";
import { Module } from "@/lib/enums/module";

import {
  //Card,
  // CardContent,
  // CardFooter,
  // CardHeader,
  // CardTitle,
} from "@/components/ui/card";
import {
  buscarDefaultDashboard,
  // Comentadas temporariamente - APIs ainda não estão prontas
  // buscarRhAgents,
  // getEmployeesForAgent,
  // getSalaryHistoryForEmployee,
  // getEmployeesByCityForAgent,
} from "./actions/getDefaultDashboard";
// import { EmployeesByCityChart } from "@/components/EmployeesByCityChart";
// import { SalaryProgressionChart } from "@/components/SalaryProgressionChart";
// import EmployeeSelector from "@/components/EmployeeSelector";
// import Link from "next/link";
// import { format } from "date-fns";
// import { Employee } from "@/lib/interface/Employee";
// import { SalaryHistory } from "@/lib/interface/SalaryHistory";
// import { EmployeesByCity } from "@/lib/interface/DefaultDashboard";

function getIconForAgentType(agentType: number): React.ReactNode {
  const Icon = AgentTypeIcon[agentType as AgentType];
  return Icon ? <Icon className="w-4 h-4" /> : <div className="w-4 h-4" />;
}

export default async function DashboardPage({
  // searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // const resolvedSearchParams = await searchParams;
  // const agentId = resolvedSearchParams?.agentId as string | undefined;
  // const view = resolvedSearchParams?.view as string | undefined;
  // const employeeId = resolvedSearchParams?.employeeId as string | undefined;

  // Usando módulo People por padrão - você pode ajustar conforme necessário
  const dashboard = await buscarDefaultDashboard(Module.People);
  
  // Comentado temporariamente - APIs ainda não estão prontas
  // const rhAgents = await buscarRhAgents();
  // let employees: Employee[] = [];
  // let selectedEmployee: Employee | undefined;
  // let salaryHistory: SalaryHistory[] = [];

  // if (agentId) {
  //   employees = await getEmployeesForAgent(agentId);
  //   if (employeeId) {
  //     selectedEmployee = employees.find((x) => x.employee_id === employeeId);
  //     salaryHistory = await getSalaryHistoryForEmployee(employeeId);
  //   }
  // }

  return (
    <div className="flex bg-background text-foreground">
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold">Dashboard</h2>
        </header>

      {/* Seletor de Agente - Comentado temporariamente */}
      {/* {!agentId ? (
        <>
          <h2 className="text-lg font-semibold mb-2">Selecione um Agente:</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            <Link
              href="/dashboard"
              className={`p-3 rounded-lg ${
                agentId === undefined
                  ? "bg-purple-800 text-white"
                  : "bg-zinc-900 text-zinc-300 hover:bg-zinc-700"
              } transition-colors duration-200`}
            >
              Todos os Agentes
            </Link>
            {rhAgents.map((agent) => (
              <Link
                key={agent.id}
                href={`/dashboard?agentId=${agent.id}`}
                className={`p-3 rounded-lg ${
                  agentId === String(agent.id)
                    ? "bg-purple-800 text-white"
                    : "bg-zinc-900 text-zinc-300 hover:bg-zinc-700"
                } transition-colors duration-200`}
              >
                Agente: {agent.name}
              </Link>
            ))}
          </div>
        </>
      ) : (
        <></>
      )} */}

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-6">
        <div className="bg-sidebar p-6 rounded-xl xl:col-span-2">
          <p className="text-zinc-400 text-sm">Agentes ativos</p>
          <p className="text-3xl font-bold mt-2">{dashboard["total-agents"]}</p>
        </div>
        <div className="bg-sidebar p-6 rounded-xl xl:col-span-3">
          <p className="text-zinc-400 text-sm">Total de interações</p>
          <p className="text-3xl font-bold mt-2">
            {dashboard["total-interactions"]}
          </p>
        </div>
        <div className="bg-sidebar p-6 rounded-xl flex-1 xl:col-span-4">
          <p className="text-zinc-400 text-sm mb-4">Interações</p>
          <div className="h-36 flex items-center justify-center text-zinc-500 text-xs italic">
            (Espaço reservado para gráfico de interações)
          </div>
        </div>
        <div className="bg-sidebar p-6 rounded-xl xl:col-span-1">
          <h2 className="text-lg font-semibold mb-4">
            Interações por Tipo de Agente
          </h2>
          <div className="space-y-4">
            {dashboard["interactions-by-agent-type"].map((item, index) => {
              const agentTypeNum = item["agent-type"] as number;
              return (
                <AgenteInfo
                  key={index}
                  icon={getIconForAgentType(agentTypeNum)}
                  name={
                    AgentTypeLabel[agentTypeNum as AgentType] ||
                    "Tipo Desconhecido"
                  }
                  value={item["interactions-count"].toString()}
                />
              );
            })}
          </div>
        </div>
              </div>

        {/* Seção de seleção detalhada - Comentada temporariamente */}
        {/* {agentId ? (
          <div className="flex gap-6 mb-6">
            <div className="bg-zinc-900 p-8 rounded-xl">
              <h2 className="text-lg font-semibold mb-2">Selecione um Agente:</h2>
              <div className="flex flex-wrap gap-2 mb-6">
                <Link
                  href="/dashboard"
                  className={`p-3 rounded-lg ${
                    agentId === undefined
                      ? "bg-purple-800 text-white"
                      : "bg-zinc-900 text-zinc-300 hover:bg-zinc-700"
                  } transition-colors duration-200`}
                >
                  Todos os Agentes
                </Link>
                {rhAgents.map((agent) => (
                  <Link
                    key={agent.id}
                    href={`/dashboard?agentId=${agent.id}`}
                    className={`p-3 rounded-lg ${
                      agentId === String(agent.id)
                        ? "bg-purple-800 text-white"
                        : "bg-zinc-900 text-zinc-300 hover:bg-zinc-700"
                    } transition-colors duration-200`}
                  >
                    Agente: {agent.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <></>
        )} */}
      {/* {agentId ? (
        <div className="flex gap-6 mb-6">
          <div className="bg-zinc-900 p-8 rounded-xl">
            <h2 className="text-lg font-semibold mb-2">Selecione um Agente:</h2>
            <div className="flex flex-wrap gap-2 mb-6">
              <Link
                href="/dashboard"
                className={`p-3 rounded-lg ${
                  agentId === undefined
                    ? "bg-purple-800 text-white"
                    : "bg-zinc-900 text-zinc-300 hover:bg-zinc-700"
                } transition-colors duration-200`}
              >
                Todos os Agentes
              </Link>
              {rhAgents.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/dashboard?agentId=${agent.id}`}
                  className={`p-3 rounded-lg ${
                    agentId === String(agent.id)
                      ? "bg-purple-800 text-white"
                      : "bg-zinc-900 text-zinc-300 hover:bg-zinc-700"
                  } transition-colors duration-200`}
                >
                  Agente: {agent.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="bg-zinc-900 p-8 rounded-xl">
            <h2 className="text-lg font-semibold mb-4">
              Informações do Agente Selecionado:
            </h2>
            <AgenteInfo
              icon={getIconForAgentType(
                rhAgents.find((agent) => agent.id === Number(agentId))
                  ?.agent_type || AgentType.Standard
              )}
              name={
                rhAgents.find((agent) => agent.id === Number(agentId))?.name ||
                "Agente Desconhecido"
              }
              value={`ID: ${agentId}`}
            />
          </div>
          <div className="bg-zinc-900 p-8 rounded-xl">
            <h2 className="text-lg font-semibold mb-4">
              Selecione a Visão do Dashboard:
            </h2>
            <div className="flex gap-2">
              <Link
                href={`/dashboard?agentId=${agentId}&view=individual`}
                className={`p-3 rounded-lg ${
                  view === "individual"
                    ? "bg-purple-800 text-white"
                    : "bg-zinc-900 text-zinc-300 hover:bg-zinc-700"
                } transition-colors duration-200`}
              >
                Individual
              </Link>
              <Link
                href={`/dashboard?agentId=${agentId}&view=comparison`}
                className={`p-3 rounded-lg ${
                  view === "comparison"
                    ? "bg-purple-800 text-white"
                    : "bg-zinc-900 text-zinc-300 hover:bg-zinc-700"
                } transition-colors duration-200`}
              >
                Comparativo
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )} */}

      {/* Seções de conteúdo avançado - Comentadas temporariamente */}
      {/* {view === "individual" && agentId ? (
        <div className="bg-zinc-900 p-8 rounded-xl mb-6">
          <h2 className="text-lg font-semibold mb-4">Visão Individual</h2>
          <EmployeeSelector
            employees={employees}
            agentId={agentId}
            selectedEmployeeId={employeeId}
          />

          {selectedEmployee ? (
            <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-8">
              <Card className="bg-zinc-800 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-400" />
                    Informações do Colaborador
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-zinc-300 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-zinc-500">Nome</p>
                      <p className="font-medium">{selectedEmployee.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">ID</p>
                      <p className="font-medium">{selectedEmployee.employee_id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-zinc-500">Cidade</p>
                      <p className="font-medium">{selectedEmployee.city}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">Estado</p>
                      <p className="font-medium">{selectedEmployee.state}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-zinc-500">Salário Atual</p>
                      <p className="font-medium text-green-400">
                        R${" "}
                        {selectedEmployee.current_salary.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">Data de Admissão</p>
                      <p className="font-medium">
                        {format(
                          new Date(selectedEmployee.admission_date),
                          "dd/MM/yyyy"
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-800 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    Progressão Salarial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SalaryProgressionChart salaryHistory={salaryHistory} />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="mt-8 flex items-center justify-center h-32 text-zinc-500">
              Selecione um colaborador para ver as informações detalhadas
            </div>
          )}
        </div>
      ) : null} */}

      <div className="mt-8 p-4 bg-sidebar rounded-lg">
        <p className="text-zinc-400 text-sm">
          📝 <strong>Funcionalidades temporariamente desabilitadas: </strong> 
          As seções de agentes, colaboradores e análises detalhadas estão comentadas até que as respectivas APIs sejam implementadas.
          Atualmente, apenas a visualização das estatísticas gerais está ativa usando a nova rota <code>/api/{'module'}/dashboard</code>.
        </p>
      </div>
      </main>
    </div>
  );
}