import { db } from "../server/db.js";
import { users } from "../shared/schema.js";
import { hashPassword } from "../server/auth.js";
import { eq } from "drizzle-orm";

async function createAdmin() {
  try {
    console.log("🔐 Criando usuário admin...");

    const email = "admin@daimidia.com";
    const password = "admin123"; // MUDE ISSO APÓS O PRIMEIRO LOGIN!

    // Verificar se já existe
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (existing.length > 0) {
      console.log("⚠️  Usuário admin já existe!");
      console.log(`Email: ${email}`);
      console.log("Para resetar a senha, delete o usuário primeiro.");
      process.exit(0);
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar admin
    await db.insert(users).values({
      email,
      password: hashedPassword,
      firstName: "Admin",
      lastName: "Sistema",
      role: "admin",
    });

    console.log("✅ Admin criado com sucesso!");
    console.log("");
    console.log("📧 Email:", email);
    console.log("🔑 Senha:", password);
    console.log("");
    console.log("⚠️  IMPORTANTE: Altere a senha após o primeiro login!");
    
  } catch (error) {
    console.error("❌ Erro ao criar admin:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

createAdmin();
