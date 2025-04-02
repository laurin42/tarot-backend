import express from "express";
import { authMiddleware } from "../middleware/auth";
import { userController } from "../controllers/userController";

const router = express.Router();

// Benutzer-Endpunkte
router.post("/", userController.createUser);
router.put("/:authId/goals", authMiddleware, userController.updateProfile);
router.get("/:authId/goals", authMiddleware, userController.getUserGoals);
router.get("/me/cards", authMiddleware, userController.getUserCards);

export default router;