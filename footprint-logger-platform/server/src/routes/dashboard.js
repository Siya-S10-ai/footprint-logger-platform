// Express router and data models for dashboard stats
const express = require('express')
const Activity = require('../models/Activity')
const User = require('../models/User')

// Middleware that ensures the request is authenticated
const authMiddleware = require('../middleware/auth')

// Create an isolated router for dashboard endpoints
const router = express.Router()

/*
  Map of categories to user-facing tips.
  Used to provide a tailored suggestion based on the highest-emission category.
*/
const tipMap = {
  transport: 'Your transport emissions are highest. Try carpooling or public transport this week.',
  food: 'Food contributes most to your footprint. Swap one high-meat meal for a plant-based option.',
  energy: 'Energy is your highest category. Focus on turning off idle appliances and reducing peak usage.',
}

/*
  Calculate the start of the current week (Monday at 00:00:00).
  Used to filter activities for weekly stats.
*/
const startOfWeek = () => {
  const date = new Date()
  const day = date.getDay() || 7
  date.setDate(date.getDate() - day + 1)
  date.setHours(0, 0, 0, 0)
  return date
}

/*
  Compute a consecutive-day streak by walking backwards from today.
  The streak counts distinct activity dates, not number of activities.
*/
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

/*
  GET /summary
  Returns aggregated dashboard data for the current user, including:
  - total and weekly emissions
  - streak in days
  - community average
  - personalized tip
  - goal and progress
*/
router.get('/summary', authMiddleware, async (req, res) => {
  // Fetch current user and their activities
  const user = await User.findById(req.user.id)
  const allUserActivities = await Activity.find({ userId: req.user.id })

  // Total emissions for all time
  const userTotal = allUserActivities.reduce((sum, item) => sum + item.emission, 0)

  // Filter and total for this week
  const weeklyActivities = allUserActivities.filter((item) => new Date(item.date) >= startOfWeek())
  const weeklyTotal = weeklyActivities.reduce((sum, item) => sum + item.emission, 0)

  // Aggregate emissions by category to find the highest contributor
  const byCategory = allUserActivities.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.emission
    return acc
  }, {})
  const highestCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || 'energy'

  // Build a per-user total to compute community average
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

  // Weekly goal and percentage completion
  const goal = user.weeklyGoalKg || 25
  const goalProgress = goal > 0 ? (weeklyTotal / goal) * 100 : 0

  // Send the computed summary back to the client
  res.json({
    communityAverage,
    weeklyTotal,
    streakDays: calculateStreakDays(allUserActivities),
    tip: tipMap[highestCategory],
    goal,
    goalProgress,
  })
})

// Export router to be mounted by the main server
module.exports = router
