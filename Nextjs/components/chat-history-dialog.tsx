import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { History } from "lucide-react";
import ChatHistory from "@/components/chatHistory";
import { ChatSession } from "@/lib/interface/ChatSession";

interface ChatHistoryDialogProps {
  sessions: ChatSession[];
  onSelectSession: (sessionId: string) => void;
  currentSessionId?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChatHistoryDialog({
  sessions,
  onSelectSession,
  currentSessionId,
  isOpen,
  onOpenChange,
}: ChatHistoryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History size={16} className="mr-2" />
          Histórico
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md h-auto">
        <DialogHeader>
          <DialogTitle>Histórico de Conversas</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ChatHistory
            sessions={sessions}
            onSelectSession={onSelectSession}
            currentSessionId={currentSessionId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
