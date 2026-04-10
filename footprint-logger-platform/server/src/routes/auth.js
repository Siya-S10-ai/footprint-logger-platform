// Express router for auth endpoints, plus dependencies for hashing and JWTs
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// User model for persisting and querying accounts
const User = require('../models/User')

// Create router instance to mount under /api/auth
const router = express.Router()

/*
  Build a signed JWT for the client.
  Payload includes user id and email; secret comes from environment.
*/
const buildToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })

/*
  POST /register
  Creates a new user if the email is not already taken.
  Returns a JWT and a minimal user profile on success.
*/
router.post('/register', async (req, res) => {
  try {
    // Extract the required fields from the request body
    const { name, email, password } = req.body

    // Ensure the email is unique
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' })
    }

    // Hash the password before storing it
    const passwordHash = await bcrypt.hash(password, 10)

    // Create the user and issue an auth token
    const user = await User.create({ name, email, passwordHash })
    const token = buildToken(user)

    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (error) {
    // Handle validation and unexpected errors
    return res.status(400).json({ message: 'Could not register user', error: error.message })
  }
})

/*
  POST /login
  Validates credentials and returns a JWT plus minimal user profile.
*/
router.post('/login', async (req, res) => {
  try {
    // Read login credentials from the request
    const { email, password } = req.body

    // Look up the user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Compare provided password with stored hash
    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Issue a token and send the response
    const token = buildToken(user)
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (error) {
    // Handle validation and unexpected errors
    return res.status(400).json({ message: 'Could not login', error: error.message })
  }
})

// Export the router to be mounted by the main server
module.exports = router
