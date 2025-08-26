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
import { criarAgenteIA } from "@/app/(app)/agents/api/postAgente";
import { enumKeys } from "../lib/utils";
import { useToast } from "@/hooks/use-toast";
import { CustomButton } from "@/components/ui/custom-button";
import {
  AgentType,
  AgentTypeIcon,
  AgentTypeLabel,
} from "@/lib/enums/agentType";
import { useModule } from "@/lib/context/ModuleContext";
import EmojiPicker from "emoji-picker-react";

// Componente para renderizar o ícone baseado no tipo de agente
const IconForType = ({ type }: { type: AgentType }) => {
  const Icon = AgentTypeIcon[type];
  return <Icon />;
};

export default function CreateAgente() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<AgentType | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { currentModule } = useModule();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("💻");

  const handleCreate = async () => {
    if (!name || !description || type == null) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await criarAgenteIA({
        module: currentModule,
        name: name,
        description: description,
        type: type,
      });

      console.log(response);

      toast({
        title: "Sucesso",
        description: "Agente criado com sucesso!",
      });

      // Limpar os campos
      setName("");
      setDescription("");
      setType(undefined);
    } catch (error: unknown) {
      console.error("Erro ao criar agente:", error);
      toast({
        title: "Erro",
        description:
          "Erro ao criar agente. Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <CustomButton>
          <span>+ Novo Agente</span>
        </CustomButton>
      </DialogTrigger>
      <DialogContent className="bg-dialog text-dialog-foreground border border-accent">
        <DialogHeader>
          <div className="flex flex-col items-center">
            <div className="bg-gray-200 w-12 h-12 rounded-md">
              <div className="relative">
                <div
                  className="bg-gray-200 w-14 h-14 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-300"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <span className="text-xl">{selectedEmoji}</span>
                </div>
                {showEmojiPicker && (
                  <div className="absolute top-14 left-0 z-50">
                    <EmojiPicker
                      onEmojiClick={(emojiData) => {
                        setSelectedEmoji(emojiData.emoji);
                        setShowEmojiPicker(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <DialogTitle className="font-bold mt-4">
              Cadastrar novo agente
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="agentName">Nome do Agente</Label>
            <Input
              id="agentName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome do agente"
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Digite uma descrição para o agente"
            />
          </div>
          <div>
            <Label>Tipo do Agente</Label>
            <div className="flex justify-between mt-2 w-full gap-2 bg-muted p-1 rounded-lg">
              {enumKeys(AgentType).map((at) => {
                const agentType = AgentType[at];
                const isSelected = type === agentType;

                return (
                  <button
                    key={at}
                    onClick={() => setType(agentType)}
                    className={`flex flex-1 flex-col items-center justify-center p-3 rounded-md transition-colors text-sm font-medium
                        ${
                          isSelected
                            ? "bg-white shadow text-black"
                            : "text-muted-foreground hover:bg-gray-100"
                        }`}
                  >
                    <IconForType type={agentType} />
                    <span className="mt-2">{AgentTypeLabel[agentType]}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <Button
            className="w-full mt-2"
            onClick={handleCreate}
            disabled={isLoading}
          >
            {isLoading ? "Criando..." : "Criar Agente"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
