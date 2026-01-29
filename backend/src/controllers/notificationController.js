const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const user = req.user;
    const query = { $or: [{ role: 'all' }] };
    if (user) {
      query.$or.push({ user: user.id }, { role: user.role });
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const id = req.params.id;
    const notif = await Notification.findById(id);
    if (!notif) return res.status(404).json({ success: false, message: 'Not found' });
    notif.read = true;
    await notif.save();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ success: false, message: 'Error marking read' });
  }
};
