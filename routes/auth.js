const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Auth routes
router.post('/masuk', authController.masuk);
router.post('/daftar', authController.daftar);
router.get('/logout', authController.logout);

// Password reset routes
router.get('/lupa-password', authController.lupaPassword);
router.post('/lupa-password', authController.kirimResetEmail);

// Route untuk menampilkan form reset password
router.get('/reset-password/:token', (req, res) => {
    res.render('pages/reset-password', {
        title: 'Reset Password',
        error: null,
        token: req.params.token
    });
});

// Route untuk memproses reset password
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;