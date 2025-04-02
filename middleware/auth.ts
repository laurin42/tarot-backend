import { Request, Response, NextFunction } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: TokenPayload;
  }
}
import jwt from 'jsonwebtoken';

export interface TokenPayload {
  id: string;
  authProvider: string;
}

// Token Verification
export const verifyToken = (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
      if (err) {
        console.error("Token verification error:", err.message);
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

// Token Generation
export const generateToken = (payload: any): string => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
};

// Middleware
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    console.log("🔍 Auth header:", authHeader ? "exists" : "missing");
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("❌ Missing or invalid Authorization header");
      return res.status(401).json({ error: 'Authorization header required' });
    }
    
    const token = authHeader.split(' ')[1];
    console.log("🔑 Got token:", token.substring(0, 15) + "...");
    
    try {
      // ONLY verify our own server-generated tokens
      const decoded = await verifyToken(token);
      console.log("✅ Token verified successfully for user:", decoded.id);
      req.user = decoded;
      next();
    } catch (error) {
      console.error("❌ Token verification failed:", error);
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ error: 'Server authentication error' });
  }
};