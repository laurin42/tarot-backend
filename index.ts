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

// Konfiguriere CORS
const corsOptions = {
  origin: '*', // Erlaube Anfragen von deinem Frontend
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Erlaubte Methoden
  allowedHeaders: ["Content-Type", "Authorization"], // Erlaube notwendige Header
  credentials: true // Falls du Cookies oder Authentifizierungsheader brauchst
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base route for server health check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'Server is running',
    message: 'Welcome to the Tarot API!',
    timestamp: new Date().toISOString(),
    // Optional: Füge hier eine Liste deiner Haupt-Endpunkte hinzu
    endpoints: {
      auth: '/auth',
      users: '/users',
      tarot: '/tarot'
    }
  });
});

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

export default app; // Export für Tests oder andere Module