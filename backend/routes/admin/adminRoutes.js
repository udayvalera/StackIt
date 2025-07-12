const express = require("express");
const router = express.Router();

const authAdminRoutes = require("./auth.admin");

router.use("/auth", authAdminRoutes);

module.exports = router;