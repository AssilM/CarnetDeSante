import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Routes de test
app.get("/", (req, res) => {
  res.send("API Carnet de Santé Virtuel");
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Une erreur est survenue",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

export default app;
