const express = require('express')
const User = require('../models/User')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

router.patch('/goal', authMiddleware, async (req, res) => {
  const { weeklyGoalKg } = req.body
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { weeklyGoalKg },
    { new: true, runValidators: true },
  )
  res.json({ weeklyGoalKg: user.weeklyGoalKg })
})

module.exports = router
