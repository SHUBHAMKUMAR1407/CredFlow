const mongoose = require('mongoose');

const creditScoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true, min: 300, max: 850 },
  factors: {
    paymentConsistency: { score: Number, max: Number, details: String },
    incomeStability: { score: Number, max: Number, details: String },
    savingsRatio: { score: Number, max: Number, details: String },
    spendingDiscipline: { score: Number, max: Number, details: String },
    accountAge: { score: Number, max: Number, details: String }
  },
  suggestions: [String],
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  calculatedAt: { type: Date, default: Date.now }
});

creditScoreSchema.index({ userId: 1, year: -1, month: -1 });

module.exports = mongoose.model('CreditScore', creditScoreSchema);
