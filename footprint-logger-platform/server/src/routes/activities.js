const express = require('express')
const Activity = require('../models/Activity')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

router.get('/', authMiddleware, async (req, res) => {
  const activities = await Activity.find({ userId: req.user.id }).sort({ date: -1 })
  res.json(activities)
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, category, co2Value, amount, emission, date } = req.body
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
    return res.status(400).json({ message: 'Activity could not be created', error: error.message })
  }
})

module.exports = router
