import { RegisterForm } from "../RegisterForm";
import { ThemeProvider } from "../ThemeProvider";

export default function RegisterFormExample() {
  return (
    <ThemeProvider>
      <RegisterForm onSubmit={(data) => console.log("Register:", data)} />
    </ThemeProvider>
  );
}
