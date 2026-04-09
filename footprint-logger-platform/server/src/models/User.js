const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    weeklyGoalKg: { type: Number, default: 25 },
  },
  { timestamps: true },
)

module.exports = mongoose.model('User', userSchema)
