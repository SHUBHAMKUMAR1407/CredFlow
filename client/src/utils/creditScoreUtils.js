export const CATEGORIES = {
  income: [
    { value: 'Salary', label: 'Salary', icon: '💼', color: '#10b981' },
    { value: 'Freelance', label: 'Freelance', icon: '💻', color: '#6366f1' },
    { value: 'Investment', label: 'Investment', icon: '📈', color: '#8b5cf6' },
    { value: 'Business', label: 'Business', icon: '🏢', color: '#3b82f6' },
    { value: 'Bonus', label: 'Bonus', icon: '🎁', color: '#f59e0b' },
    { value: 'Other', label: 'Other', icon: '💰', color: '#94a3b8' },
  ],
  expense: [
    { value: 'Food', label: 'Food', icon: '🍔', color: '#f97316' },
    { value: 'Rent', label: 'Rent', icon: '🏠', color: '#6366f1' },
    { value: 'Transport', label: 'Transport', icon: '🚗', color: '#3b82f6' },
    { value: 'Health', label: 'Health', icon: '💊', color: '#ef4444' },
    { value: 'Entertainment', label: 'Entertainment', icon: '🎮', color: '#a855f7' },
    { value: 'Education', label: 'Education', icon: '📚', color: '#14b8a6' },
    { value: 'Shopping', label: 'Shopping', icon: '🛍️', color: '#ec4899' },
    { value: 'Utilities', label: 'Utilities', icon: '⚡', color: '#f59e0b' },
    { value: 'Insurance', label: 'Insurance', icon: '🛡️', color: '#64748b' },
    { value: 'Other', label: 'Other', icon: '📦', color: '#94a3b8' },
  ]
};

export const getCategoryInfo = (category) => {
  const all = [...CATEGORIES.income, ...CATEGORIES.expense];
  return all.find(c => c.value === category) || { value: category, label: category, icon: '📦', color: '#94a3b8' };
};

export const getScoreCategory = (score) => {
  if (score >= 750) return { label: 'Excellent', color: '#10b981' };
  if (score >= 650) return { label: 'Good', color: '#3b82f6' };
  if (score >= 550) return { label: 'Fair', color: '#f59e0b' };
  return { label: 'Poor', color: '#ef4444' };
};
