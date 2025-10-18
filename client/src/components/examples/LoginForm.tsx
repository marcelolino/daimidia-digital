import { LoginForm } from "../LoginForm";
import { ThemeProvider } from "../ThemeProvider";

export default function LoginFormExample() {
  return (
    <ThemeProvider>
      <LoginForm onSubmit={(data) => console.log("Login:", data)} />
    </ThemeProvider>
  );
}
