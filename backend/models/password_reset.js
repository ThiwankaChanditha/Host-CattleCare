// backend/models/password_reset.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const passwordResetSchema = new Schema({
    user_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    email: { 
        type: String, 
        required: true,
        lowercase: true,
        trim: true
    },
    otp: { 
        type: String, 
        required: true 
    },
    created_at: { 
        type: Date, 
        default: Date.now,
        expires: 600 // Document will be automatically deleted after 10 minutes
    },
    is_used: {
        type: Boolean,
        default: false
    }
}, {
    collection: 'password_resets',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for faster queries
passwordResetSchema.index({ email: 1, otp: 1 });
passwordResetSchema.index({ created_at: 1 });

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports = PasswordReset;