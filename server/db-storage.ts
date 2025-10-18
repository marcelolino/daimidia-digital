import { eq, or, ilike, sql } from "drizzle-orm";
import { db } from "./db";
import { users, media, type User, type UpsertUser, type Media, type InsertMedia } from "@shared/schema";
import type { IStorage } from "./storage";

export class DbStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
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
}

export const storage = new DbStorage();
