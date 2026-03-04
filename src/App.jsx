import { useState, useEffect, useMemo, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Search, X, Settings, Moon, Sun, Download, Upload, Trash2, ChevronDown, ArrowUpDown, Filter, Calendar, Edit3 } from 'lucide-react';
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
        while (next <= now) { next.setMonth(next.getMonth() + 1); }
    } else {
        while (next <= now) { next.setFullYear(next.getFullYear() + 1); }
    }
    return next.toISOString().split('T')[0];
};

const loadFromStorage = (key, fallback) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch { return fallback; }
};

const saveToStorage = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.error('localStorage save failed:', e); }
};

const getMonthlyAmount = (sub) => {
    if (!sub.isActive) return 0;
    return sub.billingCycle === 'yearly' ? sub.amount / 12 : sub.amount;
};

const getYearlyAmount = (sub) => {
    if (!sub.isActive) return 0;
    return sub.billingCycle === 'monthly' ? sub.amount * 12 : sub.amount;
};

// ==================== Theme Hook ====================
const useTheme = () => {
    const [theme, setTheme] = useState(() => {
        const saved = loadFromStorage('app_settings_v1', { theme: 'system' });
        return saved.theme || 'system';
    });

    useEffect(() => {
        const root = document.documentElement;
        let isDark;
        if (theme === 'system') {
            isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        } else {
            isDark = theme === 'dark';
        }
        root.classList.toggle('light', !isDark);
        root.classList.toggle('dark', isDark);
        saveToStorage('app_settings_v1', { theme });
    }, [theme]);

    return [theme, setTheme];
};

// ==================== Subscriptions Hook ====================
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

    const deleteSub = useCallback((id) => { setSubs(prev => prev.filter(s => s.id !== id)); }, []);

    const importSubs = useCallback((data) => { setSubs(data); }, []);

    const resetAll = useCallback(() => { setSubs([]); }, []);

    return { subs, addSub, updateSub, deleteSub, importSubs, resetAll };
};

