import React, { useState, useMemo, useEffect } from "react";
import {
  PlusCircle,
  ShoppingCart,
  Settings,
  Trash2,
  X,
  Receipt,
  Briefcase,
  Clock,
  Calendar,
  Box,
  Calculator,
  TrendingUp,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronRight,
  AlertCircle,
  Percent,
  Search,
  Filter,
  RefreshCw,
  Edit3,
} from "lucide-react";

const CATEGORIES = [
  { id: "food", name: "餐飲美食", color: "#FF6B6B", type: "expense" },
  { id: "transport", name: "交通運輸", color: "#4D96FF", type: "expense" },
  { id: "shopping", name: "購物消費", color: "#FFD93D", type: "expense" },
  { id: "8591_sales", name: "銷售收入", color: "#10B981", type: "income" },
  { id: "8591_cost", name: "商品成本", color: "#F97316", type: "expense" },
  { id: "stock_inv", name: "股票投資", color: "#8B5CF6", type: "investment" },
  { id: "crypto_inv", name: "虛擬貨幣", color: "#F59E0B", type: "investment" },
  { id: "other_inv", name: "其他投資", color: "#6366F1", type: "investment" },
  { id: "income", name: "其他收入", color: "#059669", type: "income" },
  { id: "other", name: "其他支出", color: "#94A3B8", type: "expense" },
];

// 本地儲存 Key 定義
const STORAGE_KEYS = {
  TRANSACTIONS: "finance_v1_transactions",
  RECURRING: "finance_v1_recurring",
  TITLE: "finance_v1_title",
  SUBTITLE: "finance_v1_subtitle",
};

