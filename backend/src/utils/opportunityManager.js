const Opportunity = require('../models/Opportunity');
const Notification = require('../models/Notification');

async function autoUpdateOpportunities() {
  try {
    const now = new Date();

    // Close opportunities whose deadline has passed and are still open
    const res1 = await Opportunity.updateMany(
      { status: 'open', applicationDeadline: { $lt: now } },
      { $set: { status: 'closed' } }
    );

    // Close opportunities with no available slots
    const res2 = await Opportunity.updateMany(
      { status: 'open', availableSlots: { $lte: 0 } },
      { $set: { status: 'closed' } }
    );

    const totalClosed = (res1.modifiedCount || 0) + (res2.modifiedCount || 0);
    if (totalClosed > 0) {
      // create a system notification for students
      try {
        await Notification.create({
          type: 'opportunity_update',
          role: 'student',
          message: `${totalClosed} opportunity(ies) were closed automatically`,
        });
      } catch (e) {
        console.error('Notification create failed', e);
      }
    }

    return { closed: totalClosed };
  } catch (err) {
    console.error('autoUpdateOpportunities error', err);
    throw err;
  }
}

module.exports = { autoUpdateOpportunities };
