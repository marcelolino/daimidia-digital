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
        profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      })
      .onConflictDoNothing()
      .returning();

    console.log(`✅ Admin criado: ${adminUser?.email || 'já existe'}`);

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
    const adminUserId = adminUser?.id || (await db.select().from(users)).at(0)?.id;

    if (!adminUserId) {
      throw new Error("Nenhum usuário encontrado para associar às mídias");
    }

    // 3. Criar mídias de imagens
    console.log("🖼️  Criando mídias de imagens...");
    const mediaData = [
      // Natureza
      {
        title: "Floresta Verde Exuberante",
        description: "Floresta tropical com vegetação densa e verde vibrante",
        type: "image" as const,
        categoryId: allCategories.find(c => c.name === "Natureza")?.id,
        tags: ["floresta", "verde", "natureza", "tropical"],
        fileUrl: "https://images.unsplash.com/photo-1511497584788-876760111969?w=1200",
        thumbnailUrl: "https://images.unsplash.com/photo-1511497584788-876760111969?w=400",
        fileName: "floresta-verde.jpg",
        fileSize: "2.4 MB",
        mimeType: "image/jpeg",
        uploadedBy: adminUserId,
      },
      {
        title: "Montanhas ao Pôr do Sol",
        description: "Vista panorâmica de montanhas durante o crepúsculo",
        type: "image" as const,
        categoryId: allCategories.find(c => c.name === "Natureza")?.id,
        tags: ["montanha", "pôr do sol", "paisagem", "natureza"],
        fileUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
        thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
        fileName: "montanhas-por-do-sol.jpg",
        fileSize: "3.1 MB",
        mimeType: "image/jpeg",
        uploadedBy: adminUserId,
      },
      {
        title: "Oceano Azul Cristalino",
        description: "Águas cristalinas do oceano em dia ensolarado",
        type: "image" as const,
        categoryId: allCategories.find(c => c.name === "Natureza")?.id,
        tags: ["oceano", "mar", "água", "azul"],
        fileUrl: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200",
        thumbnailUrl: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400",
        fileName: "oceano-azul.jpg",
        fileSize: "2.8 MB",
        mimeType: "image/jpeg",
        uploadedBy: adminUserId,
      },
      // Tecnologia
      {
        title: "Setup de Programação Moderno",
        description: "Estação de trabalho com múltiplos monitores e código",
        type: "image" as const,
        categoryId: allCategories.find(c => c.name === "Tecnologia")?.id,
        tags: ["programação", "código", "computador", "workspace"],
        fileUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200",
        thumbnailUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
        fileName: "setup-programacao.jpg",
        fileSize: "1.9 MB",
        mimeType: "image/jpeg",
        uploadedBy: adminUserId,
      },
      {
        title: "Circuito Eletrônico",
        description: "Placa de circuito integrado com componentes eletrônicos",
        type: "image" as const,
        categoryId: allCategories.find(c => c.name === "Tecnologia")?.id,
        tags: ["eletrônica", "circuito", "hardware", "tecnologia"],
        fileUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200",
        thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400",
        fileName: "circuito-eletronico.jpg",
        fileSize: "2.2 MB",
        mimeType: "image/jpeg",
        uploadedBy: adminUserId,
      },
      // Pessoas
      {
        title: "Profissional Confiante",
        description: "Retrato profissional em ambiente corporativo",
        type: "image" as const,
        categoryId: allCategories.find(c => c.name === "Pessoas")?.id,
        tags: ["retrato", "profissional", "pessoa", "corporativo"],
        fileUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200",
        thumbnailUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
        fileName: "profissional-confiante.jpg",
        fileSize: "1.7 MB",
        mimeType: "image/jpeg",
        uploadedBy: adminUserId,
      },
      {
        title: "Equipe Colaborando",
        description: "Grupo de pessoas trabalhando juntas em projeto",
        type: "image" as const,
        categoryId: allCategories.find(c => c.name === "Pessoas")?.id,
        tags: ["equipe", "colaboração", "trabalho", "grupo"],
        fileUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200",
        thumbnailUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400",
        fileName: "equipe-colaborando.jpg",
        fileSize: "2.5 MB",
        mimeType: "image/jpeg",
        uploadedBy: adminUserId,
      },
      // Arquitetura
      {
        title: "Arranha-Céu Moderno",
        description: "Edifício contemporâneo com fachada de vidro",
        type: "image" as const,
        categoryId: allCategories.find(c => c.name === "Arquitetura")?.id,
        tags: ["prédio", "arquitetura", "moderno", "urbano"],
        fileUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200",
        thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
        fileName: "arranha-ceu-moderno.jpg",
        fileSize: "2.9 MB",
        mimeType: "image/jpeg",
        uploadedBy: adminUserId,
      },
      {
        title: "Interior Minimalista",
        description: "Ambiente interno com design clean e minimalista",
        type: "image" as const,
        categoryId: allCategories.find(c => c.name === "Arquitetura")?.id,
        tags: ["interior", "design", "minimalista", "moderno"],
        fileUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200",
        thumbnailUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400",
        fileName: "interior-minimalista.jpg",
        fileSize: "1.8 MB",
        mimeType: "image/jpeg",
        uploadedBy: adminUserId,
      },
      // Arte
      {
        title: "Arte Abstrata Colorida",
        description: "Pintura abstrata com cores vibrantes e formas fluidas",
        type: "image" as const,
        categoryId: allCategories.find(c => c.name === "Arte")?.id,
        tags: ["abstrato", "colorido", "arte", "pintura"],
        fileUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200",
        thumbnailUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400",
        fileName: "arte-abstrata.jpg",
        fileSize: "2.3 MB",
        mimeType: "image/jpeg",
        uploadedBy: adminUserId,
      },
      {
        title: "Ilustração Digital",
        description: "Arte digital contemporânea com elementos gráficos",
        type: "image" as const,
        categoryId: allCategories.find(c => c.name === "Arte")?.id,
        tags: ["digital", "ilustração", "gráfico", "arte"],
        fileUrl: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=1200",
        thumbnailUrl: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400",
        fileName: "ilustracao-digital.jpg",
        fileSize: "2.0 MB",
        mimeType: "image/jpeg",
        uploadedBy: adminUserId,
      },
      // Negócios
      {
        title: "Reunião de Negócios",
        description: "Profissionais em reunião estratégica",
        type: "image" as const,
        categoryId: allCategories.find(c => c.name === "Negócios")?.id,
        tags: ["reunião", "negócios", "corporativo", "profissional"],
        fileUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200",
        thumbnailUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400",
        fileName: "reuniao-negocios.jpg",
        fileSize: "2.1 MB",
        mimeType: "image/jpeg",
        uploadedBy: adminUserId,
      },
      {
        title: "Análise de Dados",
        description: "Gráficos e relatórios em análise de performance",
        type: "image" as const,
        categoryId: allCategories.find(c => c.name === "Negócios")?.id,
        tags: ["dados", "análise", "gráficos", "negócios"],
        fileUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200",
        thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
        fileName: "analise-dados.jpg",
        fileSize: "1.6 MB",
        mimeType: "image/jpeg",
        uploadedBy: adminUserId,
      },
    ];

    const createdMedia = await db
      .insert(media)
      .values(mediaData)
      .onConflictDoNothing()
      .returning();

    console.log(`✅ ${createdMedia.length} mídias criadas`);

    console.log("\n🎉 Seed concluído com sucesso!");
    console.log("\n📊 Resumo:");
    console.log(`   - 1 usuário admin (email: admin@example.com, senha: admin123)`);
    console.log(`   - ${allCategories.length} categorias`);
    console.log(`   - ${createdMedia.length} imagens`);
    
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
