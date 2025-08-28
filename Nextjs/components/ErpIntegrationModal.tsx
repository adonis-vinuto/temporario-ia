// Nextjs/components/ErpIntegrationModal.tsx

"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SeniorErpIntegration } from "@/lib/interface/SeniorErpIntegration";

interface ErpIntegrationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<SeniorErpIntegration & { password?: string }>) => Promise<void>;
  integration?: SeniorErpIntegration | null;
  mode: "create" | "edit" | "view";
}

export function ErpIntegrationModal({
  open,
  onClose,
  onSave,
  integration,
  mode,
}: ErpIntegrationModalProps) {
  const [formData, setFormData] = useState<
    Partial<SeniorErpIntegration & { password?: string }>
  >({});
  const [loading, setLoading] = useState(false);

  // Preenche/limpa dados quando abre com um registro
  useEffect(() => {
    if (!open) return;

    if (integration) {
      setFormData({
        ...integration,
        password: "", // nunca exibimos senha atual
      });
    } else {
      setFormData({});
    }
  }, [open, integration]);

  // Segurança extra: ao fechar, zera estados locais
  useEffect(() => {
    if (!open) {
      setFormData({});
      setLoading(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave(formData);
      onClose(); // fecha após salvar
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = mode === "view";

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        // só fecha quando o Radix avisar que está fechando
        if (!isOpen) onClose();
      }}
      // Se quiser tornar não-modal (sem overlay e sem trap), descomente:
      // modal={false}
    >
      <DialogContent
        // força remount quando muda o modo ou o ID (evita overlay preso)
        key={`${mode}-${integration?.idSeniorErpConfig ?? "new"}`}
        className="max-w-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Nova Integração Senior ERP"}
            {mode === "edit" && "Editar Integração Senior ERP"}
            {mode === "view" && "Visualizar Integração Senior ERP"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="username">Usuário</Label>
            <Input
              id="username"
              value={formData.username ?? ""}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={isReadOnly}
              placeholder="Digite o usuário"
            />
          </div>

          {(mode === "create" || mode === "edit") && (
            <div>
              <Label htmlFor="password">
                {mode === "edit"
                  ? "Nova Senha (deixe em branco para manter a atual)"
                  : "Senha"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password ?? ""}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isReadOnly}
                placeholder="Digite a senha"
              />
            </div>
          )}

          <div>
            <Label htmlFor="wsdlUrl">URL WSDL</Label>
            <Input
              id="wsdlUrl"
              value={formData.wsdlUrl ?? ""}
              onChange={(e) => setFormData({ ...formData, wsdlUrl: e.target.value })}
              disabled={isReadOnly}
              placeholder="https://exemplo.com/wsdl"
            />
          </div>

          {mode === "view" && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>ID da Configuração:</strong> {integration?.idSeniorErpConfig}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">
              {mode === "view" ? "Fechar" : "Cancelar"}
            </Button>
          </DialogClose>

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
