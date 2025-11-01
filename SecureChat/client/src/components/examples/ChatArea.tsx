import ChatArea from "../ChatArea";

export default function ChatAreaExample() {
  const messages = [
    { id: 1, text: "Hey, how are you?", isSent: false, timestamp: Date.now() - 300000, isEncrypted: true },
    { id: 2, text: "I'm doing great! Thanks for asking. How about you?", isSent: true, timestamp: Date.now() - 240000, isEncrypted: true },
    { id: 3, text: "Pretty good! Working on a new project.", isSent: false, timestamp: Date.now() - 180000, isEncrypted: true },
    { id: 4, text: "That sounds exciting! What kind of project?", isSent: true, timestamp: Date.now() - 120000, isEncrypted: true },
  ];
  
  return (
    <div className="h-screen flex flex-col">
      <ChatArea messages={messages} recipientUsername="alice" />
    </div>
  );
}
