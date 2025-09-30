const mongoose = require('mongoose');
const { Schema } = mongoose;

const userNotificationSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    notification_id: {
        type: String,
        ref: 'Notification',
        required: true,
        index: true
    },
    read_at: {
        type: Date,
        default: null
    },
    is_dismissed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: { createdAt: 'received_at' },
    unique: ['user_id', 'notification_id']
});

const UserNotification = mongoose.model('UserNotification', userNotificationSchema);

module.exports = UserNotification; 