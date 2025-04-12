import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  Timestamp,
  updateDoc,
  addDoc,
} from 'firebase/firestore';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { ThemeToggle } from './ThemeToggle';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('');
  const [remarks, setRemarks] = useState('');
  const [user, setUser] = useState(null);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const q = query(
          collection(db, 'expenses'),
          where('userId', '==', currentUser.uid)
        );
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setExpenses(data);
          },
          (error) => {
            console.error('Snapshot error:', error.message);
          }
        );
        return () => unsubscribe();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const expenseData = {
      amount: parseFloat(amount),
      date: Timestamp.fromDate(new Date(date)),
      type,
      remarks,
      createdAt: Timestamp.now(),
      userId: user.uid,
      userEmail: user.email,
    };

    try {
      if (editId) {
        await updateDoc(doc(db, 'expenses', editId), expenseData);
        setMessage('✅ Expense updated!');
        setEditId(null);
      } else {
        await addDoc(collection(db, 'expenses'), expenseData);
        setMessage('✅ Expense added!');
      }

      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setType('');
      setRemarks('');
      setShowForm(false);
    } catch (err) {
      console.error('Error:', err.message);
      setMessage(`❌ ${err.message}`);
    }
  };

  const handleEdit = (expense) => {
    setAmount(expense.amount);
    setDate(expense.date.toDate().toISOString().split('T')[0]);
    setType(expense.type);
    setRemarks(expense.remarks);
    setEditId(expense.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'expenses', id));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
      <nav className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 shadow">
        <h1 className="text-2xl font-bold">Trackify</h1>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <button
            className="bg-black text-white rounded-full p-2 hover:bg-gray-700"
            onClick={() => setShowForm(!showForm)}
          >
            <FaPlus />
          </button>
        </div>
      </nav>

      {message && (
        <div className="text-center py-2 text-sm font-medium text-green-600">
          {message}
        </div>
      )}

      {/* Hover modal form */}
      {showForm && (
        <div className="max-w-md mx-auto p-4 bg-white dark:bg-gray-800 rounded shadow my-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Type</option>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Shopping">Shopping</option>
              <option value="Bills">Bills</option>
              <option value="Other">Other</option>
            </select>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Remarks"
              className="w-full p-2 border rounded"
            ></textarea>
            <button className="w-full bg-black text-white p-2 rounded">
              {editId ? 'Update Expense' : 'Add Expense'}
            </button>
          </form>
        </div>
      )}

      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-xl font-semibold mb-4">Your Expenses</h2>
        {expenses.length === 0 ? (
          <p className="text-gray-500">No expenses added yet.</p>
        ) : (
          <ul className="space-y-3">
            {expenses.map((expense) => (
              <li
                key={expense.id}
                className="bg-white dark:bg-gray-700 p-3 rounded shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-bold">₹{expense.amount.toFixed(2)}</p>
                  <p className="text-sm">
                    {expense.type} |{' '}
                    {expense.date.toDate().toLocaleDateString()}
                  </p>
                  {expense.remarks && (
                    <p className="text-xs text-gray-500">{expense.remarks}</p>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => handleEdit(expense)} className="text-blue-500">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(expense.id)} className="text-red-500">
                    <FaTrash />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
