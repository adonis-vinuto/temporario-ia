"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Paperclip } from "lucide-react";
import { postDataAgent } from "@/app/(app)/agents/[id]/agente/actions/postDataAgent";

export default function AddDataAgentRH({ id }: { id?: number }) {
  const [filesColaboradores, setFilesColaboradores] = useState<
    { name: string; date: string }[]
  >([]);
  const [filesSalario, setFilesSalario] = useState<
    { name: string; date: string }[]
  >([]);
  const [filesEventos, setFilesEventos] = useState<
    { name: string; date: string }[]
  >([]);
  const [fileInputColaboradores, setFileInputColaboradores] =
    useState<File | null>(null);
  const [fileInputSalario, setFileInputSalario] = useState<File | null>(null);
  const [fileInputEventos, setFileInputEventos] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [colaboradoresUploaded, setColaboradoresUploaded] = useState(false);

  const handleSave = async (type: string) => {
    if (!id) {
      alert("ID do agente ausente.");
      return;
    }

    let fileInput;
    if (type === "colaboradores") {
      fileInput = fileInputColaboradores;
    } else if (type === "salario") {
      fileInput = fileInputSalario;
    } else if (type === "eventos") {
      fileInput = fileInputEventos;
    }

    if (!fileInput) {
      alert("Arquivo ausente.");
      return;
    }

    const confirmation = confirm(
      "Atenção: Os dados atuais serão apagados e sobrepostos. Deseja continuar?"
    );
    if (!confirmation) {
      return;
    }

    setUploadStatus("sending");

    const formData = new FormData();
    formData.append("idAgent", id.toString());
    formData.append("type", type);
    formData.append("file", fileInput);

    try {
      await postDataAgent(formData);
      setUploadStatus("success");
      if (type === "colaboradores") {
        setFilesColaboradores([]);
        setFileInputColaboradores(null);
        setColaboradoresUploaded(true);
      } else if (type === "salario") {
        setFilesSalario([]);
        setFileInputSalario(null);
      } else if (type === "eventos") {
        setFilesEventos([]);
        setFileInputEventos(null);
      }
      setTimeout(() => setUploadStatus("idle"), 3000);
    } catch (error: any) {
      console.error("Erro ao enviar arquivo:", error);
      let msg = "Erro ao enviar o arquivo.";
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

  const handleAddFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const now = new Date().toLocaleString();
      if (type === "colaboradores") {
        setFilesColaboradores((prev) => [
          ...prev,
          { name: file.name, date: now },
        ]);
        setFileInputColaboradores(file);
      } else if (type === "salario") {
        setFilesSalario((prev) => [...prev, { name: file.name, date: now }]);
        setFileInputSalario(file);
      } else if (type === "eventos") {
        setFilesEventos((prev) => [...prev, { name: file.name, date: now }]);
        setFileInputEventos(file);
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full mt-4">Importar Dados via Excel</Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 text-white border border-zinc-700 h-[70vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Importar Dados via Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dados dos Colaboradores */}
          <div>
            <div className="flex items-center mb-2 gap-2">
              <a
                href="https://statumdisco.blob.core.windows.net/acade/Employees.xlsx"
                download
              >
                <Button
                  className="inline-flex items-center gap-2 cursor-pointer px-3 py-2 bg-zinc-800 text-white rounded-md text-sm hover:bg-zinc-700 transition"
                  variant="outline"
                  size="sm"
                >
                  Modelo
                </Button>
              </a>
              <h3 className="text-lg font-semibold">
                Importar Dados dos Colaboradores
              </h3>
            </div>
            <p className="text-sm text-zinc-400 mb-2">
              Faça upload do arquivo Excel com os dados dos colaboradores.
            </p>
            <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-2 bg-zinc-800 text-white rounded-md text-sm hover:bg-zinc-700 transition">
              <Paperclip size={16} />
              Adicionar Anexo
              <input
                type="file"
                onChange={(e) => handleAddFile(e, "colaboradores")}
                className="hidden"
              />
            </label>
            {filesColaboradores.length > 0 && (
              <div className="mt-2">
                <h4 className="text-sm font-semibold mb-1">
                  Arquivos adicionados:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-zinc-300">
                  {filesColaboradores.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span>
                        📎 {file.name}{" "}
                        <span className="text-xs text-zinc-400">
                          ({file.date})
                        </span>
                      </span>
                      <button
                        onClick={() =>
                          setFilesColaboradores(
                            filesColaboradores.filter((_, i) => i !== index)
                          )
                        }
                        className="ml-2 text-red-500 hover:underline text-xs"
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button
              className="mt-2"
              onClick={() => handleSave("colaboradores")}
              disabled={uploadStatus === "sending"}
            >
              {uploadStatus === "sending"
                ? "Enviando..."
                : "Enviar Dados dos Colaboradores"}
            </Button>
          </div>

          {/* Histórico de Alteração no Salário */}
          <div>
            <div className="flex items-center mb-2 gap-2">
              <a
                href="https://statumdisco.blob.core.windows.net/acade/Salary history.xlsx"
                download
              >
                <Button
                  className="inline-flex items-center gap-2 cursor-pointer px-3 py-2 bg-zinc-800 text-white rounded-md text-sm hover:bg-zinc-700 transition"
                  variant="outline"
                  size="sm"
                >
                  Modelo
                </Button>
              </a>
              <h3 className="text-lg font-semibold">
                Importar Histórico de Alteração no Salário
              </h3>
            </div>
            <p className="text-sm text-zinc-400 mb-2">
              Faça upload do Excel com o histórico de alterações salariais.
              Requer dados dos colaboradores.
            </p>
            <label
              className={`inline-flex items-center gap-2 cursor-pointer px-3 py-2 bg-zinc-800 text-white rounded-md text-sm hover:bg-zinc-700 transition ${
                !colaboradoresUploaded ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Paperclip size={16} />
              Adicionar Anexo
              <input
                type="file"
                onChange={(e) => handleAddFile(e, "salario")}
                className="hidden"
                disabled={!colaboradoresUploaded}
              />
            </label>
            {filesSalario.length > 0 && (
              <div className="mt-2">
                <h4 className="text-sm font-semibold mb-1">
                  Arquivos adicionados:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-zinc-300">
                  {filesSalario.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span>
                        📎 {file.name}{" "}
                        <span className="text-xs text-zinc-400">
                          ({file.date})
                        </span>
                      </span>
                      <button
                        onClick={() =>
                          setFilesSalario(
                            filesSalario.filter((_, i) => i !== index)
                          )
                        }
                        className="ml-2 text-red-500 hover:underline text-xs"
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button
              className="mt-2"
              onClick={() => handleSave("salario")}
              disabled={uploadStatus === "sending" || !colaboradoresUploaded}
            >
              {uploadStatus === "sending"
                ? "Enviando..."
                : "Enviar Histórico de Salário"}
            </Button>
          </div>

          {/* Dados de Eventos de Pagamento */}
          <div>
            <div className="flex items-center mb-2 gap-2">
              <a
                href="https://statumdisco.blob.core.windows.net/acade/Payrooll Details.xlsx"
                download
              >
                <Button
                  className="inline-flex items-center gap-2 cursor-pointer px-3 py-2 bg-zinc-800 text-white rounded-md text-sm hover:bg-zinc-700 transition"
                  variant="outline"
                  size="sm"
                >
                  Modelo
                </Button>
              </a>
              <h3 className="text-lg font-semibold">
                Importar Dados de Eventos de Pagamento
              </h3>
            </div>
            <p className="text-sm text-zinc-400 mb-2">
              Faça upload do Excel com os eventos de pagamento. Requer dados dos
              colaboradores.
            </p>
            <label
              className={`inline-flex items-center gap-2 cursor-pointer px-3 py-2 bg-zinc-800 text-white rounded-md text-sm hover:bg-zinc-700 transition ${
                !colaboradoresUploaded ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Paperclip size={16} />
              Adicionar Anexo
              <input
                type="file"
                onChange={(e) => handleAddFile(e, "eventos")}
                className="hidden"
                disabled={!colaboradoresUploaded}
              />
            </label>
            {filesEventos.length > 0 && (
              <div className="mt-2">
                <h4 className="text-sm font-semibold mb-1">
                  Arquivos adicionados:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-zinc-300">
                  {filesEventos.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span>
                        📎 {file.name}{" "}
                        <span className="text-xs text-zinc-400">
                          ({file.date})
                        </span>
                      </span>
                      <button
                        onClick={() =>
                          setFilesEventos(
                            filesEventos.filter((_, i) => i !== index)
                          )
                        }
                        className="ml-2 text-red-500 hover:underline text-xs"
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button
              className="mt-2"
              onClick={() => handleSave("eventos")}
              disabled={uploadStatus === "sending" || !colaboradoresUploaded}
            >
              {uploadStatus === "sending"
                ? "Enviando..."
                : "Enviar Dados de Eventos"}
            </Button>
          </div>
        </div>

        {/* Feedback visual */}
        {uploadStatus === "sending" && (
          <div className="text-sm text-blue-400 mt-4">Enviando arquivo...</div>
        )}
        {uploadStatus === "success" && (
          <div className="text-sm text-green-400 flex items-center gap-2 mt-4">
            ✅ Arquivo enviado com sucesso!
          </div>
        )}
        {uploadStatus === "error" && (
          <div className="text-sm text-red-400 flex items-center gap-2 mt-4">
            ❌ {errorMessage}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
