import { db } from "../server/db";
import { users, categories, media } from "../shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Iniciando seed do banco de dados...");

  try {
    // 1. Criar usuário admin
    console.log("👤 Criando usuário admin...");
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const [adminUser] = await db
      .insert(users)
      .values({
        email: "admin@example.com",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "Sistema",
        role: "admin",
        profileImageUrl:
          "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      })
      .onConflictDoNothing()
      .returning();

    console.log(`✅ Admin criado: ${adminUser?.email || "já existe"}`);

    // 2. Criar categorias
    console.log("📂 Criando categorias...");
    const categoriesData = [
      {
        name: "Natureza",
        description: "Imagens de paisagens, flora e fauna",
        color: "#22c55e",
      },
      {
        name: "Tecnologia",
        description: "Computadores, gadgets e inovação",
        color: "#3b82f6",
      },
      {
        name: "Pessoas",
        description: "Retratos e fotografia de pessoas",
        color: "#f59e0b",
      },
      {
        name: "Arquitetura",
        description: "Edifícios e estruturas urbanas",
        color: "#8b5cf6",
      },
      {
        name: "Arte",
        description: "Ilustrações, pinturas e arte digital",
        color: "#ec4899",
      },
      {
        name: "Negócios",
        description: "Ambiente corporativo e profissional",
        color: "#14b8a6",
      },
    ];

    const createdCategories = await db
      .insert(categories)
      .values(categoriesData)
      .onConflictDoNothing()
      .returning();

    console.log(`✅ ${createdCategories.length} categorias criadas`);

    // Buscar categorias criadas para usar nas mídias
    const allCategories = await db.select().from(categories);
    const adminUserId =
      adminUser?.id || (await db.select().from(users)).at(0)?.id;

    if (!adminUserId) {
      throw new Error("Nenhum usuário encontrado para associar às mídias");
    }

    // 3. Criar mídias de imagens

    console.log("\n🎉 Seed concluído com sucesso!");
    console.log("\n📊 Resumo:");
    console.log(
      `   - 1 usuário admin (email: admin@example.com, senha: admin123)`,
    );
    console.log(`   - ${allCategories.length} categorias`);
  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("\n✅ Processo finalizado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Falha no seed:", error);
    process.exit(1);
  });
