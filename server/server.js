const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => res.json({ message: 'CredFlow API is running...' }));

// Routes
const { protect } = require('./middleware/auth');
const { upload } = require('./config/cloudinary');

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/cashflow', require('./routes/cashflowRoutes'));
app.use('/api/credit-score', require('./routes/creditScoreRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/savings', require('./routes/savingsRoutes'));
app.use('/api/smart', require('./routes/smartRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Seed endpoint (for demo — adds sample data)
app.post('/api/seed', async (req, res) => {
  try {
    const User = require('./models/User');
    const Transaction = require('./models/Transaction');
    const SavingsGoal = require('./models/SavingsGoal');
    const Budget = require('./models/Budget');
    const CreditScore = require('./models/CreditScore');

    // Check if demo user exists
    let user = await User.findOne({ email: 'demo@credflow.com' });
    if (!user) {
      user = await User.create({
        name: 'Rahul Sharma',
        email: 'demo@credflow.com',
        password: 'demo123',
        role: 'admin',
        isVerified: true,
        monthlyBudget: 50000
      });
    }

    // Clear existing data for this user
    await Transaction.deleteMany({ userId: user._id });
    await SavingsGoal.deleteMany({ userId: user._id });
    await Budget.deleteMany({ userId: user._id });
    await CreditScore.deleteMany({ userId: user._id });

    const now = new Date();
    const transactions = [];
    const categories = {
      income: ['Salary', 'Freelance', 'Investment', 'Business', 'Bonus'],
      expense: ['Food', 'Rent', 'Transport', 'Health', 'Entertainment', 'Education', 'Shopping', 'Utilities', 'Insurance']
    };

    // Generate 6 months of transactions
    for (let m = 5; m >= 0; m--) {
      const month = new Date(now.getFullYear(), now.getMonth() - m, 1);

      // Income entries
      transactions.push({
        userId: user._id, type: 'income', amount: 65000 + Math.floor(Math.random() * 10000),
        category: 'Salary', description: 'Monthly salary', date: new Date(month.getFullYear(), month.getMonth(), 1),
        paymentMethod: 'bank'
      });
      if (Math.random() > 0.5) {
        transactions.push({
          userId: user._id, type: 'income', amount: 8000 + Math.floor(Math.random() * 12000),
          category: 'Freelance', description: 'Freelance project', date: new Date(month.getFullYear(), month.getMonth(), 15),
          paymentMethod: 'upi'
        });
      }
      if (Math.random() > 0.7) {
        transactions.push({
          userId: user._id, type: 'income', amount: 3000 + Math.floor(Math.random() * 5000),
          category: 'Investment', description: 'Dividend income', date: new Date(month.getFullYear(), month.getMonth(), 20),
          paymentMethod: 'bank'
        });
      }

      // Expense entries
      const expenseData = [
        { cat: 'Rent', min: 15000, max: 15000, desc: 'Monthly rent', day: 5 },
        { cat: 'Food', min: 4000, max: 8000, desc: 'Groceries & dining', day: 3 },
        { cat: 'Food', min: 2000, max: 5000, desc: 'Restaurant & delivery', day: 18 },
        { cat: 'Transport', min: 1500, max: 4000, desc: 'Fuel & commute', day: 10 },
        { cat: 'Utilities', min: 2000, max: 4000, desc: 'Electricity & water', day: 7 },
        { cat: 'Entertainment', min: 1000, max: 4000, desc: 'Movies & subscriptions', day: 12 },
        { cat: 'Shopping', min: 2000, max: 8000, desc: 'Online shopping', day: 22 },
        { cat: 'Health', min: 500, max: 3000, desc: 'Medicine & checkup', day: 16 },
        { cat: 'Insurance', min: 2000, max: 2000, desc: 'Insurance premium', day: 1 },
      ];

      expenseData.forEach(e => {
        if (Math.random() > 0.15) {
          transactions.push({
            userId: user._id, type: 'expense',
            amount: e.min + Math.floor(Math.random() * (e.max - e.min)),
            category: e.cat, description: e.desc,
            date: new Date(month.getFullYear(), month.getMonth(), e.day),
            paymentMethod: ['cash', 'card', 'upi'][Math.floor(Math.random() * 3)]
          });
        }
      });
    }

    await Transaction.insertMany(transactions);

    // Savings Goals
    await SavingsGoal.insertMany([
      { userId: user._id, name: 'Emergency Fund', targetAmount: 300000, currentAmount: 185000, icon: '🛡️', color: '#10b981', deadline: new Date(now.getFullYear(), now.getMonth() + 6, 1) },
      { userId: user._id, name: 'New Laptop', targetAmount: 80000, currentAmount: 52000, icon: '💻', color: '#6366f1', deadline: new Date(now.getFullYear(), now.getMonth() + 2, 1) },
      { userId: user._id, name: 'Vacation', targetAmount: 150000, currentAmount: 45000, icon: '✈️', color: '#f59e0b', deadline: new Date(now.getFullYear() + 1, 0, 1) },
      { userId: user._id, name: 'Investment Portfolio', targetAmount: 500000, currentAmount: 120000, icon: '📈', color: '#8b5cf6' }
    ]);

    // Budgets for current month
    const budgetEntries = [
      { category: 'Food', limit: 12000 },
      { category: 'Transport', limit: 5000 },
      { category: 'Entertainment', limit: 4000 },
      { category: 'Shopping', limit: 8000 },
      { category: 'Utilities', limit: 5000 },
      { category: 'Health', limit: 3000 }
    ];
    await Budget.insertMany(budgetEntries.map(b => ({
      userId: user._id, ...b, month: now.getMonth() + 1, year: now.getFullYear()
    })));

    // Credit Score history
    const scoreHistory = [];
    for (let m = 5; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
      scoreHistory.push({
        userId: user._id,
        score: 620 + m * 15 + Math.floor(Math.random() * 30),
        factors: {
          paymentConsistency: { score: 22 + m * 2, max: 35, details: 'Regular payments' },
          incomeStability: { score: 16 + m, max: 25, details: 'Stable income' },
          savingsRatio: { score: 12 + m, max: 20, details: 'Good savings' },
          spendingDiscipline: { score: 9 + m, max: 15, details: 'Controlled spending' },
          accountAge: { score: 3, max: 5, details: '3+ month account' }
        },
        suggestions: ['Keep saving consistently'],
        month: d.getMonth() + 1,
        year: d.getFullYear()
      });
    }
    await CreditScore.insertMany(scoreHistory);

    res.json({
      message: 'Demo data seeded successfully!',
      credentials: { email: 'demo@credflow.com', password: 'demo123' }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 CredFlow Server running on port ${PORT}`);
  });
});
