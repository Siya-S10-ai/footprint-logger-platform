// Express router plus user model and auth middleware
const express = require('express')
const User = require('../models/User')
const authMiddleware = require('../middleware/auth')

// Create router to mount under /api/users
const router = express.Router()

/*
  PATCH /goal
  Updates the authenticated user's weekly emissions goal.
*/
router.patch('/goal', authMiddleware, async (req, res) => {
  // Read the new goal value from the request body
  const { weeklyGoalKg } = req.body

  // Persist the new goal and return the updated user
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { weeklyGoalKg },
    { new: true, runValidators: true },
  )

  // Respond with the saved goal value
  res.json({ weeklyGoalKg: user.weeklyGoalKg })
})

// Export the router to be mounted in the main server
module.exports = router
