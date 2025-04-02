import express from "express";
import { authMiddleware } from "../middleware/auth";
import { cardController } from "../controllers/cardController";

const router = express.Router();

// Karten-Endpunkte
router.post("/card", cardController.interpretCard);
router.get("/cards/:cardName", authMiddleware, cardController.getCardByName);
router.post("/summary", authMiddleware, cardController.createSummary);
router.post("/drawn-card", authMiddleware, cardController.saveDrawnCard);
router.post("/reading-summary", authMiddleware, cardController.saveReadingSummary);

export default router;