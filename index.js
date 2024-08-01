const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const contentRoutes = require("./routes/contentRoutes");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware for CORS
// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests from localhost and the production domain
    const allowedOrigins = [
      "http://localhost:3000",
      "https://philbizz.vercel.app",
    ];
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET, POST, PUT, DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware for CORS
app.use(cors(corsOptions));

app.use(express.json());

// Route handling
app.use("/api/content", contentRoutes);
app.use("/api/auth", authRoutes);

// Error handler should be the last middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
