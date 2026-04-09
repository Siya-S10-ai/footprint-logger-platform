const express = require('express')
const Activity = require('../models/Activity')
const User = require('../models/User')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

const tipMap = {
  transport: 'Your transport emissions are highest. Try carpooling or public transport this week.',
  food: 'Food contributes most to your footprint. Swap one high-meat meal for a plant-based option.',
  energy: 'Energy is your highest category. Focus on turning off idle appliances and reducing peak usage.',
}

const startOfWeek = () => {
  const date = new Date()
  const day = date.getDay() || 7
  date.setDate(date.getDate() - day + 1)
  date.setHours(0, 0, 0, 0)
  return date
}

const calculateStreakDays = (activities) => {
  const dates = new Set(
    activities.map((item) => {
      const d = new Date(item.date)
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    }),
  )

  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)

  while (dates.has(`${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`)) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

router.get('/summary', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id)
  const allUserActivities = await Activity.find({ userId: req.user.id })
  const userTotal = allUserActivities.reduce((sum, item) => sum + item.emission, 0)
  const weeklyActivities = allUserActivities.filter((item) => new Date(item.date) >= startOfWeek())
  const weeklyTotal = weeklyActivities.reduce((sum, item) => sum + item.emission, 0)

  const byCategory = allUserActivities.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.emission
    return acc
  }, {})
  const highestCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || 'energy'

  const allActivities = await Activity.find({})
  const userBuckets = {}
  allActivities.forEach((item) => {
    const key = String(item.userId)
    userBuckets[key] = (userBuckets[key] || 0) + item.emission
  })
  const totals = Object.values(userBuckets)
  const communityAverage = totals.length
    ? totals.reduce((sum, item) => sum + item, 0) / totals.length
    : userTotal

  const goal = user.weeklyGoalKg || 25
  const goalProgress = goal > 0 ? (weeklyTotal / goal) * 100 : 0

  res.json({
    communityAverage,
    weeklyTotal,
    streakDays: calculateStreakDays(allUserActivities),
    tip: tipMap[highestCategory],
    goal,
    goalProgress,
  })
})

module.exports = router