export default function App() {
  const getNowStr = () => {
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().split(" ")[0].substring(0, 5); // HH:mm
    return `${date} ${time}`;
  };

  const todayStr = new Date().toISOString().split("T")[0];

  // --- 狀態初始化 ---
  const [appTitle, setAppTitle] = useState(() => {
    return typeof localStorage !== "undefined"
      ? localStorage.getItem(STORAGE_KEYS.TITLE) || "資產對沖系統"
      : "資產對沖系統";
  });

  const [appSubtitle, setAppSubtitle] = useState(() => {
    return typeof localStorage !== "undefined"
      ? localStorage.getItem(STORAGE_KEYS.SUBTITLE) || "Finance Control Center"
      : "Finance Control Center";
  });

  const [transactions, setTransactions] = useState(() => {
    if (typeof localStorage === "undefined") return [];
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : [];
  });

  const [recurringItems, setRecurringItems] = useState(() => {
    if (typeof localStorage === "undefined") return [];
    const saved = localStorage.getItem(STORAGE_KEYS.RECURRING);
    return saved ? JSON.parse(saved) : [];
  });

  // --- 自動儲存 ---
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.TRANSACTIONS,
      JSON.stringify(transactions)
    );
  }, [transactions]);
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.RECURRING,
      JSON.stringify(recurringItems)
    );
  }, [recurringItems]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TITLE, appTitle);
  }, [appTitle]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBTITLE, appSubtitle);
  }, [appSubtitle]);

  // UI 狀態
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [showFastRecord, setShowFastRecord] = useState(false);
  const [showInvManager, setShowInvManager] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const [show8591, setShow8591] = useState(false);
  const [settlementTarget, setSettlementTarget] = useState(null);

  // 記帳表單
  const [fType, setFType] = useState("expense");
  const [fText, setFText] = useState("");
  const [fAmt, setFAmt] = useState("");
  const [fCat, setFCat] = useState("other");

  // 固定收支表單
  const [rText, setRText] = useState("");
  const [rAmt, setRAmt] = useState("");
  const [rFlow, setRFlow] = useState("expense");
  const [rType, setRType] = useState("monthly");
  const [rDay, setRDay] = useState(1);

  // 8591 專用
  const [salesTitle, setSalesTitle] = useState("");
  const [salesPrice, setSalesPrice] = useState("");
  const [salesCost, setSalesCost] = useState("");
  const [isTopUp, setIsTopUp] = useState(false);

  // 切換記帳類型時自動變更分類預設值
  useEffect(() => {
    if (fType === "investment") setFCat("stock_inv");
    else if (fType === "income") setFCat("income");
    else setFCat("other");
  }, [fType]);

  const calculatedFee = useMemo(() => {
    const price = parseFloat(salesPrice || 0);
    if (!isTopUp) return price * 0.06;
    if (price >= 100) return price * 0.03;
    return 3;
  }, [salesPrice, isTopUp]);

  const stats = useMemo(() => {
    const currentMonth = todayStr.substring(0, 7);
    const cash = transactions.reduce((acc, t) => acc + t.amount, 0);
    const activeInv = transactions
      .filter((t) => t.isInvestment && !t.isSettled)
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    const todayTransactions = transactions.filter((t) =>
      t.date.startsWith(todayStr)
    );
    const todayIncome = todayTransactions
      .filter((t) => t.amount > 0)
      .reduce((s, t) => s + t.amount, 0);
    const todayExpense = todayTransactions
      .filter((t) => t.amount < 0)
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    const monthTransactions = transactions.filter((t) =>
      t.date.startsWith(currentMonth)
    );
    const monthIncome = monthTransactions
      .filter((t) => t.amount > 0)
      .reduce((s, t) => s + t.amount, 0);
    const monthExpense = monthTransactions
      .filter((t) => t.amount < 0)
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    return {
      cash,
      inv: activeInv,
      total: cash + activeInv,
      todayIncome,
      todayExpense,
      monthIncome,
      monthExpense,
    };
  }, [transactions, todayStr]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch = (t.text || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const datePart = t.date.split(" ")[0];
      const matchStart = dateFilter.start ? datePart >= dateFilter.start : true;
      const matchEnd = dateFilter.end ? datePart <= dateFilter.end : true;
      return matchSearch && matchStart && matchEnd;
    });
  }, [transactions, searchTerm, dateFilter]);

  const activeInvestments = transactions.filter(
    (t) => t.isInvestment && !t.isSettled
  );

  const addTransaction = (data) => {
    if (!data.amount) return;

    // 邏輯處理：若名稱為空，則根據分類自動填寫名稱
    let finalTitle = data.text;
    if (!finalTitle || finalTitle.trim() === "") {
      const categoryObj = CATEGORIES.find((c) => c.id === data.category);
      finalTitle = categoryObj ? categoryObj.name : "未命名項目";
    }

    setTransactions([
      { id: Date.now(), date: getNowStr(), ...data, text: finalTitle },
      ...transactions,
    ]);
    setShowFastRecord(false);
    setFText("");
    setFAmt("");
  };

  const handleAddRecurring = () => {
    if (!rText || !rAmt) return;
    const amount =
      rFlow === "income"
        ? Math.abs(parseFloat(rAmt))
        : -Math.abs(parseFloat(rAmt));
    setRecurringItems([
      ...recurringItems,
      {
        id: Date.now(),
        text: rText,
        amount,
        type: rType,
        day: rType === "monthly" ? rDay : null,
        flow: rFlow,
      },
    ]);
    setRText("");
    setRAmt("");
  };

  const handleSettlement = (sellAmt) => {
    if (!settlementTarget || !sellAmt) return;
    const recovery = parseFloat(sellAmt);
    const cost = Math.abs(settlementTarget.amount);
    const profit = recovery - cost;
    const now = getNowStr();
    setTransactions((prev) => [
      ...prev.map((t) =>
        t.id === settlementTarget.id ? { ...t, isSettled: true } : t
      ),
      {
        id: Date.now() + 1,
        text: `${settlementTarget.text} 盈虧`,
        amount: profit,
        category: profit >= 0 ? "income" : "other",
        date: now,
        isInvestment: false,
        note: `對沖成本: ${cost}`,
      },
      {
        id: Date.now() + 2,
        text: `${settlementTarget.text} 本金回收`,
        amount: cost,
        category: "income",
        date: now,
        isInvestment: false,
        isRefund: true,
      },
    ]);
    setSettlementTarget(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2.5 rounded-2xl text-white shadow-lg">
            <Wallet size={24} />
          </div>
          <div
            className="group relative cursor-pointer"
            onClick={() => setIsEditingTitle(true)}
          >
            {isEditingTitle ? (
              <div className="flex flex-col gap-1">
                <input
                  autoFocus
                  className="text-lg font-black bg-slate-100 px-2 py-0.5 rounded outline-indigo-500"
                  value={appTitle}
                  onChange={(e) => setAppTitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && setIsEditingTitle(false)
                  }
                />
                <input
                  className="text-[10px] font-bold text-indigo-500 bg-slate-50 px-2 py-0.5 rounded outline-none"
                  value={appSubtitle}
                  onChange={(e) => setAppSubtitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && setIsEditingTitle(false)
                  }
                />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight">
                    {appTitle}
                  </h1>
                  <Edit3
                    size={14}
                    className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                  {appSubtitle}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setShowFastRecord(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 text-sm"
          >
            <PlusCircle size={18} /> 快速記帳
          </button>
          <button
            onClick={() => setShow8591(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 text-sm"
          >
            <ShoppingCart size={18} /> 銷貨紀錄
          </button>
          <button
            onClick={() => setShowRecurring(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 text-sm"
          >
            <RefreshCw size={18} /> 固定收支
          </button>
          <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden lg:block" />
          <button
            onClick={() => setShowInvManager(true)}
            className="relative flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 text-sm"
          >
            <Briefcase size={18} /> 持倉管理
            {activeInvestments.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-black">
                {activeInvestments.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-slate-400 text-xs font-bold uppercase mb-2 tracking-widest">
                淨資產 (現金 + 投資)
              </p>
              <h2 className="text-5xl font-black mb-8 tabular-nums">
                ${stats.total.toLocaleString()}
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-xs font-bold text-slate-400">
                    可用現金
                  </span>
                  <span className="text-xl font-black">
                    ${stats.cash.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-xs font-bold text-slate-400">
                    未結持倉
                  </span>
                  <span className="text-xl font-black text-indigo-400">
                    ${stats.inv.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-600" /> 收支統計看板
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-[9px] font-black text-emerald-600/60 uppercase mb-1">
                    今日收入
                  </p>
                  <p className="text-lg font-black text-emerald-700">
                    +${stats.todayIncome.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                  <p className="text-[9px] font-black text-rose-600/60 uppercase mb-1">
                    今日支出
                  </p>
                  <p className="text-lg font-black text-rose-700">
                    -${stats.todayExpense.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  本月收支累計 ({todayStr.substring(0, 7)})
                </p>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-400 mb-1">
                      <ArrowUpCircle size={14} />
                      <span className="text-xs font-bold">
                        ${stats.monthIncome.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-rose-400">
                      <ArrowDownCircle size={14} />
                      <span className="text-xs font-bold">
                        ${stats.monthExpense.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">
                      本月淨流向
                    </p>
                    <p
                      className={`text-2xl font-black ${
                        stats.monthIncome - stats.monthExpense >= 0
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      $
                      {(
                        stats.monthIncome - stats.monthExpense
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="搜尋帳目名稱..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none outline-none font-bold text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="date"
                className="bg-slate-50 border-none rounded-xl p-2 text-xs font-bold outline-none"
                value={dateFilter.start}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, start: e.target.value })
                }
              />
              <span className="text-slate-300 font-bold">~</span>
              <input
                type="date"
                className="bg-slate-50 border-none rounded-xl p-2 text-xs font-bold outline-none"
                value={dateFilter.end}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, end: e.target.value })
                }
              />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <Receipt size={22} className="text-slate-400" />
                <h3 className="font-black text-lg">近期帳目流水</h3>
              </div>
              <span className="text-[10px] font-black bg-white border px-3 py-1.5 rounded-full text-slate-500 uppercase tracking-widest shadow-sm">
                顯示 {filteredTransactions.length} 筆項目
              </span>
            </div>
            <div className="overflow-y-auto divide-y divide-slate-50">
              {filteredTransactions.length === 0 ? (
                <div className="py-20 flex flex-col items-center text-slate-300">
                  <Box size={48} className="mb-4 opacity-20" />
                  <p className="font-bold">查無交易紀錄</p>
                </div>
              ) : (
                filteredTransactions.map((t) => {
                  const cat = CATEGORIES.find((c) => c.id === t.category);
                  return (
                    <div
                      key={t.id}
                      className="px-8 py-5 flex items-center justify-between group hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-5">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-[10px] font-black shadow-inner p-1 text-center leading-tight"
                          style={{ backgroundColor: cat?.color || "#cbd5e1" }}
                        >
                          {cat?.name.substring(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-slate-800">{t.text}</p>
                            {t.isInvestment && !t.isSettled && (
                              <span className="text-[8px] px-1.5 py-0.5 bg-indigo-600 text-white rounded font-black uppercase tracking-tighter">
                                持倉
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-2">
                            <Clock size={10} /> {t.date}{" "}
                            <span className="text-slate-200">|</span>{" "}
                            {cat?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <p
                          className={`font-black text-lg tabular-nums ${
                            t.amount < 0 ? "text-rose-500" : "text-emerald-600"
                          }`}
                        >
                          {t.amount > 0 ? "+" : ""}
                          {t.amount.toLocaleString()}
                        </p>
                        <button
                          onClick={() =>
                            setTransactions(
                              transactions.filter((x) => x.id !== t.id)
                            )
                          }
                          className="text-slate-200 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 p-2 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODALS */}
      {showRecurring && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-100">
            <div className="p-10 border-b flex justify-between items-center bg-emerald-50/30">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg">
                  <RefreshCw size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">
                    固定收支管理
                  </h2>
                  <p className="text-xs text-emerald-600/60 font-bold uppercase tracking-widest">
                    Recurring Settings
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRecurring(false)}
                className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X />
              </button>
            </div>
            <div className="p-10 overflow-y-auto space-y-10 flex-1">
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  建立新排程
                </p>
                <div className="flex p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <button
                    onClick={() => setRFlow("expense")}
                    className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${
                      rFlow === "expense"
                        ? "bg-rose-500 text-white shadow-md"
                        : "text-slate-400"
                    }`}
                  >
                    固定支出
                  </button>
                  <button
                    onClick={() => setRFlow("income")}
                    className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${
                      rFlow === "income"
                        ? "bg-emerald-500 text-white shadow-md"
                        : "text-slate-400"
                    }`}
                  >
                    固定收入
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="項目名稱"
                    className="w-full p-4 rounded-xl border-none outline-none font-bold text-sm bg-white shadow-sm"
                    value={rText}
                    onChange={(e) => setRText(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="金額"
                    className="w-full p-4 rounded-xl border-none outline-none font-black text-lg bg-white shadow-sm"
                    value={rAmt}
                    onChange={(e) => setRAmt(e.target.value)}
                  />
                  <select
                    className="w-full p-4 rounded-xl border-none outline-none font-bold text-sm bg-white shadow-sm"
                    value={rType}
                    onChange={(e) => setRType(e.target.value)}
                  >
                    <option value="monthly">每月固定</option>
                    <option value="daily">每日固定</option>
                  </select>
                  {rType === "monthly" && (
                    <input
                      type="number"
                      min="1"
                      max="31"
                      className="w-full p-4 rounded-xl border-none outline-none font-black text-indigo-600 bg-white shadow-sm"
                      value={rDay}
                      onChange={(e) => setRDay(e.target.value)}
                    />
                  )}
                  <button
                    onClick={handleAddRecurring}
                    className="col-span-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200 mt-2"
                  >
                    新增排程項目
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  目前運作中的排程
                </p>
                {recurringItems.length === 0 ? (
                  <div className="py-12 text-center text-slate-300 font-bold border-2 border-dashed border-slate-100 rounded-[2rem]">
                    暫無排程資料
                  </div>
                ) : (
                  recurringItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2rem] group hover:border-indigo-100 transition-colors shadow-sm"
                    >
                      <div className="flex items-center gap-5">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            item.flow === "income"
                              ? "bg-emerald-50 text-emerald-500"
                              : "bg-rose-50 text-rose-500"
                          }`}
                        >
                          {item.type === "monthly" ? (
                            <Calendar size={22} />
                          ) : (
                            <Clock size={22} />
                          )}
                        </div>
                        <div>
                          <p className="font-black text-slate-800">
                            {item.text}
                          </p>
                          <p className="text-[10px] text-slate-400 font-black uppercase mt-0.5">
                            {item.type === "monthly"
                              ? `每月 ${item.day} 號`
                              : "每日發生"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span
                          className={`text-xl font-black ${
                            item.flow === "income"
                              ? "text-emerald-500"
                              : "text-rose-500"
                          }`}
                        >
                          {item.flow === "income" ? "+" : "-"}
                          {Math.abs(item.amount).toLocaleString()}
                        </span>
                        <button
                          onClick={() =>
                            setRecurringItems(
                              recurringItems.filter((i) => i.id !== item.id)
                            )
                          }
                          className="p-2 text-slate-200 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {show8591 && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-8 border-b bg-orange-50/30 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-2 rounded-xl text-white">
                  <ShoppingCart size={24} />
                </div>
                <h2 className="text-xl font-black">8591 快速對帳</h2>
              </div>
              <button
                onClick={() => setShow8591(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <input
                type="text"
                placeholder="商品名稱"
                className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold"
                value={salesTitle}
                onChange={(e) => setSalesTitle(e.target.value)}
              />
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <span className="font-bold text-slate-700 text-sm">
                  是否為「代儲」商品？
                </span>
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-orange-500 cursor-pointer"
                  checked={isTopUp}
                  onChange={() => setIsTopUp(!isTopUp)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-widest">
                    銷售總額
                  </label>
                  <input
                    type="number"
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-black text-xl text-emerald-600"
                    value={salesPrice}
                    onChange={(e) => setSalesPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-widest">
                    進貨成本
                  </label>
                  <input
                    type="number"
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-black text-xl text-rose-500"
                    value={salesCost}
                    onChange={(e) => setSalesCost(e.target.value)}
                  />
                </div>
              </div>
              <div className="bg-slate-900 rounded-[2rem] p-6 text-white flex justify-between items-center shadow-lg">
                <span className="text-xs font-bold text-slate-400">
                  手續費預估: ${Math.floor(calculatedFee)}
                </span>
                <div className="text-right">
                  <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">
                    預估淨利
                  </p>
                  <span className="text-2xl font-black text-emerald-400">
                    $
                    {Math.floor(
                      parseFloat(salesPrice || 0) -
                        parseFloat(salesCost || 0) -
                        calculatedFee
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  const pr = parseFloat(salesPrice) || 0;
                  const co = parseFloat(salesCost) || 0;
                  const items = [
                    {
                      text: `${salesTitle} (售)`,
                      amount: pr,
                      category: "8591_sales",
                      date: getNowStr(),
                    },
                    {
                      text: `${salesTitle} (本)`,
                      amount: -co,
                      category: "8591_cost",
                      date: getNowStr(),
                    },
                    {
                      text: `8591手續費`,
                      amount: -Math.floor(calculatedFee),
                      category: "other",
                      date: getNowStr(),
                    },
                  ];
                  setTransactions([
                    ...items.map((i) => ({ ...i, id: Math.random() })),
                    ...transactions,
                  ]);
                  setShow8591(false);
                }}
                className="w-full py-5 bg-orange-500 text-white rounded-[1.5rem] font-black text-lg shadow-lg active:scale-95"
              >
                匯入對帳結果
              </button>
            </div>
          </div>
        </div>
      )}

      {showFastRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden p-10 border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-slate-800">建立新帳目</h2>
              <button
                onClick={() => setShowFastRecord(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X />
              </button>
            </div>
            <div className="space-y-6">
              <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                {["expense", "income", "investment"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFType(type)}
                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${
                      fType === type
                        ? "bg-white shadow-md text-indigo-600"
                        : "text-slate-400"
                    }`}
                  >
                    {type === "expense"
                      ? "支出"
                      : type === "income"
                      ? "收入"
                      : "投資"}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder={
                  fCat === "other" || fCat === "income"
                    ? "項目名稱 (必填)"
                    : "項目名稱 (選填，不填則以分類命名)"
                }
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold"
                value={fText}
                onChange={(e) => setFText(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="金額"
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-black text-xl"
                  value={fAmt}
                  onChange={(e) => setFAmt(e.target.value)}
                />
                <select
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold"
                  value={fCat}
                  onChange={(e) => setFCat(e.target.value)}
                >
                  {CATEGORIES.filter((c) => {
                    if (fType === "investment") return c.type === "investment";
                    if (fType === "income") return c.type === "income";
                    return c.type === "expense";
                  }).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() =>
                  addTransaction({
                    text: fText,
                    amount:
                      fType === "income"
                        ? Math.abs(parseFloat(fAmt))
                        : -Math.abs(parseFloat(fAmt)),
                    category: fCat,
                    isInvestment: fType === "investment",
                  })
                }
                className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl active:scale-95"
              >
                確認記錄
              </button>
            </div>
          </div>
        </div>
      )}

      {showInvManager && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[100] flex flex-col p-8">
          <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
            <div className="flex justify-between items-center mb-10 text-white">
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-3 rounded-2xl">
                  <Briefcase size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black">持倉管理中心</h2>
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">
                    Investment Portfolio Manager
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInvManager(false)}
                className="p-4 bg-white/10 hover:bg-white/20 rounded-3xl text-white transition-all active:scale-90"
              >
                <X />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-6 pb-12 pr-2">
              {activeInvestments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                  <Box size={80} className="mb-4" />
                  <p className="text-xl font-bold">目前無任何持倉項目</p>
                </div>
              ) : (
                activeInvestments.map((inv) => (
                  <div
                    key={inv.id}
                    className="bg-white rounded-[2.5rem] p-10 flex flex-col md:flex-row justify-between items-start md:items-center shadow-2xl transition-transform hover:scale-[1.01]"
                  >
                    <div>
                      <p className="text-2xl font-black text-slate-800">
                        {inv.text}
                      </p>
                      <p className="text-slate-400 font-bold text-xs uppercase flex items-center gap-2 mt-1">
                        <Calendar size={12} /> {inv.date}
                      </p>
                      <div className="mt-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          投入成本
                        </p>
                        <p className="text-4xl font-black text-slate-900 tabular-nums">
                          ${Math.abs(inv.amount).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSettlementTarget(inv)}
                      className="mt-8 md:mt-0 w-full md:w-auto bg-slate-900 text-white px-10 py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl active:scale-95"
                    >
                      結算回收 <ChevronRight size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {settlementTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl border border-slate-100">
            <h2 className="text-xl font-black mb-2 text-slate-800">
              資產回收結算
            </h2>
            <p className="text-slate-400 text-sm font-bold mb-8">
              {settlementTarget.text} (成本: $
              {Math.abs(settlementTarget.amount).toLocaleString()})
            </p>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-500 uppercase px-1">
                  輸入回收總金額
                </label>
                <input
                  type="number"
                  className="w-full p-6 bg-slate-50 rounded-2xl outline-none font-black text-4xl text-indigo-600 shadow-inner"
                  autoFocus
                  placeholder="0"
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSettlement(e.target.value)
                  }
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setSettlementTarget(null)}
                  className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black"
                >
                  取消
                </button>
                <button
                  onClick={(e) => {
                    const val = e.target
                      .closest(".space-y-6")
                      .querySelector("input").value;
                    handleSettlement(val);
                  }}
                  className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-lg active:scale-95"
                >
                  確認結算
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
