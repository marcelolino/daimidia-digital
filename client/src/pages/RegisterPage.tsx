import { RegisterForm } from "@/components/RegisterForm";
import { useLocation } from "wouter";

export default function RegisterPage() {
  const [, setLocation] = useLocation();

  const handleRegister = (data: { username: string; password: string; confirmPassword: string }) => {
    console.log("Register attempt:", data);
    //todo: remove mock functionality - implement real registration
    setLocation("/login");
  };

  return <RegisterForm onSubmit={handleRegister} />;
}
