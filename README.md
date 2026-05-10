# FinTrack Modern - Personal Finance Manager

A mobile-friendly personal finance management web application built with React, Node.js, and Google Spreadsheets API.

## Features
- **Modern Fintech UI**: Clean, mobile-first design with emerald Green, Black, and White theme.
- **Smart Budget Allocation**: Automatic distribution of income (50% Makan, 20% Kebutuhan, 10% Tabungan, 10% Dana Darurat, 10% Dana Hiburan).
- **Google Sheets Database**: All data is securely stored and synced to your own Google Spreadsheet.
- **Auth System**: Secure login and register with JWT and cookies.
- **Reports**: Real-time statistics, charts, and PDF export.

---

## 🛠 Setup & Installation

### 1. Google Sheets API Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Enable **Google Sheets API**.
4. Go to **IAM & Admin > Service Accounts** and create a service account.
5. Create a **JSON Key** for the service account and download it.
6. Open the JSON key and note the `client_email` and `private_key`.
7. Share your Google Spreadsheet with the `client_email` (Editor access).
8. Copy the **Spreadsheet ID** from the URL: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`.

### 2. Spreadsheet Structure
Create a new Google Spreadsheet and add these sheets (titles must match exactly):
- **Users**: (Headers: `id`, `email`, `password`, `name`, `createdAt`)
- **Pemasukan**: (Headers: `id`, `userId`, `date`, `amount`, `source`, `note`)
- **Pengeluaran**: (Headers: `id`, `userId`, `date`, `amount`, `category`, `note`)
- **Alokasi**: (Headers: `userId`, `category`, `amount`)
- **Laporan**: (Headers: `userId`, `month`, `totalIncome`, `totalExpense`, `balance`)

### 3. Environment Variables
Copy `.env.example` to `.env` and fill in the values:
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@..."
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GOOGLE_SHEET_ID="your-spreadsheet-id"
JWT_SECRET="your-random-secret-key"
```

### 4. Running the App
```bash
npm install
npm run dev
```

---

## 📱 Tech Stack
- **Frontend**: React 19, Tailwind CSS 4, Motion, Recharts.
- **Backend**: Node.js, Express, JWT, Bcrypt.
- **Database**: Google Spreadsheet API.
- **Export**: jsPDF.
