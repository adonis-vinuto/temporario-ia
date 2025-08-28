// Nextjs/components/TwilioIntegrationModal.tsx

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
import { TwilioIntegration } from "@/lib/interface/TwilioIntegration";
import { Copy, Check } from "lucide-react";

interface TwilioIntegrationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<TwilioIntegration & { agentId?: string }>) => Promise<void>;
  integration?: TwilioIntegration | null;
  mode: "create" | "edit" | "view";
  agents?: Array<{ id: string; name: string }>;
  selectedAgentId?: string;
}

export function TwilioIntegrationModal({ 
  open, 
  onClose, 
  onSave, 
  integration, 
  mode,
  agents,
  selectedAgentId
}: TwilioIntegrationModalProps) {
  const [formData, setFormData] = useState<Partial<TwilioIntegration & { agentId?: string }>>({});
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      if (integration) {
        setFormData({
          ...integration,
          agentId: selectedAgentId
        });
      } else {
        setFormData({
          agentId: selectedAgentId || ""
        });
      }
    }
  }, [integration, selectedAgentId, open]);

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

  const handleClose = () => {
    setFormData({});
    setLoading(false);
    setCopied(false);
    onClose();
  };

  const handleCopyWebhook = () => {
    if (formData.webhookUrl) {
      navigator.clipboard.writeText(formData.webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isReadOnly = mode === "view";

  // Força desmontagem completa quando fechado
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Nova Integração Twilio"}
            {mode === "edit" && "Editar Integração Twilio"}
            {mode === "view" && "Visualizar Integração Twilio"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {mode === "create" && agents && (
            <div>
              <Label htmlFor="agent">Agente</Label>
              <Select 
                value={formData.agentId} 
                onValueChange={(value) => setFormData({...formData, agentId: value})}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um agente" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="accountSid">Account SID</Label>
            <Input
              id="accountSid"
              value={formData.accountSid || ""}
              onChange={(e) => setFormData({...formData, accountSid: e.target.value})}
              disabled={isReadOnly}
              placeholder="Digite o Account SID"
            />
          </div>

          <div>
            <Label htmlFor="authToken">Auth Token</Label>
            <Input
              id="authToken"
              type={mode === "view" ? "text" : "password"}
              value={mode === "view" ? "••••••••" : (formData.authToken || "")}
              onChange={(e) => setFormData({...formData, authToken: e.target.value})}
              disabled={isReadOnly}
              placeholder="Digite o Auth Token"
            />
          </div>

          <div>
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhookUrl"
                value={formData.webhookUrl || ""}
                onChange={(e) => setFormData({...formData, webhookUrl: e.target.value})}
                disabled={isReadOnly}
                placeholder="https://exemplo.com/webhook"
                className="flex-1"
              />
              {formData.webhookUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyWebhook}
                  title="Copiar URL"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Este é o URL do webhook que você deve configurar no Twilio.
            </p>
          </div>

          {mode === "view" && selectedAgentId && agents && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Agente:</strong> {agents.find(a => a.id === selectedAgentId)?.name}
              </p>
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