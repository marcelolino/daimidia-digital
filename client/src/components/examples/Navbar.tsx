import { Navbar } from "../Navbar";
import { ThemeProvider } from "../ThemeProvider";

export default function NavbarExample() {
  return (
    <ThemeProvider>
      <div className="space-y-8">
        <Navbar />
        <Navbar isAuthenticated userName="João Silva" />
        <Navbar isAuthenticated isAdmin userName="Admin" onLogout={() => console.log("Logout")} />
      </div>
    </ThemeProvider>
  );
}
