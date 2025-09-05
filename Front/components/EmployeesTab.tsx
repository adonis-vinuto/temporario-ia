"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { EmployeeModal } from "@/components/EmployeeModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import { format } from "date-fns";
import { EmployeeKnowledge, EmployeeKnowledgeRequest } from "@/lib/interface/EmployeeKnowledge";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "@/app/(app)/knowledges/[module]/[id]/api/employeeApi";
import { useToast } from "@/hooks/use-toast";
import { ColumnDef } from "@tanstack/react-table";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface EmployeesTabProps {
  knowledgeId: string;
}

export function EmployeesTab({ knowledgeId }: EmployeesTabProps) {
  const [employees, setEmployees] = useState<EmployeeKnowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeKnowledge | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeKnowledge | null>(null);
  const { toast } = useToast();

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getEmployees(knowledgeId);
      setEmployees(data);
    } catch (error) {
      console.error("Erro ao carregar colaboradores:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os colaboradores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [knowledgeId, toast]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleCreate = () => {
    setSelectedEmployee(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleView = (employee: EmployeeKnowledge) => {
    setSelectedEmployee(employee);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEdit = (employee: EmployeeKnowledge) => {
    setSelectedEmployee(employee);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleDelete = (employee: EmployeeKnowledge) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    try {
      await deleteEmployee(knowledgeId, employeeToDelete.idEmployee);
      toast({
        title: "Sucesso",
        description: "Colaborador excluído com sucesso",
      });
      loadEmployees();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o colaborador",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (data: Partial<EmployeeKnowledge>) => {
    try {
      const requestData: EmployeeKnowledgeRequest = {
        "id-employee": data.idEmployee || "",
        "company-name": data.companyName || "",
        "full-name": data.fullName || "",
        "admission-date": data.admissionDate || "",
        "termination-date": data.terminationDate || "",
        "status-description": data.statusDescription || "",
        "birth-date": data.birthDate || "",
        "cost-center-name": data.costCenterName || "",
        "salary": data.salary || 0,
        "complementary-salary": data.complementarySalary || 0,
        "salary-effective-date": data.salaryEffectiveDate || "",
        "gender": data.gender || "",
        "street-address": data.streetAddress || "",
        "address-number": data.addressNumber || "",
        "city-name": data.cityName || "",
        "race": data.race || "",
        "postal-code": data.postalCode || "",
        "company-cod-senior-numemp": data.companyCodSeniorNumemp || "",
        "employee-cod-senior-numcad": data.employeeCodSeniorNumcad || "",
        "collaborator-type-code-senior-tipcol": data.collaboratorTypeCodeSeniorTipcol || "",
        "status-cod-senior-sitafa": data.statusCodSeniorSitafa || "",
        "cost-center-cod-senior-codccu": data.costCenterCodSeniorCodccu || "",
      };

      if (modalMode === "create") {
        await createEmployee(knowledgeId, requestData);
        toast({
          title: "Sucesso",
          description: "Colaborador criado com sucesso",
        });
      } else if (modalMode === "edit" && selectedEmployee) {
        await updateEmployee(knowledgeId, selectedEmployee.idEmployee, requestData);
        toast({
          title: "Sucesso",
          description: "Colaborador atualizado com sucesso",
        });
      }
      loadEmployees();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o colaborador",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<EmployeeKnowledge>[] = [
    {
      accessorKey: "fullName",
      header: "Nome",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("fullName")}</div>
      ),
    },
    {
      accessorKey: "companyName",
      header: "Empresa",
    },
    {
      accessorKey: "costCenterName",
      header: "Centro de Custo",
    },
    {
      accessorKey: "statusDescription",
      header: "Status",
      cell: ({ row }) => (
        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
          {row.getValue("statusDescription")}
        </span>
      ),
    },
    {
      accessorKey: "salary",
      header: "Salário",
      cell: ({ row }) => {
        const salary = parseFloat(row.getValue("salary"));
        const formatted = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(salary);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "admissionDate",
      header: "Data de Admissão",
      cell: ({ row }) => {
        const date = row.getValue("admissionDate") as string;
        return date ? format(new Date(date), "dd/MM/yyyy") : "";
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const employee = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(employee)}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(employee)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(employee)}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (loading) {
    return <div className="text-center p-4">Carregando colaboradores...</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={employees}
        searchKey="fullName"
        onAdd={handleCreate}
        addButtonText="+ Novo Colaborador"
        nameFilter="nome do colaborador"
      />

      <EmployeeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        employee={selectedEmployee}
        mode={modalMode}
      />

      {deleteDialogOpen && (
        <ConfirmationDialog
          trigger={<div />}
          title="Confirmar exclusão"
          description={`Tem certeza que deseja excluir o colaborador "${employeeToDelete?.fullName}"?`}
          confirmText="Excluir"
          cancelText="Cancelar"
          variant="destructive"
          onConfirm={confirmDelete}
          onClose={() => setDeleteDialogOpen(false)}
        />
      )}
    </>
  );
}