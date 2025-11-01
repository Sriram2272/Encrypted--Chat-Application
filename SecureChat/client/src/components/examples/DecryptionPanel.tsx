import { useState } from "react";
import DecryptionPanel from "../DecryptionPanel";

export default function DecryptionPanelExample() {
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const message = {
    id: 1,
    senderUsername: "alice",
    receiverUsername: "bob",
    ciphertext: "abc123def456...",
    nonce: "xyz789",
  };

  return (
    <div className="p-8">
      <DecryptionPanel
        message={message}
        onDecrypt={(key) => {
          console.log("Decrypt with key:", key);
          setDecryptedText("Hello, this is a secret message!");
          setError(null);
        }}
        decryptedText={decryptedText}
        error={error}
        onClose={() => console.log("Close")}
      />
    </div>
  );
}
