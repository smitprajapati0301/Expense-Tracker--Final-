import { useState } from 'react';
import { db } from '../firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const CATEGORIES = {
  'Food':       { emoji: '🍽️', bg: '#e8f5e9', color: '#2e7d32' },
  'Transport':  { emoji: '🚗', bg: '#e3f2fd', color: '#1565c0' },
  'Bills':      { emoji: '📋', bg: '#e8eaf6', color: '#283593' },
  'Shopping':   { emoji: '🛍️', bg: '#fce4ec', color: '#c62828' },
  'Coffee':     { emoji: '☕', bg: '#fff3e0', color: '#e65100' },
  'Health':     { emoji: '💊', bg: '#e0f2f1', color: '#00695c' },
  'Other':      { emoji: '📦', bg: '#f5f5f5', color: '#424242' },
};

const AddExpenseModal = ({ onClose }) => {
  const [amount,   setAmount]  = useState('');
  const [date,     setDate]    = useState(new Date().toISOString().split('T')[0]);
  const [type,     setType]    = useState('');
  const [remarks,  setRemarks] = useState('');
  const [loading,  setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      const data = {
        amount: parseFloat(amount),
        date:   Timestamp.fromDate(new Date(date)),
        type,
        remarks,
        createdAt: Timestamp.now(),
        userId:    user.uid,
        userEmail: user.email,
      };
      await addDoc(collection(db, 'expenses'), data);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="bottom-sheet-overlay"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="bottom-sheet" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Handle bar */}
        <div style={{ width: 40, height: 4, borderRadius: 9999, background: 'var(--outline-light)', margin: '0 auto 20px' }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{
            fontFamily: '"Libre Caslon Text", Georgia, serif',
            fontSize: '1.375rem', fontWeight: 700,
            margin: 0, color: 'var(--on-surface)',
          }}>
            Add Expense
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 9999,
              background: 'var(--surface-high)', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: 'var(--on-surface-variant)',
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Amount display */}
          <div style={{
            background: 'var(--surface-low)', borderRadius: 20,
            padding: '20px 24px', textAlign: 'center',
            border: '1.5px solid var(--outline-light)',
          }}>
            <div style={{
              fontSize: '0.6875rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--on-surface-variant)', marginBottom: 8,
            }}>
              Total Amount
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span style={{
                fontFamily: '"Libre Caslon Text", Georgia, serif',
                fontSize: '2.5rem', fontWeight: 700,
                color: '#0058be', opacity: 0.5,
              }}>$</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                required
                style={{
                  fontFamily: '"Libre Caslon Text", Georgia, serif',
                  fontSize: '2.5rem', fontWeight: 700, color: '#0058be',
                  background: 'transparent', border: 'none', outline: 'none',
                  width: '60%', textAlign: 'center',
                }}
              />
            </div>
          </div>

          {/* Category chips */}
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: 10 }}>
              Select Category
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {Object.entries(CATEGORIES).map(([cat, cs]) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setType(cat)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '8px 14px', borderRadius: 9999,
                    background: type === cat ? cs.bg : 'var(--surface-high)',
                    color: type === cat ? cs.color : 'var(--on-surface-variant)',
                    border: type === cat ? `1.5px solid ${cs.color}` : '1.5px solid transparent',
                    fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer',
                    transition: 'all 0.18s',
                  }}
                >
                  {cs.emoji} {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Merchant field */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: 6 }}>
              Merchant <span style={{ color: 'var(--on-surface-variant)', fontWeight: 400 }}>(optional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🏪</span>
              <input
                className="input-trackify"
                type="text"
                placeholder="Where did you spend?"
                style={{ paddingLeft: 44 }}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: 6 }}>Notes</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: 14, fontSize: 16 }}>📝</span>
              <textarea
                className="textarea-trackify"
                rows={2}
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="Add some context…"
                style={{ paddingLeft: 42 }}
              />
            </div>
          </div>

          {/* Date & Type row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: 6 }}>Date</label>
              <input
                type="date"
                className="input-trackify"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                style={{ height: 46 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: 6 }}>Type</label>
              <div style={{
                height: 46, borderRadius: 14,
                background: 'var(--surface-low)',
                border: '1.5px solid var(--outline-light)',
                display: 'flex', alignItems: 'center',
                paddingLeft: 14, gap: 8,
                fontSize: '0.875rem', fontWeight: 600,
                color: 'var(--on-surface-variant)',
              }}>
                💳 One-time
              </div>
            </div>
          </div>

          {/* Save button */}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: 4, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {loading ? 'Saving…' : 'Save Expense'}
          </button>
        </form>
      </div>
    </>
  );
};

export default AddExpenseModal;
