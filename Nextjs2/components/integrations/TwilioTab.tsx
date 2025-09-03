"use client";

import { useState, useEffect, useCallback } from "react";
import { useModule } from "@/lib/context/ModuleContext";
import { CustomCard } from "@/components/ui/custom-card";
import { Button } from "@/components/ui/button";
import { Plus, Phone, MoreVertical, Eye, Edit, Trash } from "lucide-react";
import { TwilioModal } from "./TwilioModal";
import { TwilioConfig, TwilioConfigRequest } from "@/lib/interface/TwilioConfig";
import {
  getTwilioConfigs,
  createTwilioConfig,
  updateTwilioConfig,
  deleteTwilioConfig,
} from "@/app/(app)/integrations/api/twilioApi";
import { useToast } from "@/hooks/use-toast";
import { DeleteDialog } from "@/components/DeleteDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TwilioTab() {
  const { currentModule } = useModule();
  const [configs, setConfigs] = useState<TwilioConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedConfig, setSelectedConfig] = useState<TwilioConfig | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<TwilioConfig | null>(null);
  const { toast } = useToast();

  // Função de limpeza de emergência
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + L para limpar modais travados
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        const overlays = document.querySelectorAll('[data-radix-portal]');
        overlays.forEach(el => el.remove());
        document.body.style.pointerEvents = '';
        document.body.style.overflow = '';
        console.log('Overlays limpos');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTwilioConfigs(currentModule);
      setConfigs(data);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações do Twilio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentModule, toast]);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  const handleCreate = () => {
    setSelectedConfig(null);
    setModalMode("create");
    // Pequeno delay para garantir que o estado anterior foi limpo
    setTimeout(() => {
      setModalOpen(true);
    }, 10);
  };

  const handleView = (config: TwilioConfig) => {
    setSelectedConfig(config);
    setModalMode("view");
    setTimeout(() => {
      setModalOpen(true);
    }, 10);
  };

  const handleEdit = (config: TwilioConfig) => {
    setSelectedConfig(config);
    setModalMode("edit");
    setTimeout(() => {
      setModalOpen(true);
    }, 10);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    // Limpa o estado após o modal fechar
    setTimeout(() => {
      setSelectedConfig(null);
      setModalMode("create");
    }, 300);
  };

  const handleDeleteClick = (config: TwilioConfig) => {
    setConfigToDelete(config);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!configToDelete) return;

    try {
      await deleteTwilioConfig(currentModule, configToDelete.accountSid);
      toast({
        title: "Sucesso",
        description: "Configuração deletada com sucesso",
      });
      loadConfigs();
    } catch (error) {
      console.error("Erro ao deletar configuração:", error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar a configuração",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setConfigToDelete(null);
    }
  };

  const handleSave = async (data: Partial<TwilioConfig>) => {
    try {
      const requestData: TwilioConfigRequest = {
        "account-sid": data.accountSid || "",
        "auth-token": data.authToken || "",
        "webhook-url": data.webhookUrl || "",
      };

      if (modalMode === "create") {
        await createTwilioConfig(currentModule, requestData);
        toast({
          title: "Sucesso",
          description: "Configuração criada com sucesso",
        });
      } else if (modalMode === "edit" && selectedConfig) {
        await updateTwilioConfig(
          currentModule,
          selectedConfig.accountSid,
          requestData
        );
        toast({
          title: "Sucesso",
          description: "Configuração atualizada com sucesso",
        });
      }
      
      loadConfigs();
      handleModalClose();
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a configuração",
        variant: "destructive",
      });
      throw error; // Re-throw para o modal saber que houve erro
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie as configurações de integração com o Twilio
        </p>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Configuração
        </Button>
      </div>

      {loading ? (
        <p className="text-zinc-400">Carregando configurações...</p>
      ) : configs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {configs.map((config) => (
            <CustomCard key={config.accountSid}>
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-3 text-primary" />
                    <div>
                      <h3 className="font-semibold text-lg">Twilio</h3>
                      <p className="text-xs text-gray-500">{config.accountSid}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(config)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(config)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(config)}
                        className="text-red-600"
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-2 flex-1">
                  <div>
                    <p className="text-xs text-gray-500">Webhook URL</p>
                    <p className="text-sm truncate">{config.webhookUrl}</p>
                  </div>
                </div>
              </div>
            </CustomCard>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Phone className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">Nenhuma configuração encontrada</p>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Criar primeira configuração
          </Button>
        </div>
      )}

      <TwilioModal
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        config={selectedConfig}
        mode={modalMode}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Confirmar exclusão"
        description="Tem certeza que deseja excluir esta configuração? Esta ação não pode ser desfeita."
      />
    </div>
  );
}