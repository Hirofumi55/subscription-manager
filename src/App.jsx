import { useState, useEffect, useMemo, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Search, X, Settings, Moon, Sun, Download, Upload, Trash2, ChevronDown, ArrowUpDown, Filter, Calendar, Monitor } from 'lucide-react';
import { PRESET_SERVICES, CATEGORIES, CATEGORY_COLORS } from './data/presets';

// ==================== Utilities ====================
const formatCurrency = (amount) => new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(amount);
const generateId = () => crypto.randomUUID();
const getToday = () => new Date().toISOString().split('T')[0];

const calcNextBillingDate = (startDate, billingCycle) => {
    const start = new Date(startDate);
    const now = new Date();
    let next = new Date(start);
    if (billingCycle === 'monthly') {
        while (next <= now) next.setMonth(next.getMonth() + 1);
    } else {
        while (next <= now) next.setFullYear(next.getFullYear() + 1);
    }
    return next.toISOString().split('T')[0];
};

const loadFromStorage = (key, fallback) => {
    try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; } catch { return fallback; }
};
const saveToStorage = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.error('Save failed:', e); }
};
const getMonthlyAmount = (s) => !s.isActive ? 0 : s.billingCycle === 'yearly' ? s.amount / 12 : s.amount;
const getYearlyAmount = (s) => !s.isActive ? 0 : s.billingCycle === 'monthly' ? s.amount * 12 : s.amount;

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
};

const getDaysUntil = (dateStr) => {
    return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
};

// ==================== Hooks ====================
const useTheme = () => {
    const [theme, setTheme] = useState(() => loadFromStorage('app_settings_v1', { theme: 'dark' }).theme || 'dark');
    useEffect(() => {
        const root = document.documentElement;
        let isDark = theme === 'system' ? window.matchMedia('(prefers-color-scheme: dark)').matches : theme === 'dark';
        root.classList.toggle('light', !isDark);
        root.classList.toggle('dark', isDark);
        saveToStorage('app_settings_v1', { theme });
    }, [theme]);
    return [theme, setTheme];
};

const useSubscriptions = () => {
    const [subs, setSubs] = useState(() => loadFromStorage('subscriptions_v1', []));
    useEffect(() => { saveToStorage('subscriptions_v1', subs); }, [subs]);
    const addSub = useCallback((sub) => {
        const now = new Date().toISOString();
        setSubs(prev => [...prev, { ...sub, id: generateId(), createdAt: now, updatedAt: now, isActive: true }]);
    }, []);
    const updateSub = useCallback((id, updates) => {
        setSubs(prev => prev.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s));
    }, []);
    const deleteSub = useCallback((id) => setSubs(prev => prev.filter(s => s.id !== id)), []);
    const importSubs = useCallback((data) => setSubs(data), []);
    const resetAll = useCallback(() => setSubs([]), []);
    return { subs, addSub, updateSub, deleteSub, importSubs, resetAll };
};

