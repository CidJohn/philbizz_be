const express = require("express");
const { register, login, user } = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/user", user);
router.get("/protected", authenticateToken, (req, res) => {
  res.send("This is a protected route");
});

module.exports = router;
