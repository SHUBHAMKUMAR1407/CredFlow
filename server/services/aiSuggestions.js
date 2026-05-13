const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');

/**
 * AI Financial Suggestions Engine
 * Analyzes user financial data and generates intelligent suggestions
 */
const generateSuggestions = async (userId) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Current month transactions
  const currentTransactions = await Transaction.find({
    userId,
    date: { $gte: startOfMonth }
  });

  // Last month transactions
  const lastMonthTransactions = await Transaction.find({
    userId,
    date: { $gte: lastMonth, $lte: endOfLastMonth }
  });

  const currentIncome = currentTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const currentExpense = currentTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const lastIncome = lastMonthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const lastExpense = lastMonthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // Category breakdown for current month
  const categorySpending = {};
  currentTransactions.filter(t => t.type === 'expense').forEach(t => {
    categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
  });

  const suggestions = [];

  // ─── Spending Analysis ───
  const surplus = currentIncome - currentExpense;
  if (surplus > 0) {
    suggestions.push({
      type: 'savings',
      icon: '💰',
      title: 'Surplus Detected',
      message: `You have a ₹${surplus.toLocaleString('en-IN')} surplus this month. Consider moving it to savings!`,
      priority: 'medium'
    });
  }

  if (currentExpense > currentIncome * 0.9 && currentIncome > 0) {
    suggestions.push({
      type: 'warning',
      icon: '⚠️',
      title: 'High Spending Alert',
      message: `Your spending is ${Math.round((currentExpense / currentIncome) * 100)}% of your income. Try to keep it below 70%.`,
      priority: 'high'
    });
  }

  // ─── Month-over-Month Comparison ───
  if (lastExpense > 0 && currentExpense > lastExpense * 1.2) {
    const increase = Math.round(((currentExpense - lastExpense) / lastExpense) * 100);
    suggestions.push({
      type: 'spending',
      icon: '📈',
      title: 'Spending Increase',
      message: `Your spending is up ${increase}% compared to last month. Review your expenses.`,
      priority: 'high'
    });
  }

  if (lastIncome > 0 && currentIncome > lastIncome) {
    suggestions.push({
      type: 'income',
      icon: '🎉',
      title: 'Income Growth',
      message: `Great news! Your income increased by ₹${(currentIncome - lastIncome).toLocaleString('en-IN')} this month.`,
      priority: 'low'
    });
  }

  // ─── Category-Specific Analysis ───
  const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0];
  if (topCategory && currentIncome > 0) {
    const pct = Math.round((topCategory[1] / currentIncome) * 100);
    if (pct > 30) {
      suggestions.push({
        type: 'spending',
        icon: '🔍',
        title: `High ${topCategory[0]} Spending`,
        message: `${topCategory[0]} accounts for ${pct}% of your income (₹${topCategory[1].toLocaleString('en-IN')}). Consider optimizing.`,
        priority: 'medium'
      });
    }
  }

  // ─── Savings Goals ───
  const goals = await SavingsGoal.find({ userId, isCompleted: false });
  goals.forEach(goal => {
    const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
    if (progress >= 90) {
      suggestions.push({
        type: 'savings',
        icon: '🏆',
        title: `Almost There: ${goal.name}`,
        message: `You're ${Math.round(progress)}% towards your "${goal.name}" goal! Just ₹${(goal.targetAmount - goal.currentAmount).toLocaleString('en-IN')} more to go!`,
        priority: 'low'
      });
    }
    if (goal.deadline) {
      const daysLeft = Math.ceil((new Date(goal.deadline) - now) / (1000 * 60 * 60 * 24));
      const remaining = goal.targetAmount - goal.currentAmount;
      if (daysLeft > 0 && daysLeft < 30 && remaining > 0) {
        suggestions.push({
          type: 'warning',
          icon: '⏰',
          title: `Deadline Approaching: ${goal.name}`,
          message: `${daysLeft} days left to save ₹${remaining.toLocaleString('en-IN')} for "${goal.name}".`,
          priority: 'high'
        });
      }
    }
  });

  // ─── Budget Alerts ───
  const budgets = await Budget.find({
    userId,
    month: now.getMonth() + 1,
    year: now.getFullYear()
  });

  budgets.forEach(budget => {
    const spent = categorySpending[budget.category] || 0;
    const pct = (spent / budget.limit) * 100;
    if (pct >= 100) {
      suggestions.push({
        type: 'alert',
        icon: '🚨',
        title: `Budget Exceeded: ${budget.category}`,
        message: `You've spent ₹${spent.toLocaleString('en-IN')} on ${budget.category}, exceeding your ₹${budget.limit.toLocaleString('en-IN')} budget by ₹${(spent - budget.limit).toLocaleString('en-IN')}.`,
        priority: 'high'
      });
    } else if (pct >= 80) {
      suggestions.push({
        type: 'warning',
        icon: '⚡',
        title: `Budget Warning: ${budget.category}`,
        message: `You've used ${Math.round(pct)}% of your ${budget.category} budget. ₹${(budget.limit - spent).toLocaleString('en-IN')} remaining.`,
        priority: 'medium'
      });
    }
  });

  // ─── General Tips ───
  if (suggestions.length === 0) {
    suggestions.push({
      type: 'tip',
      icon: '✨',
      title: 'You\'re Doing Great!',
      message: 'Your finances look healthy. Keep tracking your expenses and saving consistently.',
      priority: 'low'
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return suggestions;
};

module.exports = { generateSuggestions };
