const Transaction = require('../models/Transaction');
const SavingsGoal = require('../models/SavingsGoal');
const User = require('../models/User');

/**
 * AI Credit Score Engine
 * Generates a credit score (300-850) based on weighted financial factors:
 * - Payment Consistency (35%): Regularity and timeliness of expenses
 * - Income Stability (25%): Income variance and growth trend
 * - Savings Ratio (20%): Savings relative to income
 * - Spending Discipline (15%): Spending-to-income ratio, budget adherence
 * - Account Age (5%): Duration of active usage
 */

const WEIGHTS = {
  paymentConsistency: 35,
  incomeStability: 25,
  savingsRatio: 20,
  spendingDiscipline: 15,
  accountAge: 5
};

const calculateCreditScore = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  const transactions = await Transaction.find({
    userId,
    date: { $gte: sixMonthsAgo }
  }).sort({ date: 1 });

  // New user with no transactions — return 0 score
  if (transactions.length === 0) {
    return {
      score: 0,
      factors: {
        paymentConsistency: { score: 0, max: WEIGHTS.paymentConsistency, details: 'No transactions yet' },
        incomeStability: { score: 0, max: WEIGHTS.incomeStability, details: 'No income data yet' },
        savingsRatio: { score: 0, max: WEIGHTS.savingsRatio, details: 'No savings data yet' },
        spendingDiscipline: { score: 0, max: WEIGHTS.spendingDiscipline, details: 'No spending data yet' },
        accountAge: { score: 0, max: WEIGHTS.accountAge, details: 'New account' }
      },
      suggestions: ['Start adding your income and expenses to build your credit score!']
    };
  }

  // Group transactions by month
  const monthlyData = {};
  transactions.forEach(t => {
    const key = `${t.date.getFullYear()}-${t.date.getMonth()}`;
    if (!monthlyData[key]) monthlyData[key] = { income: 0, expense: 0, count: 0 };
    if (t.type === 'income') monthlyData[key].income += t.amount;
    else monthlyData[key].expense += t.amount;
    monthlyData[key].count++;
  });

  const months = Object.values(monthlyData);
  const totalIncome = months.reduce((s, m) => s + m.income, 0);
  const totalExpense = months.reduce((s, m) => s + m.expense, 0);
  const avgIncome = months.length ? totalIncome / months.length : 0;
  const avgExpense = months.length ? totalExpense / months.length : 0;

  // ─── 1. Payment Consistency (35%) ───
  let paymentScore = 0;
  let paymentDetails = '';
  if (months.length >= 3) {
    const expenseMonths = months.filter(m => m.expense > 0).length;
    const consistencyRatio = expenseMonths / months.length;
    paymentScore = Math.min(35, Math.round(consistencyRatio * 30 + (months.length >= 6 ? 5 : 0)));
    paymentDetails = `${expenseMonths}/${months.length} months with regular payments`;
  } else if (months.length > 0) {
    paymentScore = 15;
    paymentDetails = 'Limited payment history';
  } else {
    paymentScore = 5;
    paymentDetails = 'No payment history yet';
  }

  // ─── 2. Income Stability (25%) ───
  let incomeScore = 0;
  let incomeDetails = '';
  if (months.length >= 2) {
    const incomeValues = months.map(m => m.income).filter(v => v > 0);
    if (incomeValues.length >= 2) {
      const mean = incomeValues.reduce((a, b) => a + b, 0) / incomeValues.length;
      const variance = incomeValues.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / incomeValues.length;
      const cv = mean > 0 ? Math.sqrt(variance) / mean : 1; // coefficient of variation
      const stabilityScore = Math.max(0, 1 - cv);
      
      // Check growth trend
      const growthTrend = incomeValues[incomeValues.length - 1] > incomeValues[0] ? 3 : 0;
      incomeScore = Math.min(25, Math.round(stabilityScore * 22 + growthTrend));
      incomeDetails = cv < 0.2 ? 'Very stable income' : cv < 0.5 ? 'Moderately stable income' : 'Variable income';
    } else {
      incomeScore = 10;
      incomeDetails = 'Single income source detected';
    }
  } else {
    incomeScore = 5;
    incomeDetails = 'Insufficient income data';
  }

  // ─── 3. Savings Ratio (20%) ───
  let savingsScore = 0;
  let savingsDetails = '';
  const netSavings = totalIncome - totalExpense;
  const savingsRatio = totalIncome > 0 ? netSavings / totalIncome : 0;

  const savingsGoals = await SavingsGoal.find({ userId });
  const totalGoalProgress = savingsGoals.reduce((s, g) => s + (g.currentAmount / g.targetAmount), 0);
  const goalBonus = Math.min(3, Math.round(totalGoalProgress));

  if (savingsRatio >= 0.3) { savingsScore = 17; savingsDetails = 'Excellent savings rate (30%+)'; }
  else if (savingsRatio >= 0.2) { savingsScore = 14; savingsDetails = 'Good savings rate (20%+)'; }
  else if (savingsRatio >= 0.1) { savingsScore = 10; savingsDetails = 'Moderate savings rate (10%+)'; }
  else if (savingsRatio > 0) { savingsScore = 6; savingsDetails = 'Low savings rate'; }
  else { savingsScore = 2; savingsDetails = 'No savings or negative savings'; }
  savingsScore = Math.min(20, savingsScore + goalBonus);

  // ─── 4. Spending Discipline (15%) ───
  let spendingScore = 0;
  let spendingDetails = '';
  const spendingRatio = avgIncome > 0 ? avgExpense / avgIncome : 1;

  if (spendingRatio <= 0.5) { spendingScore = 15; spendingDetails = 'Excellent spending control'; }
  else if (spendingRatio <= 0.7) { spendingScore = 12; spendingDetails = 'Good spending habits'; }
  else if (spendingRatio <= 0.85) { spendingScore = 8; spendingDetails = 'Moderate spending'; }
  else if (spendingRatio <= 1) { spendingScore = 5; spendingDetails = 'High spending relative to income'; }
  else { spendingScore = 2; spendingDetails = 'Spending exceeds income'; }

  // ─── 5. Account Age (5%) ───
  let ageScore = 0;
  let ageDetails = '';
  const accountAgeDays = (now - user.createdAt) / (1000 * 60 * 60 * 24);

  if (accountAgeDays > 365) { ageScore = 5; ageDetails = '1+ year account'; }
  else if (accountAgeDays > 180) { ageScore = 4; ageDetails = '6+ month account'; }
  else if (accountAgeDays > 90) { ageScore = 3; ageDetails = '3+ month account'; }
  else if (accountAgeDays > 30) { ageScore = 2; ageDetails = '1+ month account'; }
  else { ageScore = 1; ageDetails = 'New account'; }

  // ─── Calculate Final Score (300-850) ───
  const totalPercent = paymentScore + incomeScore + savingsScore + spendingScore + ageScore;
  const finalScore = Math.round(300 + (totalPercent / 100) * 550);
  const clampedScore = Math.min(850, Math.max(300, finalScore));

  // ─── Generate Suggestions ───
  const suggestions = [];
  if (paymentScore < 25) suggestions.push('Maintain regular expense tracking to improve payment consistency.');
  if (incomeScore < 15) suggestions.push('Diversify income sources and maintain steady earnings for better stability.');
  if (savingsRatio < 0.2) suggestions.push('Aim to save at least 20% of your income each month.');
  if (spendingRatio > 0.7) suggestions.push('Reduce discretionary spending to improve financial health.');
  if (savingsGoals.length === 0) suggestions.push('Set savings goals to build emergency funds and long-term wealth.');
  if (suggestions.length === 0) suggestions.push('Great job! Keep maintaining your healthy financial habits.');

  return {
    score: clampedScore,
    factors: {
      paymentConsistency: { score: paymentScore, max: WEIGHTS.paymentConsistency, details: paymentDetails },
      incomeStability: { score: incomeScore, max: WEIGHTS.incomeStability, details: incomeDetails },
      savingsRatio: { score: savingsScore, max: WEIGHTS.savingsRatio, details: savingsDetails },
      spendingDiscipline: { score: spendingScore, max: WEIGHTS.spendingDiscipline, details: spendingDetails },
      accountAge: { score: ageScore, max: WEIGHTS.accountAge, details: ageDetails }
    },
    suggestions
  };
};

module.exports = { calculateCreditScore };
