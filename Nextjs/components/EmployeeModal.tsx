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
import { EmployeeKnowledge } from "@/lib/interface/EmployeeKnowledge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<EmployeeKnowledge>) => Promise<void>; // Mudança aqui
  employee?: EmployeeKnowledge | null;
  mode: "create" | "edit" | "view";
}

export function EmployeeModal({ 
  open, 
  onClose, 
  onSave, 
  employee, 
  mode 
}: EmployeeModalProps) {
  const [formData, setFormData] = useState<Partial<EmployeeKnowledge>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    } else {
      setFormData({});
    }
  }, [employee]);

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Novo Colaborador"}
            {mode === "edit" && "Editar Colaborador"}
            {mode === "view" && "Visualizar Colaborador"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="professional">Dados Profissionais</TabsTrigger>
            <TabsTrigger value="address">Endereço</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  value={formData.fullName || ""}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate || ""}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gênero</Label>
                <Select 
                  value={formData.gender || ""} 
                  onValueChange={(value) => setFormData({...formData, gender: value})}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                    <SelectItem value="O">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="race">Raça</Label>
                <Input
                  id="race"
                  value={formData.race || ""}
                  onChange={(e) => setFormData({...formData, race: e.target.value})}
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="professional" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Empresa</Label>
                <Input
                  id="companyName"
                  value={formData.companyName || ""}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="costCenterName">Centro de Custo</Label>
                <Input
                  id="costCenterName"
                  value={formData.costCenterName || ""}
                  onChange={(e) => setFormData({...formData, costCenterName: e.target.value})}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="admissionDate">Data de Admissão</Label>
                <Input
                  id="admissionDate"
                  type="date"
                  value={formData.admissionDate || ""}
                  onChange={(e) => setFormData({...formData, admissionDate: e.target.value})}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="terminationDate">Data de Demissão</Label>
                <Input
                  id="terminationDate"
                  type="date"
                  value={formData.terminationDate || ""}
                  onChange={(e) => setFormData({...formData, terminationDate: e.target.value})}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="salary">Salário</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary || ""}
                  onChange={(e) => setFormData({...formData, salary: Number(e.target.value)})}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="complementarySalary">Salário Complementar</Label>
                <Input
                  id="complementarySalary"
                  type="number"
                  value={formData.complementarySalary || ""}
                  onChange={(e) => setFormData({...formData, complementarySalary: Number(e.target.value)})}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="statusDescription">Status</Label>
                <Input
                  id="statusDescription"
                  value={formData.statusDescription || ""}
                  onChange={(e) => setFormData({...formData, statusDescription: e.target.value})}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="salaryEffectiveDate">Data Efetiva Salário</Label>
                <Input
                  id="salaryEffectiveDate"
                  type="date"
                  value={formData.salaryEffectiveDate || ""}
                  onChange={(e) => setFormData({...formData, salaryEffectiveDate: e.target.value})}
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="address" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="streetAddress">Endereço</Label>
                <Input
                  id="streetAddress"
                  value={formData.streetAddress || ""}
                  onChange={(e) => setFormData({...formData, streetAddress: e.target.value})}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="addressNumber">Número</Label>
                <Input
                  id="addressNumber"
                  value={formData.addressNumber || ""}
                  onChange={(e) => setFormData({...formData, addressNumber: e.target.value})}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="cityName">Cidade</Label>
                <Input
                  id="cityName"
                  value={formData.cityName || ""}
                  onChange={(e) => setFormData({...formData, cityName: e.target.value})}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="postalCode">CEP</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode || ""}
                  onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
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