const checkRole = (roles) => {
  return (req, res, next) => {
    console.log("USER 👉", req.user); // debug

    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "No role found" });
    }

    const userRole = req.user.role.trim().toLowerCase();

    if (!roles.map(r => r.toLowerCase()).includes(userRole)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

module.exports = checkRole;