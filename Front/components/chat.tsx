import { RoleChat } from "@/lib/enums/roleChat";
import { Button } from "./ui/button";
import { useState, useEffect, useRef } from "react";
import { Message } from "@/lib/interface/Message";
import { postFirstMessage } from "@/app/(app)/agents/[id]/agente/actions/postFirstMessage";
import { postMessage } from "@/app/(app)/agents/[id]/agente/actions/postMessage";
import { getChatHistory } from "@/app/(app)/agents/[id]/agente/actions/getChatHistory";
import { Module } from "@/lib/enums/module";
import { Textarea } from "./ui/textarea";
import { ChatMessage } from "./chatMessage";
import { SendIcon, PaperclipIcon, ImageIcon } from "lucide-react";
import { sendPdf } from "./actions/sendPdf";
import { sendImage } from "./actions/sendImage";

interface ChatProps {
  currentModule: Module;
  id: string;
  sessionId?: string; // sessionId é opcional porque não haverá um se o chat for novo
  onNewSession?: (sessionId: string) => void;
}

export default function Chat({
  currentModule,
  id,
  sessionId,
  onNewSession,
}: Readonly<ChatProps>) {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scrollar quando há nova mensagem
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (sessionId) {
        try {
          const history = await getChatHistory(currentModule, sessionId);
          const formattedMessages = history.map((item) => ({
            content: item.content,
            sender: item.role,
          }));
          setMessages(formattedMessages);
        } catch (error) {
          console.error("Error fetching chat history:", error);
        }
      } else {
        setMessages([]);
      }
    };

    fetchChatHistory();
  }, [sessionId, currentModule]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelect = () => {
    imageInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedFile) return;

    let messageContent = inputMessage;

    if (selectedFile) {
      try {
        if (selectedFile.type.startsWith("image/")) {
          await sendImage(parseInt(id), selectedFile);
          messageContent =
            messageContent || `Imagem enviada: ${selectedFile.name}`;
        } else {
          await sendPdf(parseInt(id), selectedFile);
          messageContent =
            messageContent || `Arquivo enviado: ${selectedFile.name}`;
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        messageContent = `Erro ao enviar arquivo: ${selectedFile.name}`;
      }
    }

    const userMessage: Message = {
      content: messageContent,
      sender: RoleChat.User,
    };

    setMessages([...messages, userMessage]);
    setInputMessage("");
    setSelectedFile(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      let response;

      if (sessionId) {
        response = await postMessage(
          currentModule,
          id,
          messageContent,
          sessionId
        );
      } else {
        response = await postFirstMessage(currentModule, id, messageContent);
        if (response.sessionId && onNewSession) {
          onNewSession(response.sessionId);
        }
      }

      if (response.status === 200 && response.messageResponse) {
        const agentMessage: Message = {
          content: response.messageResponse,
          sender: RoleChat.System,
        };

        setMessages((prev) => [...prev, agentMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-full w-full rounded-xl shadow-md overflow-hidden">
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center text-muted-foreground">
            <p>Inicie uma nova conversa</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={`message-${index}-${new Date().getTime()}`}
              message={message}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 sticky bottom-0 shadow-inner">
        {selectedFile && (
          <div className="mb-2 p-2 bg-muted rounded-md flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Arquivo selecionado: {selectedFile.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFile(null)}
            >
              ×
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleFileSelect}
            className="shrink-0"
          >
            <PaperclipIcon size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleImageSelect}
            className="shrink-0"
          >
            <ImageIcon size={16} />
          </Button>
          <Textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 focus-visible:ring-1 focus-visible:ring-primary bg-background resize-none min-h-[40px] max-h-32"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
            }}
          />
          <Button
            onClick={handleSendMessage}
            className="gap-2 shrink-0"
            disabled={!inputMessage.trim() && !selectedFile}
          >
            <SendIcon size={16} />
            Enviar
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
