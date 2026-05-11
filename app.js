/* ── app.js ── */

// ── State ──
let txType = 'income';
let editingBudget = false;

let transactions = JSON.parse(localStorage.getItem('kiro_tx') || '[]');
let budgetLimits = JSON.parse(localStorage.getItem('kiro_budget') || JSON.stringify({
    food: 400, transport: 200, shopping: 300, health: 150, util: 200, entertain: 150, other: 100
}));

const CAT_META = {
    food: { label: 'Food & Dining', icon: '🍕', color: '#f5a623' },
    transport: { label: 'Transport', icon: '🚗', color: '#4e9fff' },
    shopping: { label: 'Shopping', icon: '🛍', color: '#a78bfa' },
    health: { label: 'Health', icon: '💊', color: '#f45b69' },
    util: { label: 'Utilities', icon: '⚡', color: '#4e9fff' },
    entertain: { label: 'Entertainment', icon: '🎬', color: '#a78bfa' },
    salary: { label: 'Salary', icon: '💼', color: '#3ddc84' },
    other: { label: 'Other', icon: '📦', color: '#7e8faa' },
};

// ── Init ──
document.getElementById('f-date').value = new Date().toISOString().split('T')[0];

if (!transactions.length) seedData();
render();

// ── Seed ──
function seedData() {
    transactions = [
        { id: 1, desc: 'Monthly salary', amount: 5200, cat: 'salary', date: '2025-05-01', type: 'income' },
        { id: 2, desc: 'Rent payment', amount: 1400, cat: 'util', date: '2025-05-02', type: 'expense' },
        { id: 3, desc: 'Grocery run', amount: 87.50, cat: 'food', date: '2025-05-03', type: 'expense' },
        { id: 4, desc: 'Netflix subscription', amount: 15.99, cat: 'entertain', date: '2025-05-04', type: 'expense' },
        { id: 5, desc: 'Freelance project', amount: 800, cat: 'salary', date: '2025-05-05', type: 'income' },
        { id: 6, desc: 'Gym membership', amount: 49, cat: 'health', date: '2025-05-06', type: 'expense' },
        { id: 7, desc: 'Uber rides', amount: 38.20, cat: 'transport', date: '2025-05-07', type: 'expense' },
        { id: 8, desc: 'Coffee & snacks', amount: 42, cat: 'food', date: '2025-05-08', type: 'expense' },
        { id: 9, desc: 'Online shopping', amount: 124.99, cat: 'shopping', date: '2025-05-09', type: 'expense' },
        { id: 10, desc: 'Side project payment', amount: 350, cat: 'salary', date: '2025-04-28', type: 'income' },
        { id: 11, desc: 'Electric bill', amount: 95, cat: 'util', date: '2025-04-15', type: 'expense' },
        { id: 12, desc: 'Doctors visit', amount: 60, cat: 'health', date: '2025-04-20', type: 'expense' },
    ];
    save();
}

// ── Save ──
function save() {
    localStorage.setItem('kiro_tx', JSON.stringify(transactions));
    localStorage.setItem('kiro_budget', JSON.stringify(budgetLimits));
}

// ── Render ──
function render() {
    renderMetrics();
    renderTxList();
    renderChart();
    renderDonut();
    renderBudget();
    updateSidebar();
}

// ── Metrics ──
function renderMetrics() {
    const income = sum(transactions, t => t.type === 'income');
    const expense = sum(transactions, t => t.type === 'expense');
    const balance = income - expense;
    const sr = income > 0 ? Math.max(0, (income - expense) / income * 100) : 0;
    const incCnt = transactions.filter(t => t.type === 'income').length;
    const expCnt = transactions.filter(t => t.type === 'expense').length;

    const balEl = document.getElementById('m-balance');
    const balCh = document.getElementById('m-balance-change');
    balEl.textContent = fmt(Math.abs(balance));
    balEl.style.color = balance >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
    balCh.textContent = balance >= 0 ? '▲ positive balance' : '▼ negative balance';
    balCh.className = 'metric-change ' + (balance >= 0 ? 'up' : 'down');

    document.getElementById('m-income').textContent = fmt(income);
    document.getElementById('m-income-count').textContent = incCnt + ' transaction' + (incCnt !== 1 ? 's' : '');
    document.getElementById('m-expenses').textContent = fmt(expense);
    document.getElementById('m-expense-count').textContent = expCnt + ' transaction' + (expCnt !== 1 ? 's' : '');

    const srEl = document.getElementById('m-savings-rate');
    srEl.textContent = sr.toFixed(1) + '%';
    srEl.style.color = sr >= 20 ? 'var(--accent-green)' : sr >= 10 ? 'var(--accent-amber)' : 'var(--accent-red)';
}

