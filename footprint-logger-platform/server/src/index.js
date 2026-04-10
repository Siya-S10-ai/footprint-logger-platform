// Core dependencies for HTTP server and database connection
const express = require('express')
const mongoose = require('mongoose')

// Middleware for cross-origin requests and parsing JSON payloads
const cors = require('cors')

// Loads environment variables from a .env file into process.env
require('dotenv').config()

/*
  Route modules for different feature areas:
  - auth: login/register/token handling
  - activities: CRUD for activity entries
  - dashboard: aggregated stats for the UI
  - users: user profile/admin endpoints
*/
const authRoutes = require('./routes/auth')
const activityRoutes = require('./routes/activities')
const dashboardRoutes = require('./routes/dashboard')
const userRoutes = require('./routes/users')

// Create the Express app instance
const app = express()

// Enable CORS for all origins (adjust if you need restrictions)
app.use(cors())

// Parse incoming JSON request bodies
app.use(express.json())

// Simple health check endpoint for uptime monitoring
app.get('/health', (req, res) => {
  res.json({ ok: true })
})

/*
  Mount API route groups with base paths so each module
  handles its own internal endpoints.
*/
app.use('/api/auth', authRoutes)
app.use('/api/activities', activityRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/users', userRoutes)

// Server port and database URI with sensible fallbacks for local dev
const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/footprint-logger'

/*
  Connect to MongoDB first, then start the HTTP server.
  If the DB connection fails, log the error and exit so
  the process doesn’t run in a broken state.
*/
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Mongo connection error:', error.message)
    process.exit(1)
  })
  