import { eq, or, ilike, sql } from "drizzle-orm";
import { db } from "./db";
import { users, media, categories, systemSettings, services, type User, type UpsertUser, type Media, type InsertMedia, type Category, type InsertCategory, type SystemSettings, type InsertSystemSettings, type Service, type InsertService } from "@shared/schema";
import type { IStorage } from "./storage";

export class DbStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(sql`${users.createdAt} DESC`);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updateData: Partial<UpsertUser>): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  // Category methods
  async getCategory(id: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result[0];
  }

  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(sql`${categories.name} ASC`);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(insertCategory).returning();
    return result[0];
  }

  async updateCategory(id: string, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
    const result = await db
      .update(categories)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return result[0];
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id)).returning();
    return result.length > 0;
  }

  // Media methods
  async getMedia(id: string): Promise<Media | undefined> {
    const result = await db.select().from(media).where(eq(media.id, id));
    return result[0];
  }

  async getAllMedia(): Promise<Media[]> {
    return await db.select().from(media).orderBy(sql`${media.createdAt} DESC`);
  }

  async getMediaByType(type: string): Promise<Media[]> {
    return await db.select().from(media).where(eq(media.type, type as any)).orderBy(sql`${media.createdAt} DESC`);
  }

  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const result = await db.insert(media).values(insertMedia).returning();
    return result[0];
  }

  async updateMedia(id: string, updateData: Partial<InsertMedia>): Promise<Media | undefined> {
    const result = await db
      .update(media)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(media.id, id))
      .returning();
    return result[0];
  }

  async deleteMedia(id: string): Promise<boolean> {
    const result = await db.delete(media).where(eq(media.id, id)).returning();
    return result.length > 0;
  }

  async searchMedia(query: string): Promise<Media[]> {
    const searchPattern = `%${query}%`;
    return await db
      .select()
      .from(media)
      .where(
        or(
          ilike(media.title, searchPattern),
          ilike(media.description, searchPattern),
          sql`${media.tags}::text ILIKE ${searchPattern}`
        )
      )
      .orderBy(sql`${media.createdAt} DESC`);
  }

  // System settings methods
  async getSystemSettings(): Promise<SystemSettings | undefined> {
    const result = await db.select().from(systemSettings).limit(1);
    return result[0];
  }

  async updateSystemSettings(updateData: Partial<InsertSystemSettings>): Promise<SystemSettings> {
    const existing = await this.getSystemSettings();
    
    if (existing) {
      const result = await db
        .update(systemSettings)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(systemSettings.id, existing.id))
        .returning();
      return result[0];
    } else {
      const result = await db
        .insert(systemSettings)
        .values(updateData)
        .returning();
      return result[0];
    }
  }

  // Service methods
  async getService(id: string): Promise<Service | undefined> {
    const result = await db.select().from(services).where(eq(services.id, id));
    return result[0];
  }

  async getAllServices(): Promise<Service[]> {
    return await db.select().from(services).orderBy(sql`${services.createdAt} DESC`);
  }

  async getActiveServices(): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.status, "ativo")).orderBy(sql`${services.createdAt} DESC`);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const result = await db.insert(services).values(insertService).returning();
    return result[0];
  }

  async updateService(id: string, updateData: Partial<InsertService>): Promise<Service | undefined> {
    const result = await db
      .update(services)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();
    return result[0];
  }

  async deleteService(id: string): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DbStorage();
