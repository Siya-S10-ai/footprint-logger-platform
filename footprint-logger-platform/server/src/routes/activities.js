// Express router, Activity model, and auth middleware
const express = require('express')
const Activity = require('../models/Activity')
const authMiddleware = require('../middleware/auth')

// Create a router for activity endpoints under /api/activities
const router = express.Router()

/*
  GET /
  Returns all activities for the authenticated user, newest first.
*/
router.get('/', authMiddleware, async (req, res) => {
  const activities = await Activity.find({ userId: req.user.id }).sort({ date: -1 })
  res.json(activities)
})

/*
  POST /
  Creates a new activity entry for the authenticated user.
*/
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Extract activity fields from the request body
    const { name, category, co2Value, amount, emission, date } = req.body

    // Persist the activity tied to the current user
    const activity = await Activity.create({
      userId: req.user.id,
      name,
      category,
      co2Value,
      amount,
      emission,
      date,
    })

    return res.status(201).json(activity)
  } catch (error) {
    // Handle validation and unexpected errors
    return res.status(400).json({ message: 'Activity could not be created', error: error.message })
  }
})

// Export router to be mounted by the server
module.exports = router
