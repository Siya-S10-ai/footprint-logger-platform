# Footprint Logger Platform

A carbon-footprint tracking app built with React, Vite, Express, MongoDB, Mongoose, JWT authentication, and a separate native MongoDB driver example layer for learning.

## What This Project Does

- Lets users register and log in.
- Lets users record daily activity logs that contribute to carbon emissions.
- Shows summaries and insights through the existing Mongoose-backed API.
- Includes a parallel MongoClient implementation so you can compare native MongoDB code with Mongoose.

## Tech Stack

- Frontend: React, Vite, Redux Toolkit, JavaScript
- Backend: Node.js, Express
- Database: MongoDB
- ODM: Mongoose
- Native driver: MongoDB Node.js Driver
- Auth: JSON Web Tokens

## Do I Need MongoDB Compass?

No. Compass is optional.

You already have a `mongo-express` container, so that is the easiest GUI for checking data in the browser.

- mongo-express: `http://localhost:8081`
- MongoDB Compass: optional desktop client

## Requirements

- Node.js installed
- npm installed
- MongoDB running locally or in Docker
- Optional: mongo-express running for browser-based database inspection

## Project Layout

- `footprint-logger-platform/` contains the Vite frontend.
- `footprint-logger-platform/server/` contains the Express backend.
- `footprint-logger-platform/server/database/` contains the MongoClient helper.
- `footprint-logger-platform/server/routes/` contains the native MongoDB routes.

## Environment Setup

Create `server/.env` from `server/.env.example` and set both connection strings.

The existing Mongoose app uses `MONGODB_URI`, and the native MongoClient example uses `MONGODB_NATIVE_URI`.

```env
MONGODB_URI=mongodb://127.0.0.1:27017/footprint-logger
MONGODB_NATIVE_URI=mongodb://admin:password@localhost:27017/user-account?authSource=admin
JWT_SECRET=your-secret-key
PORT=5000
```

## How To Run The App

Run the frontend and backend in two separate terminals.

### 1. Start the backend

From the `server` folder:

```bash
cd server
npm install
npm run dev
```

The backend starts from `server/src/index.js` and listens on:

- `http://localhost:5000`

Health check:

- `http://localhost:5000/health`

### 2. Start the frontend

From the repository root:

```bash
npm install
npm run dev
```

The Vite frontend usually runs on:

- `http://localhost:5173`

## Optional Docker Services

If you are using Docker for the database layer, start these containers before running the backend:

- MongoDB container on port `27017`
- mongo-express container on port `8081`

This setup is useful when you want the database isolated in Docker while the app runs locally.

## Available Scripts

### Frontend scripts

Run from the repository root:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

### Backend scripts

Run from the `server` folder:

```bash
npm run dev
npm start
```

Both backend scripts start the same Express server.

## API Endpoints

### Existing Mongoose routes

These power the current application.

- `GET /health`
- `POST /api/auth/...`
- `GET /api/activities`
- `POST /api/activities`
- `GET /api/dashboard/...`
- `PATCH /api/users/goal`

### Native MongoDB routes

These are the educational MongoClient examples.

- `GET /api/native/users`
- `GET /api/native/activity-logs`
- `GET /api/native/activity-logs/:id`
- `POST /api/native/activity-logs`

## Native MongoDB Learning Notes

The native routes demonstrate:

- `MongoClient`
- `find()`
- `findOne()`
- `toArray()`
- `insertOne()`
- `ObjectId`
- database and collection access
- cursor handling

These routes are separate from the Mongoose code so you can compare the two approaches without changing the existing app behavior.

## Example Requests

### Get all native users

```bash
curl http://localhost:5000/api/native/users
```

### Get all native activity logs

```bash
curl http://localhost:5000/api/native/activity-logs
```

### Get one native activity log by id

```bash
curl http://localhost:5000/api/native/activity-logs/<id>
```

### Create a native activity log

```bash
curl -X POST http://localhost:5000/api/native/activity-logs \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "66c123456789012345678901",
    "name": "Car travel",
    "category": "transport",
    "co2Value": 12.5,
    "amount": 10,
    "emission": 125,
    "date": "2026-06-29T10:00:00.000Z"
  }'
```

## Troubleshooting

### Backend does not start

Check that:

- MongoDB is running
- `MONGODB_URI` is correct
- `MONGODB_NATIVE_URI` is correct
- port `5000` is available
- `server/.env` exists

### Frontend cannot reach the backend

Check that:

- the backend is running on `http://localhost:5000`
- the frontend API URL still points to the backend
- CORS is enabled in the server

### No data appears in the database UI

Check the browser console and backend terminal logs.

The native driver routes log:

- when MongoClient connects
- when an existing connection is reused
- when each endpoint is called
- when a document is inserted
- how many documents were returned from a query

## Notes For Learning

This project is useful for comparing:

- Mongoose models and validation
- Native MongoDB driver access
- API design
- React state management
- JWT authentication
- Docker-backed development

## License

This project is for educational use.
