const mongoose = require('mongoose')

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

module.exports = mongoose.model('Activity', activitySchema)
