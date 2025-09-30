const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const User = require('../models/users');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({
            email: { $regex: new RegExp('^' + email.trim() + '$', 'i') }
        })
            .populate('role_id', 'role_name')
            .select('+password_hash');


        console.log('Query result:', user);

        console.log('User found:', user);

        if (!user) {
            console.log('Invalid email: User not found for', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            console.log('Password mismatch for user:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const payload = {
            id: user._id,
            role: user.role_id?.role_name || 'No Role Assigned',
            email: user.email,
            profileImage: user.profileImage || null,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        let dashboard = 'default_dashboard';
        switch (payload.role.toLowerCase()) {
            case 'farmer': dashboard = 'farmer_dashboard'; break;
            case 'ldi_officer': dashboard = 'ldi_dashboard'; break;
            case 'veterinarian': dashboard = 'vs_dashboard'; break;
            case 'rd': dashboard = 'rd_dashboard'; break;
            case 'pd': dashboard = 'pd_dashboard'; break;
            case 'dg': dashboard = 'dg_dashboard'; break;
            case 'sysadmin': dashboard = 'sysadmin_dashboard'; break;
        }

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                full_name: user.full_name,
                role: payload.role,
                rating: user.rating,
                dashboard,
                profileImage: user.profileImage,
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login process' });
    }
});


module.exports = router;