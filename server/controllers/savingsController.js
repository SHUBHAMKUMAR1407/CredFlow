const SavingsGoal = require('../models/SavingsGoal');

// @route GET /api/savings
exports.getSavingsGoals = async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/savings
exports.createGoal = async (req, res) => {
  try {
    const { name, targetAmount, deadline, icon, color } = req.body;
    const goal = await SavingsGoal.create({
      userId: req.user._id,
      name, targetAmount, deadline, icon, color
    });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/savings/:id
exports.updateGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    Object.assign(goal, req.body);
    if (goal.currentAmount >= goal.targetAmount) goal.isCompleted = true;
    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/savings/:id/contribute
exports.contribute = async (req, res) => {
  try {
    const { amount } = req.body;
    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    goal.currentAmount += amount;
    if (goal.currentAmount >= goal.targetAmount) goal.isCompleted = true;
    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/savings/:id
exports.deleteGoal = async (req, res) => {
  try {
    await SavingsGoal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
