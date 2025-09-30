const jwt = require('jsonwebtoken');
const User = require('../models/users');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch user and populate the role_id from UserRole model
            const user = await User.findById(decoded.id)
                .select('-password_hash') // Match your user schema
                .populate('role_id', 'role_name'); // 👈 populates from UserRole collection

            if (!user) {
                console.warn('AuthMiddleware: User not found for ID:', decoded.id);
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            let userRole = null;
            if (user.role_id && typeof user.role_id === 'object' && user.role_id.role_name) {
                userRole = user.role_id.role_name.toLowerCase();
            } else if (decoded.role) {
                userRole = decoded.role.toLowerCase();
                console.warn('AuthMiddleware: Using role from token as fallback:', userRole);
            } else {
                console.warn('AuthMiddleware: Role could not be determined from DB or token.');
            }

            req.user = {
                _id: user._id,
                id: user._id.toString(),
                email: user.email,
                username: user.username,
                full_name: user.full_name,
                profileImage: user.profileImage,
                role: userRole,
                // Add more fields here if needed
            };

            next();
        } catch (error) {
            console.error('AuthMiddleware: Token verification or DB error:', error);

            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Not authorized, invalid token' });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Not authorized, token expired' });
            }

            res.status(500).json({ message: 'Server error during authentication' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

module.exports = { protect };
