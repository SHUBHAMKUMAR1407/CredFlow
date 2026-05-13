const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @route GET /api/budgets
exports.getBudgets = async (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    const budgets = await Budget.find({ userId: req.user._id, month, year });

    // Get actual spending for each category
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const spending = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      { $group: { _id: '$category', spent: { $sum: '$amount' } } }
    ]);

    const spendingMap = {};
    spending.forEach(s => { spendingMap[s._id] = s.spent; });

    const result = budgets.map(b => ({
      ...b.toObject(),
      spent: spendingMap[b.category] || 0,
      remaining: b.limit - (spendingMap[b.category] || 0),
      percentage: Math.round(((spendingMap[b.category] || 0) / b.limit) * 100)
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/budgets
exports.createBudget = async (req, res) => {
  try {
    const { category, limit, month, year } = req.body;
    const now = new Date();

    const existing = await Budget.findOne({
      userId: req.user._id,
      category,
      month: month || now.getMonth() + 1,
      year: year || now.getFullYear()
    });

    if (existing) {
      existing.limit = limit;
      await existing.save();
      return res.json(existing);
    }

    const budget = await Budget.create({
      userId: req.user._id,
      category,
      limit,
      month: month || now.getMonth() + 1,
      year: year || now.getFullYear()
    });

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/budgets/:id
exports.deleteBudget = async (req, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
