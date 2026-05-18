import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTransactions, addTransaction, deleteTransaction, updateTransaction } from '../services/api';
import { CATEGORIES, getCategoryInfo } from '../utils/creditScoreUtils';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/dateHelpers';
import { Plus, Trash2, Search, Filter, Edit2, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import CustomSelect from '../components/common/CustomSelect';

export default function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({ type: 'expense', amount: '', category: CATEGORIES.expense[0].value, description: '', date: new Date().toISOString().split('T')[0], paymentMethod: 'upi' });
  const [filters, setFilters] = useState({ type: '', category: '', search: initialSearch });

  const fetchTransactions = async () => {
    try {
      const { data } = await getTransactions({ limit: 100, ...filters });
      setTransactions(data.transactions);
    } catch (err) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const s = searchParams.get('search') || '';
    setFilters(f => ({ ...f, search: s }));
  }, [searchParams]);

  useEffect(() => { fetchTransactions(); }, [filters]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateTransaction(editId, { ...formData, amount: Number(formData.amount) });
        toast.success('Transaction updated');
      } else {
        await addTransaction({ ...formData, amount: Number(formData.amount) });
        toast.success('Transaction added');
      }
      setShowModal(false);
      setIsEditing(false);
      setEditId(null);
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleEdit = (tx) => {
    setFormData({
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      description: tx.description || '',
      date: tx.date.split('T')[0],
      paymentMethod: tx.paymentMethod
    });
    setEditId(tx._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTransaction(deleteId);
      toast.success('Deleted successfully');
      fetchTransactions();
    } catch (err) {
      toast.error('Failed to delete transaction');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <>
    <div className="animate-fade">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1>Transactions</h1>
          <p>Manage your income and expenses.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      <div className="glass-card" style={{ padding: '20px' }}>
        <div className="filter-bar">
          <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', flex: 1 }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', marginLeft: 8, width: '100%' }}
              placeholder="Search..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <CustomSelect 
              value={filters.type} 
              onChange={val => setFilters({ ...filters, type: val })}
              options={[
                { value: '', label: 'All Types' },
                { value: 'income', label: 'Income', icon: <TrendingUp size={14} />, color: 'var(--success)' },
                { value: 'expense', label: 'Expense', icon: <TrendingDown size={14} />, color: 'var(--danger)' }
              ]}
            />

            <CustomSelect 
              value={filters.category} 
              onChange={val => setFilters({ ...filters, category: val })}
              placeholder="All Categories"
              options={[
                { value: '', label: 'All Categories' },
                ...[...CATEGORIES.income, ...CATEGORIES.expense].map(c => ({
                  value: c.value,
                  label: c.label,
                  icon: c.icon,
                  color: getCategoryInfo(c.value).color
                }))
              ]}
            />
          </div>
        </div>

        {loading ? <div className="loader-container"><div className="spinner" /></div> : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 && (
                  <tr><td colSpan="6" className="empty-state">No transactions found.</td></tr>
                )}
                {transactions.map(tx => {
                  const cat = getCategoryInfo(tx.category);
                  return (
                    <tr key={tx._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {cat.label}
                        </div>
                      </td>
                      <td>{tx.description || '-'}</td>
                      <td>{formatDate(tx.date)}</td>
                      <td style={{ textTransform: 'capitalize' }}>{tx.paymentMethod}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button className="btn-icon" onClick={() => handleEdit(tx)} title="Edit Transaction">
                            <Edit2 size={14} />
                          </button>
                          <button className="btn-icon btn-delete" onClick={() => setDeleteId(tx._id)} title="Delete Transaction">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale">
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Transaction' : 'Add Transaction'}</h2>
              <button className="modal-close" onClick={() => { setShowModal(false); setIsEditing(false); setEditId(null); }}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="grid-2">
                <div className="input-group">
                  <label>Type</label>
                  <CustomSelect 
                    value={formData.type} 
                    onChange={val => setFormData({ ...formData, type: val, category: CATEGORIES[val][0].value })}
                    options={[
                      { value: 'expense', label: 'Expense', icon: <TrendingDown size={14} />, color: 'var(--danger)' },
                      { value: 'income', label: 'Income', icon: <TrendingUp size={14} />, color: 'var(--success)' }
                    ]}
                  />
                </div>
                <div className="input-group">
                  <label>Amount (₹)</label>
                  <input className="form-input" type="number" min="1" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
                </div>
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label>Category</label>
                  <CustomSelect 
                    value={formData.category} 
                    onChange={val => setFormData({ ...formData, category: val })}
                    options={CATEGORIES[formData.type].map(c => ({
                      value: c.value,
                      label: c.label,
                      icon: c.icon,
                      color: getCategoryInfo(c.value).color
                    }))}
                  />
                </div>
                <div className="input-group">
                  <label>Date</label>
                  <input className="form-input" type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                </div>
              </div>
              <div className="input-group">
                <label>Description (Optional)</label>
                <input className="form-input" type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="e.g., Groceries at BigBazaar" />
              </div>
              <div className="input-group">
                <label>Payment Method</label>
                <CustomSelect 
                  value={formData.paymentMethod} 
                  onChange={val => setFormData({ ...formData, paymentMethod: val })}
                  options={[
                    { value: 'upi', label: 'UPI' },
                    { value: 'card', label: 'Card' },
                    { value: 'cash', label: 'Cash' },
                    { value: 'bank', label: 'Bank Transfer' }
                  ]}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale" style={{ maxWidth: 400, textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Trash2 size={32} />
              </div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Delete Transaction?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                This action cannot be undone. Are you sure you want to permanently delete this transaction?
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyItems: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button className="btn" style={{ background: 'var(--danger)', color: 'white', flex: 1, justifyContent: 'center', border: 'none' }} onClick={confirmDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
