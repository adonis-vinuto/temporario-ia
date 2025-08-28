// Nextjs/components/HcmIntegrationModal.tsx

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
import { SeniorHcmIntegration } from "@/lib/interface/SeniorHcmIntegration";

interface HcmIntegrationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<SeniorHcmIntegration & { password?: string }>) => Promise<void>;
  integration?: SeniorHcmIntegration | null;
  mode: "create" | "edit" | "view";
}

export function HcmIntegrationModal({ 
  open, 
  onClose, 
  onSave, 
  integration, 
  mode 
}: HcmIntegrationModalProps) {
  const [formData, setFormData] = useState<Partial<SeniorHcmIntegration & { password?: string }>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (integration) {
        setFormData({
          ...integration,
          password: "" // Não exibimos a senha atual por segurança
        });
      } else {
        setFormData({});
      }
    }
  }, [integration, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave(formData);
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    setLoading(false);
    onClose();
  };

  const isReadOnly = mode === "view";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Nova Integração Senior HCM"}
            {mode === "edit" && "Editar Integração Senior HCM"}
            {mode === "view" && "Visualizar Integração Senior HCM"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="username">Usuário</Label>
            <Input
              id="username"
              value={formData.username || ""}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              disabled={isReadOnly}
              placeholder="Digite o usuário"
            />
          </div>

          {(mode === "create" || mode === "edit") && (
            <div>
              <Label htmlFor="password">
                {mode === "edit" ? "Nova Senha (deixe em branco para manter a atual)" : "Senha"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password || ""}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                disabled={isReadOnly}
                placeholder="Digite a senha"
              />
            </div>
          )}

          <div>
            <Label htmlFor="wsdlUrl">URL WSDL</Label>
            <Input
              id="wsdlUrl"
              value={formData.wsdlUrl || ""}
              onChange={(e) => setFormData({...formData, wsdlUrl: e.target.value})}
              disabled={isReadOnly}
              placeholder="https://exemplo.com/wsdl"
            />
          </div>

          {mode === "view" && integration && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>ID da Configuração:</strong> {integration.idSeniorHcmConfig}
              </p>
              {integration.createdAt && (
                <p className="text-sm text-muted-foreground">
                  <strong>Criado em:</strong> {new Date(integration.createdAt).toLocaleDateString('pt-BR')}
                </p>
              )}
              {integration.updatedAt && (
                <p className="text-sm text-muted-foreground">
                  <strong>Atualizado em:</strong> {new Date(integration.updatedAt).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
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
