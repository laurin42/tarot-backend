import { Request, Response, NextFunction } from "express";

// Flexiblerer AsyncHandler mit generischem Typen für verschiedene Request-Arten
export const asyncHandler = <P = any, ResBody = any, ReqBody = any>(
  fn: (req: Request<P, ResBody, ReqBody>, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request<P, ResBody, ReqBody>, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Unterstriche für unbenutzte Parameter hinzufügen
export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
};

export const sentryErrorHandler = (err: Error, _req: Request, _res: Response, next: NextFunction) => {
  // Bereits in Sentry implementiert, hier nur Weiterleitung
  next(err);
};

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err);
  
  // Prüfen, ob es ein AppError ist
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  
  // Standard-Fehler
  res.status(500).json({ 
    error: "Internal Server Error",
    message: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
};