import React, { useEffect, useState, useMemo } from 'react';
import { ThemeToggle } from './ThemeToggle';
import '../index.css';
import track from '../assets/1.png';                      // added
import { signOut } from 'firebase/auth';                  // added
import { auth } from '../firebase';                       // added
import { useNavigate } from 'react-router-dom';           // added

export default function Dashboard() {
  const navigate = useNavigate();                         // added
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: '',
    remarks: '',
  });
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // additional filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    // demo data — replace with your Firestore fetch as needed
    setItems([
      { id: '1', amount: 12.5, date: new Date().toISOString(), type: 'Coffee', remarks: 'Morning espresso' },
      { id: '2', amount: 1200, date: new Date().toISOString(), type: 'Rent', remarks: 'August' },
      { id: '3', amount: 8.75, date: new Date().toISOString(), type: 'Transport', remarks: 'Taxi' },
      { id: '4', amount: 45.0, date: new Date().toISOString(), type: 'Groceries', remarks: 'Weekly shop' },
    ]);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const entry = { id: editingId || Date.now().toString(), ...form };
    setItems((prev) => {
      if (editingId) return prev.map((p) => (p.id === editingId ? entry : p));
      return [entry, ...prev];
    });
    setForm({ amount: '', date: new Date().toISOString().split('T')[0], type: '', remarks: '' });
    setShowForm(false);
    setEditingId(null);
    // ensure mobile UI closes when saving
    setMobileFiltersOpen(false);
  };

  const handleEdit = (it) => {
    setForm({ amount: it.amount, date: it.date.split('T')[0], type: it.type, remarks: it.remarks });
    setEditingId(it.id);
    setShowForm(true);
    // on mobile bring up form area
    setMobileFiltersOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (it) => setItems((prev) => prev.filter((x) => x.id !== it.id));

  // available categories from items
  const categories = useMemo(() => {
    const setCat = new Set(items.map((i) => i.type || 'Uncategorized'));
    return ['all', ...Array.from(setCat)];
  }, [items]);

  // filtered view by search + category + date range
  const filtered = useMemo(() => {
    const q = (query || '').toLowerCase();
    const s = startDate ? new Date(startDate) : null;
    const e = endDate ? new Date(endDate) : null;
    return items.filter((it) => {
      const inQuery =
        (it.type || '').toLowerCase().includes(q) ||
        (it.remarks || '').toLowerCase().includes(q) ||
        String(it.amount).includes(q);
      const inCategory = categoryFilter === 'all' || (it.type || 'Uncategorized') === categoryFilter;
      const d = new Date(it.date);
      const inStart = !s || d >= s;
      const inEnd = !e || d <= e;
      return inQuery && inCategory && inStart && inEnd;
    });
  }, [items, query, categoryFilter, startDate, endDate]);

  // Export CSV for provided array
  const exportCSV = (rows, filename = 'expenses.csv') => {
    if (!rows || rows.length === 0) return;
    const headers = ['id', 'amount', 'date', 'type', 'remarks'];
    const csv = [
      headers.join(','),
      ...rows.map((r) =>
        headers.map((h) => {
          const v = r[h] ?? '';
          // escape quotes
          return `"${String(v).replace(/"/g, '""')}"`;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // build monthly totals for last 6 months
  const monthlyTotals = useMemo(() => {
    const now = new Date();
    const buckets = [];
    for (let i = 5; i >= 0; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${dt.getFullYear()}-${dt.getMonth() + 1}`;
      buckets.push({ key, label: dt.toLocaleString(undefined, { month: 'short' }), total: 0 });
    }
    items.forEach((it) => {
      const d = new Date(it.date);
      const k = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const b = buckets.find((x) => x.key === k);
      if (b) b.total += Number(it.amount) || 0;
    });
    return buckets;
  }, [items]);

  const maxTotal = Math.max(1, ...monthlyTotals.map((b) => b.total));

  const handleLogout = async () => {                      // added
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-neutral-50 dark:bg-neutral-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-4">
            {/* replaced ET block with Trackify logo */}
            <img src={track} alt="Trackify" className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-md shadow-thin" />
            <div>
              <h1 className="text-lg sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Trackify</h1>
              <p className="text-xs sm:text-sm text-neutral-500">Simple • Calm • Focused</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by category, notes, amount..."
                className="flex-1 sm:w-72 text-sm bg-white/60 dark:bg-neutral-900/60 border border-neutral-200 rounded-full px-4 py-2 shadow-thin placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-offset-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileFiltersOpen((s) => !s)}
                className="sm:hidden px-3 py-2 rounded-full border border-neutral-200 bg-white text-sm"
                aria-expanded={mobileFiltersOpen}
              >
                Filters
              </button>

              <ThemeToggle />

              {/* Desktop "New" */}
              <button onClick={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hidden sm:inline-flex px-3 py-2 rounded-full bg-accent text-white text-sm shadow-thin">New</button>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-2 rounded-full border border-neutral-200 bg-white text-sm hover:bg-neutral-50 transition"
                title="Log out"
              >
                Log out
              </button>
            </div>
          </div>
        </header>

        <main className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left column: on desktop shows form + filters; on mobile collapsible panels above list */}
          <aside className="lg:col-span-1 space-y-4">
            {/* Form panel - full width on mobile */}
            <div className="bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl p-3 shadow-thin">
              {showForm ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      value={form.amount}
                      onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                      placeholder="Amount"
                      type="number"
                      step="0.01"
                      className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                    <input
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      type="date"
                      className="w-full sm:w-40 px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>

                  <input
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    placeholder="Category (e.g., Food, Rent)"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />

                  <textarea
                    value={form.remarks}
                    onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
                    placeholder="Notes (optional)"
                    rows="2"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />

                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-3 py-1 rounded-full border border-neutral-200 text-sm">Cancel</button>
                    <button type="submit" className="px-3 py-1 rounded-full bg-accent text-white text-sm">{editingId ? 'Update' : 'Save'}</button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-50">Add Expense</h3>
                    <p className="text-xs text-neutral-500">Quick and focused</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowForm(true)} className="px-3 py-1 rounded-full bg-accent text-white text-sm">New</button>
                  </div>
                </div>
              )}
            </div>

            {/* Filters & Export - collapsible on mobile */}
            <div className={`bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl p-3 shadow-thin transition-transform ${mobileFiltersOpen ? 'block' : 'hidden'} sm:block`}>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-50">Filters</h4>
                <button className="sm:hidden text-xs text-neutral-500" onClick={() => setMobileFiltersOpen(false)}>Close</button>
              </div>

              <div className="mt-3 space-y-3">
                <div>
                  <label className="text-xs text-neutral-500">Category</label>
                  <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-neutral-200">
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-neutral-500">From</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-neutral-200" />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500">To</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-neutral-200" />
                  </div>
                </div>

                <div className="flex gap-2 justify-between items-center">
                  <button onClick={() => { setCategoryFilter('all'); setStartDate(''); setEndDate(''); setQuery(''); }} className="px-3 py-2 rounded-full border border-neutral-200 text-sm">Reset</button>
                  <div className="flex gap-2">
                    <button onClick={() => exportCSV(filtered, 'expenses_filtered.csv')} className="px-3 py-2 rounded-full border border-neutral-200 text-sm">Export Filtered</button>
                    <button onClick={() => exportCSV(items, 'expenses_all.csv')} className="px-3 py-2 rounded-full bg-accent text-white text-sm">Export All</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Graph - keep compact on mobile */}
            <div className="bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl p-3 shadow-thin">
              <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-50">Last 6 months</h4>
              <div className="mt-3">
                <svg viewBox="0 0 140 60" className="w-full h-20">
                  {monthlyTotals.map((b, i) => {
                    const barWidth = 18;
                    const gap = 4;
                    const x = i * (barWidth + gap) + 6;
                    const height = Math.round((b.total / maxTotal) * 44);
                    const y = 50 - height;
                    return (
                      <g key={b.key} transform={`translate(${x},0)`}>
                        <rect x="0" y={y} width={barWidth} height={height} rx="4" fill="url(#grad)" />
                        <text x={barWidth / 2} y="56" fontSize="7" fill="#6b747a" textAnchor="middle">{b.label}</text>
                      </g>
                    );
                  })}
                  <defs>
                    <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#2b7cff" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#2b7cff" stopOpacity="0.25" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="mt-2 text-xs text-neutral-500">Total this period: <span className="font-medium text-neutral-700 dark:text-neutral-50">${monthlyTotals.reduce((s, b) => s + b.total, 0).toFixed(2)}</span></div>
              </div>
            </div>
          </aside>

          {/* Right/main content: expense cards */}
          <section className="lg:col-span-3 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item) => (
                <article key={item.id} className="w-full bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl p-3 shadow-subtle transition-transform duration-200 ease-gentle hover:translate-y-0.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center text-accent font-medium">
                        {item.type?.[0] ?? 'E'}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{item.type || 'Expense'}</div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-300 mt-0.5">{item.remarks || 'No details'}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">${Number(item.amount).toFixed(2)}</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-300 mt-0.5">{new Date(item.date).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleEdit(item)} className="text-xs px-3 py-1 rounded-full border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition">Edit</button>
                    <button onClick={() => handleDelete(item)} className="text-xs px-3 py-1 rounded-full text-red-600 hover:bg-red-50 transition">Delete</button>
                  </div>
                </article>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl p-6 text-center text-neutral-500">
                No expenses match your filters.
              </div>
            )}
          </section>
        </main>

        {/* Mobile floating New button */}
        <button
          onClick={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="fixed bottom-6 right-4 z-50 inline-flex items-center justify-center sm:hidden w-14 h-14 rounded-full bg-accent text-white shadow-lg"
          aria-label="Add expense"
        >
          +
        </button>
      </div>
    </div>
  );
}
