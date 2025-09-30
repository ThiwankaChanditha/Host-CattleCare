const mongoose = require('mongoose');
const { Schema } = mongoose;

const userRoleSchema = new Schema(
    {
        role_name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        role_level: { type: Number, required: true },
        description: { type: String, default: '' },
    },
    {
        collection: 'user_roles',
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

const UserRole = mongoose.model('UserRole', userRoleSchema); // Correct model name 'UserRole'

module.exports = UserRole;