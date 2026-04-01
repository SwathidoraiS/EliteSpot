/**
 * Middleware to check if user has required role(s)
 * @param {string[]} roles - Allowed roles
 */
const checkRole = (roles) => {
  return (req, res, next) => {

    // Check if user exists in request (set by auth middleware)
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No role found"
      });
    }

    // Normalize user role
    const userRole = req.user.role.trim().toLowerCase();

    // Normalize allowed roles
    const allowedRoles = roles.map((r) => r.toLowerCase());

    // Check access
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Role is valid → proceed
    next();
  };
};

module.exports = checkRole;