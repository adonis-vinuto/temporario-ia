"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SalaryHistoryKnowledge } from "@/lib/interface/SalaryHistoryKnowledge";
import { getEmployees } from "@/app/(app)/knowledges/[module]/[id]/api/employeeApi";
import { EmployeeKnowledge } from "@/lib/interface/EmployeeKnowledge";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const MOTIVES = [
  "Promoção",
  "Mérito",
  "Ajuste de Mercado",
  "Mudança de Cargo",
  "Dissídio Coletivo",
  "Correção",
  "Outros",
];

// schema de validação
const salaryHistoryFormSchema = z.object({
  idEmployee: z.string().min(1, "Colaborador é obrigatório"),
  changeDate: z.string().min(1, "Data da alteração é obrigatória"),
  newSalary: z
    .number({ invalid_type_error: "Novo salário deve ser um número" })
    .positive("Novo salário deve ser maior que zero"),
  motiveName: z.enum(MOTIVES as [string, ...string[]]),
  motiveCodSeniorCodmot: z.string().optional(),
});

type SalaryHistoryFormSchema = z.infer<typeof salaryHistoryFormSchema>;

interface SalaryHistoryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<SalaryHistoryKnowledge>) => Promise<void>;
  salaryHistory?: SalaryHistoryKnowledge | null;
  mode: "create" | "edit" | "view";
  knowledgeId: string;
}

export function SalaryHistoryModal({
  open,
  onClose,
  onSave,
  salaryHistory,
  mode,
  knowledgeId,
}: SalaryHistoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<EmployeeKnowledge[]>([]);

  const form = useForm<SalaryHistoryFormSchema>({
    resolver: zodResolver(salaryHistoryFormSchema),
    defaultValues: {
      idEmployee: "",
      changeDate: new Date().toISOString().split("T")[0],
      newSalary: 0,
      motiveName: "" as any,
      motiveCodSeniorCodmot: "",
    },
  });

  const { watch, setValue, reset } = form;

  // preencher dados quando editar
  useEffect(() => {
    if (salaryHistory) {
      reset({
        idEmployee: salaryHistory.idEmployee,
        changeDate: salaryHistory.changeDate,
        newSalary: salaryHistory.newSalary,
        motiveName: salaryHistory.motiveName as any,
        motiveCodSeniorCodmot: salaryHistory.motiveCodSeniorCodmot,
      });
    }
  }, [salaryHistory, reset]);

  // carregar colaboradores no create
  useEffect(() => {
    if (open && mode === "create") {
      loadEmployees();
    }
  }, [open, mode]);

  const loadEmployees = async () => {
    try {
      const data = await getEmployees(knowledgeId);
      setEmployees(data);
    } catch (error) {
      console.error("Erro ao carregar colaboradores:", error);
    }
  };

  const onSubmit = async (data: SalaryHistoryFormSchema) => {
    setLoading(true);
    try {
      await onSave(data);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = mode === "view";
  const selectedEmployee = employees.find(
    (emp) => emp.idEmployee === watch("idEmployee")
  );

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const numericValue = parseFloat(value) / 100;
    setValue("newSalary", isNaN(numericValue) ? 0 : numericValue);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Novo Histórico de Salário"}
            {mode === "edit" && "Editar Histórico de Salário"}
            {mode === "view" && "Visualizar Histórico de Salário"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="idEmployee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Colaborador</FormLabel>
                    {mode === "create" ? (
                      <FormControl>
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                          disabled={isReadOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o colaborador" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map((employee) => (
                              <SelectItem
                                key={employee.idEmployee}
                                value={employee.idEmployee}
                              >
                                {employee.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    ) : (
                      <Input
                        value={selectedEmployee?.fullName || field.value || ""}
                        disabled
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col relative gap-2">
                <FormField
                  control={form.control}
                  name="changeDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data da Alteração</FormLabel>
                      <FormControl>
                        <Input type="date" disabled={isReadOnly} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="motiveName"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Motivo da Alteração</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o motivo" />
                        </SelectTrigger>
                        <SelectContent>
                          {MOTIVES.map((motive) => (
                            <SelectItem key={motive} value={motive}>
                              {motive}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedEmployee && (
                <div>
                  <FormLabel>Salário Atual</FormLabel>
                  <Input
                    value={formatCurrency(selectedEmployee.salary)}
                    disabled
                    className="bg-muted mt-2"
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="newSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Novo Salário</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        value={formatCurrency(field.value)}
                        onChange={handleSalaryChange}
                        disabled={isReadOnly}
                        placeholder="R$ 0,00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />



              {mode !== "create" && (
                <FormField
                  control={form.control}
                  name="motiveCodSeniorCodmot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código Motivo Sênior</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isReadOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <DialogFooter className="gap-4">
              <Button variant="outline" onClick={onClose}>
                {mode === "view" ? "Fechar" : "Cancelar"}
              </Button>
              {mode !== "view" && (
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
