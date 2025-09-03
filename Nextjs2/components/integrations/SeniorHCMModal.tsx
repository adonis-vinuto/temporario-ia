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
import { SeniorHCMConfig } from "@/lib/interface/SeniorHCMConfig";
import { Eye, EyeOff } from "lucide-react";

interface SeniorHCMModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<SeniorHCMConfig>) => Promise<void>;
  config?: SeniorHCMConfig | null;
  mode: "create" | "edit" | "view";
}

export function SeniorHCMModal({ 
  open, 
  onClose, 
  onSave, 
  config, 
  mode 
}: SeniorHCMModalProps) {
  const [formData, setFormData] = useState<Partial<SeniorHCMConfig>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Key única para forçar remontagem completa
  const modalKey = `${mode}-${config?.idSeniorHcmConfig || 'new'}-${open}`;

  useEffect(() => {
    if (open) {
      // Limpa qualquer overlay anterior
      cleanupOverlays();
      
      if (config) {
        setFormData(config);
      } else {
        setFormData({});
      }
      setShowPassword(false);
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
    setShowPassword(false);
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
            {mode === "create" && "Nova Configuração Senior HCM"}
            {mode === "edit" && "Editar Configuração Senior HCM"}
            {mode === "view" && "Visualizar Configuração Senior HCM"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="username">Usuário</Label>
            <Input
              id="username"
              value={formData.username || ""}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              disabled={isReadOnly || loading}
              placeholder="Digite o usuário"
            />
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password || ""}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                disabled={isReadOnly || loading}
                placeholder="Digite a senha"
              />
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="wsdlUrl">URL do WSDL</Label>
            <Input
              id="wsdlUrl"
              value={formData.wsdlUrl || ""}
              onChange={(e) => setFormData({...formData, wsdlUrl: e.target.value})}
              disabled={isReadOnly || loading}
              placeholder="https://exemplo.com/service?wsdl"
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