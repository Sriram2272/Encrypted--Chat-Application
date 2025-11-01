import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminUserCard from "@/components/AdminUserCard";
import AdminMessageTable from "@/components/AdminMessageTable";
import DecryptionPanel from "@/components/DecryptionPanel";
import { Button } from "@/components/ui/button";
import { LogOut, Shield, Users, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchUsers, fetchAdminMessages, toggleUserDisabled } from "@/lib/api";
import { decryptMessage, deriveSharedKey } from "@/lib/crypto";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface AdminDashboardPageProps {
  token: string;
  user: { id: number; username: string };
  onLogout: () => void;
}

export default function AdminDashboardPage({ token, user, onLogout }: AdminDashboardPageProps) {
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => fetchUsers(token),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/admin/messages"],
    queryFn: () => fetchAdminMessages(token),
  });

  const handleToggleDisable = async (userId: number) => {
    try {
      await toggleUserDisabled(userId, token);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User updated",
        description: "User status has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to update user",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleDecrypt = async (privateKey: string) => {
    if (!selectedMessage) return;

    try {
      // Get the receiver's public key from users list
      const receiver = users.find((u: any) => u.id === selectedMessage.receiver);
      if (!receiver) {
        throw new Error("Receiver not found");
      }

      // The admin needs to provide the receiver's private key
      // Determine if the user whose key was provided is the sender or receiver
      const sender = users.find((u: any) => u.id === selectedMessage.sender);
      if (!sender) {
        throw new Error("Sender not found");
      }

      // Try decrypting as receiver first (most common case)
      let decrypted: string;
      try {
        const sharedKey = await deriveSharedKey(privateKey, sender.publicKey, false);
        decrypted = await decryptMessage(sharedKey, selectedMessage.ciphertext, selectedMessage.nonce);
      } catch (e) {
        // Try as sender
        const sharedKey = await deriveSharedKey(privateKey, receiver.publicKey, true);
        decrypted = await decryptMessage(sharedKey, selectedMessage.ciphertext, selectedMessage.nonce);
      }

      setDecryptedText(decrypted);
      setError(null);
      toast({
        title: "Message decrypted",
        description: "The message has been decrypted successfully",
      });
    } catch (error) {
      console.error("Decryption error:", error);
      setError("Failed to decrypt message. Invalid private key or corrupted data.");
      setDecryptedText(null);
      toast({
        title: "Decryption failed",
        description: "Invalid private key or corrupted message data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
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
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" data-testid="tab-users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="messages" data-testid="tab-messages">
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">User Management</h2>
              <p className="text-sm text-muted-foreground">
                Manage user accounts and view public keys
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((u: any) => (
                <AdminUserCard 
                  key={u.id}
                  user={u}
                  onToggleDisable={handleToggleDisable}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Message Metadata</h2>
              <p className="text-sm text-muted-foreground">
                View encrypted messages and decrypt with user's private key
              </p>
            </div>
            
            <AdminMessageTable 
              messages={messages}
              onDecrypt={(message) => {
                setSelectedMessage(message);
                setDecryptedText(null);
                setError(null);
              }}
            />

            {selectedMessage && (
              <div className="mt-6">
                <DecryptionPanel
                  message={selectedMessage}
                  onDecrypt={handleDecrypt}
                  decryptedText={decryptedText}
                  error={error}
                  onClose={() => {
                    setSelectedMessage(null);
                    setDecryptedText(null);
                    setError(null);
                  }}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
