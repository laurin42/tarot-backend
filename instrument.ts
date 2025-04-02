import * as Sentry from '@sentry/node';

// Initialize Sentry - this should be the first import in your app
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 1.0, // In production, you might want to lower this value
});

// Export all required components for Express app usage
export default Sentry;