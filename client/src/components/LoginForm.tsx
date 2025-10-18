import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

type LoginFormProps = {
  onSubmit: (data: { username: string; password: string }) => void;
};

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/20 via-background to-accent/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-lg bg-primary flex items-center justify-center mb-2">
            <span className="text-primary-foreground font-display font-bold text-2xl">D</span>
          </div>
          <CardTitle className="text-2xl font-display">Bem-vindo ao Daimidia</CardTitle>
          <CardDescription>Entre com suas credenciais para acessar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-login">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="seu-usuario"
                required
                data-testid="input-username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                data-testid="input-password"
              />
            </div>

            <Button type="submit" className="w-full" data-testid="button-submit">
              Entrar
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link href="/register">
                <span className="text-primary hover:underline cursor-pointer" data-testid="link-register">
                  Cadastre-se
                </span>
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
