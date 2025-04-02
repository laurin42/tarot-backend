import express from "express";
import { authMiddleware } from "../middleware/auth";
import { authController } from "../controllers/authController";

const router = express.Router();

// Auth-Endpunkte
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.getProfile);
router.get("/verify-token", authController.verifyToken);

export default router;