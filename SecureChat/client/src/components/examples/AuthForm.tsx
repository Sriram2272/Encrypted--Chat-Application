import { useState } from "react";
import AuthForm from "../AuthForm";

export default function AuthFormExample() {
  const [mode, setMode] = useState<"login" | "register">("login");
  
  return (
    <AuthForm 
      mode={mode}
      onSubmit={(username, password) => console.log("Auth:", { username, password })}
      onToggleMode={() => setMode(mode === "login" ? "register" : "login")}
    />
  );
}
