"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { SalaryHistoryModal } from "@/components/SalaryHistoryModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  SalaryHistoryKnowledge, 
  SalaryHistoryKnowledgeRequest 
} from "@/lib/interface/SalaryHistoryKnowledge";
import {
  getSalaryHistories,
  createSalaryHistory,
  updateSalaryHistory,
  deleteSalaryHistory,
} from "@/app/(app)/knowledges/[module]/[id]/api/salaryHistoryApi";
import { getEmployees } from "@/app/(app)/knowledges/[module]/[id]/api/employeeApi";
import { EmployeeKnowledge } from "@/lib/interface/EmployeeKnowledge";
import { useToast } from "@/hooks/use-toast";
import { ColumnDef } from "@tanstack/react-table";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface SalaryHistoryTabProps {
  knowledgeId: string;
}

export function SalaryHistoryTab({ knowledgeId }: SalaryHistoryTabProps) {
  const [salaryHistories, setSalaryHistories] = useState<SalaryHistoryKnowledge[]>([]);
  const [employees, setEmployees] = useState<EmployeeKnowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedSalaryHistory, setSelectedSalaryHistory] = useState<SalaryHistoryKnowledge | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [salaryHistoryToDelete, setSalaryHistoryToDelete] = useState<SalaryHistoryKnowledge | null>(null);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [historiesData, employeesData] = await Promise.all([
        getSalaryHistories(knowledgeId),
        getEmployees(knowledgeId)
      ]);
      setSalaryHistories(historiesData);
      setEmployees(employeesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [knowledgeId, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = () => {
    setSelectedSalaryHistory(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleView = (salaryHistory: SalaryHistoryKnowledge) => {
    setSelectedSalaryHistory(salaryHistory);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEdit = (salaryHistory: SalaryHistoryKnowledge) => {
    setSelectedSalaryHistory(salaryHistory);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleDelete = (salaryHistory: SalaryHistoryKnowledge) => {
    setSalaryHistoryToDelete(salaryHistory);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!salaryHistoryToDelete) return;

    try {
      await deleteSalaryHistory(knowledgeId, salaryHistoryToDelete.idSalaryHistory);
      toast({
        title: "Sucesso",
        description: "Histórico de salário excluído com sucesso",
      });
      loadData();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o histórico de salário",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (data: Partial<SalaryHistoryKnowledge>) => {
    try {
      // Generate a unique ID for new records
      const salaryHistoryId = modalMode === "create" 
        ? `SAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        : data.idSalaryHistory || "";

      const requestData: SalaryHistoryKnowledgeRequest = {
        "id-employee": data.idEmployee || "",
        "id-salary-history": salaryHistoryId,
        "change-date": data.changeDate || "",
        "new-salary": data.newSalary || 0,
        "motive-name": data.motiveName || "",
        "employee-cod-senior-numcad": data.employeeCodSeniorNumcad || "",
        "collaborator-type-code-senior-tipcol": data.collaboratorTypeCodeSeniorTipcol || "",
        "company-cod-senior-numemp": data.companyCodSeniorNumemp || "",
        "motive_cod_senior_codmot": data.motiveCodSeniorCodmot || "",
      };

      if (modalMode === "create") {
        await createSalaryHistory(knowledgeId, requestData);
        toast({
          title: "Sucesso",
          description: "Histórico de salário criado com sucesso",
        });
      } else if (modalMode === "edit" && selectedSalaryHistory) {
        await updateSalaryHistory(knowledgeId, selectedSalaryHistory.idSalaryHistory, requestData);
        toast({
          title: "Sucesso",
          description: "Histórico de salário atualizado com sucesso",
        });
      }
      loadData();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o histórico de salário",
        variant: "destructive",
      });
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.idEmployee === employeeId);
    return employee?.fullName || employeeId;
  };

  const getEmployeeCurrentSalary = (employeeId: string) => {
    const employee = employees.find(emp => emp.idEmployee === employeeId);
    return employee?.salary || 0;
  };

  const calculateDifference = (employeeId: string, newSalary: number) => {
    const currentSalary = getEmployeeCurrentSalary(employeeId);
    return newSalary - currentSalary;
  };

  const columns: ColumnDef<SalaryHistoryKnowledge>[] = [
    {
      accessorKey: "idEmployee",
      header: "Colaborador",
      cell: ({ row }) => (
        <div className="font-medium">{getEmployeeName(row.getValue("idEmployee"))}</div>
      ),
    },
    {
      accessorKey: "changeDate",
      header: "Data da Alteração",
      cell: ({ row }) => {
        const date = row.getValue("changeDate") as string;
        return date ? format(new Date(date), "dd/MM/yyyy", { locale: ptBR }) : "";
      },
    },
    {
      accessorKey: "newSalary",
      header: "Novo Salário",
      cell: ({ row }) => {
        const salary = parseFloat(row.getValue("newSalary"));
        const formatted = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(salary);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      id: "difference",
      header: "Diferença",
      cell: ({ row }) => {
        const difference = calculateDifference(row.original.idEmployee, row.original.newSalary);
        const percentage = getEmployeeCurrentSalary(row.original.idEmployee) > 0
          ? (difference / getEmployeeCurrentSalary(row.original.idEmployee) * 100).toFixed(2)
          : "0";
        
        const formatted = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(Math.abs(difference));

        return (
          <div className="flex items-center gap-2">
            {difference > 0 ? (
              <>
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-green-600">+{formatted} ({percentage}%)</span>
              </>
            ) : difference < 0 ? (
              <>
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-red-600">-{formatted} ({percentage}%)</span>
              </>
            ) : (
              <span className="text-muted-foreground">Sem alteração</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "motiveName",
      header: "Motivo",
      cell: ({ row }) => (
        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {row.getValue("motiveName")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const salaryHistory = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(salaryHistory)}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(salaryHistory)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(salaryHistory)}
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
    return <div className="text-center p-4">Carregando histórico de salários...</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={salaryHistories}
        searchKey="idEmployee"
        onAdd={handleCreate}
        addButtonText="+ Novo Histórico"
      />

      <SalaryHistoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        salaryHistory={selectedSalaryHistory}
        mode={modalMode}
        knowledgeId={knowledgeId}
      />

      {deleteDialogOpen && (
        <ConfirmationDialog
          trigger={<div />}
          title="Confirmar exclusão"
          description={`Tem certeza que deseja excluir este histórico de salário?`}
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