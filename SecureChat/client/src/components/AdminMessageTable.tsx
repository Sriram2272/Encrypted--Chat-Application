import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Eye } from "lucide-react";
import { format } from "date-fns";

interface MessageMetadata {
  id: number;
  sender: number;
  senderUsername: string;
  receiver: number;
  receiverUsername: string;
  ciphertext: string;
  nonce: string;
  createdAt: number;
}

interface AdminMessageTableProps {
  messages: MessageMetadata[];
  onDecrypt: (message: MessageMetadata) => void;
}

export default function AdminMessageTable({ messages, onDecrypt }: AdminMessageTableProps) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">ID</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead className="w-32">Status</TableHead>
            <TableHead className="w-24 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((message) => (
            <TableRow 
              key={message.id}
              data-testid={`row-message-${message.id}`}
              className="hover-elevate"
            >
              <TableCell className="font-mono text-sm">#{message.id}</TableCell>
              <TableCell className="font-medium">{message.senderUsername}</TableCell>
              <TableCell className="font-medium">{message.receiverUsername}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {format(message.createdAt, "MMM d, h:mm a")}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="gap-1">
                  <Lock className="w-3 h-3" />
                  Encrypted
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  data-testid={`button-decrypt-${message.id}`}
                  onClick={() => onDecrypt(message)}
                  variant="ghost"
                  size="sm"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {messages.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                No messages found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
