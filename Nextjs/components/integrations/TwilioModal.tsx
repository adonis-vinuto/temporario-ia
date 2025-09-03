"use client";

import { useState, useEffect, useCallback } from "react";
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
import { TwilioConfig } from "@/lib/interface/TwilioConfig";
import { Eye, EyeOff } from "lucide-react";

interface TwilioModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<TwilioConfig>) => Promise<void>;
  config?: TwilioConfig | null;
  mode: "create" | "edit" | "view";
}

export function TwilioModal({ 
  open, 
  onClose, 
  onSave, 
  config, 
  mode 
}: TwilioModalProps) {
  const [formData, setFormData] = useState<Partial<TwilioConfig>>({});
  const [loading, setLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Key única para forçar remontagem completa
  const modalKey = `${mode}-${config?.accountSid || 'new'}-${open}`;

  useEffect(() => {
    if (open) {
      // Limpa qualquer overlay anterior
      cleanupOverlays();
      
      if (config) {
        setFormData(config);
      } else {
        setFormData({});
      }
      setShowToken(false);
      setIsClosing(false);
    }
  }, [config, open]);

  // Função para limpar overlays órfãos
  const cleanupOverlays = () => {
    const overlays = document.querySelectorAll('[data-radix-portal]');
    overlays.forEach(overlay => {
      if (!overlay.querySelector('[role="dialog"]')) {
        overlay.remove();
      }
    });
    
    // Limpa estilos do body
    document.body.style.pointerEvents = '';
    document.body.style.overflow = '';
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave(formData);
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    if (isClosing) return;
    
    setIsClosing(true);
    setFormData({});
    setShowToken(false);
    setLoading(false);
    
    // Usa setTimeout para garantir que o modal feche corretamente
    setTimeout(() => {
      onClose();
      // Limpa overlays após fechar
      setTimeout(cleanupOverlays, 100);
    }, 0);
  }, [isClosing, onClose]);

  // Se não está aberto, não renderiza nada
  if (!open) {
    return null;
  }

  const isReadOnly = mode === "view";

  return (
    <Dialog 
      key={modalKey}
      open={open} 
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent 
        onPointerDownOutside={(e) => {
          if (loading) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (loading) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Nova Configuração Twilio"}
            {mode === "edit" && "Editar Configuração Twilio"}
            {mode === "view" && "Visualizar Configuração Twilio"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="accountSid">Account SID</Label>
            <Input
              id="accountSid"
              value={formData.accountSid || ""}
              onChange={(e) => setFormData({...formData, accountSid: e.target.value})}
              disabled={isReadOnly || loading}
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            />
          </div>

          <div>
            <Label htmlFor="authToken">Auth Token</Label>
            <div className="relative">
              <Input
                id="authToken"
                type={showToken ? "text" : "password"}
                value={formData.authToken || ""}
                onChange={(e) => setFormData({...formData, authToken: e.target.value})}
                disabled={isReadOnly || loading}
                placeholder="Digite o Auth Token"
              />
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showToken ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              value={formData.webhookUrl || ""}
              onChange={(e) => setFormData({...formData, webhookUrl: e.target.value})}
              disabled={isReadOnly || loading}
              placeholder="https://exemplo.com/webhook"
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={loading}
          >
            {mode === "view" ? "Fechar" : "Cancelar"}
          </Button>
          {mode !== "view" && (
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}