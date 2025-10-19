import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useLocation } from "wouter";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/admin");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center" data-testid="text-login-title">
            Bem-vindo
          </CardTitle>
          <CardDescription className="text-center" data-testid="text-login-description">
            Faça login para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleLogin} 
            className="w-full" 
            size="lg"
            data-testid="button-login"
          >
            <LogIn className="h-5 w-5 mr-2" />
            Entrar com Replit
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Você será redirecionado para fazer login com sua conta Replit
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
