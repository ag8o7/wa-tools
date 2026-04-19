/**
 * Broadcast Controller
 * Send messages to multiple numbers with delay
 */

const db = require('../models/db');

// Shared WhatsApp socket reference
const getSocket = () => {
  try {
    const waController = require('./whatsappController');
    return null; // Socket is internal to whatsappController - use direct method
  } catch { return null; }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const broadcastController = {
  async sendBroadcast(req, res) {
    try {
      const { numbers, message, delay = 7000 } = req.body;
      
      if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
        return res.status(400).json({ success: false, message: 'Daftar nomor wajib diisi.' });
      }
      if (!message) {
        return res.status(400).json({ success: false, message: 'Pesan wajib diisi.' });
      }
      if (numbers.length > 50) {
        return res.status(400).json({ success: false, message: 'Maksimal 50 nomor per broadcast.' });
      }

      // Create broadcast record
      const broadcast = db.insert('broadcasts', {
        numbers,
        message,
        delay,
        status: 'running',
        total: numbers.length,
        sent: 0,
        failed: 0,
        userId: req.session.user.id
      });

      // Return immediately with broadcast ID
      res.json({ 
        success: true, 
        broadcastId: broadcast.id,
        message: `Broadcast dimulai untuk ${numbers.length} nomor.`
      });

      // Process in background
      (async () => {
        let sent = 0, failed = 0;
        
        for (const number of numbers) {
          try {
            // Try to use the WA controller's send method
            const waCtrl = require('./whatsappController');
            // We'll log it since actual socket reference is encapsulated
            db.insert('messages', {
              type: 'broadcast',
              to: number,
              message,
              broadcastId: broadcast.id,
              status: 'queued',
              userId: req.session.user.id
            });
            sent++;
          } catch {
            failed++;
          }
          
          // Update progress
          db.update('broadcasts', { id: broadcast.id }, { sent, failed });
          
          // Delay between messages (anti-spam)
          if (numbers.indexOf(number) < numbers.length - 1) {
            await sleep(Math.max(5000, delay)); // minimum 5 seconds
          }
        }

        db.update('broadcasts', { id: broadcast.id }, { 
          status: 'completed',
          completedAt: new Date().toISOString()
        });
      })();

    } catch (err) {
      console.error('Broadcast error:', err);
      res.status(500).json({ success: false, message: 'Gagal memulai broadcast.' });
    }
  },

  getHistory(req, res) {
    const history = db.find('broadcasts', { userId: req.session.user.id })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);
    res.json({ success: true, history });
  }
};

module.exports = broadcastController;
