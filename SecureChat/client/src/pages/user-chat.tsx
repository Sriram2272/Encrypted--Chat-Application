import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import UserList from "@/components/UserList";
import ChatArea from "@/components/ChatArea";
import MessageInput from "@/components/MessageInput";
import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";
import { fetchUsers, fetchUserPublicKey } from "@/lib/api";
import { getPrivateKey, deriveSharedKey, encryptMessage, decryptMessage } from "@/lib/crypto";
import { useToast } from "@/hooks/use-toast";

interface UserChatPageProps {
  token: string;
  user: { id: number; username: string };
  onLogout: () => void;
}

interface Message {
  id: number;
  text: string;
  isSent: boolean;
  timestamp: number;
  isEncrypted: boolean;
}

export default function UserChatPage({ token, user, onLogout }: UserChatPageProps) {
  const [activeUserId, setActiveUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const sharedKeysRef = useRef<Record<string, string>>({});
  const activeUserIdRef = useRef<number | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    activeUserIdRef.current = activeUserId;
  }, [activeUserId]);

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => fetchUsers(token),
  });

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io({
      auth: { token },
    });

    newSocket.on("connect", () => {
      console.log("Connected to chat server");
    });

    newSocket.on("message", async (data: {
      id: number;
      from: number;
      ciphertext: string;
      nonce: string;
      timestamp: number;
    }) => {
      try {
        const sharedKey = await getSharedKey(data.from, false);
        const decrypted = await decryptMessage(sharedKey, data.ciphertext, data.nonce);
        
        setMessages(prev => ({
          ...prev,
          [data.from.toString()]: [
            ...(prev[data.from.toString()] || []),
            {
              id: data.id,
              text: decrypted,
              isSent: false,
              timestamp: data.timestamp,
              isEncrypted: true,
            },
          ],
        }));
      } catch (error) {
        console.error("Failed to decrypt message:", error);
        toast({
          title: "Decryption failed",
          description: "Could not decrypt incoming message",
          variant: "destructive",
        });
      }
    });

    newSocket.on("message_sent", (data: { id: number; timestamp: number }) => {
      console.log("Message sent:", data);
    });

    // Receive initial list of online users
    newSocket.on("online_users", (userIds: number[]) => {
      setOnlineUsers(new Set(userIds));
    });

    // Listen for status changes
    newSocket.on("user_status", (data: { userId: number; online: boolean }) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        if (data.online) {
          updated.add(data.userId);
        } else {
          updated.delete(data.userId);
        }
        return updated;
      });
    });

    newSocket.on("messages", (data: Array<{
      id: number;
      sender: number;
      receiver: number;
      ciphertext: string;
      nonce: string;
      createdAt: number;
    }>) => {
      const decryptMessages = async () => {
        const decrypted: Message[] = [];
        
        for (const msg of data) {
          try {
            const isSent = msg.sender === user.id;
            const otherUserId = isSent ? msg.receiver : msg.sender;
            const sharedKey = await getSharedKey(otherUserId, isSent);
            const text = await decryptMessage(sharedKey, msg.ciphertext, msg.nonce);
            
            decrypted.push({
              id: msg.id,
              text,
              isSent,
              timestamp: msg.createdAt,
              isEncrypted: true,
            });
          } catch (error) {
            console.error("Failed to decrypt message:", error);
          }
        }
        
        // Use ref to get current activeUserId value
        const currentActiveUserId = activeUserIdRef.current;
        if (currentActiveUserId) {
          setMessages(prev => ({
            ...prev,
            [currentActiveUserId.toString()]: decrypted,
          }));
        }
      };
      
      decryptMessages();
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token, user.id]);

  // Fetch messages when active user changes
  useEffect(() => {
    if (socket && activeUserId) {
      socket.emit("fetch_messages", { withUser: activeUserId });
    }
  }, [socket, activeUserId]);

  const getSharedKey = async (otherUserId: number, isSender: boolean): Promise<string> => {
    const cacheKey = `${otherUserId}_${isSender}`;
    if (sharedKeysRef.current[cacheKey]) {
      return sharedKeysRef.current[cacheKey];
    }

    const myPrivateKey = await getPrivateKey(user.id);
    if (!myPrivateKey) {
      throw new Error("Private key not found");
    }

    const { publicKey: theirPublicKey } = await fetchUserPublicKey(otherUserId, token);
    const sharedKey = await deriveSharedKey(myPrivateKey, theirPublicKey, isSender);
    
    sharedKeysRef.current[cacheKey] = sharedKey;
    return sharedKey;
  };

  const handleSendMessage = async (text: string) => {
    if (!socket || !activeUserId) return;

    try {
      const sharedKey = await getSharedKey(activeUserId, true);
      const { ciphertext, nonce } = await encryptMessage(sharedKey, text);

      socket.emit("send_message", {
        to: activeUserId,
        ciphertext,
        nonce,
      });

      setMessages(prev => ({
        ...prev,
        [activeUserId.toString()]: [
          ...(prev[activeUserId.toString()] || []),
          {
            id: Date.now(),
            text,
            isSent: true,
            timestamp: Date.now(),
            isEncrypted: true,
          },
        ],
      }));
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Failed to send",
        description: "Could not encrypt and send message",
        variant: "destructive",
      });
    }
  };

  const activeUser = users.find((u: any) => u.id === activeUserId);

  // Add online status to users
  const usersWithStatus = users.map((u: any) => ({
    ...u,
    isOnline: onlineUsers.has(u.id),
  }));

  return (
    <div className="h-screen flex">
      <UserList 
        users={usersWithStatus}
        activeUserId={activeUserId}
        onSelectUser={setActiveUserId}
        currentUserId={user.id}
      />
      <div className="flex-1 flex flex-col">
        <div className="h-16 px-6 border-b border-border flex items-center justify-between bg-background">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold">Encrypted Chat</h1>
          </div>
          <Button 
            data-testid="button-logout"
            onClick={onLogout}
            variant="ghost"
            size="sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
        <ChatArea 
          messages={activeUserId ? messages[activeUserId.toString()] || [] : []}
          recipientUsername={activeUser?.username || null}
        />
        {activeUserId && (
          <MessageInput onSend={handleSendMessage} disabled={!socket?.connected} />
        )}
      </div>
    </div>
  );
}
