import type { Express, RequestHandler } from "express";
import expressSession from "express-session";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";

const PgStore = connectPgSimple(expressSession);

export function setupAuth(app: Express) {
  // CRÍTICO: Trust proxy para funcionar com Nginx/aaPanel
  // Permite que o Express reconheça o protocolo HTTPS através do proxy
  app.set("trust proxy", 1);
  
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  app.use(
    expressSession({
      store: new PgStore({
        pool,
        tableName: "sessions",
        createTableIfMissing: false,
      }),
      secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      proxy: true, // CRÍTICO: necessário quando atrás de proxy
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
        // Não defina domain - deixe o navegador lidar com isso
      },
    })
  );
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
