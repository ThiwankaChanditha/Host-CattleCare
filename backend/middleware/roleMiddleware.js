/**
 * Middleware to restrict access based on user roles.
 * This middleware should be used AFTER the `protect` middleware.
 *
 * @param {string[]} allowedRoles - An array of roles (e.g., ['admin', 'veterinarian']) that are allowed to access the route.
 */
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Access denied: User role not found.' });
        }

        const userRole = req.user.role.toLowerCase();
        if (allowedRoles.includes(userRole)) {
            next();
        } else {
            res.status(403).json({ message: 'Access denied: You do not have the required permissions.' });
        }
    };
};

module.exports = { authorizeRole };