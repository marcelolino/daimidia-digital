import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { requireAdmin } from "./middleware/requireAdmin";
import multer from "multer";
import { insertMediaSchema } from "@shared/schema";
import path from "path";
import fs from "fs";

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

  app.post("/api/media", isAuthenticated, requireAdmin, upload.single("file"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "File is required" });
      }

      const mediaData = {
        title: req.body.title,
        description: req.body.description || null,
        type: req.body.type,
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        fileUrl: `/uploads/${file.filename}`,
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
