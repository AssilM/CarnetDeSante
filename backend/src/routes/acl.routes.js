import express from "express";
import aclRouter from "../acl/index.js";

const router = express.Router();

// Toutes les routes ACL sont préfixées par /api/acl dans app.js
router.use("/", aclRouter);

export default router;
