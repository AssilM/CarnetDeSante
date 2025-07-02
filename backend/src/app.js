import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import medecinRoutes from "./routes/medecin.routes.js";
import disponibiliteRoutes from "./routes/disponibilite.routes.js";
import rendezVousRoutes from "./routes/rendezvous.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware.js";
import { requestLogger } from "./middlewares/logging.middleware.js";

dotenv.config();

const app = express();

// Middleware de base
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware de logging
app.use(requestLogger);

// Middleware pour capturer les erreurs de syntaxe JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("Erreur de syntaxe JSON:", err);
    return res.status(400).json({ message: "Format JSON invalide" });
  }
  next(err);
});

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/medecin", medecinRoutes);
app.use("/api/disponibilite", disponibiliteRoutes);
app.use("/api/rendez-vous", rendezVousRoutes);
app.use("/api/admin", adminRoutes);

// Routes de test
app.get("/", (req, res) => {
  res.send("API Carnet de Santé Virtuel");
});

// Middleware pour les routes non trouvées
app.use(notFoundHandler);

// Middleware de gestion d'erreurs (doit être le dernier)
app.use(errorHandler);

export default app;
