import AdminMessageTable from "../AdminMessageTable";

export default function AdminMessageTableExample() {
  const messages = [
    {
      id: 1,
      sender: 2,
      senderUsername: "alice",
      receiver: 3,
      receiverUsername: "bob",
      ciphertext: "abc123def456...",
      nonce: "xyz789",
      createdAt: Date.now() - 3600000,
    },
    {
      id: 2,
      sender: 3,
      senderUsername: "bob",
      receiver: 2,
      receiverUsername: "alice",
      ciphertext: "ghi789jkl012...",
      nonce: "uvw345",
      createdAt: Date.now() - 1800000,
    },
  ];
  
  return (
    <div className="p-8">
      <AdminMessageTable 
        messages={messages}
        onDecrypt={(msg) => console.log("Decrypt:", msg)}
      />
    </div>
  );
}
