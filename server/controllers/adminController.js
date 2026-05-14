const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ActivityLog = require('../models/ActivityLog');
const CreditScore = require('../models/CreditScore');

// @route GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalTransactions, avgScore] = await Promise.all([
      User.countDocuments(),
      Transaction.countDocuments(),
      CreditScore.aggregate([{ $group: { _id: null, avg: { $avg: '$score' } } }])
    ]);

    const recentUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(5);

    res.json({
      totalUsers,
      totalTransactions,
      avgCreditScore: avgScore[0]?.avg ? Math.round(avgScore[0].avg) : 0,
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/admin/activity
exports.getActivity = async (req, res) => {
  try {
    const activities = await ActivityLog.find()
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/admin/users/:id/role
exports.updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = req.body.role;
    await user.save();
    res.json({ message: 'Role updated', user: { _id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Optionally delete user data here (transactions, budgets, etc.) or rely on mongoose hooks/DB cascading.
    await Transaction.deleteMany({ userId: user._id });
    await CreditScore.deleteMany({ userId: user._id });
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
