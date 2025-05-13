# Tarot App Backend

A Node.js/TypeScript backend service for the Tarot App, providing API endpoints for card readings and user management.#

## Commit History & Project Structure
Initially, this project was created as a single repository containing both the backend and frontend. Later, it was split into two separate repositories to improve the separation of concerns between the frontend and backend.

Unfortunately, during this restructuring, some commits were lost. The current commit history reflects the changes made after the split, with the original commit messages and order being preserved as much as possible.

Despite the lost commits, the codebase remains stable and continues to meet the project's initial objectives.

Contributing
Feel free to open issues or pull requests if you'd like to contribute. Please follow the coding standards and ensure clear, descriptive commit messages.

## Features

- RESTful API endpoints
- User authentication and authorization
- Card reading interpretations
- Database integration
- Error handling and logging

## Tech Stack

- Node.js
- TypeScript
- Express.js
- Drizzle ORM
- PostgreSQL
- Firebase Admin SDK

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

3. Start the development server:

```bash
npm run dev
```

## API Documentation

### Authentication

- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration
- POST `/api/auth/logout` - User logout

### Card Readings

- GET `/api/cards/daily` - Get daily card reading
- POST `/api/cards/three-card` - Get three-card spread reading

### User Management

- GET `/api/users/profile` - Get user profile
- PUT `/api/users/profile` - Update user profile

## Project Structure

- `/controllers` - Request handlers
- `/services` - Business logic
- `/routes` - API route definitions
- `/middleware` - Express middleware
- `/db` - Database configuration and models
- `/utils` - Helper functions
- `/types` - TypeScript type definitions
