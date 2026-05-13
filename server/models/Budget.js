const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true, min: 0 },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

budgetSchema.index({ userId: 1, month: 1, year: 1 });

module.exports = mongoose.model('Budget', budgetSchema);
