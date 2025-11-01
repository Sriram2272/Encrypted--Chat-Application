import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import AuthForm from "@/components/AuthForm";
import UserChatPage from "@/pages/user-chat";
import AdminDashboardPage from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";
import { register, login } from "@/lib/api";
import { generateKeypair, storePrivateKey, getPrivateKey } from "@/lib/crypto";

interface AuthState {
  token: string;
  user: {
    id: number;
    username: string;
    isAdmin: boolean;
  };
}

function Router() {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check for existing auth on mount
  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      try {
        setAuth(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem("auth");
      }
    }
  }, []);

  const handleAuth = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      if (authMode === "register") {
        const keypair = await generateKeypair();
        const response = await register(username, password, keypair.publicKey);
        
        // Store private key in IndexedDB
        await storePrivateKey(response.user.id, keypair.privateKey);
        
        const authState = {
          token: response.token,
          user: response.user,
        };
        setAuth(authState);
        localStorage.setItem("auth", JSON.stringify(authState));
        
        toast({
          title: "Account created",
          description: "Your account has been created successfully. Keep your credentials safe!",
        });
      } else {
        const response = await login(username, password);
        
        // Check if private key exists
        const privateKey = await getPrivateKey(response.user.id);
        if (!privateKey) {
          toast({
            title: "Warning",
            description: "No encryption key found. Messages may not decrypt properly.",
            variant: "destructive",
          });
        }
        
        const authState = {
          token: response.token,
          user: response.user,
        };
        setAuth(authState);
        localStorage.setItem("auth", JSON.stringify(authState));
        
        toast({
          title: "Welcome back",
          description: `Logged in as ${response.user.username}`,
        });
      }
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem("auth");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  if (!auth) {
    return (
      <AuthForm 
        mode={authMode}
        onSubmit={handleAuth}
        onToggleMode={() => setAuthMode(authMode === "login" ? "register" : "login")}
        isLoading={isLoading}
      />
    );
  }

  return (
    <Switch>
      <Route path="/">
        {auth.user.isAdmin ? (
          <AdminDashboardPage token={auth.token} user={auth.user} onLogout={handleLogout} />
        ) : (
          <UserChatPage token={auth.token} user={auth.user} onLogout={handleLogout} />
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
