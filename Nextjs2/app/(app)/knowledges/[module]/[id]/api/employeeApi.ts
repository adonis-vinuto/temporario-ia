"use server";

import { EmployeeKnowledge, EmployeeKnowledgeRequest } from "@/lib/interface/EmployeeKnowledge";

const API_BASE_URL = process.env.API_URL || "";

export async function getEmployees(knowledgeId: string): Promise<EmployeeKnowledge[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/people/employee/${knowledgeId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar colaboradores");
  }

  return response.json();
}

export async function getEmployeeById(
  knowledgeId: string, 
  employeeId: string
): Promise<EmployeeKnowledge> {
  const response = await fetch(
    `${API_BASE_URL}/api/people/employee/${knowledgeId}/${employeeId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar colaborador");
  }

  return response.json();
}

export async function createEmployee(
  knowledgeId: string,
  data: EmployeeKnowledgeRequest
): Promise<EmployeeKnowledge> {
  const response = await fetch(
    `${API_BASE_URL}/api/people/employee/${knowledgeId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao criar colaborador");
  }

  return response.json();
}

export async function updateEmployee(
  knowledgeId: string,
  employeeId: string,
  data: EmployeeKnowledgeRequest
): Promise<EmployeeKnowledge> {
  const response = await fetch(
    `${API_BASE_URL}/api/people/employee/${knowledgeId}/${employeeId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao atualizar colaborador");
  }

  return response.json();
}

export async function deleteEmployee(
  knowledgeId: string,
  employeeId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/people/employee/${knowledgeId}/${employeeId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao deletar colaborador");
  }
}