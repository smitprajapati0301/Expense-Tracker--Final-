import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // Adjust if needed
import {
  collection,
  addDoc,
  Timestamp,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const AddExpense = () => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [expenses, setExpenses] = useState([]);

  const auth = getAuth();
  const user = auth.currentUser;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!user) {
        throw new Error('User not logged in');
      }

      const expenseData = {
        amount: parseFloat(amount),
        date: Timestamp.fromDate(new Date(date)),
        type,
        remarks,
        createdAt: Timestamp.now(),
        userId: user.uid,
        userEmail: user.email,
      };

      await addDoc(collection(db, 'expenses'), expenseData);

      // Clear form
      setAmount('');
      setType('');
      setRemarks('');
      setDate(new Date().toISOString().split('T')[0]);
      setMessage('✅ Expense successfully added!');
    } catch (error) {
      console.error('❌ Error adding expense:', error.message);
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const expenseList = [];
      querySnapshot.forEach((doc) => {
        expenseList.push({ id: doc.id, ...doc.data() });
      });
      setExpenses(expenseList);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Add New Expense</h2>

      {message && (
        <div
          className={`mb-4 p-2 rounded text-sm font-medium ${
            message.startsWith('✅')
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Amount *</label>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Date *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Expense Type *</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select expense type</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Bills">Bills</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add any notes about this expense"
            className="w-full border p-2 rounded"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white py-2 px-4 rounded w-full"
        >
          {loading ? 'Adding...' : 'Add Expense'}
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Your Expenses</h3>
        {expenses.length === 0 ? (
          <p className="text-gray-500">No expenses added yet.</p>
        ) : (
          <ul className="space-y-2">
            {expenses.map((expense) => (
              <li
                key={expense.id}
                className="border rounded p-3 bg-gray-50"
              >
                <div><strong>Amount:</strong> ₹{expense.amount}</div>
                <div><strong>Type:</strong> {expense.type}</div>
                <div><strong>Date:</strong> {expense.date.toDate().toDateString()}</div>
                <div><strong>Remarks:</strong> {expense.remarks || '-'}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AddExpense;
