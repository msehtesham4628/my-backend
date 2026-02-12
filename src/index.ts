import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

app.use(cors());
app.use(express.json());

// --- Types ---
interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
}

interface AuthRequest extends Request {
  user?: User;
}

// --- In-Memory Data ---
const USERS: User[] = [
  { id: 1, username: 'admin', role: 'admin' },
  { id: 2, username: 'user', role: 'user' },
];

// --- Middleware ---
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user as User;
    next();
  });
};

const requireRole = (role: 'admin' | 'user') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

// --- Routes ---

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Simple password check (in real app, use bcrypt)
  const user = USERS.find(u => u.username === username);
  
  // Hardcoded passwords as per requirements
  const isValid = (user?.username === 'admin' && password === 'admin123') ||
                  (user?.username === 'user' && password === 'user123');

  if (!user || !isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// Get Current User
app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json(req.user);
});

// MFE Configuration
app.get('/api/config/mfe', authenticateToken, (req: AuthRequest, res: Response) => {
  const role = req.user?.role;

  if (role === 'admin') {
    res.json({
      url: 'http://localhost:3001/mf-manifest.json',
      scope: 'mfeAdmin',
      module: './AdminDashboard',
      type: 'admin'
    });
  } else if (role === 'user') {
    res.json({
      url: 'http://localhost:3002/mf-manifest.json',
      scope: 'mfeUser',
      module: './UserDashboard',
      type: 'user'
    });
  } else {
    res.status(400).json({ message: 'Unknown role' });
  }
});

// Protected Data Endpoints
app.get('/api/admin/data', authenticateToken, requireRole('admin'), (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the Admin Dashboard! Here is some sensitive admin data.', stats: { users: 100, revenue: 50000 } });
});

app.get('/api/user/data', authenticateToken, requireRole('user'), (req: Request, res: Response) => {
  res.json({ message: 'Welcome to your User Dashboard! Here is your personal activity feed.', activities: ['Logged in', 'Viewed profile'] });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
