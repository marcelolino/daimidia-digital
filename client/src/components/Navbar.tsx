import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { LogIn, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavbarProps = {
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  userName?: string;
  onLogout?: () => void;
};

export function Navbar({ isAuthenticated = false, isAdmin = false, userName, onLogout }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" data-testid="link-home">
          <div className="flex items-center gap-2 hover-elevate active-elevate-2 px-3 py-2 rounded-lg cursor-pointer">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-lg">D</span>
            </div>
            <span className="font-display font-bold text-2xl">Daimidia</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {!isAuthenticated ? (
            <Link href="/login">
              <Button data-testid="button-login">
                <LogIn className="h-4 w-4 mr-2" />
                Entrar
              </Button>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2" data-testid="button-user-menu">
                  <User className="h-4 w-4" />
                  {userName || "Usuário"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" data-testid="link-admin">
                        Painel Admin
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={onLogout} data-testid="button-logout">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
}
