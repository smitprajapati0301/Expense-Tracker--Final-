import React, { useEffect, useState, useMemo } from 'react';
import '../index.css';
import track from '../assets/1.png';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { collection, query as firestoreQuery, where, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp, writeBatch } from 'firebase/firestore';

/* ─── Currency ────────────────────────────────────────── */
const CUR = '₹';

/* ─── Category config ─────────────────────────────────── */
const CATEGORIES = {
  'Coffee':    { emoji: '☕', bg: '#fff3e0', color: '#e65100' },
  'Food':      { emoji: '🍽️', bg: '#e8f5e9', color: '#2e7d32' },
  'Transport': { emoji: '🚗', bg: '#e3f2fd', color: '#1565c0' },
  'Rent':      { emoji: '🏠', bg: '#f3e5f5', color: '#6a1b9a' },
  'Groceries': { emoji: '🛒', bg: '#e8f5e9', color: '#388e3c' },
  'Shopping':  { emoji: '🛍️', bg: '#fce4ec', color: '#c62828' },
  'Bills':     { emoji: '📋', bg: '#e8eaf6', color: '#283593' },
  'Health':    { emoji: '💊', bg: '#e0f2f1', color: '#00695c' },
  'Savings':   { emoji: '💰', bg: '#fffde7', color: '#f57f17' },
  'Other':     { emoji: '📦', bg: '#f5f5f5', color: '#424242' },
};

const getCatStyle = (type) =>
  CATEGORIES[type] || { emoji: '💸', bg: '#e7eefe', color: '#0058be' };

/* ─── Helpers ─────────────────────────────────────────── */
const greetTime = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning 🌤️';
  if (h < 17) return 'Good Afternoon ☀️';
  if (h < 21) return 'Good Evening 🌙';
  return 'Good Night 🌙';
};

const fmtDate = (iso) => {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date(today); yest.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yest.toDateString())  return 'Yesterday';
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

const fmtINR = (n) =>
  Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ─── SVG Donut chart helper ──────────────────────────── */
