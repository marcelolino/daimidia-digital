import { db } from "./db";
import { users, categories, media, systemSettings } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

interface JSONBackup {
  metadata: {
    exportDate: string;
    database: string;
    version: string;
    totalRecords: number;
  };
  data: {
    categories: any[];
    users: any[];
    media: any[];
    systemSettings: any[];
  };
}

export async function restoreFromJSON(jsonData: string): Promise<number> {
  try {
    const backup: JSONBackup = JSON.parse(jsonData);
    let recordsRestored = 0;

    // Limpar todas as tabelas (em ordem de dependências)
    await db.delete(media);
    await db.delete(categories);
    await db.delete(systemSettings);
    // Usuários por último porque media tem FK para users
    await db.delete(users).where(eq(users.role, 'visitor')); // Mantém admins por segurança

    // Restaurar categorias
    if (backup.data.categories && backup.data.categories.length > 0) {
      for (const cat of backup.data.categories) {
        await db.insert(categories).values({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          color: cat.color,
          createdAt: new Date(cat.createdAt),
          updatedAt: new Date(cat.updatedAt),
        });
        recordsRestored++;
      }
    }

    // Restaurar usuários (JSON não tem senhas, então gerar senha padrão)
    if (backup.data.users && backup.data.users.length > 0) {
      for (const user of backup.data.users) {
        // Pular se usuário já existe (admin existente)
        const existing = await db.select().from(users).where(eq(users.email, user.email));
        if (existing.length > 0) continue;

        // Gerar senha padrão hash
        const defaultPassword = await bcrypt.hash('changeme123', 10);
        
        await db.insert(users).values({
          id: user.id,
          email: user.email,
          password: user.password || defaultPassword, // Usar senha do backup ou padrão
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          role: user.role,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        });
        recordsRestored++;
      }
    }

    // Restaurar mídias
    if (backup.data.media && backup.data.media.length > 0) {
      for (const m of backup.data.media) {
        await db.insert(media).values({
          id: m.id,
          title: m.title,
          description: m.description,
          type: m.type,
          categoryId: m.categoryId,
          tags: m.tags || [],
          fileUrl: m.fileUrl,
          thumbnailUrl: m.thumbnailUrl,
          fileName: m.fileName,
          fileSize: m.fileSize,
          mimeType: m.mimeType,
          uploadedBy: m.uploadedBy,
          createdAt: new Date(m.createdAt),
          updatedAt: new Date(m.updatedAt),
        });
        recordsRestored++;
      }
    }

    // Restaurar system settings
    if (backup.data.systemSettings && backup.data.systemSettings.length > 0) {
      for (const setting of backup.data.systemSettings) {
        // Deletar settings existentes primeiro
        await db.delete(systemSettings);
        
        await db.insert(systemSettings).values({
          id: setting.id,
          logoUrl: setting.logoUrl,
          pageViews: setting.pageViews || 0,
          updatedAt: new Date(setting.updatedAt),
        });
        recordsRestored++;
      }
    }

    return recordsRestored;
  } catch (error) {
    console.error("Error restoring from JSON:", error);
    throw new Error("Failed to restore from JSON backup");
  }
}

export async function restoreFromSQL(sqlData: string): Promise<number> {
  try {
    // SQL restoration é mais complexo porque precisa parsear e executar SQL
    // Por segurança, vamos rejeitar por enquanto e sugerir usar JSON
    throw new Error("SQL restore not implemented yet. Please use JSON backup for restoration.");
  } catch (error) {
    console.error("Error restoring from SQL:", error);
    throw error;
  }
}