// ==================== Summary Cards ====================
function SummaryCards({ subs, isDark }) {
    const activeSubs = subs.filter(s => s.isActive);
    const monthlyTotal = activeSubs.reduce((sum, s) => sum + getMonthlyAmount(s), 0);
    const yearlyTotal = activeSubs.reduce((sum, s) => sum + getYearlyAmount(s), 0);

    const cards = [
        { label: '月額合計', value: formatCurrency(Math.round(monthlyTotal)), color: 'from-blue-500/20 to-blue-600/10', textColor: 'text-accent-blue', icon: '💰' },
        { label: '年額合計', value: formatCurrency(Math.round(yearlyTotal)), color: 'from-purple-500/20 to-purple-600/10', textColor: 'text-accent-purple', icon: '📊' },
        { label: '有効サービス', value: `${activeSubs.length}件`, sub: `/ ${subs.length}件`, color: 'from-green-500/20 to-green-600/10', textColor: 'text-accent-green', icon: '✅' },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {cards.map((c, i) => (
                <div key={i} className={`relative overflow-hidden rounded-xl p-5 backdrop-blur-sm border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${isDark ? 'bg-bg-card/80 border-border hover:shadow-accent-blue/5' : 'bg-bg-card-light/80 border-border-light hover:shadow-accent-blue/10'} bg-gradient-to-br ${c.color}`} style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${isDark ? 'text-text-secondary' : 'text-text-secondary-light'}`}>{c.label}</span>
                        <span className="text-xl">{c.icon}</span>
                    </div>
                    <div className={`text-2xl font-bold tabular-nums font-[Outfit] ${c.textColor}`}>{c.value}</div>
                    {c.sub && <span className={`text-xs ${isDark ? 'text-text-secondary' : 'text-text-secondary-light'}`}>{c.sub}</span>}
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

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload?.length) {
            return (
                <div className={`px-3 py-2 rounded-lg text-sm shadow-lg ${isDark ? 'bg-bg-card border border-border text-text-primary' : 'bg-bg-card-light border border-border-light text-text-primary-light'}`}>
                    <p className="font-medium">{payload[0].name}</p>
                    <p className="tabular-nums">{formatCurrency(payload[0].value)}/月</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className={`rounded-xl p-5 backdrop-blur-sm border mb-6 ${isDark ? 'bg-bg-card/80 border-border' : 'bg-bg-card-light/80 border-border-light'}`}>
            <h2 className={`text-lg font-bold font-[Outfit] mb-4 ${isDark ? 'text-text-primary' : 'text-text-primary-light'}`}>カテゴリ別支出</h2>
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-48 h-48">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="value" stroke="none">
                                {data.map((entry, i) => (<Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#6b7280'} />))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {data.map((d, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[d.name] || '#6b7280' }} />
                            <span className={isDark ? 'text-text-secondary' : 'text-text-secondary-light'}>{d.name}</span>
                            <span className={`tabular-nums font-medium ${isDark ? 'text-text-primary' : 'text-text-primary-light'}`}>{formatCurrency(d.value)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ==================== Subscription Card ====================
function SubCard({ sub, isDark, onClick }) {
    const daysUntil = Math.ceil((new Date(sub.nextBillingDate) - new Date()) / (1000 * 60 * 60 * 24));
    const urgent = daysUntil <= 3 && daysUntil >= 0;

    return (
        <div onClick={() => onClick(sub)} className={`group rounded-xl p-4 border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-fade-in-up ${isDark ? 'bg-bg-card/80 border-border hover:bg-bg-card-hover hover:shadow-accent-blue/5' : 'bg-bg-card-light/80 border-border-light hover:bg-bg-card-hover-light hover:shadow-accent-blue/10'} backdrop-blur-sm ${!sub.isActive ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{sub.icon}</span>
                    <div>
                        <h3 className={`font-medium text-sm ${isDark ? 'text-text-primary' : 'text-text-primary-light'}`}>{sub.name}</h3>
                        {sub.plan && <p className={`text-xs ${isDark ? 'text-text-secondary' : 'text-text-secondary-light'}`}>{sub.plan}</p>}
                    </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sub.isActive ? 'bg-accent-green/15 text-accent-green' : 'bg-accent-red/15 text-accent-red'}`}>
                    {sub.isActive ? '有効' : '停止'}
                </span>
            </div>
            <div className="flex items-end justify-between">
                <div>
                    <span className={`text-xl font-bold tabular-nums font-[Outfit] ${isDark ? 'text-text-primary' : 'text-text-primary-light'}`}>{formatCurrency(sub.amount)}</span>
                    <span className={`text-xs ml-1 ${isDark ? 'text-text-secondary' : 'text-text-secondary-light'}`}>/{sub.billingCycle === 'monthly' ? '月' : '年'}</span>
                </div>
                <div className={`text-xs flex items-center gap-1 ${urgent ? 'text-accent-amber font-medium' : isDark ? 'text-text-secondary' : 'text-text-secondary-light'}`}>
                    <Calendar size={12} />
                    {sub.nextBillingDate}
                </div>
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
            const updated = { ...prev, [field]: value };
            if (field === 'startDate' || field === 'billingCycle') {
                updated.nextBillingDate = calcNextBillingDate(updated.startDate, updated.billingCycle);
            }
            return updated;
        });
    };

    if (!isOpen) return null;

    const inputCls = `w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors ${isDark ? 'bg-bg-primary border border-border text-text-primary focus:border-accent-blue' : 'bg-bg-primary-light border border-border-light text-text-primary-light focus:border-accent-blue'}`;
    const labelCls = `block text-xs font-medium mb-1.5 ${isDark ? 'text-text-secondary' : 'text-text-secondary-light'}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className={`relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-6 shadow-2xl animate-scale-in ${isDark ? 'bg-bg-card border border-border' : 'bg-bg-card-light border border-border-light'}`} onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className={`text-lg font-bold font-[Outfit] ${isDark ? 'text-text-primary' : 'text-text-primary-light'}`}>
                        {step === 1 ? 'サービスを選択' : 'サブスクを追加'}
                    </h2>
                    <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-bg-card-hover text-text-secondary' : 'hover:bg-bg-card-hover-light text-text-secondary-light'}`}><X size={18} /></button>
                </div>

                {step === 1 ? (
                    <>
                        <div className={`flex items-center gap-2 rounded-lg px-3 py-2.5 mb-4 ${isDark ? 'bg-bg-primary border border-border' : 'bg-bg-primary-light border border-border-light'}`}>
                            <Search size={16} className={isDark ? 'text-text-secondary' : 'text-text-secondary-light'} />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="サービス名で検索..." className={`w-full bg-transparent outline-none text-sm ${isDark ? 'text-text-primary placeholder:text-text-secondary' : 'text-text-primary-light placeholder:text-text-secondary-light'}`} />
                        </div>
                        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-3 scrollbar-none">
                            {['すべて', ...CATEGORIES].map(cat => (
                                <button key={cat} onClick={() => setSelectedCat(cat)} className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCat === cat ? 'bg-accent-blue text-white' : isDark ? 'bg-bg-primary text-text-secondary hover:text-text-primary' : 'bg-bg-primary-light text-text-secondary-light hover:text-text-primary-light'}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto mb-4">
                            {filtered.map(s => (
                                <button key={s.id} onClick={() => selectPreset(s)} className={`flex items-center gap-2 p-2.5 rounded-lg text-left transition-all text-sm hover:-translate-y-0.5 ${isDark ? 'bg-bg-primary/50 hover:bg-bg-card-hover border border-border/50' : 'bg-bg-primary-light/50 hover:bg-bg-card-hover-light border border-border-light/50'}`}>
                                    <span className="text-lg flex-shrink-0">{s.icon}</span>
                                    <div className="min-w-0">
                                        <p className={`text-xs font-medium truncate ${isDark ? 'text-text-primary' : 'text-text-primary-light'}`}>{s.name}</p>
                                        <p className={`text-xs tabular-nums ${isDark ? 'text-text-secondary' : 'text-text-secondary-light'}`}>{s.defaultAmount > 0 ? formatCurrency(s.defaultAmount) : '—'}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <button onClick={selectCustom} className="w-full py-2.5 rounded-lg text-sm font-medium bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20 transition-colors">
                            ＋ カスタムで追加
                        </button>
                    </>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {step === 2 && !form.serviceId && (
                            <button type="button" onClick={() => setStep(1)} className={`text-xs ${isDark ? 'text-text-secondary' : 'text-text-secondary-light'} hover:text-accent-blue mb-2`}>← サービス選択に戻る</button>
                        )}
                        <div className="grid grid-cols-[auto_1fr] gap-4">
                            <div>
                                <label className={labelCls}>アイコン</label>
                                <input value={form.icon} onChange={e => updateField('icon', e.target.value)} className={`${inputCls} w-16 text-center text-xl`} />
                            </div>
                            <div>
                                <label className={labelCls}>サービス名 *</label>
                                <input value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="例: Netflix" className={inputCls} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>カテゴリ</label>
                                <select value={form.category} onChange={e => updateField('category', e.target.value)} className={inputCls}>
                                    <option value="">選択してください</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    <option value="その他">その他</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>プラン名</label>
                                <input value={form.plan} onChange={e => updateField('plan', e.target.value)} placeholder="例: スタンダード" className={inputCls} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>支払額（円）*</label>
                                <input type="number" value={form.amount || ''} onChange={e => updateField('amount', Number(e.target.value))} placeholder="0" className={inputCls} required min="0" />
                            </div>
                            <div>
                                <label className={labelCls}>請求サイクル</label>
                                <div className="flex rounded-lg overflow-hidden border ${isDark ? 'border-border' : 'border-border-light'}">
                                    {['monthly', 'yearly'].map(c => (
                                        <button key={c} type="button" onClick={() => updateField('billingCycle', c)} className={`flex-1 py-2.5 text-xs font-medium transition-colors ${form.billingCycle === c ? 'bg-accent-blue text-white' : isDark ? 'bg-bg-primary text-text-secondary' : 'bg-bg-primary-light text-text-secondary-light'}`}>
                                            {c === 'monthly' ? '月額' : '年額'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>利用開始日</label>
                                <input type="date" value={form.startDate} onChange={e => updateField('startDate', e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>次回請求日</label>
                                <input type="date" value={form.nextBillingDate} onChange={e => updateField('nextBillingDate', e.target.value)} className={inputCls} />
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>メモ</label>
                            <textarea value={form.note} onChange={e => updateField('note', e.target.value)} placeholder="メモ（任意）" rows={2} className={inputCls} />
                        </div>
                        <button type="submit" className="w-full py-3 rounded-xl text-sm font-bold bg-accent-blue text-white hover:bg-accent-blue/90 transition-colors shadow-lg shadow-accent-blue/20">
                            追加する
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

// ==================== Edit Modal ====================
function EditModal({ sub, isOpen, onClose, onUpdate, onDelete, isDark }) {
    const [form, setForm] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => { if (sub) { setForm({ ...sub }); setShowDeleteConfirm(false); } }, [sub]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(sub.id, form);
        onClose();
    };

    const handleDelete = () => {
        onDelete(sub.id);
        onClose();
    };

    if (!isOpen || !sub) return null;

    const inputCls = `w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors ${isDark ? 'bg-bg-primary border border-border text-text-primary focus:border-accent-blue' : 'bg-bg-primary-light border border-border-light text-text-primary-light focus:border-accent-blue'}`;
    const labelCls = `block text-xs font-medium mb-1.5 ${isDark ? 'text-text-secondary' : 'text-text-secondary-light'}`;

    const updateField = (field, value) => {
        setForm(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'startDate' || field === 'billingCycle') {
                updated.nextBillingDate = calcNextBillingDate(updated.startDate, updated.billingCycle);
            }
            return updated;
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className={`relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-6 shadow-2xl animate-scale-in ${isDark ? 'bg-bg-card border border-border' : 'bg-bg-card-light border border-border-light'}`} onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className={`text-lg font-bold font-[Outfit] ${isDark ? 'text-text-primary' : 'text-text-primary-light'}`}>サブスクを編集</h2>
                    <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-bg-card-hover text-text-secondary' : 'hover:bg-bg-card-hover-light text-text-secondary-light'}`}><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-[auto_1fr] gap-4">
                        <div>
                            <label className={labelCls}>アイコン</label>
                            <input value={form.icon || ''} onChange={e => updateField('icon', e.target.value)} className={`${inputCls} w-16 text-center text-xl`} />
                        </div>
                        <div>
                            <label className={labelCls}>サービス名</label>
                            <input value={form.name || ''} onChange={e => updateField('name', e.target.value)} className={inputCls} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>カテゴリ</label>
                            <select value={form.category || ''} onChange={e => updateField('category', e.target.value)} className={inputCls}>
                                <option value="">選択</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                <option value="その他">その他</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>プラン名</label>
                            <input value={form.plan || ''} onChange={e => updateField('plan', e.target.value)} className={inputCls} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>支払額（円）</label>
                            <input type="number" value={form.amount || ''} onChange={e => updateField('amount', Number(e.target.value))} className={inputCls} required min="0" />
                        </div>
                        <div>
                            <label className={labelCls}>請求サイクル</label>
                            <div className="flex rounded-lg overflow-hidden">
                                {['monthly', 'yearly'].map(c => (
                                    <button key={c} type="button" onClick={() => updateField('billingCycle', c)} className={`flex-1 py-2.5 text-xs font-medium transition-colors ${form.billingCycle === c ? 'bg-accent-blue text-white' : isDark ? 'bg-bg-primary text-text-secondary border border-border' : 'bg-bg-primary-light text-text-secondary-light border border-border-light'}`}>
                                        {c === 'monthly' ? '月額' : '年額'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>利用開始日</label>
                            <input type="date" value={form.startDate || ''} onChange={e => updateField('startDate', e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>次回請求日</label>
                            <input type="date" value={form.nextBillingDate || ''} onChange={e => updateField('nextBillingDate', e.target.value)} className={inputCls} />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>メモ</label>
                        <textarea value={form.note || ''} onChange={e => updateField('note', e.target.value)} rows={2} className={inputCls} />
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => updateField('isActive', !form.isActive)} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${form.isActive ? 'bg-accent-amber/15 text-accent-amber hover:bg-accent-amber/25' : 'bg-accent-green/15 text-accent-green hover:bg-accent-green/25'}`}>
                            {form.isActive ? '停止にする' : '再開する'}
                        </button>
                        <button type="submit" className="flex-1 py-3 rounded-xl text-sm font-bold bg-accent-blue text-white hover:bg-accent-blue/90 transition-colors">
                            保存する
                        </button>
                    </div>
                    <div className="pt-2 border-t border-border/50">
                        {showDeleteConfirm ? (
                            <div className="flex items-center gap-3">
                                <span className={`text-xs ${isDark ? 'text-text-secondary' : 'text-text-secondary-light'}`}>本当に削除しますか？</span>
                                <button type="button" onClick={handleDelete} className="px-4 py-2 rounded-lg text-xs font-bold bg-accent-red text-white hover:bg-accent-red/90">削除</button>
                                <button type="button" onClick={() => setShowDeleteConfirm(false)} className={`px-4 py-2 rounded-lg text-xs ${isDark ? 'text-text-secondary' : 'text-text-secondary-light'}`}>キャンセル</button>
                            </div>
                        ) : (
                            <button type="button" onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-1.5 text-xs text-accent-red hover:text-accent-red/80 transition-colors">
                                <Trash2 size={14} /> このサブスクを削除
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

// ==================== Settings Modal ====================
function SettingsModal({ isOpen, onClose, theme, setTheme, subs, onImport, onReset, isDark }) {
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    useEffect(() => { if (isOpen) setShowResetConfirm(false); }, [isOpen]);

    const handleExport = () => {
        const data = JSON.stringify(subs, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
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
                    else { alert('無効なデータ形式です'); }
                } catch { alert('JSONの読み込みに失敗しました'); }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    if (!isOpen) return null;

    const btnCls = `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isDark ? 'bg-bg-primary hover:bg-bg-card-hover text-text-primary' : 'bg-bg-primary-light hover:bg-bg-card-hover-light text-text-primary-light'}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className={`relative w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-scale-in ${isDark ? 'bg-bg-card border border-border' : 'bg-bg-card-light border border-border-light'}`} onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className={`text-lg font-bold font-[Outfit] ${isDark ? 'text-text-primary' : 'text-text-primary-light'}`}>設定</h2>
                    <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-bg-card-hover text-text-secondary' : 'hover:bg-bg-card-hover-light text-text-secondary-light'}`}><X size={18} /></button>
                </div>
                <div className="space-y-3">
                    <div>
                        <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-text-secondary' : 'text-text-secondary-light'}`}>テーマ</label>
                        <div className="flex rounded-xl overflow-hidden border ${isDark ? 'border-border' : 'border-border-light'}">
                            {[{ v: 'light', l: 'ライト', i: <Sun size={14} /> }, { v: 'dark', l: 'ダーク', i: <Moon size={14} /> }, { v: 'system', l: 'システム', i: <Settings size={14} /> }].map(t => (
                                <button key={t.v} onClick={() => setTheme(t.v)} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${theme === t.v ? 'bg-accent-blue text-white' : isDark ? 'bg-bg-primary text-text-secondary' : 'bg-bg-primary-light text-text-secondary-light'}`}>
                                    {t.i}{t.l}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="pt-2 space-y-2">
                        <button onClick={handleExport} className={btnCls}><Download size={16} /> データをエクスポート</button>
                        <button onClick={handleImport} className={btnCls}><Upload size={16} /> データをインポート</button>
                    </div>
                    <div className="pt-2 border-t border-border/30">
                        {showResetConfirm ? (
                            <div className="space-y-2">
                                <p className={`text-xs ${isDark ? 'text-text-secondary' : 'text-text-secondary-light'}`}>すべてのデータが削除されます。よろしいですか？</p>
                                <div className="flex gap-2">
                                    <button onClick={() => { onReset(); setShowResetConfirm(false); onClose(); }} className="flex-1 py-2.5 rounded-lg text-xs font-bold bg-accent-red text-white">リセット</button>
                                    <button onClick={() => setShowResetConfirm(false)} className={`flex-1 py-2.5 rounded-lg text-xs ${isDark ? 'bg-bg-primary text-text-secondary' : 'bg-bg-primary-light text-text-secondary-light'}`}>キャンセル</button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setShowResetConfirm(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs text-accent-red hover:bg-accent-red/10 transition-colors">
                                <Trash2 size={14} /> 全データをリセット
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
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

    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const sortedFiltered = useMemo(() => {
        let list = [...subs];
        if (filterCat !== 'すべて') list = list.filter(s => s.category === filterCat);
        if (filterStatus === 'active') list = list.filter(s => s.isActive);
        if (filterStatus === 'inactive') list = list.filter(s => !s.isActive);
        const sortFns = {
            name: (a, b) => a.name.localeCompare(b.name, 'ja'),
            amount_desc: (a, b) => b.amount - a.amount,
            amount_asc: (a, b) => a.amount - b.amount,
            date: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            nextBilling: (a, b) => new Date(a.nextBillingDate) - new Date(b.nextBillingDate),
        };
        list.sort(sortFns[sortBy] || sortFns.name);
        return list;
    }, [subs, sortBy, filterCat, filterStatus]);

    const usedCategories = useMemo(() => [...new Set(subs.map(s => s.category).filter(Boolean))], [subs]);

    // ESCキーでモーダルを閉じる
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') { setShowAdd(false); setEditSub(null); setShowSettings(false); } };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-bg-primary' : 'bg-bg-primary-light'}`}>
            {/* Header */}
            <header className={`sticky top-0 z-40 backdrop-blur-xl border-b ${isDark ? 'bg-bg-primary/80 border-border' : 'bg-bg-primary-light/80 border-border-light'}`}>
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <span className="text-xl">💎</span>
                        <h1 className={`text-lg font-bold font-[Outfit] ${isDark ? 'text-text-primary' : 'text-text-primary-light'}`}>サブスク管理</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-accent-blue text-white hover:bg-accent-blue/90 transition-all hover:shadow-lg hover:shadow-accent-blue/20" aria-label="サブスクを追加">
                            <Plus size={16} /> 追加
                        </button>
                        <button onClick={() => setShowSettings(true)} className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-bg-card text-text-secondary hover:text-text-primary' : 'hover:bg-bg-card-light text-text-secondary-light hover:text-text-primary-light'}`} aria-label="設定">
                            <Settings size={18} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-5xl mx-auto px-4 py-6">
                <SummaryCards subs={subs} isDark={isDark} />
                <CategoryChart subs={subs} isDark={isDark} />

                {/* Filters & Sort */}
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2 overflow-x-auto">
                        <Filter size={14} className={isDark ? 'text-text-secondary' : 'text-text-secondary-light'} />
                        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className={`text-xs rounded-lg px-2.5 py-1.5 outline-none ${isDark ? 'bg-bg-card border border-border text-text-primary' : 'bg-bg-card-light border border-border-light text-text-primary-light'}`}>
                            <option value="すべて">すべてのカテゴリ</option>
                            {usedCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={`text-xs rounded-lg px-2.5 py-1.5 outline-none ${isDark ? 'bg-bg-card border border-border text-text-primary' : 'bg-bg-card-light border border-border-light text-text-primary-light'}`}>
                            <option value="all">すべてのステータス</option>
                            <option value="active">有効のみ</option>
                            <option value="inactive">停止のみ</option>
                        </select>
                    </div>
                    <div className="relative">
                        <button onClick={() => setShowSortMenu(!showSortMenu)} className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${isDark ? 'bg-bg-card border border-border text-text-secondary hover:text-text-primary' : 'bg-bg-card-light border border-border-light text-text-secondary-light hover:text-text-primary-light'}`}>
                            <ArrowUpDown size={12} /> 並び替え <ChevronDown size={12} />
                        </button>
                        {showSortMenu && (
                            <div className={`absolute right-0 top-full mt-1 rounded-xl shadow-xl border overflow-hidden z-10 min-w-[140px] ${isDark ? 'bg-bg-card border-border' : 'bg-bg-card-light border-border-light'}`}>
                                {[['name', '名前順'], ['amount_desc', '金額（高い順）'], ['amount_asc', '金額（安い順）'], ['date', '登録日順'], ['nextBilling', '請求日順']].map(([v, l]) => (
                                    <button key={v} onClick={() => { setSortBy(v); setShowSortMenu(false); }} className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${sortBy === v ? 'text-accent-blue font-medium' : ''} ${isDark ? 'hover:bg-bg-card-hover text-text-primary' : 'hover:bg-bg-card-hover-light text-text-primary-light'}`}>{l}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Subscription List */}
                {sortedFiltered.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {sortedFiltered.map((sub, i) => (
                            <div key={sub.id} style={{ animationDelay: `${i * 50}ms` }}>
                                <SubCard sub={sub} isDark={isDark} onClick={setEditSub} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={`text-center py-16 rounded-xl border ${isDark ? 'bg-bg-card/50 border-border/50' : 'bg-bg-card-light/50 border-border-light/50'}`}>
                        <span className="text-4xl mb-4 block">📋</span>
                        <p className={`text-sm font-medium mb-2 ${isDark ? 'text-text-primary' : 'text-text-primary-light'}`}>サブスクがまだ登録されていません</p>
                        <p className={`text-xs mb-4 ${isDark ? 'text-text-secondary' : 'text-text-secondary-light'}`}>「追加」ボタンからサブスクを登録しましょう</p>
                        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium bg-accent-blue text-white hover:bg-accent-blue/90 transition-all">
                            <Plus size={16} /> サブスクを追加
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
