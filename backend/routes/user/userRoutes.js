const express = require('express');
const router = express.Router();

const userAuthRoutes = require('./auth.user');

router.use('/auth', userAuthRoutes);

module.exports = router;