// server/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Custom error handler with Sentry integration
export const sentryErrorHandler = (
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  Sentry.captureException(err);
  next(err);
};

// Middleware für das Abfangen nicht gefundener Routen
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(`Route nicht gefunden - ${req.originalUrl}`, 404);
  next(error);
};

// Globaler Error-Handler
export const errorHandler = (
  err: AppError, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.isOperational = err.isOperational || false;
  
  // Log error aber entferne sensible Daten
  const sanitizedReq = {
    method: req.method,
    path: req.path,
    query: req.query,
    // Don't log bodies that might contain passwords or tokens
    body: req.method === 'POST' || req.method === 'PUT' 
      ? '[REDACTED]' 
      : req.body,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? '[REDACTED]' : undefined,
      cookie: req.headers.cookie ? '[REDACTED]' : undefined
    }
  };
  
  console.error(`[ERROR] ${err.message}`, {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
    },
    request: sanitizedReq
  });
  
  // Im Produktionsmodus keine detaillierten Fehlermeldungen für Server-Fehler
  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    return res.status(500).json({
      status: 'error',
      message: 'Etwas ist schiefgelaufen.'
    });
  }
  
  res.status(err.statusCode).json({
    status: err.statusCode < 500 ? 'fail' : 'error',
    message: err.message
  });
};