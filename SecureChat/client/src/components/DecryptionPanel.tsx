import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Unlock, Key, AlertCircle } from "lucide-react";

interface DecryptionPanelProps {
  message: {
    id: number;
    senderUsername: string;
    receiverUsername: string;
    ciphertext: string;
    nonce: string;
  } | null;
  onDecrypt: (privateKey: string) => void;
  decryptedText: string | null;
  error: string | null;
  onClose: () => void;
}

export default function DecryptionPanel({ 
  message, 
  onDecrypt, 
  decryptedText, 
  error,
  onClose 
}: DecryptionPanelProps) {
  const [privateKey, setPrivateKey] = useState("");

  if (!message) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Lock className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">
            Select a message to decrypt
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5 text-primary" />
          Decrypt Message
        </CardTitle>
        <CardDescription>
          Enter the private key of <span className="font-medium">{message.receiverUsername}</span> to decrypt this message
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Message Details</Label>
            <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">From:</span>
                <span className="font-medium">{message.senderUsername}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To:</span>
                <span className="font-medium">{message.receiverUsername}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Message ID:</span>
                <span className="font-mono">#{message.id}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="privateKey" className="text-sm font-medium">
              Private Key
            </Label>
            <Input
              id="privateKey"
              data-testid="input-private-key"
              type="password"
              placeholder="Enter private key..."
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {decryptedText && (
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Unlock className="w-4 h-4 text-green-600" />
                Decrypted Message
              </Label>
              <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-foreground leading-relaxed">
                  {decryptedText}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            data-testid="button-decrypt"
            onClick={() => onDecrypt(privateKey)}
            disabled={!privateKey.trim()}
            className="flex-1"
          >
            <Unlock className="w-4 h-4 mr-2" />
            Decrypt Message
          </Button>
          <Button
            data-testid="button-close"
            onClick={onClose}
            variant="outline"
          >
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
