/**
 * Middleware to check if user has required role(s)
 * @param {string[]} roles - Allowed roles
 */
const logger = require("../utils/logger");
const checkRole = (roles) => {
  return (req, res, next) => {

    // Check if user exists in request (set by auth middleware)
    if (!req.user || !req.user.role) {
      logger.warn("Role authorization failed - user/role not found", {
        allowedRoles: roles
      });
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
      logger.warn("Access denied - insufficient role", {
        userId: req.user.userId,
        role: userRole,
        allowedRoles
      });
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Role is valid → proceed
    logger.info("Role authorization successful", {
      userId: req.user.userId,
      role: userRole
    });
    next();
  };
};

module.exports = checkRole;