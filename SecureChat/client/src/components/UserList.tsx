import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

interface UserItem {
  id: number;
  username: string;
  isOnline?: boolean;
  unreadCount?: number;
}

interface UserListProps {
  users: UserItem[];
  activeUserId: number | null;
  onSelectUser: (userId: number) => void;
  currentUserId: number;
}

export default function UserList({ users, activeUserId, onSelectUser, currentUserId }: UserListProps) {
  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-xl font-semibold text-sidebar-foreground">Messages</h2>
        <p className="text-sm text-muted-foreground mt-1">End-to-end encrypted</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {users.filter(u => u.id !== currentUserId).map((user) => (
            <button
              key={user.id}
              data-testid={`button-user-${user.id}`}
              onClick={() => onSelectUser(user.id)}
              className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors hover-elevate active-elevate-2 ${
                activeUserId === user.id 
                  ? "bg-sidebar-accent" 
                  : ""
              }`}
            >
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-sidebar ${
                  user.isOnline ? "bg-green-500" : "bg-red-500"
                }`} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sidebar-foreground truncate">
                    {user.username}
                  </p>
                  {user.unreadCount && user.unreadCount > 0 && (
                    <Badge variant="default" className="h-5 min-w-5 px-1.5 text-xs">
                      {user.unreadCount}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {user.isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </button>
          ))}
          {users.filter(u => u.id !== currentUserId).length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <User className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No other users available</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
