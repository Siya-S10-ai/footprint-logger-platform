const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const activityRoutes = require('./routes/activities')
const dashboardRoutes = require('./routes/dashboard')
const userRoutes = require('./routes/users')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRoutes)
app.use('/api/activities', activityRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/users', userRoutes)

const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/footprint-logger'

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
