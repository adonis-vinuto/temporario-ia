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
import { AgenteKnowledge } from "@/lib/interface/AgenteKnowledge";
import { AgentType } from "@/lib/enums/agentType";
import { updateAgente } from "@/app/(app)/agents/[id]/agente/actions/putUpdateAgente";
import { AgenteTwilio } from "@/lib/interface/AgenteTwilio";

export default function AddNumber({
  id,
  name,
  description,
  agent_type,
  knowledge,
  twilio,
}: {
  id?: number;
  name: string;
  description: string;
  knowledge: AgenteKnowledge;
  twilio: AgenteTwilio;
  agent_type: AgentType;
}) {
  const [phone, setPhone] = useState(twilio?.phone_number || "");
  const [accountSID, setAccountSID] = useState(twilio?.account_sid || "");
  const [authToken, setAuthToken] = useState(twilio?.auth_token || "");
  const [webhook] = useState(twilio?.webhook || "");
  const [copied, setCopied] = useState(false);

  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async () => {
    if (!id || !phone || !accountSID || !authToken || !webhook) {
      setErrorMessage("Todos os campos são obrigatórios.");
      setStatus("error");
      return;
    }

    const agente = {
      id,
      name,
      description,
      agent_type,
      knowledge,
      twilio_communication: {
        phone_number: phone,
        account_sid: accountSID,
        auth_token: authToken,
        webhook: webhook,
      },
    };

    setStatus("saving");

    try {
      await updateAgente(agente);
      setStatus("success");
      setErrorMessage(null);

      setTimeout(() => setStatus("idle"), 3000);
    } catch (error: any) {
      console.error("Erro ao atualizar agente:", error.message);
      setErrorMessage(error.message || "Erro ao atualizar agente.");
      setStatus("error");

      setTimeout(() => {
        setStatus("idle");
        setErrorMessage(null);
      }, 5000);
    }
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits ? `+${digits}` : "";
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-4 w-full">Conexão WhatsApp (Twilio)</Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 text-white border border-zinc-700">
        <DialogHeader>
          <DialogTitle>
            Adicionar integração com o WhatsApp (Twilio)
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              type="tel"
              value={formatPhone(phone)}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="+55 (16) 98844-4212"
              maxLength={14}
            />
          </div>
          <div>
            <Label htmlFor="accountSID">Account SID</Label>
            <Input
              id="accountSID"
              value={accountSID}
              onChange={(e) => setAccountSID(e.target.value)}
              placeholder="Digite o Account SID"
            />
          </div>
          <div>
            <Label htmlFor="authToken">Auth Token</Label>
            <Input
              id="authToken"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder="Digite o Auth Token"
            />
          </div>
          <div>
            <Label htmlFor="webhook">Webhook</Label>
            <p className="text-sm text-zinc-400 mb-2">
              Este é o URL do webhook que você deve configurar no Twilio.
            </p>
            <div className="relative">
              <Input
                id="webhook"
                value={webhook}
                readOnly
                className="bg-zinc-800 border-2 border-zinc-600 pr-20 truncate"
                title={webhook}
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(webhook);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-600 text-white hover:bg-white hover:text-black"
                variant="outline"
              >
                {copied ? "Copiado!" : "Copiar"}
              </Button>
            </div>
          </div>

          {/* Feedback de status */}
          {status === "saving" && (
            <div className="text-sm text-blue-400">Salvando contato...</div>
          )}
          {status === "success" && (
            <div className="text-sm text-green-400 flex items-center gap-2">
              ✅ Contato salvo com sucesso!
            </div>
          )}
          {status === "error" && (
            <div className="text-sm text-red-400 flex items-center gap-2">
              ❌ {errorMessage}
            </div>
          )}

          <Button
            onClick={handleSave}
            className="w-full mt-2 bg-gray-600 text-white hover:bg-white hover:text-black"
            disabled={status === "saving"}
          >
            {status === "saving" ? "Salvando..." : "Salvar Contato"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
