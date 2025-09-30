const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification'); 

// Route to get notifications for a specific user
router.get('/:userId', notificationController.getUserNotifications);

// Route to mark a notification as read for a specific user
router.put('/:userId/read/:notificationId', notificationController.markNotificationAsRead);

// Route to mark a notification as dismissed for a specific user
router.put('/:userId/dismiss/:notificationId', notificationController.markNotificationAsDismissed);

// Route for creating a notification (optionally protect this with auth)
router.post('/', notificationController.createNotification);

// ✅ NEW: Route to fetch a notification by its `notification_id` (for frontend access)
router.get('/id/:notificationId', async (req, res) => {
    const { notificationId } = req.params;
    const Notification = require('../models/notification');

    try {
        const notification = await Notification.findOne({ notification_id: notificationId });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found.' });
        }

        res.status(200).json(notification);
    } catch (error) {
        console.error('Error fetching notification by ID:', error);
        res.status(500).json({ message: 'Server error while fetching notification.' });
    }
});

module.exports = router;
