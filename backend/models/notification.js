const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema(
    {
        notification_id: {
            type: String,
            required: true,
            unique: true,
            default: () => new mongoose.Types.ObjectId().toString(),
        },
        type: {
            type: String,
            enum: ['alert', 'success', 'info', 'general'],
            default: 'general',
            required: true,
        },
        title_key: {
            type: String,
            required: true,
        },
        message_key: {
            type: String,
            required: true,
        },
        data: {
            type: Object,
            default: {},
        },
        target_roles: [
            {
                type: String,
                enum: ['all', 'farmer', 'ldi', 'vs'], 
                required: true,
            },
        ],
        target_users: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        active_from: {
            type: Date,
            default: Date.now,
        },
        expires_at: {
            type: Date,
            index: true,
        },
        link: {
            type: String,
            trim: true,
        },
        created_by: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        collection: 'notifications',
    }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;