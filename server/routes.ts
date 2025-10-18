import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
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
  await setupAuth(app);

  // Serve uploaded files
  app.use("/uploads", express.static(uploadDir));

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User management routes (Admin only)
  app.get("/api/users", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
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
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch("/api/users/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updated = await storage.updateUser(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
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

  app.patch("/api/media/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const media = await storage.getMedia(req.params.id);
      
      if (!media) {
        return res.status(404).json({ message: "Media not found" });
      }

      const updated = await storage.updateMedia(req.params.id, req.body);
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

  const httpServer = createServer(app);
  return httpServer;
}
