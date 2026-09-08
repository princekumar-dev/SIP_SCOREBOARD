const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      venueId: user.venueId ? String(user.venueId) : null,
    },
    jwtSecret,
    { expiresIn: "12h" }
  );
}

function publicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    venueId: user.venueId ? String(user.venueId) : null,
    status: user.status,
  };
}

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Authentication required." });

    const payload = jwt.verify(token, jwtSecret);
    const user = await User.findById(payload.sub);
    if (!user || user.status !== "active") {
      return res.status(401).json({ error: "Invalid or disabled account." });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session." });
  }
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have permission to perform this action." });
    }
    next();
  };
}

function canAccessVenue(user, venueId) {
  if (user.role === "super_admin" || user.role === "coordinator" || user.role === "venue_host") return true;
  return user.venueId && String(user.venueId) === String(venueId);
}

module.exports = { signToken, publicUser, requireAuth, requireRoles, canAccessVenue };
