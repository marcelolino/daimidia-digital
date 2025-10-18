import { LoginForm } from "@/components/LoginForm";
import { useLocation } from "wouter";

export default function LoginPage() {
  const [, setLocation] = useLocation();

  const handleLogin = (data: { username: string; password: string }) => {
    console.log("Login attempt:", data);
    //todo: remove mock functionality - implement real authentication
    setLocation("/");
  };

  return <LoginForm onSubmit={handleLogin} />;
}
