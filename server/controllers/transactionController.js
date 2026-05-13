const Transaction = require('../models/Transaction');

// @route GET /api/transactions
exports.getTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate, search, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user._id };

    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('Final Transaction Query:', JSON.stringify(query, null, 2));

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      transactions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/transactions
exports.addTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date, paymentMethod, isRecurring } = req.body;
    if (!type || !amount || !category) {
      return res.status(400).json({ message: 'Type, amount, and category are required' });
    }
    const transaction = await Transaction.create({
      userId: req.user._id,
      type, amount, category, description,
      date: date || new Date(),
      paymentMethod, isRecurring
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/transactions/:id
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    Object.assign(transaction, req.body);
    await transaction.save();
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/transactions/:id
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/transactions/summary
exports.getSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [currentMonth, lastMonth] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: req.user._id, date: { $gte: startOfMonth } } },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Transaction.aggregate([
        { $match: { userId: req.user._id, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ])
    ]);

    const current = { income: 0, expense: 0, incomeCount: 0, expenseCount: 0 };
    const previous = { income: 0, expense: 0 };

    currentMonth.forEach(item => {
      current[item._id] = item.total;
      current[`${item._id}Count`] = item.count;
    });
    lastMonth.forEach(item => {
      previous[item._id] = item.total;
    });

    // Category breakdown
    const categoryBreakdown = await Transaction.aggregate([
      { $match: { userId: req.user._id, type: 'expense', date: { $gte: startOfMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);

    res.json({
      current,
      previous,
      balance: current.income - current.expense,
      savings: current.income - current.expense,
      categoryBreakdown,
      incomeChange: previous.income > 0 ? ((current.income - previous.income) / previous.income * 100).toFixed(1) : 0,
      expenseChange: previous.expense > 0 ? ((current.expense - previous.expense) / previous.expense * 100).toFixed(1) : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
