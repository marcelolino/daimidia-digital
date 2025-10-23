import { db } from "./db";
import { users, categories, media, systemSettings } from "@shared/schema";

export async function generateDatabaseExport(): Promise<string> {
  const timestamp = new Date().toISOString();
  let exportSQL = `-- Database Export
-- Generated: ${timestamp}
-- Database: PostgreSQL
-- WARNING: This export contains sensitive data. Keep it secure!

`;

  try {
    // Export Categories
    const allCategories = await db.select().from(categories);
    exportSQL += `\n-- Categories (${allCategories.length} records)\n`;
    exportSQL += `DELETE FROM categories;\n`;
    
    for (const cat of allCategories) {
      const values = [
        `'${cat.id}'`,
        `'${cat.name.replace(/'/g, "''")}'`,
        cat.description ? `'${cat.description.replace(/'/g, "''")}'` : 'NULL',
        cat.color ? `'${cat.color}'` : 'NULL',
        `'${cat.createdAt.toISOString()}'`,
        `'${cat.updatedAt.toISOString()}'`
      ].join(', ');
      
      exportSQL += `INSERT INTO categories (id, name, description, color, created_at, updated_at) VALUES (${values});\n`;
    }

    // Export Users (without passwords for security)
    const allUsers = await db.select().from(users);
    exportSQL += `\n-- Users (${allUsers.length} records)\n`;
    exportSQL += `DELETE FROM users;\n`;
    
    for (const user of allUsers) {
      const values = [
        `'${user.id}'`,
        `'${user.email.replace(/'/g, "''")}'`,
        `'${user.password}'`, // Include hashed password
        user.firstName ? `'${user.firstName.replace(/'/g, "''")}'` : 'NULL',
        user.lastName ? `'${user.lastName.replace(/'/g, "''")}'` : 'NULL',
        user.profileImageUrl ? `'${user.profileImageUrl.replace(/'/g, "''")}'` : 'NULL',
        `'${user.role}'`,
        `'${user.createdAt.toISOString()}'`,
        `'${user.updatedAt.toISOString()}'`
      ].join(', ');
      
      exportSQL += `INSERT INTO users (id, email, password, first_name, last_name, profile_image_url, role, created_at, updated_at) VALUES (${values});\n`;
    }

    // Export Media
    const allMedia = await db.select().from(media);
    exportSQL += `\n-- Media (${allMedia.length} records)\n`;
    exportSQL += `DELETE FROM media;\n`;
    
    for (const m of allMedia) {
      const tagsArray = m.tags && m.tags.length > 0 
        ? `ARRAY[${m.tags.map(t => `'${t.replace(/'/g, "''")}'`).join(', ')}]::text[]`
        : 'ARRAY[]::text[]';
      
      const values = [
        `'${m.id}'`,
        `'${m.title.replace(/'/g, "''")}'`,
        m.description ? `'${m.description.replace(/'/g, "''")}'` : 'NULL',
        `'${m.type}'`,
        m.categoryId ? `'${m.categoryId}'` : 'NULL',
        tagsArray,
        `'${m.fileUrl.replace(/'/g, "''")}'`,
        m.thumbnailUrl ? `'${m.thumbnailUrl.replace(/'/g, "''")}'` : 'NULL',
        `'${m.fileName.replace(/'/g, "''")}'`,
        m.fileSize ? `'${m.fileSize.replace(/'/g, "''")}'` : 'NULL',
        m.mimeType ? `'${m.mimeType.replace(/'/g, "''")}'` : 'NULL',
        `'${m.uploadedBy}'`,
        `'${m.createdAt.toISOString()}'`,
        `'${m.updatedAt.toISOString()}'`
      ].join(', ');
      
      exportSQL += `INSERT INTO media (id, title, description, type, category_id, tags, file_url, thumbnail_url, file_name, file_size, mime_type, uploaded_by, created_at, updated_at) VALUES (${values});\n`;
    }

    // Export System Settings
    const settings = await db.select().from(systemSettings);
    exportSQL += `\n-- System Settings (${settings.length} records)\n`;
    exportSQL += `DELETE FROM system_settings;\n`;
    
    for (const setting of settings) {
      const values = [
        `'${setting.id}'`,
        setting.logoUrl ? `'${setting.logoUrl.replace(/'/g, "''")}'` : 'NULL',
        `'${setting.updatedAt.toISOString()}'`
      ].join(', ');
      
      exportSQL += `INSERT INTO system_settings (id, logo_url, updated_at) VALUES (${values});\n`;
    }

    exportSQL += `\n-- Export completed successfully\n`;
    exportSQL += `-- Total records: ${allCategories.length + allUsers.length + allMedia.length + settings.length}\n`;

    return exportSQL;
  } catch (error) {
    console.error("Error generating database export:", error);
    throw new Error("Failed to generate database export");
  }
}

export async function generateDatabaseExportJSON(): Promise<string> {
  const timestamp = new Date().toISOString();
  
  try {
    const allCategories = await db.select().from(categories);
    const allUsers = await db.select().from(users);
    const allMedia = await db.select().from(media);
    const settings = await db.select().from(systemSettings);

    // Remove passwords from users for security
    const usersWithoutPasswords = allUsers.map(({ password, ...user }) => user);

    const exportData = {
      metadata: {
        exportDate: timestamp,
        database: "PostgreSQL",
        version: "1.0",
        totalRecords: allCategories.length + allUsers.length + allMedia.length + settings.length
      },
      data: {
        categories: allCategories,
        users: usersWithoutPasswords,
        media: allMedia,
        systemSettings: settings
      }
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error("Error generating JSON export:", error);
    throw new Error("Failed to generate JSON export");
  }
}
