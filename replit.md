# Daimidia - Digital Media Catalog Platform

## Overview

Daimidia is a digital media catalog platform designed for marketing professionals to browse, search, and manage media assets including videos, images, logos, and banners. The application features a public-facing catalog for browsing media and an admin dashboard for content management. Built with a modern tech stack, it emphasizes visual content discovery with a clean, card-based interface inspired by platforms like Canva, Behance, and Dribbble.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tools**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing

**UI Component System**
- Shadcn/ui component library with Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Design system follows "new-york" style variant
- Framer Motion for animations and transitions

**State Management**
- TanStack Query (React Query) for server state management and caching
- Custom hooks pattern for authentication and data fetching
- Local React state for UI-specific concerns

**Design Approach**
- Content-first philosophy prioritizing media assets
- Dual theme system (light/dark mode) with custom color palettes
- Typography hierarchy using Inter for UI and Space Grotesk for headings
- Responsive grid layouts with card-based media presentation

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for the REST API
- Module-based ESM architecture
- Custom middleware for authentication and authorization

**Authentication System**
- Replit Auth integration using OpenID Connect (OIDC)
- Passport.js strategy for authentication flow
- Session-based authentication with PostgreSQL session storage
- Role-based access control (admin/visitor roles)

**API Design**
- RESTful endpoints for CRUD operations on media, categories, and users
- File upload handling via Multer middleware (50MB limit)
- Separation of storage interface from implementation for flexibility

**Storage Layer**
- Interface-based storage pattern (`IStorage`) for abstraction
- Database implementation via `DbStorage` class
- File system storage for uploaded media in `/uploads` directory

### Data Storage Solutions

**Database**
- PostgreSQL via Neon serverless database
- Drizzle ORM for type-safe database queries and schema management
- Schema-first approach with TypeScript type inference

**Database Schema**
- `users`: User profiles with Replit Auth compatibility (id, email, firstName, lastName, profileImageUrl, role)
- `sessions`: Session storage for authentication (sid, sess, expire)
- `media`: Media asset records (id, title, description, type, categoryId, tags, fileUrl, thumbnailUrl, timestamps)
- `categories`: Content categorization (id, name, description, color)

**File Storage**
- Local file system storage in `/uploads` directory
- Unique filename generation using timestamps and random identifiers
- Static file serving via Express middleware

### Authentication & Authorization

**Authentication Flow**
1. Replit OIDC discovery and configuration
2. Passport.js strategy handles OAuth flow
3. Session creation with PostgreSQL-backed store
4. User profile creation/update on successful authentication

**Authorization Mechanisms**
- Session-based user identification
- `isAuthenticated` middleware for protected routes
- `requireAdmin` middleware for admin-only endpoints
- Role checking at the route and UI levels

### External Dependencies

**Third-Party Services**
- Replit Auth (OIDC provider) for authentication
- Neon serverless PostgreSQL for database hosting
- Google Fonts (Inter, Space Grotesk) for typography

**Key Libraries**
- `@neondatabase/serverless`: Neon database client
- `drizzle-orm` & `drizzle-kit`: ORM and migration tooling
- `@tanstack/react-query`: Server state management
- `@radix-ui/*`: Headless UI component primitives
- `multer`: File upload handling
- `passport` & `openid-client`: Authentication
- `connect-pg-simple`: PostgreSQL session store
- `framer-motion`: Animation library
- `zod`: Runtime schema validation
- `react-hook-form`: Form management

**Development Tools**
- TypeScript for type safety across the stack
- ESLint and Prettier (inferred from standard setup)
- Vite plugins for Replit development environment integration