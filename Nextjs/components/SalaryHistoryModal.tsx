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
import { Label } from "@/components/ui/label";
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

interface SalaryHistoryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<SalaryHistoryKnowledge>) => Promise<void>;
  salaryHistory?: SalaryHistoryKnowledge | null;
  mode: "create" | "edit" | "view";
  knowledgeId: string;
}

const MOTIVES = [
  "Promoção",
  "Mérito",
  "Ajuste de Mercado",
  "Mudança de Cargo",
  "Dissídio Coletivo",
  "Correção",
  "Outros"
];

export function SalaryHistoryModal({ 
  open, 
  onClose, 
  onSave, 
  salaryHistory, 
  mode,
  knowledgeId 
}: SalaryHistoryModalProps) {
  const [formData, setFormData] = useState<Partial<SalaryHistoryKnowledge>>({});
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<EmployeeKnowledge[]>([]);

  useEffect(() => {
    if (salaryHistory) {
      setFormData(salaryHistory);
    } else {
      setFormData({
        changeDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [salaryHistory]);

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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = mode === "view";

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
    setFormData({...formData, newSalary: numericValue});
  };

  const selectedEmployee = employees.find(emp => emp.idEmployee === formData.idEmployee);

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

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employee">Colaborador</Label>
              {mode === "create" ? (
                <Select
                  value={formData.idEmployee || ""}
                  onValueChange={(value) => {
                    const employee = employees.find(emp => emp.idEmployee === value);
                    setFormData({
                      ...formData, 
                      idEmployee: value,
                      employeeCodSeniorNumcad: employee?.employeeCodSeniorNumcad || "",
                      collaboratorTypeCodeSeniorTipcol: employee?.collaboratorTypeCodeSeniorTipcol || "",
                      companyCodSeniorNumemp: employee?.companyCodSeniorNumemp || "",
                    });
                  }}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o colaborador" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.idEmployee} value={employee.idEmployee}>
                        {employee.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="employee"
                  value={selectedEmployee?.fullName || formData.idEmployee || ""}
                  disabled={true}
                />
              )}
            </div>

            <div>
              <Label htmlFor="changeDate">Data da Alteração</Label>
              <Input
                id="changeDate"
                type="date"
                value={formData.changeDate || ""}
                onChange={(e) => setFormData({...formData, changeDate: e.target.value})}
                disabled={isReadOnly}
              />
            </div>

            {selectedEmployee && (
              <div>
                <Label>Salário Atual</Label>
                <Input
                  value={formatCurrency(selectedEmployee.salary)}
                  disabled={true}
                  className="bg-muted"
                />
              </div>
            )}

            <div>
              <Label htmlFor="newSalary">Novo Salário</Label>
              <Input
                id="newSalary"
                type="text"
                value={formatCurrency(formData.newSalary)}
                onChange={handleSalaryChange}
                disabled={isReadOnly}
                placeholder="R$ 0,00"
              />
            </div>

            {selectedEmployee && formData.newSalary && (
              <div className="col-span-2 p-4 bg-muted rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Diferença:</span>
                  <span className={`font-medium ${formData.newSalary > selectedEmployee.salary ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(formData.newSalary - selectedEmployee.salary)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-muted-foreground">Percentual:</span>
                  <span className={`font-medium ${formData.newSalary > selectedEmployee.salary ? 'text-green-600' : 'text-red-600'}`}>
                    {((formData.newSalary - selectedEmployee.salary) / selectedEmployee.salary * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            )}

            <div className="col-span-2">
              <Label htmlFor="motiveName">Motivo da Alteração</Label>
              <Select
                value={formData.motiveName || ""}
                onValueChange={(value) => setFormData({...formData, motiveName: value})}
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
            </div>

            {mode !== "create" && (
              <>
                <div>
                  <Label htmlFor="idSalaryHistory">ID do Histórico</Label>
                  <Input
                    id="idSalaryHistory"
                    value={formData.idSalaryHistory || ""}
                    disabled={true}
                  />
                </div>
                <div>
                  <Label htmlFor="motiveCodSeniorCodmot">Código Motivo Sênior</Label>
                  <Input
                    id="motiveCodSeniorCodmot"
                    value={formData.motiveCodSeniorCodmot || ""}
                    onChange={(e) => setFormData({...formData, motiveCodSeniorCodmot: e.target.value})}
                    disabled={isReadOnly}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {mode === "view" ? "Fechar" : "Cancelar"}
          </Button>
          {mode !== "view" && (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}