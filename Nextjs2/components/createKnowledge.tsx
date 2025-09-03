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
import { postKnowledge } from "@/app/(app)/knowledges/api/postKnowledge";
import { useToast } from "@/hooks/use-toast";
import { CustomButton } from "@/components/ui/custom-button";
import { Origin, OriginLabels } from "@/lib/enums/origin";
import { useModule } from "@/lib/context/ModuleContext";
import { useQueryClient } from "@tanstack/react-query";

export default function CreateKnowledge() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [origin, setOrigin] = useState<Origin | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { currentModule } = useModule();
  const queryClient = useQueryClient();

  const handleCreate = async () => {
    if (!name || origin == null) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await postKnowledge(
        {
          name,
          description: description || undefined,
          origin,
        },
        currentModule
      );

      toast({
        title: "Sucesso",
        description: "Conhecimento criado com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["knowledges", currentModule],
      });

      setName("");
      setDescription("");
      setOrigin(undefined);
      setOpen(false);
    } catch (error: unknown) {
      console.error("Erro ao criar conhecimento:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar conhecimento. Tente novamente.",
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
          <span>+ Novo Conhecimento</span>
        </CustomButton>
      </DialogTrigger>
      <DialogContent className="bg-dialog text-dialog-foreground border border-accent">
        <DialogHeader>
          <div className="flex flex-col items-center">
            <DialogTitle className="font-bold mt-4">
              Cadastrar novo conhecimento
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="knowledgeName">Nome do Conhecimento</Label>
            <Input
              id="knowledgeName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome do conhecimento"
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Digite uma descrição para o conhecimento"
            />
          </div>
          <div>
            <Label>Origem</Label>
            <div className="flex gap-2 mt-2">
              {Object.values(Origin)
                .filter((value) => typeof value === "number")
                .map((originValue) => {
                  const isSelected = origin === originValue;
                  return (
                    <button
                      key={originValue}
                      onClick={() => setOrigin(originValue as Origin)}
                      className={`flex-1 p-3 rounded-md transition-colors text-sm font-medium border ${
                        isSelected
                          ? "bg-white shadow text-black"
                          : "text-muted-foreground hover:bg-gray-100"
                      }`}
                    >
                      {OriginLabels[originValue as Origin]}
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
            {isLoading ? "Criando..." : "Criar Conhecimento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
