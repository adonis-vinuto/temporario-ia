// "use client";

// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { useState } from "react";

// import { updateAgente } from "@/app/(app)/agents/[id]/agente/actions/putUpdateAgente";
// import { postIntegracaoAgent } from "@/app/(app)/agents/[id]/agente/actions/postUpdateIntegracao";
// import { AgenteSenior } from "@/lib/interface/AgenteSenior";
// import { AgentType } from "@/lib/enums/agentType";

// export default function AddSeniorRH({
//   id,
//   name,
//   description,
//   agent_type,
//   senior_connect,
// }: {
//   id: number;
//   name: string;
//   description: string;
//   agent_type: AgentType;
//   senior_connect: AgenteSenior;
// }) {
//   const [url_integracao_assistente_hcm_gabriel] = useState(
//     senior_connect?.url_integracao_assistente_hcm_gabriel || ""
//   );
//   const [url_integracao_assistente_hcm] = useState(
//     senior_connect?.url_integracao_assistente_hcm || ""
//   );
//   const [url_integracao_hcm, setUrl_integracao_hcm] = useState(
//     senior_connect?.url_integracao_hcm || ""
//   );
//   const [username, setUsername] = useState(senior_connect?.username || "");
//   const [password, setPassword] = useState(senior_connect?.password || "");
//   const [webhook] = useState(senior_connect?.webhook || "");
//   const [copied, setCopied] = useState(false);

//   const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
//     "idle"
//   );
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);

//   const handleSave = async () => {
//     const agente = {
//       id,
//       name,
//       agent_type,
//       description,
//       senior_connect: {
//         url_integracao_assistente_hcm_gabriel:
//           url_integracao_assistente_hcm_gabriel,
//         url_integracao_assistente_hcm: url_integracao_assistente_hcm,
//         url_integracao_hcm: url_integracao_hcm,
//         username: username,
//         password: password,
//       },
//     };

//     setStatus("saving");

//     try {
//       await updateAgente(agente);

//       const formData = new FormData();
//       formData.append("idAgent", id.toString());

//       await postIntegracaoAgent(formData);
//       setStatus("success");
//       setErrorMessage(null);

//       setTimeout(() => setStatus("idle"), 3000);
//     } catch (error: any) {
//       console.error("Erro ao atualizar agente:", error.message);
//       setErrorMessage(error.message || "Erro ao atualizar agente.");
//       setStatus("error");

//       setTimeout(() => {
//         setStatus("idle");
//         setErrorMessage(null);
//       }, 5000);
//     }
//   };

//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button className="mt-4 w-full">Integração HCM (Sênior)</Button>
//       </DialogTrigger>
//       <DialogContent className="bg-zinc-950 text-white border border-zinc-700">
//         <DialogHeader>
//           <DialogTitle>
//             Adicionar integração com o sistema Sênior HCM{" "}
//           </DialogTitle>
//         </DialogHeader>
//         <div className="space-y-4">
//           <div>
//             <Label htmlFor="url_integracao_hcm">
//               URL WSDL para a integração
//             </Label>
//             <Input
//               id="url_integracao_hcm"
//               value={url_integracao_hcm}
//               onChange={(e) => setUrl_integracao_hcm(e.target.value)}
//               placeholder="Digite a URL WSDL"
//             />
//           </div>
//           <div>
//             <Label htmlFor="username">
//               Inserir usuário para as integrações
//             </Label>
//             <Input
//               id="username"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               placeholder="Digite o usuário"
//             />
//           </div>
//           <div>
//             <Label htmlFor="password">Inserir senha para as integrações</Label>
//             <Input
//               id="password"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="Digite a senha"
//             />
//           </div>
//           <div>
//             <Label htmlFor="webhook">Webhook</Label>
//             <p className="text-sm text-zinc-400 mb-2">
//               Este é o URL do webhook que você deve configurar no Twilio.
//             </p>
//             <div className="relative">
//               <Input
//                 id="webhook"
//                 value={webhook}
//                 readOnly
//                 className="bg-zinc-800 border-2 border-zinc-600 pr-20 truncate"
//                 title={webhook}
//               />
//               <Button
//                 onClick={() => {
//                   navigator.clipboard.writeText(webhook);
//                   setCopied(true);
//                   setTimeout(() => setCopied(false), 2000);
//                 }}
//                 className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-600 text-white hover:bg-white hover:text-black"
//                 variant="outline"
//               >
//                 {copied ? "Copiado!" : "Copiar"}
//               </Button>
//             </div>
//           </div>

//           {/* Feedback de status */}
//           {status === "saving" && (
//             <div className="text-sm text-blue-400">Salvando contato...</div>
//           )}
//           {status === "success" && (
//             <div className="text-sm text-green-400 flex items-center gap-2">
//               ✅ Contato salvo com sucesso!
//             </div>
//           )}
//           {status === "error" && (
//             <div className="text-sm text-red-400 flex items-center gap-2">
//               ❌ {errorMessage}
//             </div>
//           )}

//           <Button
//             onClick={handleSave}
//             className="w-full mt-2 bg-gray-600 text-white hover:bg-white hover:text-black"
//             disabled={status === "saving"}
//           >
//             {status === "saving" ? "Salvando..." : "Salvar Contato"}
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
