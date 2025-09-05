// Nextjs/components/PayrollTab.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { PayrollModal } from "@/components/PayrollModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import { format } from "date-fns";
import { PayrollKnowledge, PayrollKnowledgeRequest } from "@/lib/interface/PayrollKnowledge";
import {
  getPayrolls,
  createPayroll,
  updatePayroll,
  deletePayroll,
} from "@/app/(app)/knowledges/[module]/[id]/api/payrollApi";
import { useToast } from "@/hooks/use-toast";
import { ColumnDef } from "@tanstack/react-table";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface PayrollTabProps {
  knowledgeId: string;
}

export function PayrollTab({ knowledgeId }: PayrollTabProps) {
  const [payrolls, setPayrolls] = useState<PayrollKnowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollKnowledge | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [payrollToDelete, setPayrollToDelete] = useState<PayrollKnowledge | null>(null);
  const { toast } = useToast();

  const loadPayrolls = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPayrolls(knowledgeId);
      setPayrolls(data);
    } catch (error) {
      console.error("Erro ao carregar dados de pagamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de pagamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [knowledgeId, toast]);

  useEffect(() => {
    loadPayrolls();
  }, [loadPayrolls]);

  const handleCreate = () => {
    setSelectedPayroll(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleView = (payroll: PayrollKnowledge) => {
    setSelectedPayroll(payroll);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEdit = (payroll: PayrollKnowledge) => {
    setSelectedPayroll(payroll);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleDelete = (payroll: PayrollKnowledge) => {
    setPayrollToDelete(payroll);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!payrollToDelete) return;

    try {
      await deletePayroll(knowledgeId, payrollToDelete.idPayroll);
      toast({
        title: "Sucesso",
        description: "Registro de pagamento excluído com sucesso",
      });
      loadPayrolls();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o registro de pagamento",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (data: Partial<PayrollKnowledge>) => {
    try {
      const requestData: PayrollKnowledgeRequest = {
        "id-employee": data.idEmployee || "",
        "id-payrooll": data.idPayroll || "",
        "payroll-period-cod": data.payrollPeriodCod || "",
        "event-name": data.eventName || "",
        "event-amount": data.eventAmount || 0,
        "event-type-name": data.eventTypeName || "",
        "reference-date": data.referenceDate || "",
        "calculation-type-name": data.calculationTypeName || "",
        "employee-cod-senior-numcad": data.employeeCodSeniorNumcad || "",
        "collaborator-type-code-senior-tipcol": data.collaboratorTypeCodeSeniorTipcol || "",
        "company-cod-senior-numemp": data.companyCodSeniorNumemp || "",
        "payroll-period-cod-senior-codcal": data.payrollPeriodCodSeniorCodcal || "",
        "event-cod-senior-codenv": data.eventCodSeniorCodenv || "",
        "event-type-cod-senior-tipeve": data.eventTypeCodSeniorTipeve || "",
        "calculation-type-cod-senior-tipcal": data.calculationTypeCodSeniorTipcal || "",
      };

      if (modalMode === "create") {
        await createPayroll(knowledgeId, requestData);
        toast({
          title: "Sucesso",
          description: "Registro de pagamento criado com sucesso",
        });
      } else if (modalMode === "edit" && selectedPayroll) {
        await updatePayroll(knowledgeId, selectedPayroll.idPayroll, requestData);
        toast({
          title: "Sucesso",
          description: "Registro de pagamento atualizado com sucesso",
        });
      }
      loadPayrolls();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o registro de pagamento",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<PayrollKnowledge>[] = [
    {
      accessorKey: "idEmployee",
      header: "ID Funcionário",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("idEmployee")}</div>
      ),
    },
    {
      accessorKey: "eventName",
      header: "Evento",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("eventName")}</div>
      ),
    },
    {
      accessorKey: "eventTypeName",
      header: "Tipo",
      cell: ({ row }) => {
        const type = row.getValue("eventTypeName") as string;
        const color = type === "PROVENTO" ? "green" : type === "DESCONTO" ? "red" : "blue";
        return (
          <span className={`px-2 py-1 rounded-full text-xs bg-${color}-100 text-${color}-800`}>
            {type}
          </span>
        );
      },
    },
    {
      accessorKey: "eventAmount",
      header: "Valor",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("eventAmount"));
        const formatted = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "payrollPeriodCod",
      header: "Período",
      cell: ({ row }) => (
        <div className="font-mono">{row.getValue("payrollPeriodCod")}</div>
      ),
    },
    {
      accessorKey: "referenceDate",
      header: "Data Referência",
      cell: ({ row }) => {
        const date = row.getValue("referenceDate") as string;
        return date ? format(new Date(date), "dd/MM/yyyy") : "";
      },
    },
    {
      accessorKey: "calculationTypeName",
      header: "Tipo Cálculo",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("calculationTypeName")}</span>
      ),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const payroll = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(payroll)}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(payroll)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(payroll)}
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
    return <div className="text-center p-4">Carregando dados de pagamento...</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={payrolls}
        searchKey="eventName"
        onAdd={handleCreate}
        addButtonText="+ Nova Ficha de Pagamento"
      />

      <PayrollModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        payroll={selectedPayroll}
        mode={modalMode}
      />

      {deleteDialogOpen && (
        <ConfirmationDialog
          trigger={<div />}
          title="Confirmar exclusão"
          description={`Tem certeza que deseja excluir o registro de pagamento "${payrollToDelete?.eventName}"?`}
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