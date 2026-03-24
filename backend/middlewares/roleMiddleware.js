const checkRole = (roles) => {
  return (req, res, next) => {

    // If user not found OR role not allowed
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    next();
  };
};

module.exports = checkRole;