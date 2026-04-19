/**
 * WhatsApp Controller - Baileys Integration
 * 
 * Uses @whiskeysockets/baileys for WhatsApp Web API
 * QR code scanning, message sending, status management
 */

const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const db = require('../models/db');

// ─── State Management ─────────────────────────────────────────────────────────
let waSocket = null;
let currentQR = null;
let connectionStatus = 'disconnected'; // disconnected | connecting | connected
let connectionInfo = {};

const AUTH_DIR = path.join(__dirname, '../data/auth');
if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

// ─── Auto-Reply Handler ───────────────────────────────────────────────────────
const handleIncomingMessage = async (msg) => {
  try {
    if (!msg.message || msg.key.fromMe) return;
    
    const text = (
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''
    ).toLowerCase().trim();

    if (!text) return;

    // Get active auto-reply rules
    const rules = db.find('autoreply', { active: true });
    
    for (const rule of rules) {
      const keyword = rule.keyword.toLowerCase();
      const matches = rule.matchType === 'exact' 
        ? text === keyword
        : text.includes(keyword);
      
      if (matches && waSocket) {
        // Send auto-reply
        await waSocket.sendMessage(msg.key.remoteJid, { text: rule.reply });
        
        // Log it
        db.insert('messages', {
          type: 'auto-reply',
          to: msg.key.remoteJid,
          from: msg.key.remoteJid,
          message: rule.reply,
          trigger: rule.keyword,
          status: 'sent'
        });
        break;
      }
    }

    // Log all incoming messages
    db.insert('messages', {
      type: 'incoming',
      from: msg.key.remoteJid,
      message: text,
      status: 'received'
    });

  } catch (err) {
    console.error('Auto-reply error:', err.message);
  }
};

// ─── Connect to WhatsApp ──────────────────────────────────────────────────────
const connectToWhatsApp = async () => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    
    waSocket = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ['WA Tools Pro', 'Chrome', '1.0.0'],
    });

    connectionStatus = 'connecting';

    waSocket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        currentQR = await QRCode.toDataURL(qr);
        connectionStatus = 'qr';
        console.log('📱 QR Code siap di-scan');
      }

      if (connection === 'close') {
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
        currentQR = null;
        
        if (reason === DisconnectReason.loggedOut) {
          connectionStatus = 'disconnected';
          waSocket = null;
          console.log('🔴 WhatsApp terputus - logged out');
        } else {
          connectionStatus = 'reconnecting';
          console.log('🟡 Reconnecting...');
          setTimeout(connectToWhatsApp, 3000);
        }
      }

      if (connection === 'open') {
        connectionStatus = 'connected';
        currentQR = null;
        connectionInfo = {
          name: waSocket.user?.name,
          number: waSocket.user?.id?.split(':')[0],
          connectedAt: new Date().toISOString()
        };
        console.log('🟢 WhatsApp terhubung:', connectionInfo.name);
      }
    });

    waSocket.ev.on('creds.update', saveCreds);
    
    waSocket.ev.on('messages.upsert', async ({ messages }) => {
      for (const msg of messages) {
        await handleIncomingMessage(msg);
      }
    });

  } catch (err) {
    console.error('WhatsApp connection error:', err.message);
    connectionStatus = 'error';
  }
};

// ─── Controller Methods ───────────────────────────────────────────────────────
const whatsappController = {
  async getQR(req, res) {
    if (connectionStatus === 'connected') {
      return res.json({ success: true, status: 'connected', info: connectionInfo });
    }
    
    if (!waSocket || connectionStatus === 'disconnected' || connectionStatus === 'error') {
      connectToWhatsApp();
    }

    // Poll for QR
    let attempts = 0;
    const waitForQR = () => {
      if (currentQR) {
        return res.json({ success: true, status: 'qr', qr: currentQR });
      }
      if (connectionStatus === 'connected') {
        return res.json({ success: true, status: 'connected', info: connectionInfo });
      }
      if (attempts++ < 20) {
        setTimeout(waitForQR, 500);
      } else {
        res.json({ success: true, status: 'connecting', message: 'Menghubungkan...' });
      }
    };
    waitForQR();
  },

  getStatus(req, res) {
    res.json({
      success: true,
      status: connectionStatus,
      info: connectionInfo
    });
  },

  async sendMessage(req, res) {
    try {
      if (connectionStatus !== 'connected') {
        return res.status(400).json({ success: false, message: 'WhatsApp belum terhubung.' });
      }

      const { number, message } = req.body;
      if (!number || !message) {
        return res.status(400).json({ success: false, message: 'Nomor dan pesan wajib diisi.' });
      }

      // Format number
      const cleaned = number.replace(/\D/g, '');
      const jid = cleaned.startsWith('0')
        ? `62${cleaned.slice(1)}@s.whatsapp.net`
        : cleaned.includes('@') ? cleaned : `${cleaned}@s.whatsapp.net`;

      await waSocket.sendMessage(jid, { text: message });

      // Log message
      db.insert('messages', {
        type: 'outgoing',
        to: jid,
        message,
        status: 'sent',
        userId: req.session.user.id
      });

      // Update usage
      const user = db.findOne('users', { id: req.session.user.id });
      if (user) {
        db.update('users', { id: user.id }, { messagesUsed: (user.messagesUsed || 0) + 1 });
      }

      res.json({ success: true, message: 'Pesan berhasil dikirim!' });
    } catch (err) {
      console.error('Send message error:', err.message);
      res.status(500).json({ success: false, message: `Gagal mengirim: ${err.message}` });
    }
  },

  disconnect(req, res) {
    if (waSocket) {
      waSocket.logout();
      waSocket = null;
    }
    connectionStatus = 'disconnected';
    currentQR = null;
    connectionInfo = {};
    res.json({ success: true, message: 'WhatsApp berhasil diputus.' });
  },

  generateLink(req, res) {
    const { number, message } = req.body;
    if (!number) {
      return res.status(400).json({ success: false, message: 'Nomor wajib diisi.' });
    }
    
    const cleaned = number.replace(/\D/g, '');
    const formatted = cleaned.startsWith('0') ? `62${cleaned.slice(1)}` : cleaned;
    const encodedMsg = message ? `?text=${encodeURIComponent(message)}` : '';
    
    res.json({
      success: true,
      link: `https://wa.me/${formatted}${encodedMsg}`,
      number: formatted
    });
  }
};

module.exports = whatsappController;
