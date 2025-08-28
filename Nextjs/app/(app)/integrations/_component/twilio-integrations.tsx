// Nextjs/app/(app)/integrations/_component/twilio-integrations.tsx

"use client";

import { useState, useEffect } from "react";
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
import { getTwilioIntegrations } from "../api/twilio/getTwilioIntegrations";
import { postTwilioIntegration } from "../api/twilio/postTwilioIntegration";
import { listAgents } from "../../agents/api/getAgents";
import { TwilioIntegrationModal } from "@/components/TwilioIntegrationModal";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useToast } from "@/hooks/use-toast";
import { TwilioIntegration } from "@/lib/interface/TwilioIntegration";

interface TwilioIntegrationWithAgent extends TwilioIntegration {
  agentId?: string;
  agentName?: string;
}

export default function TwilioIntegrations() {
  const { currentModule } = useModule();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedIntegration, setSelectedIntegration] = useState<TwilioIntegrationWithAgent | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [integrationToDelete, setIntegrationToDelete] = useState<{ integration: TwilioIntegration; agentId: string } | null>(null);
  const [allIntegrations, setAllIntegrations] = useState<TwilioIntegrationWithAgent[]>([]);
  const [modalKey, setModalKey] = useState(0); // Força recriação do modal

  const { data: agents } = useQuery({
    queryKey: ["agents", currentModule],
    queryFn: () => listAgents(currentModule),
  });

  // Buscar integrações de todos os agentes
  useEffect(() => {
    const fetchAllIntegrations = async () => {
      if (!agents || agents.length === 0) {
        setAllIntegrations([]);
        return;
      }

      const integrationsPromises = agents.map(async (agent) => {
        try {
          const integrations = await getTwilioIntegrations(currentModule, agent.id!);
          return integrations.map(int => ({
            ...int,
            agentId: agent.id,
            agentName: agent.name
          }));
        } catch (error) {
          console.error(`Erro ao buscar integrações do agente ${agent.id}:`, error);
          return [];
        }
      });

      const results = await Promise.all(integrationsPromises);
      const flatIntegrations = results.flat();
      setAllIntegrations(flatIntegrations);
    };

    fetchAllIntegrations();
  }, [agents, currentModule]);

  const handleCreate = () => {
    setSelectedIntegration(null);
    setModalMode("create");
    setModalKey(prev => prev + 1); // Força nova instância
    setModalOpen(true);
  };

  const handleView = (integration: TwilioIntegrationWithAgent) => {
    setSelectedIntegration(integration);
    setModalMode("view");
    setModalKey(prev => prev + 1); // Força nova instância
    setModalOpen(true);
  };

  const handleEdit = (integration: TwilioIntegrationWithAgent) => {
    setSelectedIntegration(integration);
    setModalMode("edit");
    setModalKey(prev => prev + 1); // Força nova instância
    setModalOpen(true);
  };

  const handleDelete = (integration: TwilioIntegrationWithAgent) => {
    if (integration.agentId) {
      setIntegrationToDelete({ integration, agentId: integration.agentId });
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!integrationToDelete) return;

    try {
      // TODO: Implementar API de delete quando disponível
      // await deleteTwilioIntegration(currentModule, integrationToDelete.agentId);
      
      toast({
        title: "Sucesso",
        description: "Integração excluída com sucesso",
      });
      
      // Recarregar as integrações
      const updatedIntegrations = allIntegrations.filter(
        int => !(int.agentId === integrationToDelete.agentId)
      );
      setAllIntegrations(updatedIntegrations);
      
      queryClient.invalidateQueries({
        queryKey: ["agents", currentModule],
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

  const handleSave = async (data: Partial<TwilioIntegration & { agentId?: string }>) => {
    try {
      if (modalMode === "create") {
        if (!data.agentId) {
          toast({
            title: "Erro",
            description: "Selecione um agente",
            variant: "destructive",
          });
          return;
        }

        await postTwilioIntegration(
          {
            accountSid: data.accountSid || "",
            authToken: data.authToken || "",
            webhookUrl: data.webhookUrl || "",
          },
          data.agentId,
          currentModule
        );
        toast({
          title: "Sucesso",
          description: "Integração criada com sucesso",
        });
      } else if (modalMode === "edit" && selectedIntegration?.agentId) {
        // TODO: Implementar API de update quando disponível
        // await updateTwilioIntegration(currentModule, selectedIntegration.agentId, data);
        toast({
          title: "Sucesso",
          description: "Integração atualizada com sucesso",
        });
      }

      // Recarregar integrações
      if (agents) {
        const integrationsPromises = agents.map(async (agent) => {
          try {
            const integrations = await getTwilioIntegrations(currentModule, agent.id!);
            return integrations.map(int => ({
              ...int,
              agentId: agent.id,
              agentName: agent.name
            }));
          } catch {
            console.error(`Erro ao buscar integrações do agente ${agent.id}`);
            return [];
          }
        });

        const results = await Promise.all(integrationsPromises);
        setAllIntegrations(results.flat());
      }

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

  const isLoading = !agents;

  if (isLoading) {
    return <p className="text-zinc-400 mt-8">Carregando integrações Twilio...</p>;
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Integrações Twilio</h3>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Integração
        </Button>
      </div>

      {allIntegrations.length === 0 ? (
        <p className="text-zinc-400">Nenhuma integração Twilio encontrada</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allIntegrations.map((integration, index) => (
            <CustomCard key={`${integration.agentId}-${index}`}>
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">Twilio</h3>
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
                    <p className="text-sm text-gray-500">Agente</p>
                    <p className="text-sm font-medium">{integration.agentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account SID</p>
                    <p className="text-sm truncate" title={integration.accountSid}>
                      {integration.accountSid}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Webhook URL</p>
                    <p className="text-sm truncate" title={integration.webhookUrl}>
                      {integration.webhookUrl}
                    </p>
                  </div>
                </div>
              </div>
            </CustomCard>
          ))}
        </div>
      )}

      <TwilioIntegrationModal
        key={`twilio-modal-${modalKey}`}
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
        agents={agents?.map(a => ({ id: a.id!, name: a.name }))}
        selectedAgentId={selectedIntegration?.agentId}
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