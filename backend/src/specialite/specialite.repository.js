import pool from "../config/db.js";

const findAllSpecialites = async () => {
  const query = "SELECT id, nom FROM specialite ORDER BY nom";
  const { rows } = await pool.query(query);
  return rows;
};

export { findAllSpecialites };
