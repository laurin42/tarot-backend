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

    // Karte in DB speichern
    const newCard = await cardService.saveCard(
      req.user?.id ? parseInt(req.user.id) : 0,
      card.name,
      description,
      null,
      null
    );
    
    res.status(201).json(newCard[0]);
  }),

  // Karte aus URL-Parameter interpretieren
  getCardByName: asyncHandler(async (req: Request, res: Response) => {
    const cardName = decodeURIComponent(req.params.cardName);
    let userGoals = "";
    
    // Benutzerziele aus DB holen, falls angemeldet
    if (req.user?.id) {
      const { context } = await cardService.buildPersonalContextForUser(parseInt(req.user.id));
      userGoals = context;
    }
    
    const explanation = await cardService.interpretCard(cardName, userGoals);
    
    res.json({ 
      explanation,
      goalsIncluded: userGoals ? true : false
    });
  }),

  // Zusammenfassung für mehrere Karten erstellen
  createSummary: asyncHandler(async (req: Request<{}, {}, CardRequest>, res: Response) => {
    const { cards } = req.body;
    let personalContext = "";
    let profileInfo = {
      goals: false,
      gender: false,
      zodiac: false,
      age: false
    };
    
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      throw new Error('Invalid or empty cards array received');
    }

    const cardNames = cards.map(card => card.name);
    
    // Benutzerkontext hinzufügen, falls angemeldet
    if (req.user?.id) {
      const contextData = await cardService.buildPersonalContextForUser(parseInt(req.user.id));
      personalContext = contextData.context;
      profileInfo = contextData.profileInfo;
    }
    
    // Fallback zu Request-Goals, falls keine DB-Goals
    if (!personalContext && req.body.userGoals) {
      personalContext = `Ziele der Person: ${req.body.userGoals}. `;
      profileInfo.goals = true;
    }
    
    const summary = await cardService.interpretCardSet(cardNames, personalContext);

    if (!summary) {
      throw new Error("Es wurde keine Zusammenfassung generiert");
    }

    res.json({ 
      success: true,
      summary,
      cards: cardNames,
      profileInfoIncluded: profileInfo
    });
  }),

  // Gezogene Karte speichern
  saveDrawnCard: asyncHandler(async (req: Request, res: Response) => {
    const { name, description, position = null, sessionId = null } = req.body;
    const userId = req.user?.id ? parseInt(req.user.id) : null;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const result = await cardService.saveCard(
      userId, name, description, position, sessionId
    );
    
    res.status(201).json(result[0]);
  }),

  // Lesungszusammenfassung speichern
  saveReadingSummary: asyncHandler(async (req: Request, res: Response) => {
    const { sessionId, summary } = req.body;
    const userId = req.user?.id ? parseInt(req.user.id) : null;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const result = await cardService.saveReadingSummary(userId, sessionId, summary);
    
    res.status(201).json(result[0]);
  })
};