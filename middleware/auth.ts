import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { usersTable } from '../db/schema';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: string };
  }
}

export interface TokenPayload {
  id: string;
  authProvider: string;
}

export interface AuthenticatedRequest extends Request {
    user?: { id: string };
    token?: string;
}

// Helper function to send error responses
const sendAuthError = (res: Response, status: number, code: string, message: string, details?: string) => {
    console.error(`Auth Error (${code}): ${message}`, details ? `Details: ${details}` : '');
    return res.status(status).json({
        error: {
            code: code,
            message: message,
            ...(details && { details: details }),
        },
    });
};

// Token Verification
export const verifyToken = (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Debugging-Info
    console.log("Token to verify:", token.substring(0, 20) + "...");
    
    try {
      // Einige Clients senden möglicherweise Base64-codierte Tokens oder Tokens mit anderen Formaten
      // Versuch, mit verschiedenen Decodierungen zu arbeiten
      let decodedToken = token;
      
      // Entferne Whitespace
      decodedToken = decodedToken.trim();
      
      // JWT verifizieren
      jwt.verify(decodedToken, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
        if (err) {
          console.error("Token verification error:", err.message);
          reject(err);
        } else {
          console.log("Token decoded successfully:", decoded);
          resolve(decoded);
        }
      });
    } catch (error) {
      console.error("Token pre-verification error:", error);
      reject(error);
    }
  });
};

// Token Generation
export const generateToken = (payload: any): string => {
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
  console.log("Generated new token:", token.substring(0, 20) + "...");
  return token;
};

// Middleware
export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    // Logge den eingehenden Header für Debugging-Zwecke
    console.log('Incoming Authorization Header:', authHeader);

    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        // Kein Token vorhanden
        return sendAuthError(res, 401, 'NO_TOKEN', 'Access token is missing or malformed.');
    }

    try {
        console.log('Attempting to verify token:', token); // Logge den extrahierten Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        console.log('Token decoded successfully:', decoded); // Logge das dekodierte Payload

        if (!decoded || typeof decoded.userId !== 'string') {
            return sendAuthError(res, 403, 'INVALID_TOKEN_PAYLOAD', 'Token payload is invalid or missing userId.');
        }

        // FIX Linter Error: Convert string userId from token to number for comparison
        const userIdAsNumber = parseInt(decoded.userId, 10);
        if (isNaN(userIdAsNumber)) {
             return sendAuthError(res, 403, 'INVALID_USER_ID_FORMAT', 'User ID in token is not a valid number.');
        }

        // Optional: Überprüfen, ob der Benutzer noch in der Datenbank existiert (mit Drizzle)
        const existingUser = await db.select({ id: usersTable.id })
                                      .from(usersTable)
                                      // Use the parsed number for comparison
                                      .where(eq(usersTable.id, userIdAsNumber))
                                      .limit(1);

        if (existingUser.length === 0) {
            return sendAuthError(res, 403, 'USER_NOT_FOUND', 'User associated with this token no longer exists.');
        }

        // Füge Benutzerinformationen und Token zur Anfrage hinzu
        req.user = { id: decoded.userId }; // Keep the original string ID for req.user if needed elsewhere
        req.token = token;

        console.log(`User ${req.user.id} authenticated successfully.`);
        next();

    } catch (error) {
        console.error('Token verification failed:', error); // Logge den Fehler

        if (error instanceof TokenExpiredError) {
            return sendAuthError(res, 401, 'TOKEN_EXPIRED', 'Access token has expired.', `Expired at: ${error.expiredAt}`);
        }
        if (error instanceof JsonWebTokenError) {
            return sendAuthError(res, 403, 'INVALID_TOKEN', 'Access token is invalid.', error.message);
        }
        // Allgemeiner Serverfehler, falls etwas anderes schiefgeht
        return sendAuthError(res, 500, 'INTERNAL_SERVER_ERROR', 'Failed to authenticate token due to an internal error.');
    }
};