/**
 * Auto Reply Controller
 * Manage keyword-based automatic replies
 */

const db = require('../models/db');

const autoReplyController = {
  getAll(req, res) {
    const rules = db.find('autoreply', { userId: req.session.user.id });
    res.json({ success: true, rules });
  },

  create(req, res) {
    const { keyword, reply, matchType = 'contains' } = req.body;
    
    if (!keyword || !reply) {
      return res.status(400).json({ success: false, message: 'Keyword dan balasan wajib diisi.' });
    }

    // Check for duplicate keyword
    const existing = db.findOne('autoreply', { 
      keyword: keyword.toLowerCase(), 
      userId: req.session.user.id 
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Keyword sudah ada.' });
    }

    const rule = db.insert('autoreply', {
      keyword: keyword.toLowerCase(),
      reply,
      matchType,
      active: true,
      userId: req.session.user.id,
      triggerCount: 0
    });

    res.status(201).json({ success: true, rule, message: 'Auto reply berhasil ditambahkan!' });
  },

  update(req, res) {
    const { id } = req.params;
    const { keyword, reply, matchType } = req.body;
    
    const rule = db.findOne('autoreply', { id, userId: req.session.user.id });
    if (!rule) return res.status(404).json({ success: false, message: 'Rule tidak ditemukan.' });

    const updated = db.update('autoreply', { id }, { keyword, reply, matchType });
    res.json({ success: true, rule: updated, message: 'Auto reply diperbarui!' });
  },

  remove(req, res) {
    const { id } = req.params;
    db.remove('autoreply', { id, userId: req.session.user.id });
    res.json({ success: true, message: 'Auto reply dihapus.' });
  },

  toggle(req, res) {
    const { id } = req.params;
    const rule = db.findOne('autoreply', { id, userId: req.session.user.id });
    if (!rule) return res.status(404).json({ success: false, message: 'Rule tidak ditemukan.' });

    const updated = db.update('autoreply', { id }, { active: !rule.active });
    res.json({ 
      success: true, 
      rule: updated,
      message: `Auto reply ${updated.active ? 'diaktifkan' : 'dinonaktifkan'}.`
    });
  }
};

module.exports = autoReplyController;
