# Google Sheets & Google Apps Script Setup Guide

This guide walks you through connecting this Minimal Stock Inventory App to your own **Google Sheet** using **Google Apps Script** as the serverless REST API backend.

---

## Step 1: Create a Google Spreadsheet

1. Go to [Google Sheets](https://sheets.new) and create a new blank spreadsheet.
2. Title it `StockFlow Inventory` (or any name you prefer).

---

## Step 2: Open the Apps Script Editor

1. In the Google Sheets menu, click **Extensions** > **Apps Script**.
2. A new tab will open with the script editor.
3. Rename the project at the top left to `StockFlow Backend`.

---

## Step 3: Paste the Backend Code

1. In the Apps Script editor, open the default `Code.gs` file (or replace all contents).
2. Copy the entire contents of [`apps-script/Code.gs`](./Code.gs) and paste it into `Code.gs`.
3. If your script is container-bound (opened directly from the Google Sheet via *Extensions > Apps Script*), you can leave `var SPREADSHEET_ID = '';` blank, as it automatically references the active spreadsheet!
   - *Optional*: If creating a standalone script, copy your Spreadsheet ID from the URL (`https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`) and set `var SPREADSHEET_ID = '<YOUR_SPREADSHEET_ID>';`.
4. Click the **Save** floppy icon (or press `Ctrl+S` / `Cmd+S`).

---

## Step 4: Deploy as a Web App

1. In the top right corner of the Apps Script editor, click the blue **Deploy** button > **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in the deployment configuration:
   - **Description**: `v1 - Production`
   - **Execute as**: **Me (your-email@gmail.com)**
   - **Who has access**: **Anyone** *(Essential so the frontend client can perform GET/POST requests without requiring an OAuth sign-in pop-up)*
4. Click **Deploy**.
5. If prompted, click **Authorize access**, select your Google account, click **Advanced**, and then click **Go to StockFlow Backend (unsafe)** to grant permissions to manage your spreadsheet.
6. Copy the **Web App URL** provided (it looks like `https://script.google.com/macros/s/AKfycbx.../exec`).

---

## Step 5: Connect to the Frontend

You have two easy ways to connect:

### Option A: Via In-App Setup (Immediate)
1. In the StockFlow web app, click the **Sheet Status / Settings** icon in the top navigation.
2. Paste your Web App URL into the input field.
3. Click **Test & Connect**. The app tests connection live and immediately begins reading and writing directly to your Google Sheet!

### Option B: Via Environment Variable
1. In `.env.local` or `.env`:
   ```env
   VITE_GOOGLE_APPS_SCRIPT_URL="https://script.google.com/macros/s/AKfycbx.../exec"
   ```
2. Restart the app.

---

## Architecture & Reliability Notes

- **Concurrency Protection**: The script employs `LockService.getScriptLock()` with a 30-second timeout for stock updates and transactions to ensure atomic read-check-write behavior, preventing race conditions.
- **CORS Handling**: Modern browsers send HTTP POST as `text/plain` payload or query parameters, completely avoiding preflight `OPTIONS` blocks that Apps Script does not natively answer.
- **Two Sheets Created Automatically**:
  - `Products`: `productId | title | quantity | imageUrl | description | createdAt | updatedAt`
  - `Transactions`: `transactionId | productId | productTitle | type | quantity | timestamp`
