// Mongoose ODM for defining the Activity schema and model
const mongoose = require('mongoose')

/*
  Activity schema:
  - userId links to the owning user
  - category is restricted to known emission types
  - co2Value/amount/emission capture the footprint calculation
  - date is the time of the activity
  - timestamps track create/update times
*/
const activitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['transport', 'food', 'energy'],
      required: true,
    },
    co2Value: { type: Number, required: true },
    amount: { type: Number, required: true },
    emission: { type: Number, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true },
)

// Export the compiled model for use in routes and services
module.exports = mongoose.model('Activity', activitySchema)
