import express from "express";
import { authMiddleware } from "../middleware/auth";
import { cardController } from "../controllers/cardController";

const router = express.Router();

// Grundlegende Status-Route ohne Auth-Anforderung
router.get("/status", (req, res) => {
  res.json({ status: "ok", message: "Tarot API is running" });
});

// Karten-Endpunkte
router.post("/card", cardController.interpretCard);
router.get("/cards/:cardName", cardController.getCardByName);
router.get("/card/:cardName", cardController.getCardByName);
router.post("/summary", authMiddleware, cardController.createSummary);

// Spezielle Fehlerbehandlung für die drawn-card Route
router.post("/drawn-card", (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Nur im Entwicklungsmodus: Erlaube Zugriff ohne Auth für einfachere Tests
    if (process.env.NODE_ENV === 'development') {
      console.log("⚠️ DEV MODE: Allowing unauthenticated access to /drawn-card");
      req.user = { id: "0" }; // Dummy-User für Entwicklung (removed authProvider)
      return next();
    }
    
    return res.status(401).json({
      error: "Authentication required",
      message: "Please provide a valid JWT token in the Authorization header",
      tokenReceived: false
    });
  }
  
  next();
}, authMiddleware, cardController.saveDrawnCard);

// Test-Route für drawn-card ohne Auth (nur im Entwicklungsmodus)
if (process.env.NODE_ENV === 'development') {
  router.post("/test/drawn-card", (req, res) => {
    const { name, description, position = 0 } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ 
        error: "Missing required fields", 
        required: ["name", "description"] 
      });
    }
    
    // Einfache Antwort für Tests
    res.status(201).json({
      id: Math.floor(Math.random() * 1000),
      name,
      description,
      position,
      userId: 0,
      sessionId: `test_${Date.now()}`,
      createdAt: new Date().toISOString()
    });
  });
}

router.post("/reading-summary", authMiddleware, cardController.saveReadingSummary);

export default router;