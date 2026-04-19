/**
 * Analytics Controller
 */

const db = require('../models/db');

const analyticsController = {
  getStats(req, res) {
    const userId = req.session.user.id;
    
    const allMessages = db.find('messages', { userId });
    const outgoing = allMessages.filter(m => m.type === 'outgoing').length;
    const incoming = allMessages.filter(m => m.type === 'incoming').length;
    const autoReplied = allMessages.filter(m => m.type === 'auto-reply').length;
    const broadcasts = db.find('broadcasts', { userId }).length;
    const autoRules = db.find('autoreply', { userId }).length;
    const activeRules = db.find('autoreply', { userId, active: true }).length;

    // Messages per day (last 7 days)
    const now = new Date();
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = allMessages.filter(m => m.createdAt?.startsWith(dateStr)).length;
      dailyStats.push({ date: dateStr, count });
    }

    const user = db.findOne('users', { id: userId });

    res.json({
      success: true,
      stats: {
        totalSent: outgoing,
        totalReceived: incoming,
        autoReplied,
        broadcasts,
        autoRules,
        activeRules,
        dailyStats,
        plan: user?.plan || 'free',
        messagesUsed: user?.messagesUsed || 0,
        messageLimit: user?.messageLimit || 100
      }
    });
  },

  getMessageLogs(req, res) {
    const userId = req.session.user.id;
    const { page = 1, limit = 20, type } = req.query;
    
    let messages = db.find('messages', { userId });
    if (type) messages = messages.filter(m => m.type === type);
    
    messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const start = (page - 1) * limit;
    const paginated = messages.slice(start, start + Number(limit));
    
    res.json({
      success: true,
      messages: paginated,
      total: messages.length,
      page: Number(page)
    });
  }
};

module.exports = analyticsController;
