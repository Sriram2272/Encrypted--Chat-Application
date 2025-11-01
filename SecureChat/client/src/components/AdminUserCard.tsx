import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShieldCheck, ShieldOff, Key } from "lucide-react";

interface AdminUserCardProps {
  user: {
    id: number;
    username: string;
    publicKey: string;
    isAdmin: boolean;
    disabled: boolean;
  };
  onToggleDisable: (userId: number) => void;
}

export default function AdminUserCard({ user, onToggleDisable }: AdminUserCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
        <Avatar className="w-12 h-12">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
            {user.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-card-foreground truncate">
            {user.username}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {user.isAdmin && (
              <Badge variant="default" className="h-5 text-xs">
                Admin
              </Badge>
            )}
            <Badge 
              variant={user.disabled ? "destructive" : "secondary"}
              className="h-5 text-xs"
            >
              {user.disabled ? "Disabled" : "Active"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Key className="w-3.5 h-3.5" />
            <span className="font-medium">Public Key</span>
          </div>
          <div className="p-2 bg-muted rounded-md">
            <code className="text-xs font-mono text-muted-foreground break-all">
              {user.publicKey.substring(0, 48)}...
            </code>
          </div>
        </div>
        <Button
          data-testid={`button-toggle-${user.id}`}
          onClick={() => onToggleDisable(user.id)}
          variant={user.disabled ? "default" : "destructive"}
          className="w-full"
          size="sm"
        >
          {user.disabled ? (
            <>
              <ShieldCheck className="w-4 h-4 mr-2" />
              Enable User
            </>
          ) : (
            <>
              <ShieldOff className="w-4 h-4 mr-2" />
              Disable User
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
