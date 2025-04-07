import { Request, Response } from "express";
import { cardService } from "../services/cardService";
import { asyncHandler } from "../utils/errorHandler";

// Interface für Kartenanfragen
interface CardRequest {
  cards: Array<{ name: string }>;
  userGoals?: string;
}

export const cardController = {
  // Einzelne Karte deuten
  interpretCard: asyncHandler(async (req: Request<{}, {}, CardRequest>, res: Response) => {
    const { cards, userGoals = "" } = req.body;
    const card = cards[0];

    if (!card || !card.name) {
      return res.status(400).json({ error: "Ungültige Karteninformationen" });
    }

    const description = await cardService.interpretCard(card.name, userGoals);
    
    if (!description) {
      throw new Error("Es wurde keine Beschreibung generiert");
    }

    // Karte in DB speichern - pass null as userId since auth is removed
    const newCard = await cardService.saveCard(
      null, // Pass null for userId
      card.name,
      description,
      null,
      null // Or maybe a guest session ID if needed?
    );
    
    res.status(201).json(newCard[0]);
  }),

  // Karte aus URL-Parameter interpretieren
  getCardByName: asyncHandler(async (req: Request, res: Response) => {
    const cardName = decodeURIComponent(req.params.cardName);
    // Remove user-specific logic as req.user is no longer set
    // const userId = req.user?.id ? parseInt(req.user.id) : null;
    // let userGoals = "";
    // if (userId) {
    //   const { context } = await cardService.buildPersonalContextForUser(userId);
    //   userGoals = context;
    // }
    
    // Always call interpretCard without user goals
    const explanation = await cardService.interpretCard(cardName);
    
    res.json({ 
      explanation,
      goalsIncluded: false // Goals are never included now
    });
  }),

  // Zusammenfassung für mehrere Karten erstellen
  createSummary: asyncHandler(async (req: Request<{}, {}, CardRequest>, res: Response) => {
    const { cards } = req.body;
    // Remove user-specific logic as req.user is no longer set
    // let personalContext = "";
    // let profileInfo = { /* ... */ };
    // const userId = req.user?.id ? parseInt(req.user.id) : null;
    // if (userId) { /* ... */ }
    // if (!personalContext && req.body.userGoals) { /* ... */ }

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      throw new Error('Invalid or empty cards array received');
    }

    const cardNames = cards.map(card => card.name);
    
    // Always call interpretCardSet without personal context
    const summary = await cardService.interpretCardSet(cardNames);

    if (!summary) {
      throw new Error("Es wurde keine Zusammenfassung generiert");
    }

    res.json({ 
      success: true,
      summary,
      cards: cardNames,
      // Indicate that no profile info was used
      profileInfoIncluded: { goals: false, gender: false, zodiac: false, age: false }
    });
  }),

  // Gezogene Karte speichern
  saveDrawnCard: asyncHandler(async (req: Request, res: Response) => {
    const { name, description, position = null, sessionId = null } = req.body;
    // Remove userId check and pass null
    // const userId = req.user?.id ? parseInt(req.user.id) : null;
    // if (!userId) { return res.status(401).json({ error: "Authentication required" }); }
    
    const result = await cardService.saveCard(
      null, name, description, position, sessionId // Pass null for userId
    );
    
    res.status(201).json(result[0]);
  }),

  // Lesungszusammenfassung speichern
  saveReadingSummary: asyncHandler(async (req: Request, res: Response) => {
    const { sessionId, summary } = req.body;
    // Remove userId check and pass null
    // const userId = req.user?.id ? parseInt(req.user.id) : null;
    // if (!userId) { return res.status(401).json({ error: "Authentication required" }); }
    
    const result = await cardService.saveReadingSummary(
      null, sessionId, summary // Pass null for userId
    );
    
    res.status(201).json(result[0]);
  })
};