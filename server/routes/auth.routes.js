const express = require('express');
const router = express.Router();
const { login, register, changePassword, getMe } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/login', login);
router.post('/register', register);
router.put('/change-password', verifyToken, changePassword);
router.get('/me', verifyToken, getMe); 

module.exports = router;
