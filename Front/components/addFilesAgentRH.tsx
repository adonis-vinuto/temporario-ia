// "use client";

// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { useState } from "react";
// import { Paperclip } from "lucide-react";
// import { documentosRH } from "@/lib/interface/Document";
// import { AgentType } from "@/lib/enums/agentType";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { AgenteFiles } from "@/lib/interface/AgenteFiles";
// import { postFileAgent } from "@/app/(app)/agents/[id]/agente/actions/postFileAgent";
// import { postResumePdf } from "@/app/(app)/agents/[id]/agente/actions/postResumePdf";

// export default function AddFilesAgentRH({
//   id,
//   AgenteFiles,
// }: {
//   id?: number;
//   AgenteFiles?: AgenteFiles[];
// }) {
//   const [fileInputs, setFileInputs] = useState<{ [key: string]: File | null }>(
//     {}
//   );
//   const [uploadStatus, setUploadStatus] = useState<
//     "idle" | "sending" | "success" | "error"
//   >("idle");
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);

//   // Mapeamento de títulos para tipos válidos da API
//   const titleToTypeMap: { [key: string]: string } = {
//     "Documentos de Treinamento e Capacitação":
//       "Rh_DocumentoTreinamentoCapacitacao",
//     "Políticas e Normas Internas": "Rh_PoliticasNormasInternas",
//     "Processos e Fluxos de RH": "Rh_ProcessosFluxos",
//     "Modelos e Documentos Padrão": "Rh_ModelosDocumentos",
//     "FAQs e Histórico de Atendimento": "Rh_FAQs",
//     "Calendário Corporativo e Eventos de RH": "Rh_CalendarioEventos",
//   };

//   const handleSave = async (title: string) => {
//     if (!id) {
//       alert("ID do agente ausente.");
//       return;
//     }

//     const fileInput = fileInputs[title];
//     if (!fileInput) {
//       alert("Nenhum arquivo selecionado.");
//       return;
//     }

//     const type = titleToTypeMap[title];
//     if (!type) {
//       alert("Tipo de documento inválido.");
//       return;
//     }

//     const confirmation = confirm(
//       "Atenção: O envio deste arquivo irá sobrepor arquivos anteriormente enviados. Deseja continuar?"
//     );
//     if (!confirmation) return;

//     setUploadStatus("sending");

//     const formData = new FormData();
//     formData.append("idAgent", id.toString());
//     formData.append("type", type);
//     formData.append("file", fileInput);

//     try {
//       await postFileAgent(formData);
//       setUploadStatus("success");
//       setFileInputs((prev) => ({ ...prev, [title]: null }));
//       setTimeout(() => setUploadStatus("idle"), 3000);
//     } catch (error: any) {
//       console.error("Erro ao enviar arquivo:", error);
//       let msg = "Erro ao enviar o arquivo.";
//       if (typeof error?.message === "string") msg = error.message;
//       setErrorMessage(msg);
//       setUploadStatus("error");
//       setTimeout(() => {
//         setUploadStatus("idle");
//         setErrorMessage(null);
//       }, 5000);
//     }
//   };

//   const handleAddFile = (
//     e: React.ChangeEvent<HTMLInputElement>,
//     title: string
//   ) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setFileInputs((prev) => ({ ...prev, [title]: file }));
//     }
//   };

//   const handleGenerateSummary = (pdf_id: number) => {
//     const confirmation = confirm(
//       "Atenção: A solicitação de resumo irá sobrepor as informações anteriormente treinadas. Deseja continuar?"
//     );
//     if (!confirmation) return;

//     setUploadStatus("sending");

//     const formData = new FormData();
//     formData.append("pdf_id", pdf_id.toString());

