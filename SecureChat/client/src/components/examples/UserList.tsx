import { useState } from "react";
import UserList from "../UserList";

export default function UserListExample() {
  const [activeUserId, setActiveUserId] = useState<number | null>(2);
  
  const users = [
    { id: 1, username: "currentuser", isOnline: true },
    { id: 2, username: "alice", isOnline: true, unreadCount: 3 },
    { id: 3, username: "bob", isOnline: false },
    { id: 4, username: "charlie", isOnline: true, unreadCount: 1 },
  ];
  
  return (
    <div className="h-screen">
      <UserList 
        users={users}
        activeUserId={activeUserId}
        onSelectUser={setActiveUserId}
        currentUserId={1}
      />
    </div>
  );
}
