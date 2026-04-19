/**
 * Auth Controller - Login, Register, Session
 */

const db = require('../models/db');
const crypto = require('crypto');

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const authController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
      }

      const user = db.findOne('users', { email: email.toLowerCase() });
      
      if (!user || user.password !== hashPassword(password)) {
        return res.status(401).json({ success: false, message: 'Email atau password salah.' });
      }

      // Store session (exclude password)
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan || 'free'
      };

      res.json({ 
        success: true, 
        message: 'Login berhasil!',
        user: req.session.user
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ success: false, message: 'Server error.' });
    }
  },

  async register(req, res) {
    try {
      const { name, email, password } = req.body;
      
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Semua field wajib diisi.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password minimal 6 karakter.' });
      }

      const existing = db.findOne('users', { email: email.toLowerCase() });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email sudah terdaftar.' });
      }

      const user = db.insert('users', {
        name,
        email: email.toLowerCase(),
        password: hashPassword(password),
        plan: 'free',
        messagesUsed: 0,
        messageLimit: 100
      });

      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan
      };

      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil! Selamat datang.',
        user: req.session.user
      });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ success: false, message: 'Server error.' });
    }
  },

  logout(req, res) {
    req.session.destroy();
    res.json({ success: true, message: 'Logout berhasil.' });
  },

  getMe(req, res) {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const user = db.findOne('users', { id: req.session.user.id });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const { password, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  }
};

module.exports = authController;