// ── TX List ──
function renderTxList() {
    const list = document.getElementById('tx-list');
    const footer = document.getElementById('tx-footer');
    if (!transactions.length) {
        list.innerHTML = '<div class="empty">no transactions yet<br><span class="hint">add your first entry →</span></div>';
        footer.textContent = 'ready';
        return;
    }
    list.innerHTML = transactions.slice(0, 10).map(t => {
        const m = CAT_META[t.cat] || CAT_META.other;
        const sign = t.type === 'income' ? '+' : '-';
        return `<div class="tx-item">
      <div class="tx-icon ${t.cat}">${m.icon}</div>
      <div class="tx-info">
        <div class="tx-name">${esc(t.desc)}</div>
        <div class="tx-meta">${t.date} · ${m.label}</div>
      </div>
      <div class="tx-amount ${t.type}">${sign}${fmt(t.amount)}</div>
      <button class="tx-delete-btn" onclick="deleteTx(${t.id})" title="Delete">✕</button>
    </div>`;
    }).join('');
    footer.textContent = transactions.length + ' total record' + (transactions.length !== 1 ? 's' : '');
}

// ── Add / Delete ──
function addTransaction() {
    const desc = document.getElementById('f-desc').value.trim();
    const amount = parseFloat(document.getElementById('f-amount').value);
    const cat = document.getElementById('f-category').value;
    const date = document.getElementById('f-date').value;

    if (!desc) { showToast('⚠ description is required'); return; }
    if (isNaN(amount) || amount <= 0) { showToast('⚠ enter a valid amount'); return; }
    if (!date) { showToast('⚠ date is required'); return; }

    transactions.unshift({ id: Date.now(), desc, amount, cat, date, type: txType });
    save();
    render();

    document.getElementById('f-desc').value = '';
    document.getElementById('f-amount').value = '';
    document.getElementById('form-status').textContent = 'committed: ' + desc + ' — ' + fmt(amount);
    showToast('✓ ' + (txType === 'income' ? 'income' : 'expense') + ' added: ' + fmt(amount));
}

function deleteTx(id) {
    transactions = transactions.filter(t => t.id !== id);
    save(); render();
    showToast('transaction removed');
}

function clearAll() {
    if (!confirm('Reset all transaction data? This cannot be undone.')) return;
    transactions = [];
    save(); render();
    showToast('all data cleared');
}

// ── Type Toggle ──
function setType(t) {
    txType = t;
    document.getElementById('btn-income').className = 'type-btn' + (t === 'income' ? ' active-income' : '');
    document.getElementById('btn-expense').className = 'type-btn' + (t === 'expense' ? ' active-expense' : '');
}

// ── Bar Chart ──
function renderChart() {
    const el = document.getElementById('monthly-chart');
    const months = getLast6Months();
    if (!months.some(m => m.income > 0 || m.expense > 0)) {
        el.innerHTML = '<div class="empty" style="padding:8px 0">add transactions to see chart</div>';
        return;
    }
    const maxV = Math.max(...months.map(m => Math.max(m.income, m.expense)), 1);
    el.innerHTML = months.map(m => {
        const iH = Math.max(Math.round((m.income / maxV) * 64), m.income > 0 ? 3 : 0);
        const eH = Math.max(Math.round((m.expense / maxV) * 64), m.expense > 0 ? 3 : 0);
        return `<div class="bar-col">
      <div class="bar-pair">
        <div class="bar bar-income"  style="height:${iH}px"  title="Income: ${fmt(m.income)}"></div>
        <div class="bar bar-expense" style="height:${eH}px"  title="Expenses: ${fmt(m.expense)}"></div>
      </div>
      <div class="bar-label">${m.label}</div>
    </div>`;
    }).join('');
}

function getLast6Months() {
    const out = [], now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        out.push({
            label: d.toLocaleString('default', { month: 'short' }).toLowerCase(),
            income: sum(transactions, t => t.type === 'income' && t.date.startsWith(key)),
            expense: sum(transactions, t => t.type === 'expense' && t.date.startsWith(key)),
        });
    }
    return out;
}