const polarXY = (cx, cy, r, deg) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};
const arcPath = (cx, cy, r, startDeg, endDeg) => {
  const s = polarXY(cx, cy, r, startDeg);
  const e = polarXY(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
};

/* ─── Nav tabs ────────────────────────────────────────── */
const NAV_TABS = [
  { id: 'home',    label: 'Home',
    icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill={a?'var(--primary)':'none'} stroke={a?'var(--primary)':'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { id: 'history', label: 'History',
    icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?'var(--primary)':'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { id: 'stats',   label: 'Stats',
    icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?'var(--primary)':'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { id: 'profile', label: 'Profile',
    icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?'var(--primary)':'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
];

/* ═══════════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════════ */
const seedDemoData = async (user) => {
  try {
    const batch = writeBatch(db);
    const now = new Date().toISOString();
    const yest = new Date(Date.now() - 86400000).toISOString();
    const twodago = new Date(Date.now() - 172800000).toISOString();

    const demoItems = [
      { amount: 350,    date: now,     type: 'Coffee',    remarks: 'Café Coffee Day', isIncome: false },
      { amount: 3200,   date: now,     type: 'Groceries', remarks: 'Reliance Fresh',  isIncome: false },
      { amount: 15000,  date: yest,    type: 'Rent',      remarks: 'Apartment 4B',    isIncome: false },
      { amount: 85000,  date: yest,    type: 'Income',    remarks: 'Monthly salary',  isIncome: true  },
      { amount: 650,    date: yest,    type: 'Transport', remarks: 'Ola cab',         isIncome: false },
      { amount: 1800,   date: twodago, type: 'Shopping',  remarks: 'Myntra order',    isIncome: false },
      { amount: 2100,   date: twodago, type: 'Bills',     remarks: 'Electricity',     isIncome: false },
      { amount: 500,    date: twodago, type: 'Coffee',    remarks: 'Starbucks',       isIncome: false },
    ];

    demoItems.forEach((item) => {
      const docRef = doc(collection(db, 'expenses'));
      batch.set(docRef, {
        ...item,
        date: Timestamp.fromDate(new Date(item.date)),
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp()
      });
    });

    await batch.commit();
    console.log("Seeded initial demo data to Firestore in a single batch.");
  } catch (err) {
    console.error("Error seeding initial data:", err);
  }
};

export default function Dashboard() {
  const navigate = useNavigate();

  /* ── State ── */
  const [items, setItems]             = useState([]);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [addingIncome, setAddingIncome] = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [activeTab, setActiveTab]     = useState('home');
  const [query, setQuery]             = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDark, setIsDark]           = useState(false);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [loading, setLoading]         = useState(true);

  /* ── Stats period state ── */
  const [statsPeriod, setStatsPeriod]   = useState('month');     // 'today'|'week'|'month'|'year'
  const [statsMonth, setStatsMonth]     = useState(new Date().getMonth());   // 0-11
  const [statsYear, setStatsYear]       = useState(new Date().getFullYear());
  const [showMonthGrid, setShowMonthGrid] = useState(false);

  const [form, setForm] = useState({
    amount: '', date: new Date().toISOString().split('T')[0],
    type: '', remarks: '', isIncome: false,
  });

  /* ── Dark mode ── */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  /* ── Reactive Auth State Listener ── */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  /* ── Firestore data sync ── */
  useEffect(() => {
    if (!currentUser) return;

    const q = firestoreQuery(
      collection(db, 'expenses'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        seedDemoData(currentUser);
        return;
      }

      const docs = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        let formattedDate = new Date().toISOString();
        if (data.date) {
          formattedDate = typeof data.date === 'string' ? data.date : new Date(data.date.seconds * 1000).toISOString();
        } else if (data.createdAt) {
          formattedDate = new Date(data.createdAt.seconds * 1000).toISOString();
        }

        const rawAmount = Number(data.amount || 0);
        const isInc = data.isIncome === true || data.type === 'Income';

        return {
          id: docSnap.id,
          ...data,
          date: formattedDate,
          amount: Math.abs(rawAmount),
          isIncome: isInc
        };
      });

      docs.sort((a, b) => new Date(b.date) - new Date(a.date));
      setItems(docs);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching expenses snapshot:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  /* ── Derived values ── */
  const totalIncome   = useMemo(() => items.filter(i=>i.isIncome).reduce((s,i)=>s+Number(i.amount),0), [items]);
  const totalExpenses = useMemo(() => items.filter(i=>!i.isIncome).reduce((s,i)=>s+Number(i.amount),0), [items]);
  const balance       = totalIncome - totalExpenses;

  /* filtered for history */
  const filtered = useMemo(() => {
    const q = (query||'').toLowerCase();
    return items.filter(it => {
      const inQ   = (it.type||'').toLowerCase().includes(q) || (it.remarks||'').toLowerCase().includes(q) || String(it.amount).includes(q);
      const inCat = categoryFilter === 'all' || (it.isIncome && categoryFilter === 'income') || (!it.isIncome && categoryFilter === 'expense') || it.type === categoryFilter;
      return inQ && inCat;
    });
  }, [items, query, categoryFilter]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(it => { const l = fmtDate(it.date); if(!map[l]) map[l]=[]; map[l].push(it); });
    return Object.entries(map);
  }, [filtered]);

  /* monthly totals for last 6 months */
  const monthlyData = useMemo(() => {
    const now = new Date();
    const buckets = [];
    for (let i=5; i>=0; i--) {
      const dt  = new Date(now.getFullYear(), now.getMonth()-i, 1);
      const key = `${dt.getFullYear()}-${dt.getMonth()+1}`;
      buckets.push({ key, label: dt.toLocaleString('en-IN',{month:'short'}), expenses:0, income:0 });
    }
    items.forEach(it => {
      const d = new Date(it.date);
      const k = `${d.getFullYear()}-${d.getMonth()+1}`;
      const b = buckets.find(x=>x.key===k);
      if (b) { if(it.isIncome) b.income+=Number(it.amount); else b.expenses+=Number(it.amount); }
    });
    return buckets;
  }, [items]);

  const maxBar = Math.max(1, ...monthlyData.map(b=>Math.max(b.income,b.expenses)));

  /* category breakdown for donut */
  const catBreakdown = useMemo(() => {
    const map = {};
    items.filter(i=>!i.isIncome).forEach(i => { map[i.type]=(map[i.type]||0)+Number(i.amount); });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]);
  }, [items]);

  const DONUT_COLORS = ['#0058be','#30d158','#ff453a','#ff9f0a','#bf5af2','#5ac8fa','#32ade6','#ac8e68'];

  /* donut segments (for home card — all time) */
  const donutSegments = useMemo(() => {
    if (!catBreakdown.length) return [];
    const total = catBreakdown.reduce((s,[,v])=>s+v,0);
    let angle = 0;
    return catBreakdown.map(([cat, amt], i) => {
      const pct  = amt/total;
      const span = pct*360;
      const seg  = { cat, amt, pct, startDeg:angle, endDeg:angle+span, color:DONUT_COLORS[i%DONUT_COLORS.length] };
      angle += span;
      return seg;
    });
  }, [catBreakdown]);

  /* ── Stats: period filter ── */
  const statsFilteredItems = useMemo(() => {
    const now = new Date();
    return items.filter(it => {
      const d = new Date(it.date);
      if (statsPeriod === 'today') {
        return d.toDateString() === now.toDateString();
      }
      if (statsPeriod === 'week') {
        const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 6); weekAgo.setHours(0,0,0,0);
        return d >= weekAgo;
      }
      if (statsPeriod === 'month') {
        return d.getMonth() === statsMonth && d.getFullYear() === statsYear;
      }
      if (statsPeriod === 'year') {
        return d.getFullYear() === statsYear;
      }
      return true;
    });
  }, [items, statsPeriod, statsMonth, statsYear]);

  const statsIncome   = useMemo(() => statsFilteredItems.filter(i=>i.isIncome).reduce((s,i)=>s+Number(i.amount),0), [statsFilteredItems]);
  const statsExpenses = useMemo(() => statsFilteredItems.filter(i=>!i.isIncome).reduce((s,i)=>s+Number(i.amount),0), [statsFilteredItems]);
  const statsBalance  = statsIncome - statsExpenses;

  const statsCatBreakdown = useMemo(() => {
    const map = {};
    statsFilteredItems.filter(i=>!i.isIncome).forEach(i => { map[i.type]=(map[i.type]||0)+Number(i.amount); });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]);
  }, [statsFilteredItems]);

  const statsDonutSegments = useMemo(() => {
    if (!statsCatBreakdown.length) return [];
    const total = statsCatBreakdown.reduce((s,[,v])=>s+v,0);
    let angle = 0;
    return statsCatBreakdown.map(([cat,amt],i) => {
      const pct=amt/total, span=pct*360;
      const seg = { cat, amt, pct, startDeg:angle, endDeg:angle+span, color:DONUT_COLORS[i%DONUT_COLORS.length] };
      angle+=span; return seg;
    });
  }, [statsCatBreakdown]);

  /* bar/line buckets per period */
  const statsBarData = useMemo(() => {
    if (statsPeriod === 'today') {
      // 24 hours, show by hour
      const hours = Array.from({length:24},(_,h)=>({ label:`${h}:00`, expenses:0, income:0 }));
      statsFilteredItems.forEach(it => {
        const h = new Date(it.date).getHours();
        if (it.isIncome) hours[h].income+=Number(it.amount);
        else hours[h].expenses+=Number(it.amount);
      });
      // only return hours that have data, or at least current hour range
      const now = new Date().getHours();
      return hours.slice(Math.max(0,now-6), now+1);
    }
    if (statsPeriod === 'week') {
      const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const days = [];
      for (let i=6; i>=0; i--) {
        const dt = new Date(); dt.setDate(dt.getDate()-i); dt.setHours(0,0,0,0);
        days.push({ label: dayNames[dt.getDay()], date:dt, expenses:0, income:0 });
      }
      statsFilteredItems.forEach(it => {
        const d = new Date(it.date); d.setHours(0,0,0,0);
        const b = days.find(x=>x.date.toDateString()===d.toDateString());
        if (b) { if(it.isIncome) b.income+=Number(it.amount); else b.expenses+=Number(it.amount); }
      });
      return days;
    }
    if (statsPeriod === 'month') {
      const daysInMonth = new Date(statsYear, statsMonth+1, 0).getDate();
      // group by week of month (1-5)
      const weeks = Array.from({length:5},(_,i)=>({ label:`Wk ${i+1}`, expenses:0, income:0 }));
      statsFilteredItems.forEach(it => {
        const d = new Date(it.date);
        if (d.getMonth()===statsMonth && d.getFullYear()===statsYear) {
          const wk = Math.floor((d.getDate()-1)/7);
          if (it.isIncome) weeks[wk].income+=Number(it.amount);
          else weeks[wk].expenses+=Number(it.amount);
        }
      });
      return weeks;
    }
    if (statsPeriod === 'year') {
      const months = Array.from({length:12},(_,i)=>({ label:new Date(statsYear,i,1).toLocaleString('en-IN',{month:'short'}), expenses:0, income:0 }));
      statsFilteredItems.forEach(it => {
        const d = new Date(it.date);
        if (d.getFullYear()===statsYear) {
          if (it.isIncome) months[d.getMonth()].income+=Number(it.amount);
          else months[d.getMonth()].expenses+=Number(it.amount);
        }
      });
      return months;
    }
    return [];
  }, [statsFilteredItems, statsPeriod, statsMonth, statsYear]);

  const maxStatsBar = Math.max(1, ...statsBarData.map(b=>Math.max(b.income,b.expenses)));

  /* period label helper */
  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const periodLabel = statsPeriod==='today' ? 'Today'
    : statsPeriod==='week'  ? 'Last 7 Days'
    : statsPeriod==='month' ? `${MONTH_NAMES[statsMonth]} ${statsYear}`
    : `Year ${statsYear}`;

  /* ── CRUD ── */
  const openAddSheet = (isIncome = false) => {
    setForm({ amount:'', date:new Date().toISOString().split('T')[0], type: isIncome ? 'Income' : '', remarks:'', isIncome });
    setAddingIncome(isIncome);
    setEditingId(null);
    setShowAddSheet(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const data = {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      amount: parseFloat(form.amount),
      date: Timestamp.fromDate(new Date(form.date)),
      type: form.isIncome ? 'Income' : (form.type || 'Other'),
      remarks: (form.remarks || '').trim(),
      isIncome: form.isIncome
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'expenses', editingId), data);
      } else {
        await addDoc(collection(db, 'expenses'), {
          ...data,
          createdAt: serverTimestamp()
        });
      }
      setForm({ amount:'', date:new Date().toISOString().split('T')[0], type:'', remarks:'', isIncome:false });
      setShowAddSheet(false);
      setEditingId(null);
    } catch (err) {
      console.error('Error saving transaction to Firestore:', err);
      alert('Failed to save transaction: ' + err.message);
    }
  };

  const handleEdit = (it) => {
    setForm({ amount:it.amount, date:it.date.split('T')[0], type:it.type, remarks:it.remarks, isIncome:it.isIncome });
    setEditingId(it.id);
    setAddingIncome(it.isIncome);
    setShowAddSheet(true);
  };

  const handleDelete = async (it) => {
    try {
      await deleteDoc(doc(db, 'expenses', it.id));
    } catch (err) {
      console.error('Error deleting transaction from Firestore:', err);
    }
  };

  const handleLogout = async () => {
    try { await signOut(auth); navigate('/login'); }
    catch(e) { console.error(e); }
  };

  const exportCSV = (rows, filename='expenses.csv') => {
    if(!rows?.length) return;
    const h = ['id','amount','date','type','remarks','isIncome'];
    const csv = [h.join(','), ...rows.map(r=>h.map(k=>`"${String(r[k]??'').replace(/"/g,'""')}"`).join(','))].join('\n');
    const a = Object.assign(document.createElement('a'),{href:URL.createObjectURL(new Blob([csv],{type:'text/csv'})),download:filename});
    document.body.appendChild(a); a.click(); a.remove();
  };

  /* ─── shared transaction list renderer ─── */
  const TxList = ({ data }) => {
    const grp = useMemo(() => {
      const map = {};
      data.forEach(it => { const l=fmtDate(it.date); if(!map[l]) map[l]=[]; map[l].push(it); });
      return Object.entries(map);
    }, [data]);

    if (!grp.length) return (
      <div className="card" style={{ textAlign:'center', padding:'2.5rem', color:'var(--on-surface-variant)' }}>
        <div style={{ fontSize:40, marginBottom:10 }}>🔍</div>
        <div style={{ fontWeight:700, color:'var(--on-surface)', marginBottom:6, fontSize:'1rem' }}>Nothing here yet</div>
        <div style={{ fontSize:'0.875rem' }}>Add your first entry using the buttons above.</div>
      </div>
    );

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
        {grp.map(([dateLabel, txs]) => (
          <div key={dateLabel}>
            <div className="date-label" style={{ marginBottom:8 }}>{dateLabel}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {txs.map(it => {
                const cs = it.isIncome ? { emoji:'📈', bg:'#e8f5e9', color:'#1a8a52' } : getCatStyle(it.type);
                return (
                  <div key={it.id} className="tx-item animate-fade-up" style={{ justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div className="tx-icon" style={{ background:cs.bg }}>{cs.emoji}</div>
                      <div>
                        <div style={{ fontSize:'0.9375rem', fontWeight:600, color:'var(--on-surface)', lineHeight:1.3 }}>
                          {it.type || 'Expense'}
                        </div>
                        <div style={{ fontSize:'0.75rem', color:'var(--on-surface-variant)', marginTop:2 }}>
                          {it.remarks || 'No details'} · {fmtTime(it.date)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:'0.9375rem', fontWeight:700, color: it.isIncome?'var(--income)':'var(--expense)' }}>
                          {it.isIncome?'+':'-'}{CUR}{fmtINR(it.amount)}
                        </div>
                        <div style={{ fontSize:'0.6875rem', color:'var(--on-surface-variant)', marginTop:2 }}>
                          {new Date(it.date).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                        <button onClick={()=>handleEdit(it)} style={{ fontSize:'0.6875rem', fontWeight:700, color:'var(--primary)', background:'none', border:'none', cursor:'pointer', padding:'2px 6px' }}>Edit</button>
                        <button onClick={()=>handleDelete(it)} style={{ fontSize:'0.6875rem', fontWeight:700, color:'var(--expense)', background:'none', border:'none', cursor:'pointer', padding:'2px 6px' }}>Del</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  /* ═══ RENDER ═══════════════════════════════════════════ */
  if (loading) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--surface)', gap:16 }}>
        <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid var(--outline-light)', borderTopColor:'var(--primary)', animation:'spin 1s linear infinite' }}/>
        <div style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--on-surface-variant)', fontFamily:'inherit' }}>Loading your dashboard…</div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background:'var(--surface)', color:'var(--on-surface)', paddingBottom:88 }}>

      {/* ── Header ─────────────────────────────────────── */}
      <header style={{
        background:'rgba(245,245,247,0.88)',
        backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
        borderBottom:'1px solid var(--outline-light)',
        position:'sticky', top:0, zIndex:30,
      }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 20px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>

          {/* Logo only — no text */}
          <a href="/" style={{ display:'inline-flex', alignItems:'center', textDecoration:'none', flexShrink:0 }}>
            <img src={track} alt="Trackify" style={{ height:34, width:'auto', objectFit:'contain' }} />
          </a>

          {/* Search — hidden on mobile */}
          <div style={{ flex:1, maxWidth:380, position:'relative' }} className="hidden sm:block">
            <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--outline)', pointerEvents:'none' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search…"
              style={{ width:'100%', height:36, paddingLeft:36, paddingRight:14, borderRadius:9999, border:'1px solid var(--outline-light)', background:'var(--surface-mid)', color:'var(--on-surface)', fontSize:'0.875rem', fontFamily:'inherit', outline:'none' }}
            />
          </div>

          {/* Right actions */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {/* Dark mode toggle */}
            <button onClick={()=>setIsDark(d=>!d)}
              style={{ width:34, height:34, borderRadius:9999, background:'var(--surface-mid)', border:'1px solid var(--outline-light)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}
              title="Toggle dark mode"
            >
              {isDark?'☀️':'🌙'}
            </button>
            {/* Logout — icon on mobile, text on desktop */}
            <button onClick={handleLogout}
              className="btn-ghost"
              style={{ height:34, padding:'0 10px' }}
              title="Log out"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────── */}
      <main style={{ maxWidth:1200, margin:'0 auto', padding:'20px 16px' }}>

        {/* ══ HOME TAB ══════════════════════════════════ */}
        {activeTab === 'home' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:20, alignItems:'start' }}>

            {/* ── Left column ── */}
            <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

              {/* Greeting */}
              <div style={{ padding:'4px 2px' }}>
                <div style={{ fontSize:'0.8125rem', color:'var(--on-surface-variant)', fontWeight:500 }}>{greetTime()}</div>
                <h1 style={{ fontSize:'clamp(1.375rem,4vw,1.75rem)', fontWeight:700, margin:'4px 0 0', color:'var(--on-surface)', letterSpacing:'-0.02em' }}>
                  {new Date().toLocaleString('en-IN',{month:'long'})} Overview
                </h1>
              </div>

              {/* Balance Card */}
              <div className="card-primary animate-fade-up">
                <div style={{ fontSize:'0.6875rem', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', opacity:0.8, marginBottom:4 }}>
                  Total Balance
                </div>
                <div style={{ fontSize:'clamp(1.75rem,5vw,2.5rem)', fontWeight:700, letterSpacing:'-0.025em', marginBottom:18 }}>
                  {balance < 0 ? `-${CUR}${fmtINR(Math.abs(balance))}` : `${CUR}${fmtINR(balance)}`}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  {[
                    { label:'Income', val:totalIncome, arrow:'↓', tint:'rgba(48,209,88,0.2)' },
                    { label:'Expenses', val:totalExpenses, arrow:'↑', tint:'rgba(255,69,58,0.2)' },
                  ].map(({ label, val, arrow, tint }) => (
                    <div key={label} style={{ background:'rgba(255,255,255,0.13)', borderRadius:12, padding:'10px 12px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4 }}>
                        <div style={{ width:20, height:20, borderRadius:6, background:tint, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 }}>{arrow}</div>
                        <span style={{ fontSize:'0.6875rem', fontWeight:700, opacity:0.82, letterSpacing:'0.04em', textTransform:'uppercase' }}>{label}</span>
                      </div>
                      <div style={{ fontSize:'0.9375rem', fontWeight:700 }}>{CUR}{fmtINR(val)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── TWO BIG ACTION BUTTONS ── */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <button className="btn-primary" onClick={()=>openAddSheet(false)} style={{ height:56, fontSize:'1rem', borderRadius:16 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Expense
                </button>
                <button className="btn-income" onClick={()=>openAddSheet(true)} style={{ height:56, fontSize:'1rem', borderRadius:16 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Income
                </button>
              </div>

              {/* Savings Goal + Top Category mini */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="stat-card" style={{ background:'var(--surface-mid)', border:'1px solid var(--outline-light)' }}>
                  <div style={{ fontSize:18 }}>📊</div>
                  <div style={{ fontSize:'0.6875rem', fontWeight:700, color:'var(--on-surface-variant)', letterSpacing:'0.06em', textTransform:'uppercase' }}>Saved</div>
                  <div style={{ fontSize:'1.375rem', fontWeight:700, color:'var(--primary)', letterSpacing:'-0.02em' }}>
                    {totalIncome>0 ? Math.max(0,Math.round((balance/totalIncome)*100)) : 0}%
                  </div>
                  <div style={{ height:4, borderRadius:9999, background:'var(--outline-light)', overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:9999, background:'linear-gradient(90deg,var(--primary),var(--primary-light))', width:`${Math.min(100,totalIncome>0?Math.max(0,Math.round((balance/totalIncome)*100)):0)}%`, transition:'width 0.6s' }} />
                  </div>
                </div>
                <div className="stat-card" style={{ background:'linear-gradient(135deg,var(--income),#6af0a0)', color:'#002910' }}>
                  <div style={{ fontSize:'0.6875rem', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', opacity:0.7 }}>Top Expense</div>
                  <div style={{ fontSize:'1rem', fontWeight:700, marginTop:'auto', paddingTop:8 }}>
                    {catBreakdown[0]?.[0] || '—'}
                  </div>
                  <div style={{ fontSize:'0.875rem', fontWeight:600, opacity:0.85 }}>
                    {catBreakdown[0] ? `${CUR}${fmtINR(catBreakdown[0][1])}` : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right column ── */}
            <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

              {/* Monthly chart */}
              <div className="card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <h3 style={{ fontSize:'1rem', fontWeight:700, margin:0, color:'var(--on-surface)', letterSpacing:'-0.01em' }}>Monthly Spending</h3>
                  <span style={{ fontSize:'0.75rem', color:'var(--on-surface-variant)', fontWeight:500 }}>Last 6 months</span>
                </div>
                <svg viewBox="0 0 280 90" style={{ width:'100%', height:96 }}>
                  <defs>
                    <linearGradient id="bg1" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#0058be" stopOpacity="0.9"/>
                      <stop offset="100%" stopColor="#0058be" stopOpacity="0.2"/>
                    </linearGradient>
                    <linearGradient id="bg2" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#30d158" stopOpacity="0.85"/>
                      <stop offset="100%" stopColor="#30d158" stopOpacity="0.15"/>
                    </linearGradient>
                  </defs>
                  {monthlyData.map((b, i) => {
                    const bw=18, gap=26, x=i*(bw*2+gap)+8;
                    const hE=Math.round((b.expenses/maxBar)*60);
                    const hI=Math.round((b.income/maxBar)*60);
                    return (
                      <g key={b.key}>
                        <rect x={x}    y={72-hE} width={bw} height={hE} rx="4" fill="url(#bg1)"/>
                        <rect x={x+bw+2} y={72-hI} width={bw} height={hI} rx="4" fill="url(#bg2)"/>
                        <text x={x+bw+1} y="83" fontSize="8" fill="var(--on-surface-variant)" textAnchor="middle" fontWeight="600">{b.label}</text>
                      </g>
                    );
                  })}
                </svg>
                <div style={{ display:'flex', gap:16, marginTop:8 }}>
                  {[['#0058be','Expenses'],['#30d158','Income']].map(([c,l])=>(
                    <div key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.75rem', color:'var(--on-surface-variant)', fontWeight:500 }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:c }}/>
                      {l}
                    </div>
                  ))}
                </div>
              </div>

              {/* Top categories */}
              {catBreakdown.length>0 && (
                <div className="card">
                  <h3 style={{ fontSize:'1rem', fontWeight:700, margin:'0 0 14px', color:'var(--on-surface)', letterSpacing:'-0.01em' }}>Top Categories</h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {catBreakdown.slice(0,4).map(([cat,amt]) => {
                      const cs=getCatStyle(cat), pct=Math.round((amt/totalExpenses)*100);
                      return (
                        <div key={cat}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <div style={{ width:28, height:28, borderRadius:8, background:cs.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>{cs.emoji}</div>
                              <span style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--on-surface)' }}>{cat}</span>
                            </div>
                            <span style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--on-surface)' }}>{CUR}{fmtINR(amt)}</span>
                          </div>
                          <div style={{ height:3, borderRadius:9999, background:'var(--surface-high)' }}>
                            <div style={{ height:'100%', borderRadius:9999, background:cs.color, width:`${pct}%`, transition:'width 0.5s' }}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent 3 quick entries */}
              <div className="card" style={{ padding:'1rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <h3 style={{ fontSize:'0.9375rem', fontWeight:700, margin:0, color:'var(--on-surface)', letterSpacing:'-0.01em' }}>Recent Activity</h3>
                  <button onClick={()=>setActiveTab('history')} style={{ fontSize:'0.8125rem', fontWeight:700, color:'var(--primary)', background:'none', border:'none', cursor:'pointer' }}>View All</button>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {items.slice(0,3).map(it => {
                    const cs = it.isIncome ? {emoji:'📈',bg:'#e8f5e9',color:'#1a8a52'} : getCatStyle(it.type);
                    return (
                      <div key={it.id} className="tx-item" style={{ justifyContent:'space-between' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div className="tx-icon" style={{ background:cs.bg, width:36, height:36, borderRadius:10, fontSize:'1rem' }}>{cs.emoji}</div>
                          <div>
                            <div style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--on-surface)' }}>{it.type}</div>
                            <div style={{ fontSize:'0.6875rem', color:'var(--on-surface-variant)' }}>{it.remarks}</div>
                          </div>
                        </div>
                        <div style={{ fontSize:'0.9rem', fontWeight:700, color:it.isIncome?'var(--income)':'var(--expense)' }}>
                          {it.isIncome?'+':'-'}{CUR}{fmtINR(it.amount)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ HISTORY TAB ══════════════════════════════ */}
        {activeTab === 'history' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h2 style={{ fontSize:'1.375rem', fontWeight:700, margin:0, color:'var(--on-surface)', letterSpacing:'-0.02em' }}>All Transactions</h2>
              <button onClick={()=>exportCSV(filtered,'history.csv')} style={{ fontSize:'0.8125rem', fontWeight:700, color:'var(--primary)', background:'none', border:'none', cursor:'pointer' }}>Export ↗</button>
            </div>

            {/* Search + filter row */}
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
              <div style={{ position:'relative', flex:1, minWidth:180 }}>
                <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--outline)', pointerEvents:'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search transactions…" className="input-trackify" style={{ paddingLeft:36, height:40, fontSize:'0.875rem' }}/>
              </div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {['all','income','expense',...Object.keys(CATEGORIES).slice(0,4)].map(cat=>(
                  <button key={cat} onClick={()=>setCategoryFilter(cat)} className={categoryFilter===cat?'chip chip-active':'chip chip-inactive'}>
                    {cat==='all'?'All':cat==='income'?'📈 Income':cat==='expense'?'💸 Expense':`${getCatStyle(cat).emoji} ${cat}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary strip */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
              {[
                { label:'Total Entries', val:filtered.length, color:'var(--on-surface)' },
                { label:'Total Spend',   val:`${CUR}${fmtINR(filtered.filter(i=>!i.isIncome).reduce((s,i)=>s+Number(i.amount),0))}`, color:'var(--expense)' },
                { label:'Total Income',  val:`${CUR}${fmtINR(filtered.filter(i=>i.isIncome).reduce((s,i)=>s+Number(i.amount),0))}`,  color:'var(--income)' },
              ].map(({label,val,color})=>(
                <div key={label} className="card" style={{ padding:'0.875rem', textAlign:'center' }}>
                  <div style={{ fontSize:'0.6875rem', fontWeight:600, color:'var(--on-surface-variant)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{label}</div>
                  <div style={{ fontSize:'1rem', fontWeight:700, color }}>{val}</div>
                </div>
              ))}
            </div>

            <TxList data={filtered} />
          </div>
        )}

        {/* ══ STATS TAB ════════════════════════════════ */}
        {activeTab === 'stats' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* ── Header + Period Selector ── */}
            <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
              <h2 style={{ fontSize:'1.375rem', fontWeight:700, margin:0, color:'var(--on-surface)', letterSpacing:'-0.02em' }}>Analytics</h2>

              {/* Period pill buttons */}
              <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                {[{id:'today',label:'Today'},{id:'week',label:'Week'},{id:'month',label:'Month'},{id:'year',label:'Year'}].map(p=>(
                  <button
                    key={p.id}
                    onClick={()=>{ setStatsPeriod(p.id); if(p.id==='month') setShowMonthGrid(g=>!g); else setShowMonthGrid(false); }}
                    style={{
                      height:34, padding:'0 14px', borderRadius:9999,
                      border:'1.5px solid',
                      borderColor: statsPeriod===p.id ? 'var(--primary)' : 'var(--outline-light)',
                      background: statsPeriod===p.id ? 'var(--primary)' : 'var(--surface-mid)',
                      color: statsPeriod===p.id ? 'white' : 'var(--on-surface-variant)',
                      fontWeight:700, fontSize:'0.8125rem', cursor:'pointer', fontFamily:'inherit',
                      transition:'all 0.18s',
                    }}
                  >
                    {p.label}{p.id==='month' && statsPeriod==='month' ? ` ▾` : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Month picker grid (shows when period='month') ── */}
            {statsPeriod === 'month' && showMonthGrid && (
              <div className="card" style={{ padding:'1rem' }}>
                {/* Year selector */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                  <button onClick={()=>setStatsYear(y=>y-1)} style={{ width:30, height:30, borderRadius:9999, border:'1px solid var(--outline-light)', background:'var(--surface-high)', cursor:'pointer', fontSize:14, color:'var(--on-surface)' }}>‹</button>
                  <span style={{ fontWeight:700, fontSize:'0.9375rem', color:'var(--on-surface)' }}>{statsYear}</span>
                  <button onClick={()=>setStatsYear(y=>y+1)} style={{ width:30, height:30, borderRadius:9999, border:'1px solid var(--outline-light)', background:'var(--surface-high)', cursor:'pointer', fontSize:14, color:'var(--on-surface)', opacity:statsYear>=new Date().getFullYear()?0.4:1 }} disabled={statsYear>=new Date().getFullYear()}>›</button>
                </div>
                {/* Month grid */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                  {MONTH_NAMES.map((m,i)=>{
                    const isFuture = statsYear===new Date().getFullYear() && i>new Date().getMonth();
                    return (
                      <button
                        key={m}
                        onClick={()=>{ if(!isFuture){setStatsMonth(i); setShowMonthGrid(false); } }}
                        disabled={isFuture}
                        style={{
                          height:38, borderRadius:10,
                          background: statsMonth===i ? 'var(--primary)' : 'var(--surface-high)',
                          color: isFuture ? 'var(--outline)' : statsMonth===i ? 'white' : 'var(--on-surface)',
                          border:'none', cursor:isFuture?'default':'pointer',
                          fontWeight: statsMonth===i ? 700 : 500,
                          fontSize:'0.8125rem', fontFamily:'inherit',
                          transition:'all 0.15s',
                        }}
                      >
                        {m.slice(0,3)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Active period label ── */}
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ height:1, flex:1, background:'var(--outline-light)' }}/>
              <span style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--on-surface-variant)', letterSpacing:'0.08em', textTransform:'uppercase' }}>{periodLabel}</span>
              <div style={{ height:1, flex:1, background:'var(--outline-light)' }}/>
            </div>

            {/* ── KPI summary row ── */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
              {[
                { label:'Income',   val:statsIncome,   color:'var(--income)',  bg:'#e8f5e9', emoji:'📈' },
                { label:'Expenses', val:statsExpenses, color:'var(--expense)', bg:'#fce4ec', emoji:'💸' },
                { label:statsBalance>=0?'Saved':'Deficit', val:Math.abs(statsBalance), color:statsBalance>=0?'var(--income)':'var(--expense)', bg:statsBalance>=0?'#e8f5e9':'#fce4ec', emoji:statsBalance>=0?'💰':'⚠️' },
              ].map(({label,val,color,bg,emoji})=>(
                <div key={label} className="card" style={{ padding:'0.875rem', textAlign:'center' }}>
                  <div style={{ width:34, height:34, borderRadius:10, background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, margin:'0 auto 8px' }}>{emoji}</div>
                  <div style={{ fontSize:'0.6875rem', fontWeight:700, color:'var(--on-surface-variant)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{label}</div>
                  <div style={{ fontSize:'1rem', fontWeight:800, color, letterSpacing:'-0.01em' }}>{CUR}{fmtINR(val)}</div>
                </div>
              ))}
            </div>

            {/* ── Row 1: Donut + Category legend ── */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:16 }}>

              {/* Donut chart */}
              <div className="card">
                <h3 style={{ fontSize:'0.9375rem', fontWeight:700, margin:'0 0 16px', color:'var(--on-surface)', letterSpacing:'-0.01em' }}>Spending by Category</h3>
                {statsDonutSegments.length > 0 ? (
                  <>
                    <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
                      <svg viewBox="0 0 120 120" style={{ width:160, height:160 }}>
                        {statsDonutSegments.map(seg => (
                          <path
                            key={seg.cat}
                            d={arcPath(60,60,44,seg.startDeg,Math.min(seg.endDeg,seg.startDeg+359.99))}
                            fill="none" stroke={seg.color} strokeWidth="16" strokeLinecap="round"
                          />
                        ))}
                        <text x="60" y="54" textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--on-surface-variant)">EXPENSES</text>
                        <text x="60" y="66" textAnchor="middle" fontSize="9" fontWeight="800" fill="var(--on-surface)">{CUR}{fmtINR(statsExpenses)}</text>
                      </svg>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                      {statsDonutSegments.map(seg=>(
                        <div key={seg.cat} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ width:10, height:10, borderRadius:3, background:seg.color, flexShrink:0 }}/>
                            <span style={{ fontSize:'0.8125rem', color:'var(--on-surface)', fontWeight:500 }}>{getCatStyle(seg.cat).emoji} {seg.cat}</span>
                          </div>
                          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                            <span style={{ fontSize:'0.75rem', color:'var(--on-surface-variant)' }}>{Math.round(seg.pct*100)}%</span>
                            <span style={{ fontSize:'0.8125rem', fontWeight:700, color:'var(--on-surface)' }}>{CUR}{fmtINR(seg.amt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign:'center', padding:'2.5rem', color:'var(--on-surface-variant)' }}>
                    <div style={{ fontSize:36, marginBottom:8 }}>📊</div>
                    <div style={{ fontSize:'0.875rem' }}>No expense data for {periodLabel}</div>
                  </div>
                )}
              </div>

              {/* Income vs Expense summary cards */}
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {[
                  { label:'Total Income',  amt:statsIncome,   color:'var(--income)',  bg:'#e8f5e9', emoji:'📈', pct:100 },
                  { label:'Total Expenses',amt:statsExpenses, color:'var(--expense)', bg:'#fce4ec', emoji:'💸', pct:statsIncome>0?Math.min(100,Math.round((statsExpenses/statsIncome)*100)):0 },
                  { label:statsBalance>=0?'Net Savings':'Deficit', amt:Math.abs(statsBalance), color:statsBalance>=0?'var(--income)':'var(--expense)', bg:statsBalance>=0?'#e8f5e9':'#fce4ec', emoji:statsBalance>=0?'💰':'⚠️', pct:statsIncome>0?Math.max(0,Math.round((statsBalance/statsIncome)*100)):0 },
                ].map(({label,amt,color,bg,emoji,pct})=>(
                  <div key={label} className="card" style={{ padding:'0.875rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                      <div>
                        <div style={{ fontSize:'0.6875rem', fontWeight:700, color:'var(--on-surface-variant)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 }}>{label}</div>
                        <div style={{ fontSize:'1.25rem', fontWeight:700, color, letterSpacing:'-0.02em' }}>{CUR}{fmtINR(amt)}</div>
                      </div>
                      <div style={{ width:36, height:36, borderRadius:10, background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>{emoji}</div>
                    </div>
                    <div style={{ height:4, borderRadius:9999, background:'var(--surface-high)' }}>
                      <div style={{ height:'100%', borderRadius:9999, background:color, width:`${Math.min(100,Math.abs(pct))}%`, transition:'width 0.5s' }}/>
                    </div>
                    <div style={{ fontSize:'0.6875rem', color:'var(--on-surface-variant)', marginTop:4, fontWeight:500 }}>
                      {label==='Total Income' ? 'Total received' : label==='Total Expenses' ? `${pct}% of income` : `${Math.abs(pct)}% of income`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Row 2: Income vs Expense bar chart ── */}
            <div className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <h3 style={{ fontSize:'0.9375rem', fontWeight:700, margin:0, color:'var(--on-surface)', letterSpacing:'-0.01em' }}>Income vs Expenses</h3>
                <div style={{ display:'flex', gap:14 }}>
                  {[['#0058be','Expenses'],['#30d158','Income']].map(([c,l])=>(
                    <div key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.75rem', color:'var(--on-surface-variant)', fontWeight:500 }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:c }}/>{l}
                    </div>
                  ))}
                </div>
              </div>
              {statsBarData.length > 0 ? (
                <svg viewBox={`0 0 320 100`} style={{ width:'100%', height:110 }}>
                  <defs>
                    <linearGradient id="sIncG" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#30d158" stopOpacity="0.9"/>
                      <stop offset="100%" stopColor="#30d158" stopOpacity="0.2"/>
                    </linearGradient>
                    <linearGradient id="sExpG" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#0058be" stopOpacity="0.9"/>
                      <stop offset="100%" stopColor="#0058be" stopOpacity="0.2"/>
                    </linearGradient>
                  </defs>
                  {[0,33,66].map(pct=>(
                    <line key={pct} x1="4" x2="316" y1={84-(pct*0.72)} y2={84-(pct*0.72)} stroke="var(--outline-light)" strokeWidth="0.5" strokeDasharray="3,3"/>
                  ))}
                  {statsBarData.map((b,i) => {
                    const n = statsBarData.length;
                    const totalW = 312, groupW = totalW/n, gap=Math.max(2,groupW*0.15), bw=(groupW-gap)/2-1;
                    const x = 4 + i*groupW + gap/2;
                    const hE=Math.round((b.expenses/maxStatsBar)*66);
                    const hI=Math.round((b.income/maxStatsBar)*66);
                    return (
                      <g key={i}>
                        <rect x={x}      y={84-hE} width={bw} height={Math.max(hE,2)} rx="3" fill="url(#sExpG)"/>
                        <rect x={x+bw+1} y={84-hI} width={bw} height={Math.max(hI,2)} rx="3" fill="url(#sIncG)"/>
                        <text x={x+bw} y="96" fontSize="7.5" fill="var(--on-surface-variant)" textAnchor="middle" fontWeight="600">{b.label}</text>
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <div style={{ textAlign:'center', padding:'2rem', color:'var(--on-surface-variant)', fontSize:'0.875rem' }}>No data for {periodLabel}</div>
              )}
            </div>

            {/* ── Row 3: Expense trend line chart ── */}
            <div className="card">
              <h3 style={{ fontSize:'0.9375rem', fontWeight:700, margin:'0 0 4px', color:'var(--on-surface)', letterSpacing:'-0.01em' }}>Expense Trend</h3>
              <p style={{ fontSize:'0.8125rem', color:'var(--on-surface-variant)', margin:'0 0 14px' }}>{periodLabel} — spending pattern</p>
              {(() => {
                const pts = statsBarData.map((b,i)=>({ x:i, y:b.expenses }));
                if (pts.length < 2) return (
                  <div style={{ textAlign:'center', padding:'1.5rem', color:'var(--on-surface-variant)', fontSize:'0.875rem' }}>Not enough data points</div>
                );
                const maxV = Math.max(1,...pts.map(p=>p.y));
                const W=320, H=72, padX=8, padY=8;
                const mapped = pts.map(p=>({ x: padX + (p.x/(pts.length-1))*(W-padX*2), y: H-padY - (p.y/maxV)*(H-padY*2) }));
                const linePath = mapped.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
                const fillPath = `${linePath} L${mapped[mapped.length-1].x.toFixed(1)},${H} L${mapped[0].x.toFixed(1)},${H} Z`;
                return (
                  <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:84 }}>
                    <defs>
                      <linearGradient id="trendG" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#0058be" stopOpacity="0.15"/>
                        <stop offset="100%" stopColor="#0058be" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <path d={fillPath} fill="url(#trendG)"/>
                    <path d={linePath} fill="none" stroke="#0058be" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    {mapped.map((p,i)=> pts[i].y>0 && (
                      <g key={i}>
                        <circle cx={p.x} cy={p.y} r="3.5" fill="#0058be"/>
                        <circle cx={p.x} cy={p.y} r="1.5" fill="white"/>
                      </g>
                    ))}
                  </svg>
                );
              })()}
            </div>
          </div>
        )}

        {/* ══ PROFILE TAB ══════════════════════════════ */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth:440, margin:'0 auto' }}>
            {/* User card */}
            <div className="card" style={{ textAlign:'center', paddingTop:32, paddingBottom:28, marginBottom:16 }}>
              <div style={{ width:72, height:72, borderRadius:9999, background:'linear-gradient(135deg,var(--primary),var(--primary-light))', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', fontSize:28 }}>
                👤
              </div>
              <h2 style={{ fontSize:'1.25rem', fontWeight:700, margin:'0 0 4px', color:'var(--on-surface)', letterSpacing:'-0.01em' }}>
                {currentUser?.displayName || 'User'}
              </h2>
              <div style={{ fontSize:'0.875rem', color:'var(--on-surface-variant)' }}>{currentUser?.email}</div>
            </div>

            {/* Monthly goal */}
            <div className="card" style={{ marginBottom:12 }}>
              <div style={{ fontSize:'0.6875rem', fontWeight:700, color:'var(--on-surface-variant)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Monthly Budget</div>
              <div style={{ fontSize:'1.375rem', fontWeight:700, color:'var(--primary)', letterSpacing:'-0.02em', marginBottom:4 }}>
                {CUR}{fmtINR(totalExpenses)}
                <span style={{ fontSize:'0.875rem', color:'var(--on-surface-variant)', fontWeight:500 }}> spent this month</span>
              </div>
              <div style={{ height:6, borderRadius:9999, background:'var(--surface-high)', overflow:'hidden', marginBottom:6 }}>
                <div style={{ height:'100%', borderRadius:9999, background:'linear-gradient(90deg,var(--primary),var(--primary-light))', width:`${Math.min(100,totalIncome>0?Math.round((totalExpenses/totalIncome)*100):0)}%` }}/>
              </div>
              <div style={{ fontSize:'0.8125rem', color:'var(--on-surface-variant)' }}>
                {CUR}{fmtINR(Math.max(0,totalIncome-totalExpenses))} remaining of {CUR}{fmtINR(totalIncome)} income
              </div>
            </div>

            {/* Preferences */}
            <div className="card" style={{ marginBottom:12 }}>
              <div style={{ fontSize:'0.6875rem', fontWeight:700, color:'var(--on-surface-variant)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Preferences</div>
              {[
                { emoji:'🌙', label:'Dark Mode', action:()=>setIsDark(d=>!d), right:isDark?'On':'Off' },
                { emoji:'💱', label:'Currency', right:'₹ INR' },
              ].map(({emoji,label,action,right})=>(
                <button key={label} onClick={action||undefined} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding:'12px 4px', border:'none', background:'none', cursor:action?'pointer':'default', borderBottom:'1px solid var(--outline-light)', color:'var(--on-surface)' }}>
                  <span style={{ display:'flex', alignItems:'center', gap:10, fontSize:'0.9375rem', fontWeight:500 }}>
                    <span style={{ width:32, height:32, borderRadius:9, background:'var(--surface-mid)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>{emoji}</span>
                    {label}
                  </span>
                  <span style={{ fontSize:'0.875rem', color:'var(--on-surface-variant)', fontWeight:500 }}>{right} ›</span>
                </button>
              ))}
            </div>

            {/* Account */}
            <div className="card" style={{ marginBottom:12 }}>
              <div style={{ fontSize:'0.6875rem', fontWeight:700, color:'var(--on-surface-variant)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Account & Data</div>
              {[
                { emoji:'📤', label:'Export Data', action:()=>exportCSV(items) },
              ].map(({emoji,label,action})=>(
                <button key={label} onClick={action} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding:'12px 4px', border:'none', background:'none', cursor:'pointer', borderBottom:'1px solid var(--outline-light)', color:'var(--on-surface)' }}>
                  <span style={{ display:'flex', alignItems:'center', gap:10, fontSize:'0.9375rem', fontWeight:500 }}>
                    <span style={{ width:32, height:32, borderRadius:9, background:'var(--surface-mid)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>{emoji}</span>
                    {label}
                  </span>
                  <span style={{ fontSize:'0.875rem', color:'var(--on-surface-variant)' }}>›</span>
                </button>
              ))}
              <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding:'12px 4px', border:'none', background:'none', cursor:'pointer', color:'var(--expense)' }}>
                <span style={{ display:'flex', alignItems:'center', gap:10, fontSize:'0.9375rem', fontWeight:700 }}>
                  <span style={{ width:32, height:32, borderRadius:9, background:'#ffdad6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>🚪</span>
                  Log Out
                </span>
                <span style={{ fontSize:'0.875rem' }}>›</span>
              </button>
            </div>

            <div style={{ textAlign:'center', fontSize:'0.75rem', color:'var(--on-surface-variant)', opacity:0.6, paddingBottom:8 }}>
              Trackify · Version 2.4.0
            </div>
          </div>
        )}

      </main>

      {/* ── Bottom Navigation (mobile) ─ NO FAB ──────── */}
      <nav className="bottom-nav sm:hidden">
        {NAV_TABS.map(tab => (
          <button key={tab.id} className={`nav-item ${activeTab===tab.id?'active':''}`} onClick={()=>setActiveTab(tab.id)}>
            {tab.icon(activeTab===tab.id)}
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ── Desktop tab bar ─────────────────────────── */}
      <div className="hidden sm:flex" style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:30,
        background:'rgba(245,245,247,0.9)', backdropFilter:'blur(20px)',
        borderTop:'1px solid var(--outline-light)',
        justifyContent:'center', gap:4, padding:'8px 16px',
      }}>
        {NAV_TABS.map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
            display:'flex', alignItems:'center', gap:6,
            padding:'8px 20px', borderRadius:10,
            border:'none', background:activeTab===tab.id?'var(--surface-mid)':'transparent',
            cursor:'pointer', color:activeTab===tab.id?'var(--primary)':'var(--on-surface-variant)',
            fontSize:'0.875rem', fontWeight:activeTab===tab.id?700:500, fontFamily:'inherit',
            transition:'all 0.15s',
          }}>
            {tab.icon(activeTab===tab.id)}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Add / Edit Bottom Sheet ──────────────────── */}
      {showAddSheet && (
        <>
          <div className="bottom-sheet-overlay" onClick={()=>{setShowAddSheet(false);setEditingId(null);}}/>
          <div className="bottom-sheet">
            {/* Handle */}
            <div style={{ width:38, height:4, borderRadius:9999, background:'var(--outline-light)', margin:'0 auto 18px' }}/>

            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <h2 style={{ fontSize:'1.25rem', fontWeight:700, margin:0, color:'var(--on-surface)', letterSpacing:'-0.015em' }}>
                {editingId?'Edit Entry': addingIncome?'Add Income':'Add Expense'}
              </h2>
              <button onClick={()=>{setShowAddSheet(false);setEditingId(null);}}
                style={{ width:30, height:30, borderRadius:9999, background:'var(--surface-high)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:'var(--on-surface-variant)' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {/* Amount */}
              <div style={{ background:'var(--surface-low)', borderRadius:18, padding:'16px 20px', textAlign:'center', border:'1px solid var(--outline-light)' }}>
                <div style={{ fontSize:'0.6875rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--on-surface-variant)', marginBottom:8 }}>Total Amount</div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  <span style={{ fontSize:'2rem', fontWeight:700, color:'var(--primary)', opacity:0.5 }}>{CUR}</span>
                  <input type="number" step="0.01" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="0.00" required
                    style={{ fontSize:'2rem', fontWeight:700, color:'var(--primary)', background:'transparent', border:'none', outline:'none', width:'55%', textAlign:'center', fontFamily:'inherit' }}/>
                </div>
              </div>

              {/* Expense / Income toggle */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[
                  { label:'💸 Expense', isIncome:false, style:'background:linear-gradient(135deg,#0058be,#2170e4)' },
                  { label:'📈 Income',  isIncome:true,  style:'background:linear-gradient(135deg,#1a8a52,#30d158)' },
                ].map(o=>(
                  <button key={o.label} type="button" onClick={()=>setForm(f=>({...f,isIncome:o.isIncome,type:o.isIncome?'Income':''}))}
                    style={{ height:40, borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, fontSize:'0.875rem', fontFamily:'inherit',
                      ...(form.isIncome===o.isIncome ? { background: o.isIncome?'linear-gradient(135deg,#1a8a52,#30d158)':'linear-gradient(135deg,#0058be,#2170e4)', color:'white' }
                        : { background:'var(--surface-high)', color:'var(--on-surface-variant)' }),
                    }}>
                    {o.label}
                  </button>
                ))}
              </div>

              {/* Category chips */}
              {!form.isIncome && (
                <div>
                  <div style={{ fontSize:'0.8125rem', fontWeight:700, color:'var(--on-surface)', marginBottom:8 }}>Category</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {Object.entries(CATEGORIES).map(([cat,cs])=>(
                      <button key={cat} type="button" onClick={()=>setForm(f=>({...f,type:cat}))}
                        style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'6px 12px', borderRadius:9999, fontWeight:700, fontSize:'0.75rem', cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s',
                          background:form.type===cat?cs.bg:'var(--surface-high)',
                          color:form.type===cat?cs.color:'var(--on-surface-variant)',
                          border:form.type===cat?`1.5px solid ${cs.color}`:'1.5px solid transparent',
                        }}>
                        {cs.emoji} {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes + Date */}
              <div>
                <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:700, color:'var(--on-surface)', marginBottom:6 }}>Notes <span style={{ color:'var(--on-surface-variant)', fontWeight:400 }}>(optional)</span></label>
                <textarea className="textarea-trackify" rows={2} value={form.remarks} onChange={e=>setForm(f=>({...f,remarks:e.target.value}))} placeholder="Add some context…"/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:700, color:'var(--on-surface)', marginBottom:6 }}>Date</label>
                <input type="date" className="input-trackify" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} required/>
              </div>

              {/* Submit */}
              <button type="submit" className={form.isIncome?'btn-income':'btn-primary'} style={{ marginTop:4 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {editingId?'Update Entry':form.isIncome?'Save Income':'Save Expense'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
