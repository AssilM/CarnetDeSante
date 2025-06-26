import app from "./app.js";
import dotenv from "dotenv";
import pool from "./config/db.js";
import createUserTable from "./data/createUserTable.js";

dotenv.config();

const port = process.env.PORT || 3001;

// Créer les tables
createUserTable();

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
