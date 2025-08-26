"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CustomButton } from "@/components/ui/custom-button";
import { postErpIntegration } from "../api/erp/postErpIntegration";
import { postHcmIntegration } from "../api/hcm/postHcmIntegration";
import { postTwilioIntegration } from "../api/twilio/postTwilioIntegration";
import { useModule } from "@/lib/context/ModuleContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IntegrationType,
  IntegrationTypeLabel,
} from "@/lib/enums/integrationType";
import { enumKeys } from "@/lib/utils";
import { listAgents } from "../../agents/api/getAgents";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateIntegration() {
  const [type, setType] = useState<IntegrationType | undefined>(
    IntegrationType.ERP
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [wsdlUrl, setWsdlUrl] = useState("");
  const [accountSid, setAccountSid] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { currentModule } = useModule();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: agents } = useQuery({
    queryKey: ["agents", currentModule],
    queryFn: () => listAgents(currentModule),
    enabled: type === IntegrationType.Twilio && open,
  });

  const handleCreate = async () => {
    if (type == null) {
      toast({
        title: "Erro",
        description: "Selecione o tipo de integração.",
        variant: "destructive",
      });
      return;
    }

    if (type === IntegrationType.Twilio) {
      if (!accountSid || !authToken || !webhookUrl || !selectedAgent) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos.",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!username || !password || !wsdlUrl) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      if (type === IntegrationType.ERP) {
        await postErpIntegration(
          { username, password, wsdlUrl },
          currentModule
        );
      } else if (type === IntegrationType.HCM) {
        await postHcmIntegration(
          { username, password, wsdlUrl },
          currentModule
        );
      } else if (type === IntegrationType.Twilio) {
        await postTwilioIntegration(
          { accountSid, authToken, webhookUrl },
          selectedAgent,
          currentModule
        );
      }

      toast({
        title: "Sucesso",
        description: "Integração criada com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["integrations", currentModule],
      });

      setType(undefined);
      setUsername("");
      setPassword("");
      setWsdlUrl("");
      setAccountSid("");
      setAuthToken("");
      setWebhookUrl("");
      setSelectedAgent("");
      setOpen(false);
    } catch (error: unknown) {
      console.error("Erro ao criar integração:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar integração. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <CustomButton>
          <span>+ Nova integração</span>
        </CustomButton>
      </DialogTrigger>
      <DialogContent className="bg-dialog text-dialog-foreground border border-accent">
        <DialogHeader>
          <div className="flex flex-col items-center">
            <DialogTitle className="font-bold mt-4">
              Cadastrar nova integração
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label>Tipo de Integração</Label>
            <div className="flex gap-2 mt-2">
              {enumKeys(IntegrationType).map((key) => {
                const integrationType = IntegrationType[key];
                const isSelected = type === integrationType;
                return (
                  <button
                    key={key}
                    onClick={() => setType(integrationType)}
                    className={`flex-1 p-3 rounded-md transition-colors text-sm font-medium border ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:bg-accent"
                    }`}
                  >
                    {IntegrationTypeLabel[integrationType]}
                  </button>
                );
              })}
            </div>
          </div>

          {type === IntegrationType.Twilio ? (
            <>
              <div>
                <Label htmlFor="accountSid">Account SID</Label>
                <Input
                  id="accountSid"
                  value={accountSid}
                  onChange={(e) => setAccountSid(e.target.value)}
                  placeholder="Digite o Account SID"
                />
              </div>
              <div>
                <Label htmlFor="authToken">Auth Token</Label>
                <Input
                  id="authToken"
                  type="password"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  placeholder="Digite o Auth Token"
                />
              </div>
              <div>
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="Digite a URL do webhook"
                />
              </div>
              <div>
                <Label htmlFor="agent">Agente</Label>
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um agente" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents?.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id!}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : type != null ? (
            <>
              <div>
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite o nome de usuário"
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha"
                />
              </div>
              <div>
                <Label htmlFor="wsdlUrl">URL WSDL</Label>
                <Input
                  id="wsdlUrl"
                  value={wsdlUrl}
                  onChange={(e) => setWsdlUrl(e.target.value)}
                  placeholder="Digite a URL do WSDL"
                />
              </div>
            </>
          ) : null}
          <Button
            className="w-full mt-2"
            onClick={handleCreate}
            disabled={isLoading}
          >
            {isLoading ? "Criando..." : "Criar integração"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
