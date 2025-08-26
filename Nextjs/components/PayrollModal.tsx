// Nextjs/components/PayrollModal.tsx

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
import { PayrollKnowledge } from "@/lib/interface/PayrollKnowledge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  mode 
}: PayrollModalProps) {
  const [formData, setFormData] = useState<Partial<PayrollKnowledge>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (payroll) {
      setFormData(payroll);
    } else {
      setFormData({
        referenceDate: new Date().toISOString().split('T')[0]
      });
    }
  }, [payroll]);

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

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
            <TabsTrigger value="event">Evento</TabsTrigger>
            <TabsTrigger value="codes">Códigos Senior</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="idEmployee">ID do Funcionário</Label>
                <Input
                  id="idEmployee"
                  value={formData.idEmployee || ""}
                  onChange={(e) => setFormData({...formData, idEmployee: e.target.value})}
                  disabled={isReadOnly}
                  placeholder="Digite o ID do funcionário"
                />
              </div>
              <div>
                <Label htmlFor="payrollPeriodCod">Código do Período</Label>
                <Input
                  id="payrollPeriodCod"
                  value={formData.payrollPeriodCod || ""}
                  onChange={(e) => setFormData({...formData, payrollPeriodCod: e.target.value})}
                  disabled={isReadOnly}
                  placeholder="Ex: 202401"
                />
              </div>
              <div>
                <Label htmlFor="referenceDate">Data de Referência</Label>
                <Input
                  id="referenceDate"
                  type="date"
                  value={formData.referenceDate || ""}
                  onChange={(e) => setFormData({...formData, referenceDate: e.target.value})}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="calculationTypeName">Tipo de Cálculo</Label>
                <Select 
                  value={formData.calculationTypeName || ""} 
                  onValueChange={(value) => setFormData({...formData, calculationTypeName: value})}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de cálculo" />
                  </SelectTrigger>
                  <SelectContent>
                    {calculationTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="event" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eventName">Nome do Evento</Label>
                <Input
                  id="eventName"
                  value={formData.eventName || ""}
                  onChange={(e) => setFormData({...formData, eventName: e.target.value})}
                  disabled={isReadOnly}
                  placeholder="Ex: Salário Base, Desconto INSS, etc."
                />
              </div>
              <div>
                <Label htmlFor="eventAmount">Valor do Evento</Label>
                <Input
                  id="eventAmount"
                  type="number"
                  step="0.01"
                  value={formData.eventAmount || ""}
                  onChange={(e) => setFormData({...formData, eventAmount: Number(e.target.value)})}
                  disabled={isReadOnly}
                  placeholder="0.00"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="eventTypeName">Tipo do Evento</Label>
                <Select 
                  value={formData.eventTypeName || ""} 
                  onValueChange={(value) => setFormData({...formData, eventTypeName: value})}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="codes" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employeeCodSeniorNumcad">Código Senior - Funcionário</Label>
                <Input
                  id="employeeCodSeniorNumcad"
                  value={formData.employeeCodSeniorNumcad || ""}
                  onChange={(e) => setFormData({...formData, employeeCodSeniorNumcad: e.target.value})}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="collaboratorTypeCodeSeniorTipcol">Código Senior - Tipo Colaborador</Label>
                <Input
                  id="collaboratorTypeCodeSeniorTipcol"
                  value={formData.collaboratorTypeCodeSeniorTipcol || ""}
                  onChange={(e) => setFormData({...formData, collaboratorTypeCodeSeniorTipcol: e.target.value})}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="companyCodSeniorNumemp">Código Senior - Empresa</Label>
                <Input
                  id="companyCodSeniorNumemp"
                  value={formData.companyCodSeniorNumemp || ""}
                  onChange={(e) => setFormData({...formData, companyCodSeniorNumemp: e.target.value})}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="payrollPeriodCodSeniorCodcal">Código Senior - Período</Label>
                <Input
                  id="payrollPeriodCodSeniorCodcal"
                  value={formData.payrollPeriodCodSeniorCodcal || ""}
                  onChange={(e) => setFormData({...formData, payrollPeriodCodSeniorCodcal: e.target.value})}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="eventCodSeniorCodenv">Código Senior - Evento</Label>
                <Input
                  id="eventCodSeniorCodenv"
                  value={formData.eventCodSeniorCodenv || ""}
                  onChange={(e) => setFormData({...formData, eventCodSeniorCodenv: e.target.value})}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="eventTypeCodSeniorTipeve">Código Senior - Tipo Evento</Label>
                <Input
                  id="eventTypeCodSeniorTipeve"
                  value={formData.eventTypeCodSeniorTipeve || ""}
                  onChange={(e) => setFormData({...formData, eventTypeCodSeniorTipeve: e.target.value})}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="calculationTypeCodSeniorTipcal">Código Senior - Tipo Cálculo</Label>
                <Input
                  id="calculationTypeCodSeniorTipcal"
                  value={formData.calculationTypeCodSeniorTipcal || ""}
                  onChange={(e) => setFormData({...formData, calculationTypeCodSeniorTipcal: e.target.value})}
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

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