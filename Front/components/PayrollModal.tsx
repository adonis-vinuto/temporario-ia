// Nextjs/components/PayrollModal.tsx
"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PayrollKnowledge } from "@/lib/interface/PayrollKnowledge";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { payrollFormSchema } from "@/lib/schemas/payroll-shema";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmployeeKnowledge } from "@/lib/interface/EmployeeKnowledge";

interface PayrollModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<PayrollKnowledge>) => Promise<void>;
  payroll?: PayrollKnowledge | null;
  mode: "create" | "edit" | "view";
}

export function PayrollModal({
  open,
  onClose,
  onSave,
  payroll,
  mode,
}: PayrollModalProps) {
  const form = useForm<z.infer<typeof payrollFormSchema>>({
    resolver: zodResolver(payrollFormSchema),
    defaultValues: { referenceDate: new Date().toISOString().split("T")[0] },
  });
  const [employees, setEmployees] = useState<EmployeeKnowledge[]>([]);

  const selectedEmployee = employees.find(
    (emp) => emp.idEmployee === form.watch("idEmployee")
  );
  useEffect(() => {
    if (payroll) {
      form.reset({
        ...payroll,
        calculationTypeName: payroll.calculationTypeName as
          | "VALOR"
          | "PERCENTUAL"
          | "QUANTIDADE",
        eventTypeName: payroll.eventTypeName as
          | "PROVENTO"
          | "DESCONTO"
          | "BASE",
      });
    }
  }, [payroll, form]);

  const isReadOnly = mode === "view";

  const eventTypes = [
    { value: "PROVENTO", label: "Provento" },
    { value: "DESCONTO", label: "Desconto" },
    { value: "BASE", label: "Base" },
  ];

  const calculationTypes = [
    { value: "VALOR", label: "Valor" },
    { value: "PERCENTUAL", label: "Percentual" },
    { value: "QUANTIDADE", label: "Quantidade" },
  ];

  async function onSubmit(values: z.infer<typeof payrollFormSchema>) {
    await onSave(values);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Novo Registro de Pagamento"}
            {mode === "edit" && "Editar Registro de Pagamento"}
            {mode === "view" && "Visualizar Registro de Pagamento"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              onSubmit,
              () => {
                toast.error("Preencha todos os campos obrigatórios antes de salvar.");
              }
            )}
          >
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
                <TabsTrigger value="event">Evento</TabsTrigger>
                <TabsTrigger value="codes">Códigos Senior</TabsTrigger>
              </TabsList>

              {/* ==== BASIC ==== */}
              <TabsContent value="basic" className="grid grid-cols-2 gap-4">
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


                <FormField
                  control={form.control}
                  name="payrollPeriodCod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código do Período</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isReadOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col relative gap-2">
                  <FormField
                    control={form.control}
                    name="referenceDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Referência</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} disabled={isReadOnly} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="calculationTypeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Cálculo</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isReadOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de cálculo" />
                          </SelectTrigger>
                          <SelectContent>
                            {calculationTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* ==== EVENT ==== */}
              <TabsContent value="event" className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="eventName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Evento</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isReadOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor do Evento</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventTypeName"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Tipo do Evento</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isReadOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de evento" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* ==== CODES ==== */}
              <TabsContent value="codes" className="grid grid-cols-2 gap-4">
                {[
                  "employeeCodSeniorNumcad",
                  "collaboratorTypeCodeSeniorTipcol",
                  "companyCodSeniorNumemp",
                  "payrollPeriodCodSeniorCodcal",
                  "eventCodSeniorCodenv",
                  "eventTypeCodSeniorTipeve",
                  "calculationTypeCodSeniorTipcal",
                ].map((fieldName) => (
                  <FormField
                    key={fieldName}
                    control={form.control}
                    name={fieldName as keyof z.infer<typeof payrollFormSchema>}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldName}</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isReadOnly} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={onClose}>
                {mode === "view" ? "Fechar" : "Cancelar"}
              </Button>
              {mode !== "view" && (
                <Button type="submit">
                  Salvar
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
