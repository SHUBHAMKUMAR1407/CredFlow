const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true, min: 0 },
  currentAmount: { type: Number, default: 0 },
  deadline: { type: Date },
  icon: { type: String, default: '🎯' },
  color: { type: String, default: '#6366f1' },
  isCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
