import AgenteInfo from "@/components/agenteInfo";
import { User, Calendar, Briefcase, DollarSign, Clock } from "lucide-react";
import {
  AgentType,
  AgentTypeLabel,
  AgentTypeIcon,
} from "@/lib/enums/agentType";
import React from "react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  buscarDefaultDashboard,
  buscarRhAgents,
  getEmployeesForAgent,
  getSalaryHistoryForEmployee,
  // getEmployeesByCityForAgent,
} from "./actions/getDefaultDashboard";
import { EmployeesByCityChart } from "@/components/EmployeesByCityChart";
import { SalaryProgressionChart } from "@/components/SalaryProgressionChart";
import EmployeeSelector from "@/components/EmployeeSelector";
import Link from "next/link";
import { format } from "date-fns";
import { Employee } from "@/lib/interface/Employee";
import { SalaryHistory } from "@/lib/interface/SalaryHistory";
// import { EmployeesByCity } from "@/lib/interface/DefaultDashboard";

function getIconForAgentType(agentType: number): React.ReactNode {
  const Icon = AgentTypeIcon[agentType as AgentType];
  return Icon ? <Icon className="w-4 h-4" /> : <div className="w-4 h-4" />;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const agentId = resolvedSearchParams?.agentId as string | undefined;
  const view = resolvedSearchParams?.view as string | undefined;
  const employeeId = resolvedSearchParams?.employeeId as string | undefined;

  const dashboard = await buscarDefaultDashboard();
  const rhAgents = await buscarRhAgents();
  let employees: Employee[] = [];
  let selectedEmployee: Employee | undefined;
  let salaryHistory: SalaryHistory[] = [];

  if (agentId) {
    employees = await getEmployeesForAgent(agentId);
    if (employeeId) {
      selectedEmployee = employees.find((x) => x.employee_id === employeeId);
      salaryHistory = await getSalaryHistoryForEmployee(employeeId);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Seletor de Agente */}
      {!agentId ? (
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
      )}
      {/* Estatísticas Gerais */}
      {!agentId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-6">
          <div className="bg-zinc-900 p-6 rounded-xl xl:col-span-2">
            <p className="text-zinc-400 text-sm">Agentes ativos</p>
            <p className="text-3xl font-bold mt-2">{dashboard.total_agents}</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl xl:col-span-3">
            <p className="text-zinc-400 text-sm">Total de interações</p>
            <p className="text-3xl font-bold mt-2">
              {dashboard.total_interactions}
            </p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl flex-1 xl:col-span-4">
            <p className="text-zinc-400 text-sm mb-4">Interações</p>
            <div className="h-36 flex items-center justify-center text-zinc-500 text-xs italic">
              (Espaço reservado para gráfico de interações)
            </div>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl xl:col-span-1">
            <h2 className="text-lg font-semibold mb-4">
              Interações por Tipo de Agente
            </h2>
            <div className="space-y-4">
              {dashboard.interactions_by_agent_type.map((item, index) => {
                const agentTypeNum = item.agent_type as number;
                return (
                  <AgenteInfo
                    key={index}
                    icon={getIconForAgentType(agentTypeNum)}
                    name={
                      AgentTypeLabel[agentTypeNum as AgentType] ||
                      "Tipo Desconhecido"
                    }
                    value={item.interactions_count.toString()}
                  />
                );
              })}
            </div>
          </div>
        </div>
      ) : (
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
              {/* Espaço para adicionar mais visões no futuro */}
            </div>
          </div>
          {view === "individual" && (
            <div className="bg-zinc-900 p-7 rounded-xl">
              <h2 className="text-lg font-semibold mb-4">
                Selecione um Colaborador:
              </h2>
              <EmployeeSelector employees={employees} agentId={agentId} />
            </div>
          )}
        </div>
      )}

      {/* Informações do Colaborador */}
      {agentId && view === "individual" && selectedEmployee && (
        <div className="bg-zinc-900 p-6 rounded-xl mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Informações do Colaborador
          </h2>

          {/* Nome destacado */}
          <p className="text-5xl font-bold text-center text-white mb-10">
            {selectedEmployee.full_name}
          </p>

          {/* Cards de informações */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <Card className="bg-zinc-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-black">
                  Status
                </CardTitle>
                <User className="h-150 w-150 text-black" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-black">
                  {selectedEmployee.status_description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-black">
                  Situação em que o colaborador se encontra.
                </p>
              </CardFooter>
            </Card>

            <Card className="bg-zinc-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-black">
                  Data de Nascimento
                </CardTitle>
                <Calendar className="h-100 w-100 text-black" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-black">
                  {format(new Date(selectedEmployee.birth_date), "dd/MM/yyyy")}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-black">
                  Data de nascimento do colaborador.
                </p>
              </CardFooter>
            </Card>

            <Card className="bg-zinc-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-black">
                  Tempo de Serviço
                </CardTitle>
                <Clock className="h-150 w-150 text-black" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-black">
                  {calculateLengthOfService(
                    selectedEmployee.admission_date,
                    selectedEmployee.termination_date
                  )}{" "}
                  anos
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-black">
                  Tempo total de serviço do colaborador na empresa.
                </p>
              </CardFooter>
            </Card>

            <Card className="bg-zinc-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-black">
                  Data de Admissão
                </CardTitle>
                <Calendar className="h-100 w-100 text-black" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-black">
                  {format(
                    new Date(selectedEmployee.admission_date),
                    "dd/MM/yyyy"
                  )}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-black">
                  Data em que o colaborador foi admitido na empresa.
                </p>
              </CardFooter>
            </Card>

            <Card className="bg-zinc-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-black">
                  Salário Atual
                </CardTitle>
                <DollarSign className="h-100 w-100 text-black" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-black">
                  R${" "}
                  {typeof selectedEmployee.salary === "number"
                    ? selectedEmployee.salary.toFixed(2)
                    : "N/A"}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-black">
                  Salário atual do colaborador, sem considerar benefícios.
                </p>
              </CardFooter>
            </Card>

            <Card className="bg-zinc-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-black">
                  Centro de Custo
                </CardTitle>
                <Briefcase className="h-100 w-100 text-black" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-black">
                  {selectedEmployee.cost_center_name}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-black">
                  Centro de custo ao qual o colaborador está alocado.
                </p>
              </CardFooter>
            </Card>
          </div>

          {/* Informações de Endereço e Contato */}
          <div className="bg-zinc-600 p-4 mb-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-2 text-black">Endereço</h3>
            <p className="text-2xl font-bold text-black">
              {selectedEmployee.street_address},{" "}
              {selectedEmployee.address_number}, {selectedEmployee.city_name},{" "}
              {selectedEmployee.postal_code}
            </p>
            <p className="mt-2">
              <strong className="text-black">Link do Google Maps:</strong>{" "}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${selectedEmployee.street_address} ${selectedEmployee.address_number}, ${selectedEmployee.city_name}, ${selectedEmployee.postal_code}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:underline"
              >
                Ver no Google Maps
              </a>
            </p>

            <h3 className="text-2xl font-semibold mb-4 mt-4 text-black">
              Contato
            </h3>
            <p className=" text-black">
              <strong>Email:</strong> Não possui
            </p>
            <p className=" text-black">
              <strong>Telefone:</strong> Não possui
            </p>
          </div>

          <div className="bg-zinc-700 p-4 rounded-lg">
            <SalaryProgressionChart salaryHistory={salaryHistory} />
          </div>
        </div>
      )}

      {/* Gráficos Específicos do Agente */}
      {agentId && !view && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-zinc-900 p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4">
              Funcionários por Cidade
            </h2>
            <EmployeesByCityChart />
          </div>
        </div>
      )}

      {!agentId && !view && (
        <div className="text-zinc-500 italic mt-6">
          Selecione um agente para visualizar os dados específicos.
        </div>
      )}
    </div>
  );
}

// function getIconForAgentType(agentType: number) {
//   switch (agentType) {
//     case AgentType.RH:
//       return <PersonStanding />;
//     case AgentType.Sales:
//       return <Users />;
//     case AgentType.Support:
//       return <MessageCircle />;
//     case AgentType.Finance:
//       return <Activity />;
//     default:
//       return <User />;
//   }
// }

function calculateLengthOfService(
  admissionDate: Date,
  terminationDate?: Date
): number {
  const admission = new Date(admissionDate);
  const endDate = terminationDate ? new Date(terminationDate) : new Date();
  const diffInMs = endDate.getTime() - admission.getTime();
  const diffInYears = diffInMs / (1000 * 60 * 60 * 24 * 365.25);
  return Math.floor(diffInYears);
}
