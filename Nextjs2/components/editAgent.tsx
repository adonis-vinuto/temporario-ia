"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { updateAgente } from "../app/(app)/agents/[id]/agente/actions/putUpdateAgente";
import { Input } from "@/components/ui/input";

export default function EditAgent({
  id,
  name,
  description,
}: Readonly<{
  id: number;
  name: string;
  description: string;
}>) {
  const [editedName, setEditedName] = useState(name);
  const [editedDescription, setEditedDescription] = useState(description);

  // const getBaseContext = (module: Module) => {
  //   switch (module) {
  //     case Module.People:
  //       return "Você é um assistente virtual movido a IA facilita o onboarding de novos funcionários, oferecendo suporte 24/7 em cultura empresarial, tarefas administrativas, planejamento do primeiro dia, respostas a FAQs, orientação em processos, conteúdo interativo, coleta de feedback e gerenciamento de casos; mantém um tom acolhedor, profissional, com respostas concisas e personalizadas; garante precisão, confidencialidade, conformidade e inclusão.";
  //     case Module.Sales:
  //       return "Você é um assistente virtual de IA para suporte em vendas que fornece informações detalhadas sobre produtos, estratégias de vendas, respostas a perguntas frequentes, materiais de treinamento e análises de mercado aos vendedores da empresa, com foco em aumentar a eficácia nas interações com clientes; utiliza tom profissional e respostas concisas, personalizadas com variáveis como nome do usuário e departamento; garante precisão, confidencialidade e conformidade, priorizando perguntas de onboarding; inclui exemplos e incentiva feedback e ajuda adicional quando necessário.";
  //     // case Module.Support:
  //     //   return "Você é um assistente de IA projetado para suporte ao cliente, ajudando clientes e equipe de suporte com FAQs, informações de produtos, processos e procedimentos internos, adaptando linguagem, mantendo tom profissional, respostas concisas, garantindo precisão, confidencialidade e conformidade, focando em onboarding, promovendo cultura inclusiva, incentivando feedback e usando variáveis para personalização, com exemplos.";
  //     case Module.Finance:
  //       return "Você é um assistente virtual, uma ferramenta de inteligência artificial projetada especificamente para a área de finanças e gestão empresarial, com foco em fornecer suporte detalhado a gestores e profissionais do financeiro. Ele atende a um público-alvo composto por diretores, gerentes de departamento, contadores e analistas financeiros, que possuem conhecimento em administração de empresas, contabilidade, finanças ou áreas relacionadas, sendo geralmente adultos com experiência em suas funções. O propósito principal é facilitar a gestão e a tomada de decisão, fornecendo informações precisas, análises detalhadas e ideias estratégicas que permitam decisões baseadas em dados, aumentando a eficiência e a competitividade da empresa.";
  //     default:
  //       return "";
  //   }
  // };

  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async () => {
    if (!id || !editedName || !editedDescription) {
      alert("Todos os campos são obrigatórios.");
      return;
    }

    setUploadStatus("sending");

    try {
      await updateAgente(id, editedName, 0, editedDescription, 0);
      setUploadStatus("success");
      setTimeout(() => setUploadStatus("idle"), 3000);
    } catch (error: any) {
      console.error("Erro ao enviar conteúdo:", error);

      let msg = "Erro ao enviar o conteúdo.";
      if (typeof error?.message === "string") {
        msg = error.message;
      }

      setErrorMessage(msg);
      setUploadStatus("error");

      setTimeout(() => {
        setUploadStatus("idle");
        setErrorMessage(null);
      }, 5000);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full mt-4">Editar</Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 text-white border border-zinc-700 overflow-auto">
        <DialogHeader>
          <DialogTitle className="font-bold text-xl">
            Adicionar informação ao agente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div>
            <Label htmlFor="name" className="font-bold text-lg">
              Nome do Agente
            </Label>
            <Input
              id="name"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder="Digite o nome do agente"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description" className="font-bold text-lg">
              Descrição do Agente
            </Label>
            <Input
              id="description"
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              placeholder="Digite a descrição do agente"
              className="mt-1"
            />
          </div>

          {/* Feedback visual */}
          {uploadStatus === "sending" && (
            <div className="text-sm text-blue-400">Enviando conteúdo...</div>
          )}
          {uploadStatus === "success" && (
            <div className="text-sm text-green-400 flex items-center gap-2">
              ✅ Conteúdo enviado com sucesso!
            </div>
          )}
          {uploadStatus === "error" && (
            <div className="text-sm text-red-400 flex items-center gap-2">
              ❌ {errorMessage}
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleSave}
            disabled={uploadStatus === "sending"}
          >
            {uploadStatus === "sending" ? "Salvando..." : "Salvar conhecimento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
