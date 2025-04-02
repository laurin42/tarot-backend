import { Request, Response } from "express";
import { db } from "../db";
import { usersTable, drawnCardsTable } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { asyncHandler } from "../utils/errorHandler";

interface GoalsUpdateRequest {
  goals: string;
  gender?: string;
  zodiacSign?: string;
  birthday?: string;
}

export const userController = {
  // Benutzer erstellen
  createUser: asyncHandler(async (req: Request, res: Response) => {
    const { username, authProvider, authId, goals } = req.body;
    
    const newUser = await db
      .insert(usersTable)
      .values({
        username,
        authProvider,
        authId,
        goals,
      })
      .returning();
      
    res.status(201).json(newUser[0]);
  }),

  // Benutzerprofil aktualisieren
  updateProfile: asyncHandler<{authId: string}, any, GoalsUpdateRequest>(async (req, res) => {
    const { goals, gender, zodiacSign, birthday } = req.body;
    const { authId } = req.params;
    
    const updatedUser = await db
      .update(usersTable)
      .set({ 
        goals,
        gender: gender || undefined,
        zodiacSign: zodiacSign || undefined,
        birthday: birthday ? new Date(birthday) : undefined,
        updatedAt: new Date()
      })
      .where(eq(usersTable.authId, authId))
      .returning();
      
    if (!updatedUser.length) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(updatedUser[0]);
  }),

  // Benutzerziele abrufen
  getUserGoals: asyncHandler(async (req: Request, res: Response) => {
    const { authId } = req.params;
    
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.authId, authId))
      .limit(1);
      
    if (!user.length) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ goals: user[0].goals });
  }),

  // Karten eines Benutzers abrufen
  getUserCards: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id ? parseInt(req.user.id) : null;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Karten des Benutzers abrufen, nach neusten zuerst
    const userCards = await db
      .select()
      .from(drawnCardsTable)
      .where(eq(drawnCardsTable.userId, userId))
      .orderBy(desc(drawnCardsTable.createdAt));
      
    // Karten nach Sitzung gruppieren
    const readings = userCards.reduce((acc: any, card: any) => {
      if (!acc[card.sessionId]) {
        acc[card.sessionId] = {
          date: card.createdAt,
          cards: []
        };
      }
      
      acc[card.sessionId].cards.push(card);
      return acc;
    }, {});
    
    res.json({
      cards: userCards,
      readings: Object.values(readings)
    });
  })
};