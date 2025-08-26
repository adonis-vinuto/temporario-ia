"use client";

import { use, useState, useEffect } from "react";
import { buscarAgentePorId } from "./agente/actions/getAgenteId";
import { useQuery } from "@tanstack/react-query";
import Chat from "@/components/chat";
import { useModule } from "@/lib/context/ModuleContext";
import { getChatSession } from "./agente/actions/getChatSession";
import { ChatSession } from "@/lib/interface/ChatSession";
import ChatHistoryDialog from "@/components/chat-history-dialog";

export default function AgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { currentModule } = useModule();
  const [currentSessionId, setCurrentSessionId] = useState<
    string | undefined
  >();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const { data: agent } = useQuery({
    queryKey: ["agent", id],
    queryFn: () => buscarAgentePorId(currentModule, id),
  });

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  const {
    data: fetchedSessions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["chatHistory", id, currentModule],
    queryFn: async () => {
      try {
        const sessions = await getChatSession(currentModule, id);
        return sessions;
      } catch (error) {
        console.error("Error fetching chat history:", error);
        return [];
      }
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (fetchedSessions) {
      setChatSessions(fetchedSessions);
    }
  }, [fetchedSessions]);

  useEffect(() => {
    if (error) {
      console.error("Chat history error:", error);
    }
  }, [isLoading, error]);

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setIsHistoryOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{agent?.name || "Agent"}</h1>
        <ChatHistoryDialog
          sessions={chatSessions}
          onSelectSession={handleSelectSession}
          currentSessionId={currentSessionId}
          isOpen={isHistoryOpen}
          onOpenChange={setIsHistoryOpen}
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <Chat
          currentModule={currentModule}
          id={id}
          sessionId={currentSessionId}
          onNewSession={(newSessionId) => {
            setCurrentSessionId(newSessionId);
            getChatSession(currentModule, id).then((sessions) => {
              setChatSessions(sessions);
            });
          }}
        />
      </div>
    </div>
  );
}
