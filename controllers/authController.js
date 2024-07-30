const connection = require("../db_conn/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query =
      "INSERT INTO tblusers (username, email, password) VALUES (?, ?, ?)";
    await connection.query(query, [username, email, hashedPassword]);
    res.status(201).send("User registered successfully");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await connection.query(
      "SELECT * FROM tblusers WHERE email = ?",
      [email]
    );
    const user = rows[0];
    if (!user) return res.status(400).send("Cannot find user");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      const payload = { username: user.username, email: user.email };
      const options = { expiresIn: "1h", algorithm: "HS256" };
      const token = jwt.sign(payload, process.env.SECRET_KEY, options);
      res.json({ token });
    } else {
      res.status(400).send("Incorrect password");
    }
  } catch (error) {
    res.status(500).send("Server error");
  }
};

module.exports = {
  register,
  login,
};
