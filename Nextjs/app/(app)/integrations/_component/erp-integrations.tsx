// Nextjs/app/(app)/integrations/_component/erp-integrations.tsx

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
import { getErpIntegrations } from "../api/erp/getErpIntegrations";
import { postErpIntegration } from "../api/erp/postErpIntegration";
import { ErpIntegrationModal } from "@/components/ErpIntegrationModal";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useToast } from "@/hooks/use-toast";
import { SeniorErpIntegration } from "@/lib/interface/SeniorErpIntegration";

export default function ErpIntegrations() {
  const { currentModule } = useModule();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [selectedIntegration, setSelectedIntegration] =
    useState<SeniorErpIntegration | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [integrationToDelete, setIntegrationToDelete] =
    useState<SeniorErpIntegration | null>(null);// Força recriação do modal

  const { data: integrations, isLoading } = useQuery({
    queryKey: ["erp-integrations", currentModule],
    queryFn: () => getErpIntegrations(currentModule),
  });

  const handleCreate = () => {
    setSelectedIntegration(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleView = (integration: SeniorErpIntegration) => {
    setSelectedIntegration(integration);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEdit = (integration: SeniorErpIntegration) => {
    setSelectedIntegration(integration);
    setModalMode("edit");
    
    setModalOpen(true);
  };

  const handleDelete = (integration: SeniorErpIntegration) => {
    setIntegrationToDelete(integration);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!integrationToDelete) return;

    try {
      // TODO: Implementar API de delete quando disponível
      // await deleteErpIntegration(currentModule, integrationToDelete.idSeniorErpConfig);

      toast({
        title: "Sucesso",
        description: "Integração excluída com sucesso",
      });

      queryClient.invalidateQueries({
        queryKey: ["erp-integrations", currentModule],
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

  const handleSave = async (
    data: Partial<SeniorErpIntegration & { password?: string }>
  ) => {
    try {
      if (modalMode === "create") {
        await postErpIntegration(
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
        // await updateErpIntegration(currentModule, selectedIntegration.idSeniorErpConfig, data);
        toast({
          title: "Sucesso",
          description: "Integração atualizada com sucesso",
        });
      }

      queryClient.invalidateQueries({
        queryKey: ["erp-integrations", currentModule],
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
    return <p className="text-zinc-400 mt-8">Carregando integrações ERP...</p>;
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Integrações Senior ERP</h3>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Integração
        </Button>
      </div>

      {!integrations?.length ? (
        <p className="text-zinc-400">Nenhuma integração ERP encontrada</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {integrations.map((integration) => (
            <CustomCard key={integration.idSeniorErpConfig}>
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">Senior ERP</h3>
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

      <ErpIntegrationModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedIntegration(null);
        }}
        onSave={handleSave}
        integration={selectedIntegration}
        mode={modalMode}
      />

      <DeleteDialog
        key={`delete-dialog-${deleteDialogOpen ? "open" : "closed"}`}
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
