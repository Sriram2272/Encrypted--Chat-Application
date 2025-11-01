import MessageInput from "../MessageInput";

export default function MessageInputExample() {
  return (
    <div className="h-screen flex items-end">
      <div className="w-full">
        <MessageInput onSend={(msg) => console.log("Sent:", msg)} />
      </div>
    </div>
  );
}
