import { useState } from 'react';
import { db } from '../firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


const AddExpenseModal = ({ onClose }) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('');
  const [remarks, setRemarks] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const data = {
      amount: parseFloat(amount),
      date: Timestamp.fromDate(new Date(date)),
      type,
      remarks,
      createdAt: Timestamp.now(),
      userId: user.uid,
      userEmail: user.email,
    };

    await addDoc(collection(db, 'expenses'), data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-96">
        <h2 className="text-lg font-semibold mb-4">Add New Expense</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="w-full p-2 border rounded" type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          <input className="w-full p-2 border rounded" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <select className="w-full p-2 border rounded" value={type} onChange={(e) => setType(e.target.value)} required>
            <option value="">Select type</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Bills">Bills</option>
            <option value="Other">Other</option>
          </select>
          <textarea className="w-full p-2 border rounded" placeholder="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          <button className="bg-black text-white w-full p-2 rounded" type="submit">Add Expense</button>
        </form>
      </div>
    </div>

 

  );
};

export default AddExpenseModal;
