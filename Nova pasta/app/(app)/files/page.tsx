"use client";

import { CustomButton } from "@/components/ui/custom-button";
import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFiles } from "./api/getFiles";
import { useModule } from "@/lib/context/ModuleContext";
import { CustomCard } from "@/components/ui/custom-card";
import { Button } from "@/components/ui/button";
import { DownloadIcon, Ellipsis, Trash2 } from "lucide-react";
import { postFile } from "./api/postFile";
import { deleteFile } from "./api/deleteFile";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

export default function FilesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentModule } = useModule();
  const queryClient = useQueryClient();
  const [fileToDelete, setFileToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: files, isLoading } = useQuery({
    queryKey: ["files", currentModule],
    queryFn: () => getFiles(currentModule),
  });

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex bg-background text-foreground">
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold">Arquivos</h2>
          <CustomButton className="text-sm" onClick={handleFileSelect}>
            + Adicionar
          </CustomButton>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                await postFile({ pdf: file }, currentModule);
              }
              queryClient.invalidateQueries({
                queryKey: ["files", currentModule],
              });
            }}
          />
        </header>

        {isLoading ? (
          <p className="text-zinc-400">Carregando arquivos...</p>
        ) : files?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-6 gap-6">
            {files.map((file, index) => {
              const fileExtension =
                file.nameFile.split(".").pop()?.toUpperCase() || "";
              return (
                <CustomCard key={file.idFile || `file-${index}`}>
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">
                        {`Arquivo ${fileExtension}`}
                      </p>
                      <h3 className="font-semibold text-lg mt-2">
                        {file.nameFile}
                      </h3>
                    </div>
                    <div className="flex justify-between items-end">
                      <Button
                        variant="default"
                        size="sm"
                        className="mt-4 w-24"
                        onClick={() => window.open(file.urlFile, "_blank")}
                      >
                        <DownloadIcon size={16} className="mr-2" />
                        Baixar
                      </Button>
                      <DropdownMenu
                        trigger={
                          <Button variant={"ghost"}>
                            <Ellipsis />
                          </Button>
                        }
                      >
                        <DropdownMenuItem
                          onClick={() =>
                            setFileToDelete({
                              id: file.idFile,
                              name: file.nameFile,
                            })
                          }
                        >
                          <Trash2 size={16} className="mr-2 inline" />
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenu>
                    </div>
                  </div>
                </CustomCard>
              );
            })}
          </div>
        ) : (
          <p className="text-zinc-400">Nenhum arquivo encontrado</p>
        )}

        {fileToDelete && (
          <ConfirmationDialog
            trigger={<div />}
            title="Confirmar exclusão"
            description={`Tem certeza que deseja deletar o arquivo "${fileToDelete.name}"? Esta ação não pode ser desfeita.`}
            confirmText="Deletar"
            cancelText="Cancelar"
            variant="destructive"
            onConfirm={async () => {
              await deleteFile(currentModule, fileToDelete.id);
              queryClient.invalidateQueries({
                queryKey: ["files", currentModule],
              });
            }}
            onClose={() => setFileToDelete(null)}
          />
        )}
      </main>
    </div>
  );
}
