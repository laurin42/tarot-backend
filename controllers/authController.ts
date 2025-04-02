import { Request, Response } from "express";
import { db } from "../db";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { jwtDecode } from "jwt-decode";
import { generateToken } from "../middleware/auth";
import { asyncHandler } from "../utils/errorHandler";

export const authController = {
  // Login (inklusive Registrierung falls neuer Benutzer)
  login: asyncHandler(async (req: Request, res: Response) => {
    let { authProvider, authId, username, email, picture } = req.body;
    
    if (!authProvider || !authId) {
      return res.status(400).json({ error: "Missing required authentication data" });
    }
    
    // Stabile Benutzer-ID extrahieren (für Google Auth)
    let stableAuthId = authId;
    
    if (authProvider === "google") {
      try {
        const decoded: any = jwtDecode(authId);
        
        if (decoded.sub) {
          stableAuthId = `google|${decoded.sub}`;
        }
        
        // Fallback-Werte aus Token verwenden, falls nicht angegeben
        if (!username && decoded.given_name) {
          username = decoded.given_name;
        }
        if (!email && decoded.email) {
          email = decoded.email;
        }
        if (!picture && decoded.picture) {
          picture = decoded.picture;
        }
      } catch (decodeError) {
        console.error("❌ Failed to decode Google token:", decodeError);
      }
    }
    
    // Handle anonymous authentication
    // The stableAuthId should already be in format "anonymous|{uid}" from client
    if (authProvider === "anonymous") {
      // For anonymous auth, we'll use the provided authId directly
      // No need to decode as we're receiving a properly formatted ID
      if (!stableAuthId.startsWith('anonymous|')) {
        return res.status(400).json({ error: "Invalid anonymous auth ID format" });
      }
      
      // Default username for anonymous users if not provided
      if (!username) {
        username = "Anonymer Benutzer";
      }
    }
    
    // Nach bestehendem Benutzer suchen
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.authId, stableAuthId))
      .limit(1);

    if (existingUser.length) {
      // Benutzerprofil aktualisieren, falls neue Informationen vorhanden
      if (username || email || picture) {
        await db.update(usersTable)
          .set({
            username: username || existingUser[0].username,
            name: username || existingUser[0].name,
            email: email || existingUser[0].email,
            picture: picture || existingUser[0].picture,
            updatedAt: new Date()
          })
          .where(eq(usersTable.id, existingUser[0].id));
          
        // Aktualisierte Benutzerdaten abrufen
        const updatedUser = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, existingUser[0].id))
          .limit(1);
        
        const token = generateToken({ 
          id: updatedUser[0].id.toString(), 
          authProvider 
        });
        
        return res.json({ token, user: updatedUser[0] });
      }
      
      // Wenn keine Aktualisierung nötig ist, vorhandene Benutzerdaten zurückgeben
      const token = generateToken({ 
        id: existingUser[0].id.toString(), 
        authProvider 
      });
      
      return res.json({ token, user: existingUser[0] });
    }

    // Neuen Benutzer erstellen
    const newUser = {
      authId: stableAuthId,
      username: username || "New User",
      authProvider,
      email: email || null,
      picture: picture || null,
      name: username || null,
      goals: "",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const insertedUser = await db
      .insert(usersTable)
      .values(newUser)
      .returning();

    const token = generateToken({ 
      id: insertedUser[0].id.toString(), 
      authProvider 
    });
    
    res.status(201).json({
      token,
      user: insertedUser[0]
    });
  }),

  // Benutzerprofil abrufen
  getProfile: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const userId = parseInt(req.user.id);
    
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);
      
    if (!user.length) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user[0]);
  }),

  // Token-Format überprüfen
  verifyToken: asyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: "No authorization header", 
        headers: Object.keys(req.headers)
      });
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: "Invalid authorization format", 
        format: authHeader.substring(0, 20)
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    res.json({ 
      status: "success",
      tokenReceived: !!token,
      tokenLength: token.length
    });
  })
};