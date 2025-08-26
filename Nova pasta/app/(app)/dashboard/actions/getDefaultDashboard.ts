"use server";

import { DefaultDashboard } from "../../../../lib/interface/DefaultDashboard";
import { AgenteRh } from "../../../../lib/interface/AgenteRh";
import { Employee } from "../../../../lib/interface/Employee";
import { SalaryHistory } from "../../../../lib/interface/SalaryHistory";

export async function buscarDefaultDashboard(): Promise<DefaultDashboard> {
  const response = await fetch(`${process.env.API_URL}/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar dashboard`);
  }

  const dashboard: DefaultDashboard = await response.json();
  return dashboard;
}

export async function buscarRhAgents(): Promise<AgenteRh[]> {
  const response = await fetch(`${process.env.API_URL}/getAgentsRhFunction`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar agentes RH`);
  }

  const agents: AgenteRh[] = await response.json();

  return agents;
}

export async function getEmployeesForAgent(id: string): Promise<Employee[]> {
  const response = await fetch(`${process.env.API_URL}/getEmployeeFunction/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar colaboradores`);
  }

  const employees: Employee[] = await response.json();

  return employees;
}

export async function getSalaryHistoryForEmployee(id: string):  Promise<SalaryHistory[]> {
  const response = await fetch(`${process.env.API_URL}/getSalaryHistoryFunction/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar histórico salarial`);
  }

  const salaryHistory: SalaryHistory[] = await response.json();

  return salaryHistory;
}


// export async function getEmployeesByCityForAgent(agentId: string): Promise<EmployeesByCity[]> {
//   const response = await fetch(`${process.env.API_URL}/getEmployeesByCity?agentId=${agentId}`, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });

//   if (!response.ok) {
//     throw new Error(`Erro ao buscar funcionários por cidade para o agente ${agentId}`);
//   }

//   const data: EmployeesByCity[] = await response.json();
//   return data;
// }