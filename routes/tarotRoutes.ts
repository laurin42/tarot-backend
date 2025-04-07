import express from "express";
import { cardController } from "../controllers/cardController";

const router = express.Router();

// Grundlegende Status-Route
router.get("/status", (req, res) => {
  res.json({ status: "ok", message: "Tarot API is running" });
});

// Karten-Endpunkte - Alle öffentlich zugänglich
router.post("/card", cardController.interpretCard);
router.get("/cards/:cardName", cardController.getCardByName);
router.get("/card/:cardName", cardController.getCardByName);

// Make summary route public
router.post("/summary", cardController.createSummary);

// Make save drawn card route public and simplify logic
router.post("/drawn-card", cardController.saveDrawnCard);

// Make reading summary route public
router.post("/reading-summary", cardController.saveReadingSummary);

export default router;