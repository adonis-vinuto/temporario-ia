import { ChatSession } from "@/lib/interface/ChatSession";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChatHistoryProps {
  sessions: ChatSession[];
  onSelectSession: (sessionId: string) => void;
  currentSessionId?: string;
}

export default function ChatHistory({
  sessions,
  onSelectSession,
  currentSessionId,
}: Readonly<ChatHistoryProps>) {
  const validSessions = Array.isArray(sessions) && sessions.length > 0;

  if (!validSessions) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Nenhum histórico de chat encontrado
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-2">
            {sessions
              .map((session) => {
                if (!session || !session.sessionId) {
                  console.warn("Invalid session found:", session);
                  return null;
                }

                const isActive = session.sessionId === currentSessionId;
                const date = session.lastSendDate
                  ? new Date(session.lastSendDate)
                  : new Date();

                return (
                  <Button
                    key={session.sessionId}
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => onSelectSession(session.sessionId)}
                  >
                    <div className="flex flex-col items-start gap-1 truncate">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(date, {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                      <span className="truncate max-w-full">
                        {session.totalInteractions
                          ? `${session.totalInteractions} mensagens`
                          : "Nova conversa"}
                      </span>
                    </div>
                  </Button>
                );
              })
              .filter(Boolean)}
          </div>
        </ScrollArea>
  );
}