//     try {
//       postResumePdf(formData);
//       setUploadStatus("success");
//       setTimeout(() => setUploadStatus("idle"), 3000);
//     } catch (error: any) {
//       console.error("Erro ao enviar arquivo:", error);
//       let msg = "Erro ao enviar o arquivo.";
//       if (typeof error?.message === "string") msg = error.message;
//       setErrorMessage(msg);
//       setUploadStatus("error");
//       setTimeout(() => {
//         setUploadStatus("idle");
//         setErrorMessage(null);
//       }, 5000);
//     }
//   };

//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button className="w-full mt-4">Anexar Arquivos</Button>
//       </DialogTrigger>
//       <DialogContent className="bg-zinc-950 text-white border border-zinc-700 h-[80vh] overflow-auto">
//         <DialogHeader>
//           <DialogTitle>Anexar Arquivos do Agente RH</DialogTitle>
//         </DialogHeader>

//         <TooltipProvider>
//           <div className="space-y-6">
//             {documentosRH
//               .filter((doc) => doc.agent_type === AgentType.RH)
//               .map((doc, index) => {
//                 const existingFile = AgenteFiles?.find(
//                   (f) => f.pdf_type === titleToTypeMap[doc.titulo]
//                 );
//                 return (
//                   <div
//                     key={index}
//                     className="p-3 border border-zinc-700 rounded hover:bg-zinc-800 transition"
//                   >
//                     <Tooltip>
//                       <TooltipTrigger asChild>
//                         <div>
//                           <div className="flex items-center mb-2 gap-2">
//                             <h3 className="text-lg font-semibold">
//                               {doc.titulo}
//                             </h3>
//                           </div>
//                           <p className="text-sm text-zinc-400 mb-2">
//                             {doc.descricao}
//                           </p>
//                           {existingFile && (
//                             <div className="text-sm text-yellow-400 mb-2">
//                               Documento existente: {existingFile.pdf_type}
//                               {existingFile.resume && (
//                                 <p className="text-xs text-zinc-300 mt-1">
//                                   Resumo: {existingFile.resume}
//                                 </p>
//                               )}
//                             </div>
//                           )}
//                           <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-2 bg-zinc-800 text-white rounded-md text-sm hover:bg-zinc-700 transition">
//                             <Paperclip size={16} />
//                             Adicionar Anexo
//                             <input
//                               type="file"
//                               accept=".pdf"
//                               onChange={(e) => handleAddFile(e, doc.titulo)}
//                               className="hidden"
//                               disabled
//                             />
//                           </label>
//                           <div className="mt-2 flex gap-2">
//                             <Tooltip>
//                               <TooltipTrigger asChild>
//                                 <Button className="flex-1" disabled={true}>
//                                   Enviar
//                                 </Button>
//                               </TooltipTrigger>
//                               <TooltipContent>
//                                 Funcionalidade desativada
//                               </TooltipContent>
//                             </Tooltip>
//                             {existingFile && (
//                               <Tooltip>
//                                 <TooltipTrigger asChild>
//                                   <Button className="flex-1" disabled={true}>
//                                     Gerar Resumo
//                                   </Button>
//                                 </TooltipTrigger>
//                                 <TooltipContent>
//                                   Funcionalidade desativada
//                                 </TooltipContent>
//                               </Tooltip>
//                             )}
//                           </div>
//                         </div>
//                       </TooltipTrigger>
//                       <TooltipContent side="right" className="max-w-xs">
//                         {doc.tooltip}
//                       </TooltipContent>
//                     </Tooltip>
//                   </div>
//                 );
//               })}
//           </div>
//         </TooltipProvider>

//         {/* Feedback visual */}
//         {uploadStatus === "sending" && (
//           <div className="text-sm text-blue-400 mt-4">Enviando arquivo...</div>
//         )}
//         {uploadStatus === "success" && (
//           <div className="text-sm text-green-400 flex items-center gap-2 mt-4">
//             ✅ Arquivo enviado com sucesso!
//           </div>
//         )}
//         {uploadStatus === "error" && (
//           <div className="text-sm text-red-400 flex items-center gap-2 mt-4">
//             ❌ {errorMessage}
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }
