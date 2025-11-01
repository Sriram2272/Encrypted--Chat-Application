# Encrypted Chat Application

## Overview

This is a fullstack end-to-end encrypted (E2EE) chat application built for Replit. The application provides two distinct user interfaces: a **User Chat Interface** for secure messaging and an **Admin Dashboard** for user management and metadata oversight. The core security principle is that all messages are encrypted client-side using libsodium cryptography, ensuring that private keys never leave the user's device and the server cannot decrypt message content.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React with TypeScript, using Vite as the build tool
- **UI Components:** Shadcn/ui component library based on Radix UI primitives
- **Styling:** Tailwind CSS with custom design system (Linear + Slack inspired)
- **State Management:** TanStack Query (React Query) for server state
- **Routing:** Wouter for lightweight client-side routing
- **Real-time Communication:** Socket.IO client

**Design System:**
- Typography: Inter for UI elements, JetBrains Mono for technical data
- Color scheme: Neutral base with HSL color variables for theming
- Component variants: Utilizes class-variance-authority for consistent styling
- Spacing: Tailwind's standard spacing scale (2, 4, 6, 8, 12, 16, 20, 24)

**Client-Side Encryption:**
- **Library:** libsodium-wrappers for cryptographic operations
- **Key Management:** X25519 keypair generation on registration
- **Key Storage:** Private keys stored in IndexedDB (browser-local, never transmitted)
- **Encryption Flow:** Uses crypto_kx for key agreement and crypto_secretbox for message encryption/decryption
- **Security Model:** Sender derives shared symmetric key using their private key + recipient's public key, encrypts message with nonce, transmits ciphertext

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with Express.js framework
- **Real-time:** Socket.IO server for WebSocket connections
- **Language:** TypeScript with ES modules

**API Structure:**
- RESTful endpoints for authentication and user management
- WebSocket connections for real-time message delivery
- Middleware-based request logging and error handling

**Authentication & Authorization:**
- **Password Security:** Bcrypt for password hashing (10 rounds)
- **Session Management:** JWT tokens with 4-hour expiration
- **Token Verification:** Middleware-based authentication for protected routes
- **Admin Privileges:** Role-based access control (isAdmin flag)

**Message Handling:**
- Server stores encrypted messages (ciphertext + nonce) without ability to decrypt
- Real-time delivery via Socket.IO to connected recipients
- Admin can view metadata (sender, receiver, timestamps, message length) but not plaintext content

### Data Storage

**Current Implementation:**
- **In-Memory Storage:** MemStorage class using Map data structures
- **Data Models:** Users and Messages with typed schemas using Zod
- **Auto-incrementing IDs:** Simple counter-based ID generation

**Database Configuration:**
- Drizzle ORM configured for PostgreSQL (prepared for migration from in-memory)
- Schema defined in shared/schema.ts with User and Message models
- Migration directory structure in place

**Data Models:**
- **User:** id, username, passwordHash, publicKey, isAdmin, disabled
- **Message:** id, sender, receiver, ciphertext, nonce, createdAt

### Application Interfaces

**User Chat Interface:**
- User list sidebar showing available contacts
- Chat area with encrypted message display
- Message input with real-time delivery
- Visual indicators for encryption status and message delivery
- Logout functionality

**Admin Dashboard:**
- User management cards with account enable/disable controls
- Message metadata table (cannot view plaintext)
- Decryption panel (requires manual private key input to decrypt)
- User and message tabs for organized viewing
- Badge indicators for user status (admin, active/disabled)

## External Dependencies

### Third-Party Services
- **Replit Infrastructure:** Hosting, environment variables, development tooling
- **Database:** PostgreSQL via Neon (@neondatabase/serverless) - configured but not yet implemented

### Key Libraries

**Frontend:**
- libsodium-wrappers: Client-side encryption/decryption
- Socket.IO client: Real-time messaging
- TanStack Query: Server state management
- Wouter: Lightweight routing
- date-fns: Date formatting
- Radix UI: Accessible UI primitives
- Tailwind CSS: Utility-first styling

**Backend:**
- Express.js: Web framework
- Socket.IO: WebSocket server
- jsonwebtoken: JWT authentication
- bcrypt: Password hashing
- Zod: Schema validation

**Development:**
- TypeScript: Type safety
- Vite: Build tooling and HMR
- Drizzle Kit: Database migrations
- tsx: TypeScript execution

### Environment Requirements

**Development:**
- `SESSION_SECRET`: Required for JWT signing (stored as Replit secret)
- Node.js runtime with ES module support

**Production:**
- `SESSION_SECRET`: Required for JWT signing (stored as Replit secret, available globally)
- `DATABASE_URL`: Set to placeholder value (since app uses in-memory storage)
  - Current value: `postgresql://placeholder:placeholder@localhost:5432/placeholder`
  - Required by drizzle.config.ts during build time
  - Not actually used since the app uses MemStorage for data persistence

**Notes:**
- The application currently uses in-memory storage (MemStorage) and does not require a real database
- All data is ephemeral and will be lost on restart
- DATABASE_URL is set to a placeholder to satisfy build requirements
- For persistent storage, migrate to actual PostgreSQL database by updating the storage implementation
