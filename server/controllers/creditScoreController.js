const CreditScore = require('../models/CreditScore');
const { calculateCreditScore } = require('../services/creditScoreEngine');

// @route GET /api/credit-score
exports.getCreditScore = async (req, res) => {
  try {
    const now = new Date();
    // Always recalculate fresh score
    const result = await calculateCreditScore(req.user._id);
    
    const creditScore = await CreditScore.findOneAndUpdate(
      { userId: req.user._id, month: now.getMonth() + 1, year: now.getFullYear() },
      {
        score: result.score,
        factors: result.factors,
        suggestions: result.suggestions,
        calculatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json(creditScore);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/credit-score/recalculate
exports.recalculateScore = async (req, res) => {
  try {
    const now = new Date();
    const result = await calculateCreditScore(req.user._id);

    const creditScore = await CreditScore.findOneAndUpdate(
      { userId: req.user._id, month: now.getMonth() + 1, year: now.getFullYear() },
      {
        score: result.score,
        factors: result.factors,
        suggestions: result.suggestions,
        calculatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json(creditScore);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/credit-score/history
exports.getScoreHistory = async (req, res) => {
  try {
    const history = await CreditScore.find({ userId: req.user._id })
      .sort({ year: -1, month: -1 })
      .limit(12);

    res.json(history.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