// ==================== Summary Cards ====================
function SummaryCards({ subs, isDark }) {
    const activeSubs = subs.filter(s => s.isActive);
    const monthlyTotal = activeSubs.reduce((sum, s) => sum + getMonthlyAmount(s), 0);
    const yearlyTotal = activeSubs.reduce((sum, s) => sum + getYearlyAmount(s), 0);

    const cards = [
        {
            label: '月額合計', value: formatCurrency(Math.round(monthlyTotal)),
            gradient: 'from-[#5b8def]/20 via-[#5b8def]/5 to-transparent',
            glow: 'glow-blue', accent: 'text-[#5b8def]', icon: '💰',
            ring: 'ring-[#5b8def]/10'
        },
        {
            label: '年額合計', value: formatCurrency(Math.round(yearlyTotal)),
            gradient: 'from-[#9b7bf7]/20 via-[#9b7bf7]/5 to-transparent',
            glow: 'glow-purple', accent: 'text-[#9b7bf7]', icon: '📊',
            ring: 'ring-[#9b7bf7]/10'
        },
        {
            label: '有効サービス', value: `${activeSubs.length}`, unit: '件',
            sub: `全 ${subs.length} 件中`,
            gradient: 'from-[#36d9a0]/20 via-[#36d9a0]/5 to-transparent',
            glow: 'glow-green', accent: 'text-[#36d9a0]', icon: '✅',
            ring: 'ring-[#36d9a0]/10'
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            {cards.map((c, i) => (
                <div key={i}
                    className={`group relative overflow-hidden rounded-2xl p-5 sm:p-6 glass-card gradient-border 
            ${c.glow} ring-1 ${c.ring}
            transition-all duration-500 hover:-translate-y-1 hover:shadow-xl cursor-default`}
                    style={{ animationDelay: `${i * 80}ms` }}
                >
                    <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <span className={`text-xs font-medium tracking-wide uppercase ${isDark ? 'text-text-secondary' : 'text-text-secondary-light'}`}>{c.label}</span>
                            <span className="text-lg opacity-80 group-hover:scale-110 transition-transform duration-300">{c.icon}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-2xl sm:text-3xl price-display ${c.accent}`}>{c.value}</span>
                            {c.unit && <span className={`text-sm font-medium ${isDark ? 'text-text-secondary' : 'text-text-secondary-light'}`}>{c.unit}</span>}
                        </div>
                        {c.sub && <span className={`text-[11px] mt-1 block ${isDark ? 'text-text-muted' : 'text-text-muted-light'}`}>{c.sub}</span>}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ==================== Category Chart ====================
function CategoryChart({ subs, isDark }) {
    const data = useMemo(() => {
        const catMap = {};
        subs.filter(s => s.isActive).forEach(s => {
            const cat = s.category || 'その他';
            catMap[cat] = (catMap[cat] || 0) + getMonthlyAmount(s);
        });
        return Object.entries(catMap).map(([name, value]) => ({ name, value: Math.round(value) })).sort((a, b) => b.value - a.value);
    }, [subs]);

    if (data.length === 0) return null;

    const total = data.reduce((s, d) => s + d.value, 0);

    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload?.length) return null;
        const pct = ((payload[0].value / total) * 100).toFixed(1);
        return (
            <div className={`px-3 py-2 rounded-xl text-xs shadow-2xl backdrop-blur-xl ${isDark ? 'bg-bg-card/95 border border-border text-text-primary' : 'bg-bg-card-light/95 border border-border-light text-text-primary-light'}`}>
                <p className="font-semibold">{payload[0].name}</p>
                <p className="tabular-nums mt-0.5">{formatCurrency(payload[0].value)}/月 <span className={isDark ? 'text-text-muted' : 'text-text-muted-light'}>({pct}%)</span></p>
            </div>
        );
    };

    return (
        <div className={`rounded-2xl p-5 sm:p-6 glass-card gradient-border mb-6 ring-1 ${isDark ? 'ring-border/50' : 'ring-border-light/50'}`}>
            <h2 className={`text-sm font-semibold tracking-wide uppercase mb-5 ${isDark ? 'text-text-secondary' : 'text-text-secondary-light'}`}>カテゴリ別支出</h2>
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative w-44 h-44 flex-shrink-0">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value" stroke="none" cornerRadius={4}>
                                {data.map((entry, i) => (<Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#6b7280'} />))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className={`text-[10px] ${isDark ? 'text-text-muted' : 'text-text-muted-light'}`}>月額合計</span>
                        <span className={`text-sm font-bold price-display ${isDark ? 'text-text-primary' : 'text-text-primary-light'}`}>{formatCurrency(total)}</span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center md:justify-start flex-1">
                    {data.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs group/item">
                            <span className="w-2 h-2 rounded-full flex-shrink-0 ring-2 ring-offset-1 transition-transform group-hover/item:scale-125"
                                style={{ backgroundColor: CATEGORY_COLORS[d.name] || '#6b7280', ringColor: CATEGORY_COLORS[d.name] || '#6b7280', ['--tw-ring-offset-color']: isDark ? '#131320' : '#ffffff' }} />
                            <span className={`${isDark ? 'text-text-secondary' : 'text-text-secondary-light'} group-hover/item:text-text-primary transition-colors`}>{d.name}</span>
                            <span className={`tabular-nums font-semibold ${isDark ? 'text-text-primary' : 'text-text-primary-light'}`}>{formatCurrency(d.value)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ==================== Subscription Card ====================
function SubCard({ sub, isDark, onClick }) {
    const daysUntil = getDaysUntil(sub.nextBillingDate);
    const urgent = daysUntil <= 3 && daysUntil >= 0;
    const monthlyEquiv = sub.billingCycle === 'yearly' ? Math.round(sub.amount / 12) : sub.amount;

    return (
        <div onClick={() => onClick(sub)}
            className={`group relative overflow-hidden rounded-2xl p-4 sm:p-5 cursor-pointer
        transition-all duration-400 hover:-translate-y-1.5 hover:shadow-2xl
        glass-card ring-1 animate-fade-in-up
        ${isDark ? 'ring-border/40 hover:ring-border' : 'ring-border-light/40 hover:ring-border-light'}
        ${!sub.isActive ? 'opacity-50 grayscale-[30%]' : ''}`}
        >
            {/* Hover glow */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${sub.isActive ? 'from-accent-blue/5 to-transparent' : 'from-accent-red/5 to-transparent'}`} />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300">{sub.icon}</span>
                        <div>
                            <h3 className={`font-semibold text-sm leading-tight ${isDark ? 'text-text-primary' : 'text-text-primary-light'}`}>{sub.name}</h3>
                            {sub.plan && <p className={`text-[11px] mt-0.5 ${isDark ? 'text-text-muted' : 'text-text-muted-light'}`}>{sub.plan}</p>}
                        </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase
            ${sub.isActive
                            ? 'bg-accent-green/10 text-accent-green ring-1 ring-accent-green/20'
                            : 'bg-accent-red/10 text-accent-red ring-1 ring-accent-red/20'}`}>
                        {sub.isActive ? '有効' : '停止'}
                    </span>
                </div>

                {/* Price & Next Billing */}
                <div className="flex items-end justify-between">
                    <div>
                        <span className={`text-xl sm:text-2xl price-display ${isDark ? 'text-text-primary' : 'text-text-primary-light'}`}>{formatCurrency(sub.amount)}</span>
                        <span className={`text-[11px] ml-1 ${isDark ? 'text-text-muted' : 'text-text-muted-light'}`}>/{sub.billingCycle === 'monthly' ? '月' : '年'}</span>
                        {sub.billingCycle === 'yearly' && (
                            <p className={`text-[10px] mt-0.5 ${isDark ? 'text-text-muted' : 'text-text-muted-light'}`}>月額換算 {formatCurrency(monthlyEquiv)}</p>
                        )}
                    </div>
                    <div className={`text-[11px] flex items-center gap-1 px-2 py-1 rounded-lg
            ${urgent
                            ? 'bg-accent-amber/10 text-accent-amber ring-1 ring-accent-amber/20 font-medium'
                            : isDark
                                ? 'text-text-muted bg-bg-input/50'
                                : 'text-text-muted-light bg-bg-input-light/50'}`}>
                        <Calendar size={10} />
                        <span className="tabular-nums">{formatDate(sub.nextBillingDate)}</span>
                        {urgent && <span className="text-[9px]">({daysUntil}日後)</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==================== Input Component ====================
function Input({ label, isDark, className = '', ...props }) {
    return (
        <div>
            {label && <label className={`block text-[11px] font-semibold mb-1.5 tracking-wide uppercase ${isDark ? 'text-text-secondary' : 'text-text-secondary-light'}`}>{label}</label>}
            <input {...props} className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200
        ${isDark ? 'bg-bg-input border border-border text-text-primary placeholder:text-text-muted focus:border-accent-blue/50' : 'bg-bg-input-light border border-border-light text-text-primary-light placeholder:text-text-muted-light focus:border-accent-blue/50'}
        ${className}`} />
        </div>
    );
}

function Select({ label, isDark, children, ...props }) {
    return (
        <div>
            {label && <label className={`block text-[11px] font-semibold mb-1.5 tracking-wide uppercase ${isDark ? 'text-text-secondary' : 'text-text-secondary-light'}`}>{label}</label>}
            <select {...props} className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 appearance-none
        ${isDark ? 'bg-bg-input border border-border text-text-primary focus:border-accent-blue/50' : 'bg-bg-input-light border border-border-light text-text-primary-light focus:border-accent-blue/50'}`}>
                {children}
            </select>
        </div>
    );
}

// ==================== Modal Shell ====================
function ModalShell({ isOpen, onClose, title, isDark, children, maxW = 'max-w-lg' }) {
    useEffect(() => {
        if (!isOpen) return;
        const h = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', h);
        document.body.style.overflow = 'hidden';
        return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
    }, [isOpen, onClose]);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="absolute inset-0 modal-overlay" />
            <div className={`relative w-full ${maxW} max-h-[90vh] sm:max-h-[85vh] overflow-y-auto 
        rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-scale-in
        ${isDark ? 'bg-bg-secondary border border-border/50' : 'bg-bg-card-light border border-border-light/50'}
        ring-1 ${isDark ? 'ring-white/[0.03]' : 'ring-black/[0.03]'}`}
                onClick={e => e.stopPropagation()}>
                {/* Handle bar for mobile */}
                <div className="sm:hidden flex justify-center mb-4">
                    <div className={`w-10 h-1 rounded-full ${isDark ? 'bg-border' : 'bg-border-light'}`} />
                </div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-lg font-bold font-[Outfit] tracking-tight ${isDark ? 'text-text-primary' : 'text-text-primary-light'}`}>{title}</h2>
                    <button onClick={onClose} className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 ${isDark ? 'hover:bg-bg-card text-text-muted hover:text-text-primary' : 'hover:bg-bg-secondary-light text-text-muted-light hover:text-text-primary-light'}`}>
                        <X size={16} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

// ==================== Add Modal ====================
function AddModal({ isOpen, onClose, onAdd, isDark }) {
    const [step, setStep] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedCat, setSelectedCat] = useState('すべて');
    const [form, setForm] = useState({ serviceId: null, name: '', icon: '📦', category: '', plan: '', amount: 0, billingCycle: 'monthly', startDate: getToday(), nextBillingDate: '', note: '' });

    useEffect(() => { if (isOpen) { setStep(1); setSearch(''); setSelectedCat('すべて'); } }, [isOpen]);

    const filtered = useMemo(() => {
        let list = PRESET_SERVICES;
        if (selectedCat !== 'すべて') list = list.filter(s => s.category === selectedCat);
        if (search) list = list.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.category.includes(search));
        return list;
    }, [search, selectedCat]);

    const selectPreset = (preset) => {
        setForm({ serviceId: preset.id, name: preset.name, icon: preset.icon, category: preset.category, plan: preset.plan, amount: preset.defaultAmount, billingCycle: 'monthly', startDate: getToday(), nextBillingDate: calcNextBillingDate(getToday(), 'monthly'), note: '' });
        setStep(2);
    };

    const selectCustom = () => {
        setForm({ serviceId: null, name: '', icon: '📦', category: '', plan: '', amount: 0, billingCycle: 'monthly', startDate: getToday(), nextBillingDate: calcNextBillingDate(getToday(), 'monthly'), note: '' });
        setStep(2);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name || !form.amount) return;
        onAdd({ ...form, nextBillingDate: form.nextBillingDate || calcNextBillingDate(form.startDate, form.billingCycle) });
        onClose();
    };

    const updateField = (field, value) => {
        setForm(prev => {
            const u = { ...prev, [field]: value };
            if (field === 'startDate' || field === 'billingCycle') u.nextBillingDate = calcNextBillingDate(u.startDate, u.billingCycle);
            return u;
        });
    };

    return (
        <ModalShell isOpen={isOpen} onClose={onClose} title={step === 1 ? 'サービスを選択' : 'サブスクを追加'} isDark={isDark}>
            {step === 1 ? (
                <>
                    {/* Search */}
                    <div className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 mb-4 transition-all duration-200 ring-1
            ${isDark ? 'bg-bg-input ring-border focus-within:ring-accent-blue/40' : 'bg-bg-input-light ring-border-light focus-within:ring-accent-blue/40'}`}>
                        <Search size={15} className={isDark ? 'text-text-muted' : 'text-text-muted-light'} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="サービス名で検索..."
                            className={`w-full bg-transparent outline-none text-sm ${isDark ? 'text-text-primary placeholder:text-text-muted' : 'text-text-primary-light placeholder:text-text-muted-light'}`} />
                        {search && <button onClick={() => setSearch('')} className="text-text-muted hover:text-text-primary"><X size={14} /></button>}
                    </div>

                    {/* Category tabs */}
                    <div className="flex gap-1.5 overflow-x-auto pb-3 mb-3 scrollbar-none">
                        {['すべて', ...CATEGORIES].map(cat => (
                            <button key={cat} onClick={() => setSelectedCat(cat)}
                                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200
                  ${selectedCat === cat
                                        ? 'btn-primary text-white shadow-md'
                                        : isDark ? 'bg-bg-input text-text-muted hover:text-text-secondary ring-1 ring-border/50' : 'bg-bg-input-light text-text-muted-light hover:text-text-secondary-light ring-1 ring-border-light/50'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Preset grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto mb-5 pr-1">
                        {filtered.map(s => (
                            <button key={s.id} onClick={() => selectPreset(s)}
                                className={`flex items-center gap-2.5 p-3 rounded-xl text-left transition-all duration-200 group/preset ring-1
                  hover:-translate-y-0.5 hover:shadow-lg
                  ${isDark ? 'bg-bg-input/40 hover:bg-bg-card ring-border/30 hover:ring-border' : 'bg-bg-input-light/40 hover:bg-bg-card-light ring-border-light/30 hover:ring-border-light'}`}>
                                <span className="text-xl flex-shrink-0 group-hover/preset:scale-110 transition-transform">{s.icon}</span>
                                <div className="min-w-0">
                                    <p className={`text-xs font-semibold truncate ${isDark ? 'text-text-primary' : 'text-text-primary-light'}`}>{s.name}</p>
                                    <p className={`text-[10px] tabular-nums mt-0.5 ${isDark ? 'text-text-muted' : 'text-text-muted-light'}`}>{s.defaultAmount > 0 ? formatCurrency(s.defaultAmount) : '—'}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <button onClick={selectCustom}
                        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ring-1
              ${isDark ? 'bg-bg-input text-accent-blue ring-accent-blue/20 hover:ring-accent-blue/40 hover:bg-accent-blue/5' : 'bg-accent-blue/5 text-accent-blue ring-accent-blue/20 hover:ring-accent-blue/40'}`}>
                        ＋ カスタムで追加
                    </button>
                </>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!form.serviceId && (
                        <button type="button" onClick={() => setStep(1)}
                            className={`text-[11px] font-medium flex items-center gap-1 ${isDark ? 'text-text-muted' : 'text-text-muted-light'} hover:text-accent-blue transition-colors`}>
                            ← サービス選択に戻る
                        </button>
                    )}
                    <div className="grid grid-cols-[72px_1fr] gap-3">
                        <Input label="アイコン" isDark={isDark} value={form.icon} onChange={e => updateField('icon', e.target.value)} className="text-center text-xl !px-2" />
                        <Input label="サービス名 *" isDark={isDark} value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="例: Netflix" required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Select label="カテゴリ" isDark={isDark} value={form.category} onChange={e => updateField('category', e.target.value)}>
                            <option value="">選択してください</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            <option value="その他">その他</option>
                        </Select>
                        <Input label="プラン名" isDark={isDark} value={form.plan} onChange={e => updateField('plan', e.target.value)} placeholder="例: スタンダード" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="支払額（円）*" isDark={isDark} type="number" value={form.amount || ''} onChange={e => updateField('amount', Number(e.target.value))} placeholder="0" required min="0" />
                        <div>
                            <label className={`block text-[11px] font-semibold mb-1.5 tracking-wide uppercase ${isDark ? 'text-text-secondary' : 'text-text-secondary-light'}`}>請求サイクル</label>
                            <div className={`flex rounded-xl overflow-hidden ring-1 ${isDark ? 'ring-border' : 'ring-border-light'}`}>
                                {['monthly', 'yearly'].map(c => (
                                    <button key={c} type="button" onClick={() => updateField('billingCycle', c)}
                                        className={`flex-1 py-2.5 text-xs font-semibold transition-all duration-200
                      ${form.billingCycle === c ? 'btn-primary text-white' : isDark ? 'bg-bg-input text-text-muted' : 'bg-bg-input-light text-text-muted-light'}`}>
                                        {c === 'monthly' ? '月額' : '年額'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="利用開始日" isDark={isDark} type="date" value={form.startDate} onChange={e => updateField('startDate', e.target.value)} />
                        <Input label="次回請求日" isDark={isDark} type="date" value={form.nextBillingDate} onChange={e => updateField('nextBillingDate', e.target.value)} />
                    </div>
                    <div>
                        <label className={`block text-[11px] font-semibold mb-1.5 tracking-wide uppercase ${isDark ? 'text-text-secondary' : 'text-text-secondary-light'}`}>メモ</label>
                        <textarea value={form.note} onChange={e => updateField('note', e.target.value)} placeholder="メモ（任意）" rows={2}
                            className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 ${isDark ? 'bg-bg-input border border-border text-text-primary placeholder:text-text-muted' : 'bg-bg-input-light border border-border-light text-text-primary-light placeholder:text-text-muted-light'}`} />
                    </div>
                    <button type="submit" className="w-full py-3.5 rounded-xl text-sm font-bold btn-primary text-white mt-2">
                        追加する
                    </button>
                </form>
            )}
        </ModalShell>
    );
}

// ==================== Edit Modal ====================
function EditModal({ sub, isOpen, onClose, onUpdate, onDelete, isDark }) {
    const [form, setForm] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => { if (sub) { setForm({ ...sub }); setShowDeleteConfirm(false); } }, [sub]);

    const handleSubmit = (e) => { e.preventDefault(); onUpdate(sub.id, form); onClose(); };
    const handleDelete = () => { onDelete(sub.id); onClose(); };

    const updateField = (field, value) => {
        setForm(prev => {
            const u = { ...prev, [field]: value };
            if (field === 'startDate' || field === 'billingCycle') u.nextBillingDate = calcNextBillingDate(u.startDate, u.billingCycle);
            return u;
        });
    };

    if (!sub) return null;

    return (
        <ModalShell isOpen={isOpen} onClose={onClose} title="サブスクを編集" isDark={isDark}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-[72px_1fr] gap-3">
                    <Input label="アイコン" isDark={isDark} value={form.icon || ''} onChange={e => updateField('icon', e.target.value)} className="text-center text-xl !px-2" />
                    <Input label="サービス名" isDark={isDark} value={form.name || ''} onChange={e => updateField('name', e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Select label="カテゴリ" isDark={isDark} value={form.category || ''} onChange={e => updateField('category', e.target.value)}>
                        <option value="">選択</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        <option value="その他">その他</option>
                    </Select>
                    <Input label="プラン名" isDark={isDark} value={form.plan || ''} onChange={e => updateField('plan', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Input label="支払額（円）" isDark={isDark} type="number" value={form.amount || ''} onChange={e => updateField('amount', Number(e.target.value))} required min="0" />
                    <div>
                        <label className={`block text-[11px] font-semibold mb-1.5 tracking-wide uppercase ${isDark ? 'text-text-secondary' : 'text-text-secondary-light'}`}>請求サイクル</label>
                        <div className={`flex rounded-xl overflow-hidden ring-1 ${isDark ? 'ring-border' : 'ring-border-light'}`}>
                            {['monthly', 'yearly'].map(c => (
                                <button key={c} type="button" onClick={() => updateField('billingCycle', c)}
                                    className={`flex-1 py-2.5 text-xs font-semibold transition-all duration-200
                    ${form.billingCycle === c ? 'btn-primary text-white' : isDark ? 'bg-bg-input text-text-muted' : 'bg-bg-input-light text-text-muted-light'}`}>
                                    {c === 'monthly' ? '月額' : '年額'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Input label="利用開始日" isDark={isDark} type="date" value={form.startDate || ''} onChange={e => updateField('startDate', e.target.value)} />
                    <Input label="次回請求日" isDark={isDark} type="date" value={form.nextBillingDate || ''} onChange={e => updateField('nextBillingDate', e.target.value)} />
                </div>
                <div>
                    <label className={`block text-[11px] font-semibold mb-1.5 tracking-wide uppercase ${isDark ? 'text-text-secondary' : 'text-text-secondary-light'}`}>メモ</label>
                    <textarea value={form.note || ''} onChange={e => updateField('note', e.target.value)} rows={2}
                        className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 ${isDark ? 'bg-bg-input border border-border text-text-primary' : 'bg-bg-input-light border border-border-light text-text-primary-light'}`} />
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => { updateField('isActive', !form.isActive); }}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 ring-1
              ${form.isActive
                                ? 'bg-accent-amber/5 text-accent-amber ring-accent-amber/20 hover:ring-accent-amber/40'
                                : 'bg-accent-green/5 text-accent-green ring-accent-green/20 hover:ring-accent-green/40'}`}>
                        {form.isActive ? '停止にする' : '再開する'}
                    </button>
                    <button type="submit" className="flex-1 py-3 rounded-xl text-sm font-bold btn-primary text-white">
                        保存する
                    </button>
                </div>

                {/* Delete */}
                <div className={`pt-3 mt-1 border-t ${isDark ? 'border-border/30' : 'border-border-light/30'}`}>
                    {showDeleteConfirm ? (
                        <div className="flex items-center gap-3">
                            <span className={`text-xs flex-1 ${isDark ? 'text-text-muted' : 'text-text-muted-light'}`}>本当に削除しますか？</span>
                            <button type="button" onClick={handleDelete} className="px-4 py-2 rounded-xl text-xs font-bold bg-accent-red text-white hover:bg-accent-red/90 transition-all">削除</button>
                            <button type="button" onClick={() => setShowDeleteConfirm(false)} className={`px-4 py-2 rounded-xl text-xs ${isDark ? 'text-text-muted hover:text-text-secondary' : 'text-text-muted-light'}`}>キャンセル</button>
                        </div>
                    ) : (
                        <button type="button" onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-1.5 text-xs text-accent-red/70 hover:text-accent-red transition-colors">
                            <Trash2 size={13} /> このサブスクを削除
                        </button>
                    )}
                </div>
            </form>
        </ModalShell>
    );
}

// ==================== Settings Modal ====================
function SettingsModal({ isOpen, onClose, theme, setTheme, subs, onImport, onReset, isDark }) {
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    useEffect(() => { if (isOpen) setShowResetConfirm(false); }, [isOpen]);

    const handleExport = () => {
        const blob = new Blob([JSON.stringify(subs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `subscriptions_${new Date().toISOString().split('T')[0]}.json`; a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file'; input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    if (Array.isArray(data)) { onImport(data); alert('インポートが完了しました'); }
                    else alert('無効なデータ形式です');
                } catch { alert('JSONの読み込みに失敗しました'); }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const themeOptions = [
        { v: 'light', l: 'ライト', icon: <Sun size={13} /> },
        { v: 'dark', l: 'ダーク', icon: <Moon size={13} /> },
        { v: 'system', l: 'システム', icon: <Monitor size={13} /> },
    ];

    return (
        <ModalShell isOpen={isOpen} onClose={onClose} title="設定" isDark={isDark} maxW="max-w-sm">
            <div className="space-y-5">
                <div>
                    <label className={`block text-[11px] font-semibold mb-2.5 tracking-wide uppercase ${isDark ? 'text-text-secondary' : 'text-text-secondary-light'}`}>テーマ</label>
                    <div className={`flex rounded-xl overflow-hidden ring-1 ${isDark ? 'ring-border' : 'ring-border-light'}`}>
                        {themeOptions.map(t => (
                            <button key={t.v} onClick={() => setTheme(t.v)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all duration-200
                  ${theme === t.v ? 'btn-primary text-white' : isDark ? 'bg-bg-input text-text-muted' : 'bg-bg-input-light text-text-muted-light'}`}>
                                {t.icon}{t.l}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    {[{ fn: handleExport, icon: <Download size={15} />, label: 'データをエクスポート' },
                    { fn: handleImport, icon: <Upload size={15} />, label: 'データをインポート' }].map((item, i) => (
                        <button key={i} onClick={item.fn}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ring-1
                ${isDark ? 'bg-bg-input/50 ring-border/50 hover:ring-border text-text-primary hover:bg-bg-card' : 'bg-bg-input-light/50 ring-border-light/50 hover:ring-border-light text-text-primary-light hover:bg-bg-secondary-light'}`}>
                            {item.icon} {item.label}
                        </button>
                    ))}
                </div>

                <div className={`pt-3 border-t ${isDark ? 'border-border/30' : 'border-border-light/30'}`}>
                    {showResetConfirm ? (
                        <div className="space-y-3">
                            <p className={`text-xs ${isDark ? 'text-text-muted' : 'text-text-muted-light'}`}>すべてのデータが削除されます。よろしいですか？</p>
                            <div className="flex gap-2">
                                <button onClick={() => { onReset(); setShowResetConfirm(false); onClose(); }}
                                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-accent-red text-white hover:bg-accent-red/90">リセット</button>
                                <button onClick={() => setShowResetConfirm(false)}
                                    className={`flex-1 py-2.5 rounded-xl text-xs ring-1 ${isDark ? 'ring-border text-text-muted' : 'ring-border-light text-text-muted-light'}`}>キャンセル</button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setShowResetConfirm(true)}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs text-accent-red/70 hover:text-accent-red hover:bg-accent-red/5 transition-all ring-1 ring-transparent hover:ring-accent-red/20">
                            <Trash2 size={13} /> 全データをリセット
                        </button>
                    )}
                </div>
            </div>
        </ModalShell>
    );
}

// ==================== Main App ====================
export default function App() {
    const [theme, setTheme] = useTheme();
    const { subs, addSub, updateSub, deleteSub, importSubs, resetAll } = useSubscriptions();
    const [showAdd, setShowAdd] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [editSub, setEditSub] = useState(null);
    const [sortBy, setSortBy] = useState('name');
    const [filterCat, setFilterCat] = useState('すべて');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showSortMenu, setShowSortMenu] = useState(false);

    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const sortedFiltered = useMemo(() => {
        let list = [...subs];
        if (filterCat !== 'すべて') list = list.filter(s => s.category === filterCat);
        if (filterStatus === 'active') list = list.filter(s => s.isActive);
        if (filterStatus === 'inactive') list = list.filter(s => !s.isActive);
        const fns = {
            name: (a, b) => a.name.localeCompare(b.name, 'ja'),
            amount_desc: (a, b) => b.amount - a.amount,
            amount_asc: (a, b) => a.amount - b.amount,
            date: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            nextBilling: (a, b) => new Date(a.nextBillingDate) - new Date(b.nextBillingDate),
        };
        list.sort(fns[sortBy] || fns.name);
        return list;
    }, [subs, sortBy, filterCat, filterStatus]);

    const usedCategories = useMemo(() => [...new Set(subs.map(s => s.category).filter(Boolean))], [subs]);

    // Close sort menu on outside click
    useEffect(() => {
        if (!showSortMenu) return;
        const h = () => setShowSortMenu(false);
        setTimeout(() => document.addEventListener('click', h), 0);
        return () => document.removeEventListener('click', h);
    }, [showSortMenu]);

    return (
        <div className={`min-h-screen noise-bg transition-colors duration-500 ${isDark ? 'bg-bg-primary' : 'bg-bg-primary-light'}`}>
            {/* Header */}
            <header className={`sticky top-0 z-40 backdrop-blur-2xl border-b transition-colors duration-500
        ${isDark ? 'bg-bg-primary/70 border-border/50' : 'bg-bg-primary-light/70 border-border-light/50'}`}>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-accent-blue/20">¥</div>
                        <h1 className={`text-base sm:text-lg font-bold font-[Outfit] tracking-tight ${isDark ? 'text-text-primary' : 'text-text-primary-light'}`}>
                            サブスク<span className="text-accent-blue">管理</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowAdd(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold btn-primary text-white"
                            aria-label="サブスクを追加">
                            <Plus size={15} strokeWidth={2.5} /> <span className="hidden sm:inline">追加</span>
                        </button>
                        <button onClick={() => setShowSettings(true)}
                            className={`p-2.5 rounded-xl transition-all duration-200 ring-1
                ${isDark ? 'ring-border/50 hover:ring-border text-text-muted hover:text-text-primary hover:bg-bg-card' : 'ring-border-light/50 hover:ring-border-light text-text-muted-light hover:text-text-primary-light hover:bg-bg-secondary-light'}`}
                            aria-label="設定">
                            <Settings size={16} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <SummaryCards subs={subs} isDark={isDark} />
                <CategoryChart subs={subs} isDark={isDark} />

                {/* Filters & Sort */}
                {subs.length > 0 && (
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                            <Filter size={13} className={isDark ? 'text-text-muted' : 'text-text-muted-light'} />
                            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                                className={`text-[11px] font-medium rounded-lg px-2.5 py-1.5 outline-none transition-all ring-1 appearance-none pr-6
                  ${isDark ? 'bg-bg-input ring-border/50 text-text-secondary' : 'bg-bg-input-light ring-border-light/50 text-text-secondary-light'}`}>
                                <option value="すべて">すべてのカテゴリ</option>
                                {usedCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                                className={`text-[11px] font-medium rounded-lg px-2.5 py-1.5 outline-none transition-all ring-1 appearance-none pr-6
                  ${isDark ? 'bg-bg-input ring-border/50 text-text-secondary' : 'bg-bg-input-light ring-border-light/50 text-text-secondary-light'}`}>
                                <option value="all">すべてのステータス</option>
                                <option value="active">有効のみ</option>
                                <option value="inactive">停止のみ</option>
                            </select>
                        </div>
                        <div className="relative">
                            <button onClick={(e) => { e.stopPropagation(); setShowSortMenu(!showSortMenu); }}
                                className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition-all ring-1
                  ${isDark ? 'bg-bg-input ring-border/50 text-text-muted hover:text-text-secondary' : 'bg-bg-input-light ring-border-light/50 text-text-muted-light hover:text-text-secondary-light'}`}>
                                <ArrowUpDown size={11} /> 並び替え <ChevronDown size={11} className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                            </button>
                            {showSortMenu && (
                                <div className={`absolute right-0 top-full mt-1.5 rounded-xl shadow-2xl ring-1 overflow-hidden z-10 min-w-[150px] animate-scale-in
                  ${isDark ? 'bg-bg-secondary ring-border' : 'bg-bg-card-light ring-border-light'}`}>
                                    {[['name', '名前順'], ['amount_desc', '金額（高い順）'], ['amount_asc', '金額（安い順）'], ['date', '登録日順'], ['nextBilling', '請求日順']].map(([v, l]) => (
                                        <button key={v} onClick={() => { setSortBy(v); setShowSortMenu(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-all
                        ${sortBy === v ? 'text-accent-blue bg-accent-blue/5' : ''}
                        ${isDark ? 'hover:bg-bg-card text-text-secondary' : 'hover:bg-bg-secondary-light text-text-secondary-light'}`}>{l}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* List */}
                {sortedFiltered.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {sortedFiltered.map((sub, i) => (
                            <div key={sub.id} style={{ animationDelay: `${i * 40}ms` }}>
                                <SubCard sub={sub} isDark={isDark} onClick={setEditSub} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={`text-center py-20 rounded-2xl glass-card ring-1 ${isDark ? 'ring-border/30' : 'ring-border-light/30'}`}>
                        <div className="text-5xl mb-5 animate-fade-in-up">💎</div>
                        <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-text-primary' : 'text-text-primary-light'}`}>サブスクがまだ登録されていません</p>
                        <p className={`text-xs mb-6 ${isDark ? 'text-text-muted' : 'text-text-muted-light'}`}>「追加」ボタンからサブスクを登録しましょう</p>
                        <button onClick={() => setShowAdd(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold btn-primary text-white">
                            <Plus size={16} strokeWidth={2.5} /> はじめてのサブスクを追加
                        </button>
                    </div>
                )}
            </main>

            {/* Modals */}
            <AddModal isOpen={showAdd} onClose={() => setShowAdd(false)} onAdd={addSub} isDark={isDark} />
            <EditModal sub={editSub} isOpen={!!editSub} onClose={() => setEditSub(null)} onUpdate={updateSub} onDelete={deleteSub} isDark={isDark} />
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} theme={theme} setTheme={setTheme} subs={subs} onImport={importSubs} onReset={resetAll} isDark={isDark} />
        </div>
    );
}
