"use client";

import { useRouter } from "next/navigation";
import { Employee } from "@/lib/interface/Employee";

interface EmployeeSelectorProps {
  employees: Employee[];
  agentId: string;
}

export default function EmployeeSelector({ employees, agentId }: EmployeeSelectorProps) {
  const router = useRouter();

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedEmployeeId = e.target.value;
    router.push(`/dashboard?agentId=${agentId}&view=individual&employeeId=${selectedEmployeeId}`);
  };

  return (
    <select
      className="bg-zinc-900 text-white p-3 rounded-lg"
      onChange={handleEmployeeChange}
    >
      <option value="">Selecione um colaborador</option>
      {employees.map((employee) => (
        <option key={employee.employee_id} value={employee.employee_id}>
          {employee.full_name}
        </option>
      ))}
    </select>
  );
}