// ── Donut ──
function renderDonut() {
    const canvas = document.getElementById('donut-canvas');
    const legend = document.getElementById('donut-legend');
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2, R = 42, r = 28;

    ctx.clearRect(0, 0, W, H);

    const expenses = transactions.filter(t => t.type === 'expense');
    if (!expenses.length) {
        legend.innerHTML = '<div class="empty no-pad">no expense data</div>';
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.strokeStyle = '#252b3b'; ctx.lineWidth = 14; ctx.stroke();
        return;
    }

    const totals = {};
    expenses.forEach(t => totals[t.cat] = (totals[t.cat] || 0) + t.amount);
    const total = Object.values(totals).reduce((a, v) => a + v, 0);
    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);

    let angle = -Math.PI / 2;
    sorted.forEach(([cat, val]) => {
        const slice = (val / total) * Math.PI * 2;
        const m = CAT_META[cat] || CAT_META.other;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R, angle, angle + slice);
        ctx.closePath();
        ctx.fillStyle = m.color;
        ctx.fill();
        angle += slice;
    });

    // Hole
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#181c25'; ctx.fill();

    // Center total
    ctx.fillStyle = '#e2e8f8';
    ctx.font = '500 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fmt(total, true), cx, cy);

    // Legend
    legend.innerHTML = sorted.slice(0, 5).map(([cat, val]) => {
        const m = CAT_META[cat] || CAT_META.other;
        return `<div class="legend-item">
      <div class="legend-dot" style="background:${m.color}"></div>
      ${m.label}
      <span class="legend-pct">${((val / total) * 100).toFixed(1)}%</span>
    </div>`;
    }).join('');
}

// ── Budget ──
function toggleBudgetEdit() {
    editingBudget = !editingBudget;
    document.getElementById('edit-budget-btn').textContent = editingBudget ? 'save limits' : 'edit limits';
    renderBudget();
}

function renderBudget() {
    const panel = document.getElementById('budget-panel');
    const expCats = [...new Set(transactions.filter(t => t.type === 'expense').map(t => t.cat))];
    if (!expCats.length) { panel.innerHTML = '<div class="empty">no expenses recorded</div>'; return; }

    panel.innerHTML = expCats.map(cat => {
        const m = CAT_META[cat] || CAT_META.other;
        const spent = sum(transactions, t => t.type === 'expense' && t.cat === cat);
        const limit = budgetLimits[cat] || 500;
        const pct = Math.min((spent / limit) * 100, 100).toFixed(1);
        const over = spent > limit;
        const fill = over ? 'var(--accent-red)' : pct > 80 ? 'var(--accent-amber)' : m.color;

        const right = editingBudget
            ? `<input class="budget-input" type="number" min="1" value="${limit}"
           onchange="budgetLimits['${cat}']=Math.max(1,parseFloat(this.value)||${limit});save();renderBudget()">`
            : `<div class="budget-nums">${fmt(spent)} / ${fmt(limit)}${over ? ' ⚠' : ''}</div>`;

        return `<div class="budget-item">
      <div class="budget-row">
        <div class="budget-name">
          <span class="budget-cat-dot" style="background:${m.color}"></span>${m.label}
        </div>
        ${right}
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width:${pct}%;background:${fill}"></div>
      </div>
    </div>`;
    }).join('');
}

// ── Sidebar ──
function updateSidebar() {
    const balance = sum(transactions, t => t.type === 'income') - sum(transactions, t => t.type === 'expense');
    const b = document.getElementById('badge-checking');
    if (b) b.textContent = fmt(balance, true);
}

// ── Navigation ──
function showTab(el, name) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    if (name === 'transactions') scrollToAdd();
    else if (name === 'budget') document.getElementById('add-section').previousElementSibling.scrollIntoView({ behavior: 'smooth' });
    else document.getElementById('main-content').scrollTo({ top: 0, behavior: 'smooth' });
}

function showSideTab(el, name) {
    document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
    if (name === 'add') scrollToAdd();
    else document.getElementById('main-content').scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToAdd() {
    document.getElementById('add-section').scrollIntoView({ behavior: 'smooth' });
}

// ── Helpers ──
function sum(arr, pred) {
    return arr.filter(pred).reduce((s, t) => s + t.amount, 0);
}

function fmt(n, short) {
    if (short && Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(1) + 'k';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);
}

function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 2600);
}
