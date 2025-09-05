"use client";

import { CustomButton } from "@/components/ui/custom-button";
import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFiles } from "./api/getFiles";
import { useModule } from "@/lib/context/ModuleContext";
import { CustomCard } from "@/components/ui/custom-card";
import { Button } from "@/components/ui/button";
import {
  DownloadIcon,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { postFile } from "./api/postFile";
import { deleteFile } from "./api/deleteFile";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import Image from "next/image";

export default function FilesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentModule } = useModule();
  const queryClient = useQueryClient();
  const [fileToDelete, setFileToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [pagina, setPagina] = useState(1);
  const [tamanhoPagina, setTamanhoPagina] = useState(10);

  const { data: files, isLoading } = useQuery({
    queryKey: ["files", currentModule, pagina, tamanhoPagina],
    queryFn: () => getFiles(currentModule, pagina, tamanhoPagina),
  });

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex bg-background text-foreground">
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold">Arquivos</h2>
          <div className="flex gap-4 items-center">
            {/* Select de página */}
            {files && files.totalPaginas > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="rounded hover:bg-muted disabled:opacity-50 border p-1"
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <select
                  className="border rounded px-2 py-1 text-sm bg-card"
                  value={pagina}
                  onChange={(e) => setPagina(Number(e.target.value))}
                >
                  {Array.from({ length: files.totalPaginas }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Página {i + 1}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className=" rounded hover:bg-muted disabled:opacity-50 border p-1"
                  onClick={() =>
                    setPagina((p) => Math.min(files.totalPaginas, p + 1))
                  }
                  disabled={pagina === files.totalPaginas}
                  aria-label="Próxima página"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
            {/* Select de tamanho da página */}
            {files && (
              <select
                className="border rounded px-2 py-1 text-sm bg-card"
                value={tamanhoPagina}
                onChange={(e) => {
                  setTamanhoPagina(Number(e.target.value));
                  setPagina(1); // volta pra primeira página ao mudar tamanho
                }}
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size} por página
                  </option>
                ))}
              </select>
            )}
            <CustomButton className="text-sm" onClick={handleFileSelect}>
              + Adicionar
            </CustomButton>
          </div>
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
        ) : files?.itens.length ? (
          <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-6 gap-6">
            {files.itens.map((file, index) => {
              const fileExtension =
                file.fileName.split(".").pop()?.toLowerCase() || "";
              const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(
                fileExtension
              );
              const isPdf = fileExtension === "pdf";
              const idDocx = fileExtension === "docx";
              const isXlsx =
                fileExtension === "xlsx" ||
                fileExtension === "xls" ||
                fileExtension === "csv";
              return (
                <CustomCard key={file.id || `file-${index}`}>
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <p
                        className="text-sm font-semibold line-clamp-2"
                        title={file.fileName}
                      >
                        {file.fileName}
                      </p>
                      <div className="w-full h-32 flex items-center justify-center my-2 bg-zinc-100 rounded">
                        {
                          <Image
                            src={
                              isImage
                                ? file.urlFile
                                : isPdf
                                ? "/img/pdf.png"
                                : idDocx
                                ? "/img/docx.png"
                                : isXlsx
                                ? "/img/xlsx.png"
                                : "/img/file.png"
                            }
                            alt={file.fileName}
                            className="object-contain max-h-28 max-w-full"
                            width={isImage ? 112 : 48}
                            height={isImage ? 112 : 48}
                          />
                        }
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-24"
                        onClick={() => window.open(file.urlFile, "_blank")}
                      >
                        <DownloadIcon size={16} className="mr-2" />
                        Baixar
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={async () => {
                              setFileToDelete({
                                id: file.id,
                                name: file.fileName,
                              });
                            }}
                          >
                            <Trash2 size={16} className="mr-2 inline" />
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
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
            key={fileToDelete.id}
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
