const mongoose = require('mongoose');
const Notification = require('../models/notification');
const UserNotification = require('../models/userNotification');
const User = require('../models/users');

exports.getUserNotifications = async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log('Backend: getUserNotifications called with userId from params:', userId);

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log('Backend: Invalid user ID format received:', userId);
            return res.status(400).json({ message: 'Invalid user ID format.' });
        }

        console.log(`Backend: Starting aggregation to find user role for userId: ${userId}`);
        const userWithRole = await User.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(userId) }
            },
            {
                $lookup: {
                    from: 'user_roles',
                    localField: 'role_id',
                    foreignField: '_id',
                    as: 'userRoleInfo'
                }
            },
            {
                $unwind: '$userRoleInfo'
            },
            {
                $project: {
                    _id: 0,
                    role_name: '$userRoleInfo.role_name'
                }
            }
        ]);
        console.log('Backend: Aggregation result for user role:', userWithRole);

        let userRole = null;
        if (userWithRole.length > 0 && userWithRole[0].role_name) {
            userRole = userWithRole[0].role_name.toLowerCase();
            console.log(`Backend: User role determined from aggregation: "${userRole}"`);
        } else {
            console.log('Backend: Aggregation failed to find user or user role name for userId:', userId);
            return res.status(404).json({ message: 'User or user role not found.' });
        }

        const currentDate = new Date();
        const notificationsQuery = {
            $or: [
                { target_roles: 'all' },
                { target_roles: userRole },
                { target_users: new mongoose.Types.ObjectId(userId) }
            ],
            active_from: { $lte: currentDate },
            $or: [
                { expires_at: { $exists: false } },
                { expires_at: null },
                { expires_at: { $gte: currentDate } }
            ]
        };
        console.log("Backend: Notifications query:", JSON.stringify(notificationsQuery, null, 2));

        const availableNotifications = await Notification.find(notificationsQuery).sort({ created_at: -1 });
        console.log(`Backend: Found ${availableNotifications.length} available notifications for user ${userId}.`);

        const notificationIds = availableNotifications.map(notif => notif.notification_id);
        const userReadStatuses = await UserNotification.find({
            user_id: userId,
            notification_id: { $in: notificationIds }
        });
        console.log(`Backend: Found ${userReadStatuses.length} user read statuses for user ${userId}.`);

        const readStatusMap = new Map();
        userReadStatuses.forEach(status => {
            readStatusMap.set(status.notification_id, {
                read: !!status.read_at,
                read_at: status.read_at,
                is_dismissed: status.is_dismissed
            });
        });

        const notificationsWithStatus = availableNotifications.map(notif => {
            const status = readStatusMap.get(notif.notification_id) || { read: false, read_at: null, is_dismissed: false };
            return {
                id: notif.notification_id,
                type: notif.type,
                title_key: notif.title_key,
                message_key: notif.message_key,
                data: notif.data,
                time: notif.created_at.toISOString(),
                link: notif.link,
                read: status.read,
                is_dismissed: status.is_dismissed
            };
        });
        console.log("Backend: Sending combined notifications (first 2):", notificationsWithStatus.slice(0, 2));

        res.status(200).json(notificationsWithStatus);

    } catch (error) {
        console.error('Error fetching user notifications:', error);
        res.status(500).json({ message: 'Server error while fetching notifications.' });
    }
};

exports.markNotificationAsRead = async (req, res) => {
    try {
        const { userId, notificationId } = req.params;
        console.log(`Backend: Mark as Read request for User ID: ${userId}, Notification ID: ${notificationId}`);

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({ message: 'Invalid ID format.' });
        }

        const userNotification = await UserNotification.findOneAndUpdate(
            { user_id: userId, notification_id: notificationId },
            { read_at: new Date() },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: 'Notification marked as read', userNotification });

    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Server error while marking notification as read.' });
    }
};

exports.markNotificationAsDismissed = async (req, res) => {
    try {
        const { userId, notificationId } = req.params;
        console.log(`Backend: Mark as Dismissed request for User ID: ${userId}, Notification ID: ${notificationId}`);

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({ message: 'Invalid ID format.' });
        }

        const userNotification = await UserNotification.findOneAndUpdate(
            { user_id: userId, notification_id: notificationId },
            { is_dismissed: true },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: 'Notification marked as dismissed', userNotification });

    } catch (error) {
        console.error('Error marking notification as dismissed:', error);
        res.status(500).json({ message: 'Server error while marking notification as dismissed.' });
    }
};


exports.createNotification = async (req, res) => {
    try {
        const { type, title_key, message_key, data, target_roles, target_users, active_from, expires_at, link } = req.body;

        const newNotification = new Notification({
            type,
            title_key,
            message_key,
            data: data || {},
            target_roles: target_roles || ['all'],
            target_users: target_users ? target_users.map(id => new mongoose.Types.ObjectId(id)) : [],
            active_from: active_from ? new Date(active_from) : undefined,
            expires_at: expires_at ? new Date(expires_at) : undefined,
            link
        });

        await newNotification.save();
        res.status(201).json({ message: 'Notification created successfully', notification: newNotification });

    } catch (error) {
        console.error('Error creating notification:', error);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'A notification with similar identifying data already exists.' });
        }
        res.status(500).json({ message: 'Server error while creating notification.' });
    }
};