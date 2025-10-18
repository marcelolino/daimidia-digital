import { type User, type UpsertUser, type Media, type InsertMedia } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Media methods
  getMedia(id: string): Promise<Media | undefined>;
  getAllMedia(): Promise<Media[]>;
  getMediaByType(type: string): Promise<Media[]>;
  createMedia(media: InsertMedia): Promise<Media>;
  updateMedia(id: string, media: Partial<InsertMedia>): Promise<Media | undefined>;
  deleteMedia(id: string): Promise<boolean>;
  searchMedia(query: string): Promise<Media[]>;
}

export { storage } from "./db-storage";
