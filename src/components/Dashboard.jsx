import React, { useState, useEffect } from 'react';
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
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('');
  const [remarks, setRemarks] = useState('');
  const [user, setUser] = useState(null);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');

  // Filter state
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const q = query(
          collection(db, 'expenses'),
          where('userId', '==', currentUser.uid)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setExpenses(data);
        });
        return () => unsubscribe();
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let filtered = expenses;

    if (filterType) {
      filtered = filtered.filter((e) => e.type === filterType);
    }
    if (filterDate) {
      filtered = filtered.filter(
        (e) => e.date.toDate().toISOString().split('T')[0] === filterDate
      );
    }
    if (minAmount) {
      filtered = filtered.filter((e) => e.amount >= parseFloat(minAmount));
    }
    if (maxAmount) {
      filtered = filtered.filter((e) => e.amount <= parseFloat(maxAmount));
    }

    setFilteredExpenses(filtered);
  }, [expenses, filterType, filterDate, minAmount, maxAmount]);

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-pink-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-white font-mono">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 sm:px-6 bg-white dark:bg-gray-900 shadow-md">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide font-[Fira_Code] text-indigo-600 dark:text-indigo-300">
          Trackify
        </h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition shadow"
            onClick={() => setShowForm(!showForm)}
            title="Add Expense"
          >
            <FaPlus />
          </button>
        </div>
      </nav>

      {message && (
        <div className="mx-4 mt-4 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-800 dark:text-emerald-200 rounded shadow-sm text-center">
          {message}
        </div>
      )}

      {showForm && (
        <div className="max-w-md mx-auto mt-6 px-4 sm:px-6 py-6 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-5 text-sm sm:text-base font-[Roboto_Mono]">
            <div className="space-y-1">
              <label htmlFor="amount" className="block text-gray-700 dark:text-gray-200 font-medium">
                Amount
              </label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                placeholder="e.g. 120.00"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="date" className="block text-gray-700 dark:text-gray-200 font-medium">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="type" className="block text-gray-700 dark:text-gray-200 font-medium">
                Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                required
              >
                <option value="">Choose category</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Shopping">Shopping</option>
                <option value="Bills">Bills</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="remarks" className="block text-gray-700 dark:text-gray-200 font-medium">
                Remarks
              </label>
              <textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                placeholder="Add a note (optional)"
              ></textarea>
            </div>

            <button
              className="w-full bg-gray-900 dark:bg-gray-700 text-white font-bold font-[Fira_Code] p-3 rounded-lg hover:opacity-90 transition"
            >
              {editId ? 'Update Expense' : 'Add Expense'}
            </button>
          </form>
        </div>
      )}

      {/* Filter Button */}
      <button
        onClick={() => setFilterOpen(!filterOpen)}
        className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition mt-4 ml-3"
      >
        <span>Filter</span>
        <svg
          className={`ml-2 transition-transform transform ${filterOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6"></path>
        </svg>
      </button>

      {/* Filter Options */}
      {filterOpen && (
        <div className="mt-4 bg-white dark:bg-gray-800 shadow-lg rounded-md p-4 space-y-4 w-full sm:w-auto">
          <div className="space-y-2">
            <label htmlFor="type" className="block text-gray-700 dark:text-gray-200">
              Type
            </label>
            <select
              id="type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            >
              <option value="">All Types</option>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Shopping">Shopping</option>
              <option value="Bills">Bills</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="date" className="block text-gray-700 dark:text-gray-200">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="minAmount" className="block text-gray-700 dark:text-gray-200">
              Min Amount
            </label>
            <input
              type="number"
              id="minAmount"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="Enter Min Amount"
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="maxAmount" className="block text-gray-700 dark:text-gray-200">
              Max Amount
            </label>
            <input
              type="number"
              id="maxAmount"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="Enter Max Amount"
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => {
                setFilterType('');
                setFilterDate('');
                setMinAmount('');
                setMaxAmount('');
              }}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
            >
              Clear Filters
            </button>

            {/* <button
              onClick={() => setFilterOpen(false)}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
            >
              Apply Filters
            </button> */}
          </div>
        </div>
      )}

      {/* Expense List */}
      <div className="mt-6 space-y-4">
        {(filterOpen ? filteredExpenses : expenses).map((expense) => (
          <div
            key={expense.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-2"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300">
                {expense.type}
              </h3>
              <span className="text-gray-600 dark:text-gray-400">
                {new Date(expense.date.toDate()).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {expense.remarks || 'No remarks'}
            </p>
            <div className="flex justify-between items-center mt-2">
              <span className="font-semibold text-indigo-600 dark:text-indigo-300">
                ${expense.amount.toFixed(2)}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(expense)}
                  className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-500 dark:hover:text-indigo-400"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
