# Finance Tracker Web App — Project Structure

## Overview

A single-page personal finance tracker built with vanilla HTML, CSS, and JavaScript. No frameworks or build tools — runs directly in the browser using `localStorage` for persistence.

---

## Folder Structure

```
Finance-Tracker-Web-App/
├── index.html        # App shell and all HTML markup
├── style.css         # All styles and CSS custom properties (design tokens)
├── app.js            # All application logic and state management
└── .kiro/
    └── steering/
        └── project-structure.md   # This file
```

---

## File Responsibilities

### `index.html`
- App entry point
- Contains the full layout: topbar, sidebar, main content area
- Sections: metrics grid, transactions panel, bar chart, donut chart, budget tracker, add transaction form
- Links `style.css` in `<head>` and loads `app.js` before `</body>`

### `style.css`
- CSS custom properties (design tokens) defined on `:root` — colors, fonts, border radius
- Component styles organized by section: topbar, sidebar, main, metric cards, transaction list, bar chart, donut, budget, form, toast
- Dark theme throughout using `--bg-base`, `--bg-panel`, `--bg-card` variables
- Monospace font (`JetBrains Mono`) for data/numbers, sans-serif (`DM Sans`) for UI text

### `app.js`
- **State**: `transactions` array and `budgetLimits` object, both persisted to `localStorage`
- **Constants**: `CAT_META` maps category keys to labels, icons, and colors
- **Render pipeline**: `render()` calls all sub-renderers — `renderMetrics()`, `renderTxList()`, `renderChart()`, `renderDonut()`, `renderBudget()`, `updateSidebar()`
- **CRUD**: `addTransaction()`, `deleteTx(id)`, `clearAll()`
- **Charts**: bar chart via DOM elements, donut chart via Canvas API
- **Navigation**: `showTab()`, `showSideTab()`, `scrollToAdd()`
- **Helpers**: `sum()`, `fmt()`, `esc()`, `showToast()`

---

## Data Model

### Transaction
```js
{
  id: number,        // Date.now() or seed integer
  desc: string,      // User-provided description
  amount: number,    // Positive float
  cat: string,       // Category key (see CAT_META)
  date: string,      // ISO date string "YYYY-MM-DD"
  type: 'income' | 'expense'
}
```

### Budget Limits
```js
{
  food: number,
  transport: number,
  shopping: number,
  health: number,
  util: number,
  entertain: number,
  other: number
}
```

---

## Category Keys

| Key         | Label           | Icon |
|-------------|-----------------|------|
| `food`      | Food & Dining   | 🍕   |
| `transport` | Transport       | 🚗   |
| `shopping`  | Shopping        | 🛍   |
| `health`    | Health          | 💊   |
| `util`      | Utilities       | ⚡   |
| `entertain` | Entertainment   | 🎬   |
| `salary`    | Salary          | 💼   |
| `other`     | Other           | 📦   |

---

## localStorage Keys

| Key            | Value                        |
|----------------|------------------------------|
| `kiro_tx`      | JSON array of transactions   |
| `kiro_budget`  | JSON object of budget limits |

---

## Design Tokens (key CSS variables)

| Variable             | Purpose                        |
|----------------------|--------------------------------|
| `--bg-base`          | Page background                |
| `--bg-panel`         | Sidebar / topbar background    |
| `--bg-card`          | Card / panel background        |
| `--accent-green`     | Primary accent, income color   |
| `--accent-red`       | Expense / danger color         |
| `--accent-amber`     | Warning color                  |
| `--accent-blue`      | Secondary accent               |
| `--font-mono`        | JetBrains Mono                 |
| `--font-sans`        | DM Sans                        |
