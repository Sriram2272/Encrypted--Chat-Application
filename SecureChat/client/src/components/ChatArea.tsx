import { ScrollArea } from "@/components/ui/scroll-area";
import { Lock, CheckCheck } from "lucide-react";
import { format } from "date-fns";

interface MessageItem {
  id: number;
  text: string;
  isSent: boolean;
  timestamp: number;
  isEncrypted: boolean;
}

interface ChatAreaProps {
  messages: MessageItem[];
  recipientUsername: string | null;
}

export default function ChatArea({ messages, recipientUsername }: ChatAreaProps) {
  if (!recipientUsername) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <Lock className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          End-to-End Encrypted Chat
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Select a user from the sidebar to start a secure, encrypted conversation.
          Your messages are encrypted locally and never stored in plaintext.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-16 px-6 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{recipientUsername}</h2>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>End-to-end encrypted</span>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              data-testid={`message-${message.id}`}
              className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-lg ${message.isSent ? "ml-auto" : "mr-auto"}`}>
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.isSent
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-base leading-relaxed">{message.text}</p>
                </div>
                <div className={`flex items-center gap-1.5 mt-1 px-1 ${message.isSent ? "justify-end" : "justify-start"}`}>
                  <span className="text-xs text-muted-foreground">
                    {format(message.timestamp, "h:mm a")}
                  </span>
                  {message.isSent && (
                    <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                  {message.isEncrypted && (
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No messages yet. Start the conversation!
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
