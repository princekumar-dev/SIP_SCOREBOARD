const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken, publicUser } = require("../middleware/auth");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user || user.status !== "active") {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials." });

  return res.json({ token: signToken(user), user: publicUser(user) });
});

module.exports = router;
