import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, verifyPassword, hashPassword } from "./auth";
import { requireAdmin } from "./middleware/requireAdmin";
import multer from "multer";
import { insertMediaSchema, insertCategorySchema } from "@shared/schema";
import path from "path";
import fs from "fs";
import { z } from "zod";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Serve uploaded files
  app.use("/uploads", express.static(uploadDir));

  // Auth routes
  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email e senha são obrigatórios" });
      }

      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }

      const isValid = await verifyPassword(password, user.password);
      
      if (!isValid) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }

      req.session.userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Erro ao fazer login" });
    }
  });

  app.post("/api/auth/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logout realizado com sucesso" });
    });
  });

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User management routes (Admin only)
  app.get("/api/users", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email e senha são obrigatórios" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "Email já está em uso" });
      }

      const hashedPassword = await hashPassword(password);
      const userData = {
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        role: role || "visitor",
      };

      const newUser = await storage.upsertUser(userData);
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updateData: any = { ...req.body };
      
      if (req.body.password) {
        updateData.password = await hashPassword(req.body.password);
      }

      const updated = await storage.updateUser(req.params.id, updateData);
      if (updated) {
        const { password: _, ...userWithoutPassword } = updated;
        res.json(userWithoutPassword);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      
      if (userId === req.params.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  app.post("/api/categories", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.patch("/api/categories/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const updated = await storage.updateCategory(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      await storage.deleteCategory(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      if (error.code === "23503" || error.message?.includes("foreign key")) {
        return res.status(409).json({ 
          message: "Cannot delete category that is in use by media items" 
        });
      }
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Media routes
  app.get("/api/media", async (req, res) => {
    try {
      const { type, search } = req.query;
      
      let media;
      if (search && typeof search === "string") {
        media = await storage.searchMedia(search);
      } else if (type && typeof type === "string") {
        media = await storage.getMediaByType(type);
      } else {
        media = await storage.getAllMedia();
      }
      
      res.json(media);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  app.get("/api/media/:id", async (req, res) => {
    try {
      const media = await storage.getMedia(req.params.id);
      if (!media) {
        return res.status(404).json({ message: "Media not found" });
      }
      res.json(media);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  app.post("/api/media", isAuthenticated, requireAdmin, upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]), async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files || !files.file || files.file.length === 0) {
        return res.status(400).json({ message: "File is required" });
      }

      const file = files.file[0];
      const thumbnail = files.thumbnail ? files.thumbnail[0] : null;

      const mediaData = {
        title: req.body.title,
        description: req.body.description || null,
        type: req.body.type,
        categoryId: req.body.categoryId || null,
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        fileUrl: `/uploads/${file.filename}`,
        thumbnailUrl: thumbnail ? `/uploads/${thumbnail.filename}` : null,
        fileName: file.originalname,
        fileSize: file.size.toString(),
        mimeType: file.mimetype,
        uploadedBy: userId,
      };

      const validatedData = insertMediaSchema.parse(mediaData);
      const media = await storage.createMedia(validatedData);
      
      res.status(201).json(media);
    } catch (error) {
      console.error("Error creating media:", error);
      res.status(500).json({ message: "Failed to create media" });
    }
  });

  app.patch("/api/media/:id", isAuthenticated, requireAdmin, upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]), async (req: any, res) => {
    try {
      const media = await storage.getMedia(req.params.id);
      
      if (!media) {
        return res.status(404).json({ message: "Media not found" });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const file = files?.file ? files.file[0] : null;
      const thumbnail = files?.thumbnail ? files.thumbnail[0] : null;

      const updateData: any = {
        title: req.body.title || media.title,
        description: req.body.description !== undefined ? req.body.description : media.description,
        type: req.body.type || media.type,
        categoryId: req.body.categoryId !== undefined ? req.body.categoryId : media.categoryId,
        tags: req.body.tags ? JSON.parse(req.body.tags) : media.tags,
      };

      if (file) {
        updateData.fileUrl = `/uploads/${file.filename}`;
        updateData.fileName = file.originalname;
        updateData.fileSize = file.size.toString();
        updateData.mimeType = file.mimetype;
      }

      if (thumbnail) {
        updateData.thumbnailUrl = `/uploads/${thumbnail.filename}`;
      }

      const updated = await storage.updateMedia(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      console.error("Error updating media:", error);
      res.status(500).json({ message: "Failed to update media" });
    }
  });

  app.delete("/api/media/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const media = await storage.getMedia(req.params.id);
      
      if (!media) {
        return res.status(404).json({ message: "Media not found" });
      }

      await storage.deleteMedia(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting media:", error);
      res.status(500).json({ message: "Failed to delete media" });
    }
  });

  // System settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings || { id: null, logoUrl: null, updatedAt: null });
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings/logo", isAuthenticated, requireAdmin, upload.single("logo"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Logo file is required" });
      }

      // Validate file type (only allow images)
      const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        // Delete the uploaded file since it's not valid
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Only image files are allowed (JPEG, PNG, GIF, WebP, SVG)" });
      }

      // Get current settings to remove old logo file
      const currentSettings = await storage.getSystemSettings();
      if (currentSettings?.logoUrl) {
        try {
          const oldLogoPath = path.join(process.cwd(), currentSettings.logoUrl.replace(/^\//, ''));
          if (fs.existsSync(oldLogoPath)) {
            fs.unlinkSync(oldLogoPath);
          }
        } catch (error) {
          console.error("Error deleting old logo file:", error);
          // Continue with upload even if old file deletion fails
        }
      }

      const logoUrl = `/uploads/${req.file.filename}`;
      const settings = await storage.updateSystemSettings({ logoUrl });
      
      res.json(settings);
    } catch (error) {
      console.error("Error uploading logo:", error);
      res.status(500).json({ message: "Failed to upload logo" });
    }
  });

  // Database export routes
  app.get("/api/database/export/sql", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { generateDatabaseExport } = await import("./db-export");
      const exportSQL = await generateDatabaseExport();
      
      const filename = `database-backup-${new Date().toISOString().split('T')[0]}.sql`;
      
      res.setHeader('Content-Type', 'application/sql');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(exportSQL);
    } catch (error) {
      console.error("Error exporting database:", error);
      res.status(500).json({ message: "Failed to export database" });
    }
  });

  app.get("/api/database/export/json", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { generateDatabaseExportJSON } = await import("./db-export");
      const exportJSON = await generateDatabaseExportJSON();
      
      const filename = `database-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(exportJSON);
    } catch (error) {
      console.error("Error exporting database:", error);
      res.status(500).json({ message: "Failed to export database" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
