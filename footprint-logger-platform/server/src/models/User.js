// Mongoose ODM for defining the User schema and model
const mongoose = require('mongoose')

/*
  User schema:
  - name/email/passwordHash are required for auth
  - weeklyGoalKg stores the user's weekly emissions goal
  - timestamps automatically track createdAt/updatedAt
*/
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    weeklyGoalKg: { type: Number, default: 25 },
  },
  { timestamps: true },
)

// Export the compiled model for use in routes and services
module.exports = mongoose.model('User', userSchema)
