// Nextjs/app/(app)/integrations/_component/hcm-integrations.tsx

"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useModule } from "@/lib/context/ModuleContext";
import { CustomCard } from "@/components/ui/custom-card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash, Plus } from "lucide-react";
import { getHcmIntegrations } from "../api/hcm/getHcmIntegrations";
import { postHcmIntegration } from "../api/hcm/postHcmIntegration";
import { HcmIntegrationModal } from "@/components/HcmIntegrationModal";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useToast } from "@/hooks/use-toast";
import { SeniorHcmIntegration } from "@/lib/interface/SeniorHcmIntegration";

export default function HcmIntegrations() {
  const { currentModule } = useModule();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedIntegration, setSelectedIntegration] = useState<SeniorHcmIntegration | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [integrationToDelete, setIntegrationToDelete] = useState<SeniorHcmIntegration | null>(null);
  const [modalKey, setModalKey] = useState(0); // Força recriação do modal

  const { data: integrations, isLoading } = useQuery({
    queryKey: ["hcm-integrations", currentModule],
    queryFn: () => getHcmIntegrations(currentModule),
  });

  const handleCreate = () => {
    setSelectedIntegration(null);
    setModalMode("create");
    setModalKey(prev => prev + 1); // Força nova instância
    setModalOpen(true);
  };

  const handleView = (integration: SeniorHcmIntegration) => {
    setSelectedIntegration(integration);
    setModalMode("view");
    setModalKey(prev => prev + 1); // Força nova instância
    setModalOpen(true);
  };

  const handleEdit = (integration: SeniorHcmIntegration) => {
    setSelectedIntegration(integration);
    setModalMode("edit");
    setModalKey(prev => prev + 1); // Força nova instância
    setModalOpen(true);
  };

  const handleDelete = (integration: SeniorHcmIntegration) => {
    setIntegrationToDelete(integration);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!integrationToDelete) return;

    try {
      // TODO: Implementar API de delete quando disponível
      // await deleteHcmIntegration(currentModule, integrationToDelete.idSeniorHcmConfig);
      
      toast({
        title: "Sucesso",
        description: "Integração excluída com sucesso",
      });
      
      queryClient.invalidateQueries({
        queryKey: ["hcm-integrations", currentModule],
      });
      
      setDeleteDialogOpen(false);
      setIntegrationToDelete(null);
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a integração",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (data: Partial<SeniorHcmIntegration & { password?: string }>) => {
    try {
      if (modalMode === "create") {
        await postHcmIntegration(
          {
            username: data.username || "",
            password: data.password || "",
            wsdlUrl: data.wsdlUrl || "",
          },
          currentModule
        );
        toast({
          title: "Sucesso",
          description: "Integração criada com sucesso",
        });
      } else if (modalMode === "edit" && selectedIntegration) {
        // TODO: Implementar API de update quando disponível
        // await updateHcmIntegration(currentModule, selectedIntegration.idSeniorHcmConfig, data);
        toast({
          title: "Sucesso",
          description: "Integração atualizada com sucesso",
        });
      }

      queryClient.invalidateQueries({
        queryKey: ["hcm-integrations", currentModule],
      });
      
      setModalOpen(false);
      setSelectedIntegration(null);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a integração",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <p className="text-zinc-400 mt-8">Carregando integrações HCM...</p>;
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Integrações Senior HCM</h3>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Integração
        </Button>
      </div>

      {!integrations?.length ? (
        <p className="text-zinc-400">Nenhuma integração HCM encontrada</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {integrations.map((integration) => (
            <CustomCard key={integration.idSeniorHcmConfig}>
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">Senior HCM</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(integration)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(integration)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(integration)}
                        className="text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-2 flex-1">
                  <div>
                    <p className="text-sm text-gray-500">Usuário</p>
                    <p className="text-sm">{integration.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">URL WSDL</p>
                    <p className="text-sm truncate" title={integration.wsdlUrl}>
                      {integration.wsdlUrl}
                    </p>
                  </div>
                </div>
              </div>
            </CustomCard>
          ))}
        </div>
      )}

      <HcmIntegrationModal
        key={`hcm-modal-${modalKey}`}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedIntegration(null);
          // Força limpeza do DOM após fechamento
          setTimeout(() => {
            setModalKey(prev => prev + 1);
          }, 100);
        }}
        onSave={handleSave}
        integration={selectedIntegration}
        mode={modalMode}
      />

      <DeleteDialog
        key={`delete-dialog-${deleteDialogOpen ? 'open' : 'closed'}`}
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setIntegrationToDelete(null);
          }
        }}
        onConfirm={confirmDelete}
        title="Confirmar exclusão"
        description="Tem certeza que deseja excluir esta integração? Esta ação não pode ser desfeita."
      />
    </div>
  );
}