import './instrument';
import express, { application, Application } from "express";
import cors from "cors";
import dotenvFlow from 'dotenv-flow';
import * as Sentry from '@sentry/node';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/authRoutes';
import tarotRoutes from './routes/tarotRoutes';
import userRoutes from './routes/userRoutes';

// Load environment variables
dotenvFlow.config();

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;

// Middleware
app.use(cors({
  origin: '*',  // In Produktion einschränken!
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/tarot', tarotRoutes);
app.use('/users', userRoutes);

// Sentry request handler must be one of the first middlewares
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  app.use(Sentry.expressErrorHandler());
}

app.use(notFoundHandler);
app.use(errorHandler);


// Sentry test route
app.get('/debug-sentry', (_req, _res) => {
  throw new Error('Test-Fehler für Sentry!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});