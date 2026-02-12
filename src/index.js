"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// --- In-Memory Data ---
const USERS = [
    { id: 1, username: 'admin', role: 'admin' },
    { id: 2, username: 'user', role: 'user' },
];
// --- Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token)
        return res.sendStatus(401);
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err)
            return res.sendStatus(403);
        req.user = user;
        next();
    });
};
const requireRole = (role) => {
    return (req, res, next) => {
        if (req.user?.role !== role) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};
// --- Routes ---
// Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    // Simple password check (in real app, use bcrypt)
    const user = USERS.find(u => u.username === username);
    // Hardcoded passwords as per requirements
    const isValid = (user?.username === 'admin' && password === 'admin123') ||
        (user?.username === 'user' && password === 'user123');
    if (!user || !isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});
// Get Current User
app.get('/api/auth/me', authenticateToken, (req, res) => {
    res.json(req.user);
});
// MFE Configuration
app.get('/api/config/mfe', authenticateToken, (req, res) => {
    const role = req.user?.role;
    if (role === 'admin') {
        res.json({
            url: 'http://localhost:3001/mf-manifest.json',
            scope: 'mfeAdmin',
            module: './AdminDashboard',
            type: 'admin'
        });
    }
    else if (role === 'user') {
        res.json({
            url: 'http://localhost:3002/mf-manifest.json',
            scope: 'mfeUser',
            module: './UserDashboard',
            type: 'user'
        });
    }
    else {
        res.status(400).json({ message: 'Unknown role' });
    }
});
// Protected Data Endpoints
app.get('/api/admin/data', authenticateToken, requireRole('admin'), (req, res) => {
    res.json({ message: 'Welcome to the Admin Dashboard! Here is some sensitive admin data.', stats: { users: 100, revenue: 50000 } });
});
app.get('/api/user/data', authenticateToken, requireRole('user'), (req, res) => {
    res.json({ message: 'Welcome to your User Dashboard! Here is your personal activity feed.', activities: ['Logged in', 'Viewed profile'] });
});
// Start Server
app.listen(PORT, () => {
    console.log(`Backend API running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map
