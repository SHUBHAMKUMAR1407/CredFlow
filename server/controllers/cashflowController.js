const Transaction = require('../models/Transaction');

// @route GET /api/cashflow/monthly
exports.getMonthlyCashFlow = async (req, res) => {
  try {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const data = await Transaction.aggregate([
      { $match: { userId: req.user._id, date: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Build 12-month structure
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthData = {
        month: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        monthNum: d.getMonth() + 1,
        income: 0,
        expense: 0
      };
      data.forEach(item => {
        if (item._id.year === d.getFullYear() && item._id.month === d.getMonth() + 1) {
          monthData[item._id.type] = item.total;
        }
      });
      monthData.net = monthData.income - monthData.expense;
      months.push(monthData);
    }

    res.json(months);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/cashflow/trends
exports.getCashFlowTrends = async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [incomeByCategory, expenseByCategory] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: req.user._id, type: 'income', date: { $gte: sixMonthsAgo } } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]),
      Transaction.aggregate([
        { $match: { userId: req.user._id, type: 'expense', date: { $gte: sixMonthsAgo } } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ])
    ]);

    res.json({ incomeByCategory, expenseByCategory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
