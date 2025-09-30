const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');

const userSchema = new Schema(
    {
        username: { type: String, required: true, unique: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password_hash: { type: String, required: false },
        profileImage: { type: String, default: null },
        role_id: { type: Schema.Types.ObjectId, ref: 'UserRole', required: true },
        division_id: { type: Schema.Types.ObjectId, ref: 'AdministrativeDivision', required: true },
        full_name: { type: String, required: true, trim: true },
        contact_number: { type: String, trim: true },
        address: { type: String, trim: true },
        is_active: { type: Boolean, default: true },
        nic: { type: String, unique: true, sparse: true, trim: true },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

userSchema.pre('save', async function (next) {
    if (this.isModified('password_hash')) {
        const salt = await bcrypt.genSalt(10);
        this.password_hash = await bcrypt.hash(this.password_hash, salt);
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;