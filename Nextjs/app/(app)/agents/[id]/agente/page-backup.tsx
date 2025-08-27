// "use client";

// import { useEffect, useRef, useState } from "react";
// import { useParams } from "next/navigation";
// import { Bot, User } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import AddNumber from "@/components/addNumber";
// import EditAgent from "@/components/editAgent";
// import { buscarAgentePorId } from "./actions/getAgenteId";
// import { AgentResponse } from "@/lib/interface/AgentResponse";
// import rehypeHighlight from "rehype-highlight";
// import ReactMarkdown from "react-markdown";
// import { formatDateBR } from "../../../../../lib/utils";
// import { sendChat } from "./actions/sendChat";
// import LoadingSpin from "../../../../../components/ui/loadingSpin";
// import AddFilesAgentRH from "../../../../../components/addFilesAgentRH";
// import AddDataAgentRH from "../../../../../components/addDataAgentRH";
// import AddSeniorRH from "../../../../../components/addSeniorRH";

// export default function AgentChatPage() {
//   const { id } = useParams();
//   const [message, setMessage] = useState("");
//   const [files] = useState<{ name: string; date: string }[]>([]);
//   const [agente, setAgente] = useState<AgentResponse | null>();

//   const messagesEndRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     if (!id) return;
//     buscarAgentePorId(1, String(id))
//       .then((v) => {
//         setAgente(v);
//       })
//       .catch((err) => {
//         console.error("Erro ao buscar agente:", err);
//         setAgente(null);
//       });
//   }, [id]);

//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [message, files, agente?.chat_history]);

//   const sendMessage = async () => {
//     if (!message.trim()) return;

//     try {
//       // Cria uma mensagem temporária com ID único (timestamp ou UUID)
//       const tempId = Date.now();
//       const tempMessage = {
//         tempId,
//         message: message.trim(),
//         sent_at: new Date(),
//         sender: "User",
//       };

//       // Adiciona a mensagem temporária ao chat
//       setAgente((prev) =>
//         prev
//           ? {
//               ...prev,
//               chat_history: [...prev.chat_history, tempMessage],
//             }
//           : prev
//       );

//       // Envia para o backend
//       const newChat = await sendChat(+id!, {
//         message: message.trim(),
//         from: "User",
//       });

//       // Substitui a mensagem temporária pela real
//       setAgente((prev) =>
//         prev
//           ? {
//               ...prev,
//               chat_history: prev.chat_history.map((chat) =>
//                 "tempId" in chat && chat.tempId === tempId ? newChat : chat
//               ),
//             }
//           : prev
//       );
//     } catch (error) {
//       alert(error);
//     } finally {
//       setMessage("");
//     }
//   };

//   return (
//     <div className="h-screen flex bg-black text-white">
//       <div className="flex flex-col flex-1 p-6">
//         <header className="text-xl font-bold mb-4">
//           {agente ? (
//             <>
//               {agente.name}
//               <p className="text-sm font-normal text-zinc-400">
//                 {agente.description}
//               </p>
//             </>
//           ) : (
//             `Carregando agente ${id}...`
//           )}
//         </header>

//         <div className="flex-1 rounded bg-zinc-900 p-4 mb-4 overflow-y-auto">
//           <div className="flex-1 overflow-auto space-y-4 mb-28">
//             {agente?.chat_history?.map((item, index) => (
//               <div key={index}>
//                 {/* MESSAGE */}
//                 <div className={`flex items-start gap-3 justify-end`}>
//                   <div
//                     className={`max-w-md px-4 py-2 rounded-lg text-sm whitespace-pre-wrap bg-blue-600 text-white rounded-br-none`}
//                   >
//                     <div className="prose prose-invert max-w-none text-md text-white">
//                       <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
//                         {item.message}
//                       </ReactMarkdown>
//                     </div>
//                     <div className="text-xs text-zinc-200 mt-1">
//                       {formatDateBR(item.sent_at)}
//                     </div>
//                   </div>

//                   <div className="bg-blue-600 p-2 rounded-full">
//                     <User size={20} />
//                   </div>
//                 </div>

//                 {/* RESPONSE */}
//                 <div
//                   key={index}
//                   className={`flex items-start gap-3 justify-start`}
//                 >
//                   <div className="bg-zinc-800 p-2 rounded-full">
//                     <Bot size={20} />
//                   </div>

//                   {item.response ? (
//                     <div
//                       className={`max-w-md px-4 py-2 rounded-lg text-sm whitespace-pre-wrap bg-zinc-800 text-gray-100 rounded-bl-none`}
//                     >
//                       <div className="prose prose-invert max-w-none text-md text-white">
//                         <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
//                           {item.response}
//                         </ReactMarkdown>
//                       </div>

//                       <div className="text-xs text-zinc-200 mt-1">
//                         {formatDateBR(item.sent_at)}
//                       </div>
//                     </div>
//                   ) : (
//                     <LoadingSpin />
//                   )}
//                 </div>
//               </div>
//             ))}

//             <div ref={messagesEndRef} />
//           </div>
//         </div>

//         <div className="flex items-center justify-center gap-2">
//           <Input
//             className="w-full max-w-2xl p-3 rounded-lg border border-zinc-700 bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//             type="text"
//             placeholder="Digite sua mensagem..."
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter" && !e.shiftKey) {
//                 e.preventDefault();
//                 sendMessage();
//               }
//             }}
//           />
//           <Button onClick={sendMessage}>Enviar</Button>
//         </div>
//       </div>

//       <aside className="w-72 bg-zinc-950 p-6 border-l border-zinc-800 flex flex-col justify-between">
//         <div className="h-full flex flex-col justify-between">
//           <div>
//             <h3 className="text-lg font-semibold mb-4">Configurações</h3>
//             <div className="mb-4">
//               <p className="text-sm text-zinc-400 mb-2">
//                 ID do Agente: {agente?.id}
//               </p>
//             </div>

//             {agente && (
//               <>
//                 <EditAgent
//                   id={agente.id}
//                   name={agente.name}
//                   description={agente.description}
//                 />
//                 <AddDataAgentRH id={agente.id} />
//                 <AddFilesAgentRH id={agente.id} AgenteFiles={agente.pdf_data} />
//                 <AddSeniorRH
//                   id={agente.id}
//                   name={agente.name}
//                   description={agente.description}
//                 />
//               </>
//             )}
//           </div>
//           {agente && (
//             <div>
//               <AddNumber
//                 id={agente.id}
//                 name={agente.name}
//                 description={agente.description}
//                 agent_type={agente.agent_type}
//                 knowledge={agente.knowledge}
//                 twilio={agente.twilio_communication}
//               />
//             </div>
//           )}
//         </div>
//       </aside>
//     </div>
//   );
// }
