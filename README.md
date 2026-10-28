# StockFlow — Minimal Stock Inventory App

A mobile-first stock inventory management web application built with an Apple-inspired **Liquid Glass** interface, powered by **Google Sheets** as a database and **Google Apps Script** as a serverless backend API.

---

## Features

- **Three Primary Pages**:
  1. **Home**: Clean inventory overview with total product count, total units across all products, quick navigation shortcuts, and recently updated items.
  2. **Stock**: Responsive product grid with search by title, add product modal, inline edit details, delete confirmation dialog, and quick stock in/out adjustments.
  3. **Transactions**: Dedicated stock movement recorder with Stock In & Stock Out options, live projected stock balance calculation, strict negative stock prevention, and transaction history feed.
- **Apple Liquid Glass Interface**:
  - Translucent surfaces with soft backdrop blur (`backdrop-filter`).
  - Floating Liquid Glass bottom navigation bar on mobile devices.
  - Light and Dark appearance mode with smooth transitions.
  - Native feel, accessible contrast, responsive typography, and comfortable touch targets (48px+).
- **Persistence & Google Sheets Backend**:
  - Full Google Apps Script API in `apps-script/Code.gs` supporting all required operations: `GET_PRODUCTS`, `GET_PRODUCT`, `CREATE_PRODUCT`, `UPDATE_PRODUCT`, `DELETE_PRODUCT`, `GET_TRANSACTIONS`, `CREATE_TRANSACTION`, and `GET_SUMMARY`.
  - Atomic stock updates and concurrency protection via `LockService`.
  - Immediate out-of-the-box Local Test Mode with instant in-app switching to live Google Sheets.

---

## Project Structure

```text
├── apps-script/
│   ├── Code.gs             # Complete, deployable Google Apps Script backend
│   └── README.md           # Step-by-step Apps Script & Google Sheets setup guide
├── src/
│   ├── components/         # Navigation, ProductCard, ProductFormModal, DeleteConfirmDialog, etc.
│   ├── pages/              # HomePage, StockPage, TransactionsPage
│   ├── services/           # api.ts (Google Apps Script client), inventory-rules.ts (logic & validation)
│   ├── types/              # TypeScript schema matching Google Sheets headers
│   ├── App.tsx             # Root application orchestrator
│   └── index.css           # Apple Liquid Glass styling and Tailwind setup
├── .env.example            # Environment variables template
└── README.md
```

---

## Google Sheets & Apps Script Setup

See the complete guide in [`apps-script/README.md`](./apps-script/README.md) for deployment instructions:
1. Create a spreadsheet at [sheets.new](https://sheets.new).
2. Open **Extensions > Apps Script** and paste `apps-script/Code.gs`.
3. Deploy as a Web App with access set to **Anyone**.
4. Paste the Web App URL into the app's **Database Setup** modal or set `VITE_GOOGLE_APPS_SCRIPT_URL` in your `.env` file.
