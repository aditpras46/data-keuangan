import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT as GoogleJWT } from 'google-auth-library';
import dotenv from 'dotenv';
import crypto from 'node:crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fintrack-fallback-secret';

// --- Mock Data Storage for Demo Mode ---
const mockDb = {
  Users: [] as any[],
  Pemasukan: [] as any[],
  Pengeluaran: [] as any[],
  Alokasi: [] as any[],
  Profile: [] as any[],
};

// --- Google Sheets Service ---
class SheetsService {
  private doc: GoogleSpreadsheet | null = null;
  public isDemoMode = false;

  async init() {
    if (this.doc) return;
    
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
    const rawKey = process.env.GOOGLE_PRIVATE_KEY?.trim();
    let sheetId = process.env.GOOGLE_SHEET_ID?.trim();

    // Handle full URL if provided instead of just the ID
    if (sheetId && sheetId.includes('spreadsheets/d/')) {
      sheetId = sheetId.split('spreadsheets/d/')[1].split('/')[0];
    }

    if (!email || !rawKey || !sheetId) {
      console.warn('Google Sheets configuration missing. Running in DEMO MODE (In-Memory).');
      this.isDemoMode = true;
      return;
    }

    // Clean up the private key (handle escaped newlines and potential quotes)
    const key = rawKey.replace(/\\n/g, '\n').replace(/^"(.*)"$/, '$1');

    try {
      console.log('Attempting to connect to Google Sheets...');
      const auth = new GoogleJWT({
        email,
        key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.doc = new GoogleSpreadsheet(sheetId, auth);
      await this.doc.loadInfo();
      console.log(`✅ SUCCESS: Connected to Spreadsheet "${this.doc.title}"`);
      this.isDemoMode = false;
    } catch (err: any) {
      console.error('❌ ERROR: Google Sheets Connection Failed:', err.message);
      if (err.message.includes('403')) {
        console.error('PRO TIP: Make sure you shared your Spreadsheet with:', email);
      }
      if (err.message.includes('404')) {
        console.error('PRO TIP: Check your GOOGLE_SHEET_ID. It should be the long ID in the URL.');
      }
      this.isDemoMode = true;
    }
  }

  async getRows(title: string) {
    await this.init();
    if (this.isDemoMode) {
      return mockDb[title as keyof typeof mockDb] || [];
    }
    const sheet = this.doc?.sheetsByTitle[title];
    return sheet ? await sheet.getRows() : [];
  }

  async addRow(title: string, data: any) {
    await this.init();
    if (this.isDemoMode) {
      (mockDb[title as keyof typeof mockDb] as any[]).push({
        ...data,
        get: (key: string) => data[key],
        set: (key: string, val: any) => { data[key] = val; },
        save: async () => {},
        delete: async () => {
          const idx = mockDb[title as keyof typeof mockDb].indexOf(data);
          if (idx > -1) mockDb[title as keyof typeof mockDb].splice(idx, 1);
        },
        toObject: () => data
      });
      return;
    }
    const sheet = this.doc?.sheetsByTitle[title];
    if (sheet) await sheet.addRow(data);
  }

  async ensureSheets() {
    await this.init();
    if (this.isDemoMode || !this.doc) return;

    const required = ['Users', 'Pemasukan', 'Pengeluaran', 'Alokasi', 'Laporan', 'Profile'];
    for (const title of required) {
      if (!this.doc.sheetsByTitle[title]) {
        await this.doc.addSheet({ title, headerValues: this.getHeaders(title) });
      }
    }
  }

  private getHeaders(title: string) {
    switch (title) {
      case 'Users': return ['id', 'email', 'password', 'name', 'createdAt'];
      case 'Pemasukan': return ['id', 'userId', 'date', 'amount', 'source', 'note'];
      case 'Pengeluaran': return ['id', 'userId', 'date', 'amount', 'category', 'note'];
      case 'Alokasi': return ['userId', 'category', 'amount', 'month'];
      case 'Laporan': return ['userId', 'month', 'totalIncome', 'totalExpense', 'balance'];
      case 'Profile': return ['userId', 'email', 'dana', 'ovo', 'seabank', 'bca', 'updatedAt'];
      default: return [];
    }
  }
}

const sheets = new SheetsService();

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  // --- Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Forbidden' });
      req.user = user;
      next();
    });
  };

  // --- Auth Routes ---
  app.post('/api/auth/register', async (req, res) => {
    const { email, password, name } = req.body;
    try {
      const rows = await sheets.getRows('Users');
      if (rows.find((r: any) => (typeof r.get === 'function' ? r.get('email') : r.email) === email)) {
        return res.status(400).json({ error: 'Email sudah terdaftar' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        id: crypto.randomUUID(),
        email,
        password: hashedPassword,
        name,
        createdAt: new Date().toISOString()
      };

      await sheets.addRow('Users', newUser);
      res.status(201).json({ message: 'User created' });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const rows = await sheets.getRows('Users');
      const user = rows.find((r: any) => (typeof r.get === 'function' ? r.get('email') : r.email) === email);

      if (!user) return res.status(401).json({ error: 'Akun tidak ditemukan' });
      
      const userPass = typeof user.get === 'function' ? user.get('password') : user.password;
      if (!(await bcrypt.compare(password, userPass))) {
        return res.status(401).json({ error: 'Password salah' });
      }

      const userData = {
        id: typeof user.get === 'function' ? user.get('id') : user.id,
        email: typeof user.get === 'function' ? user.get('email') : user.email,
        name: typeof user.get === 'function' ? user.get('name') : user.name
      };

      const token = jwt.sign(userData, JWT_SECRET);
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
      res.json({ user: userData });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    res.json({ user: req.user, isDemo: sheets.isDemoMode });
  });

  // --- Finance Routes ---
  app.get('/api/finance/dashboard', authenticateToken, async (req: any, res) => {
    const userId = req.user.id;
    const month = req.query.month || new Date().toISOString().substring(0, 7); // YYYY-MM
    try {
      const pRowsAll = await sheets.getRows('Pemasukan');
      const eRowsAll = await sheets.getRows('Pengeluaran');
      const aRowsAll = await sheets.getRows('Alokasi');

      const pRows = pRowsAll.filter((r: any) => {
        const uId = typeof r.get === 'function' ? r.get('userId') : r.userId;
        const d = typeof r.get === 'function' ? r.get('date') : r.date;
        return uId === userId && d.startsWith(month);
      });

      const eRows = eRowsAll.filter((r: any) => {
        const uId = typeof r.get === 'function' ? r.get('userId') : r.userId;
        const d = typeof r.get === 'function' ? r.get('date') : r.date;
        return uId === userId && d.startsWith(month);
      });

      const aRows = aRowsAll.filter((r: any) => {
        const uId = typeof r.get === 'function' ? r.get('userId') : r.userId;
        const m = typeof r.get === 'function' ? r.get('month') : r.month;
        return uId === userId && m === month;
      });

      const totalIncome = pRows.reduce((sum: number, r: any) => sum + Number(typeof r.get === 'function' ? r.get('amount') : r.amount), 0);
      const totalExpense = eRows.reduce((sum: number, r: any) => sum + Number(typeof r.get === 'function' ? r.get('amount') : r.amount), 0);

      const categories = ['Makan', 'Kebutuhan', 'Tabungan', 'Dana Darurat', 'Dana Hiburan'];
      const allocations = categories.map(cat => {
        const allocated = aRows.find((r: any) => (typeof r.get === 'function' ? r.get('category') : r.category) === cat);
        const spent = eRows.filter((r: any) => (typeof r.get === 'function' ? r.get('category') : r.category) === cat)
                           .reduce((sum: number, r: any) => sum + Number(typeof r.get === 'function' ? r.get('amount') : r.amount), 0);
        const amount = allocated ? Number(typeof allocated.get === 'function' ? allocated.get('amount') : allocated.amount) : 0;
        return {
          category: cat,
          allocated: amount,
          spent,
          remaining: amount - spent,
          percent: amount > 0 ? (spent / amount) * 100 : 0
        };
      });

      res.json({
        balance: totalIncome - totalExpense,
        totalIncome,
        totalExpense,
        allocations,
        recentTransactions: [...pRows, ...eRows]
          .sort((a: any, b: any) => {
            const dateA = new Date(typeof a.get === 'function' ? a.get('date') : a.date).getTime();
            const dateB = new Date(typeof b.get === 'function' ? b.get('date') : b.date).getTime();
            return dateB - dateA;
          })
          .slice(0, 10)
          .map((r: any) => ({
            id: typeof r.get === 'function' ? r.get('id') : r.id,
            type: (typeof r.get === 'function' ? r.get('source') : r.source) ? 'income' : 'expense',
            amount: Number(typeof r.get === 'function' ? r.get('amount') : r.amount),
            category: (typeof r.get === 'function' ? (r.get('category') || r.get('source')) : (r.category || r.source)),
            date: typeof r.get === 'function' ? r.get('date') : r.date,
            note: typeof r.get === 'function' ? r.get('note') : r.note
          }))
      });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.get('/api/finance/stats', authenticateToken, async (req: any, res) => {
    const userId = req.user.id;
    const month = req.query.month || new Date().toISOString().substring(0, 7);
    try {
      const pRowsAll = await sheets.getRows('Pemasukan');
      const eRowsAll = await sheets.getRows('Pengeluaran');
      const aRowsAll = await sheets.getRows('Alokasi');

      const pRows = pRowsAll.filter((r: any) => {
        const uId = typeof r.get === 'function' ? r.get('userId') : r.userId;
        const d = typeof r.get === 'function' ? r.get('date') : r.date;
        return uId === userId && d.startsWith(month);
      });

      const eRows = eRowsAll.filter((r: any) => {
        const uId = typeof r.get === 'function' ? r.get('userId') : r.userId;
        const d = typeof r.get === 'function' ? r.get('date') : r.date;
        return uId === userId && d.startsWith(month);
      });

      const aRows = aRowsAll.filter((r: any) => {
        const uId = typeof r.get === 'function' ? r.get('userId') : r.userId;
        const m = typeof r.get === 'function' ? r.get('month') : r.month;
        return uId === userId && m === month;
      });

      const totalIncome = pRows.reduce((sum: number, r: any) => sum + Number(typeof r.get === 'function' ? r.get('amount') : r.amount), 0);
      const totalExpense = eRows.reduce((sum: number, r: any) => sum + Number(typeof r.get === 'function' ? r.get('amount') : r.amount), 0);

      const categories = ['Makan', 'Kebutuhan', 'Tabungan', 'Dana Darurat', 'Dana Hiburan'];
      const allocations = categories.map(cat => {
        const allocated = aRows.find((r: any) => (typeof r.get === 'function' ? r.get('category') : r.category) === cat);
        const spent = eRows.filter((r: any) => (typeof r.get === 'function' ? r.get('category') : r.category) === cat)
                           .reduce((sum: number, r: any) => sum + Number(typeof r.get === 'function' ? r.get('amount') : r.amount), 0);
        const amount = allocated ? Number(typeof allocated.get === 'function' ? allocated.get('amount') : allocated.amount) : 0;
        return {
          category: cat,
          allocated: amount,
          spent,
          remaining: amount - spent,
          percent: amount > 0 ? (spent / amount) * 100 : 0
        };
      });

      res.json({
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        allocations
      });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post('/api/finance/income', authenticateToken, async (req: any, res) => {
    const userId = req.user.id;
    const { date, amount, source, note } = req.body;
    try {
      const numAmount = Number(amount);
      const isSalary = source.toLowerCase().includes('gaji') || source.toLowerCase().includes('salary');
      
      // Save root income record
      await sheets.addRow('Pemasukan', { id: crypto.randomUUID(), userId, date, amount: numAmount, source, note });

      const currentMonth = date.substring(0, 7);
      
      // Budget Allocation Logic (50/20/10/10/10 split)
      const shares = { 
        'Makan': 0.5, 
        'Kebutuhan': 0.2, 
        'Tabungan': 0.1, 
        'Dana Darurat': 0.1, 
        'Dana Hiburan': 0.1 
      };

      const monthsToAllocate = isSalary ? 2 : 1;
      const amountPerMonth = isSalary ? numAmount / 2 : numAmount;

      for (let i = 0; i < monthsToAllocate; i++) {
        const targetDate = new Date(date);
        targetDate.setMonth(targetDate.getMonth() + i);
        const targetMonth = targetDate.toISOString().substring(0, 7);

        const aRowsAll = await sheets.getRows('Alokasi');
        const aRows = aRowsAll.filter((r: any) => {
          const uId = typeof r.get === 'function' ? r.get('userId') : r.userId;
          const m = typeof r.get === 'function' ? r.get('month') : r.month;
          return uId === userId && m === targetMonth;
        });

        for (const [cat, share] of Object.entries(shares)) {
          const shareAmount = amountPerMonth * share;
          const existing = aRows.find((r: any) => (typeof r.get === 'function' ? r.get('category') : r.category) === cat);
          if (existing) {
            const currentVal = typeof existing.get === 'function' ? existing.get('amount') : existing.amount;
            existing.set ? existing.set('amount', Number(currentVal) + shareAmount) : existing.amount = Number(currentVal) + shareAmount;
            await existing.save();
          } else {
            await sheets.addRow('Alokasi', { userId, category: cat, amount: shareAmount, month: targetMonth });
          }
        }
      }

      res.status(201).json({ 
        message: isSalary ? 'Gaji berhasil displit untuk 2 bulan!' : 'Pendapatan berhasil disimpan dan dialokasikan.' 
      });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post('/api/finance/expense', authenticateToken, async (req: any, res) => {
    const userId = req.user.id;
    const { date, amount, category, note } = req.body;
    try {
      await sheets.addRow('Pengeluaran', { id: crypto.randomUUID(), userId, date, amount, category, note });
      res.status(201).json({ message: 'Expense added' });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.get('/api/finance/transactions', authenticateToken, async (req: any, res) => {
    const userId = req.user.id;
    try {
      const pRowsAll = await sheets.getRows('Pemasukan');
      const eRowsAll = await sheets.getRows('Pengeluaran');
      
      const pRows = pRowsAll.filter((r: any) => (typeof r.get === 'function' ? r.get('userId') : r.userId) === userId);
      const eRows = eRowsAll.filter((r: any) => (typeof r.get === 'function' ? r.get('userId') : r.userId) === userId);

      const transactions = [
        ...pRows.map((r: any) => {
          const data = typeof r.toObject === 'function' ? r.toObject() : r;
          return { ...data, type: 'income', category: data.source };
        }),
        ...eRows.map((r: any) => {
          const data = typeof r.toObject === 'function' ? r.toObject() : r;
          return { ...data, type: 'expense' };
        })
      ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

      res.json(transactions);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.delete('/api/finance/transaction/:type/:id', authenticateToken, async (req: any, res) => {
    const { type, id } = req.params;
    const userId = req.user.id;
    try {
      const sheetTitle = type === 'income' ? 'Pemasukan' : 'Pengeluaran';
      const rows = await sheets.getRows(sheetTitle);
      const row = rows.find((r: any) => (typeof r.get === 'function' ? r.get('id') : r.id) === id && (typeof r.get === 'function' ? r.get('userId') : r.userId) === userId);
      
      if (row) {
        await row.delete();
        res.json({ message: 'Deleted' });
      } else {
        res.status(404).json({ error: 'Not found' });
      }
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.get('/api/finance/transaction/:type/:id', authenticateToken, async (req: any, res) => {
    // ... logic for delete could be here too but original was delete
  });

  // --- Profile Routes ---
  app.get('/api/profile', authenticateToken, async (req: any, res) => {
    const userId = req.user.id;
    try {
      const rows = await sheets.getRows('Profile');
      const profile = rows.find((r: any) => (typeof r.get === 'function' ? r.get('userId') : r.userId) === userId);
      
      if (profile) {
        res.json({
          email: typeof profile.get === 'function' ? profile.get('email') : profile.email,
          dana: typeof profile.get === 'function' ? profile.get('dana') : profile.dana,
          ovo: typeof profile.get === 'function' ? profile.get('ovo') : profile.ovo,
          seabank: typeof profile.get === 'function' ? profile.get('seabank') : profile.seabank,
          bca: typeof profile.get === 'function' ? profile.get('bca') : profile.bca,
        });
      } else {
        res.json({ email: req.user.email, dana: '', ovo: '', seabank: '', bca: '' });
      }
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post('/api/profile', authenticateToken, async (req: any, res) => {
    const userId = req.user.id;
    const { dana, ovo, seabank, bca } = req.body;
    try {
      const rows = await sheets.getRows('Profile');
      let profile = rows.find((r: any) => (typeof r.get === 'function' ? r.get('userId') : r.userId) === userId);
      
      const updateData = {
        userId,
        email: req.user.email,
        dana,
        ovo,
        seabank,
        bca,
        updatedAt: new Date().toISOString()
      };

      if (profile) {
        if (typeof profile.set === 'function') {
          profile.set('dana', dana);
          profile.set('ovo', ovo);
          profile.set('seabank', seabank);
          profile.set('bca', bca);
          profile.set('updatedAt', updateData.updatedAt);
          await profile.save();
        } else {
          // Manual update for mockDb
          Object.assign(profile, updateData);
        }
      } else {
        await sheets.addRow('Profile', updateData);
      }
      res.json({ message: 'Profil berhasil diperbarui' });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // --- Vite / Static ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server: http://localhost:${PORT}`);
    sheets.ensureSheets().catch(console.error);
  });
}

startServer();
