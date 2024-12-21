const jwt = require('jsonwebtoken');


module.exports = (req, res, next) => {
    try {
        // Cek session user
        if (!req.session.user) {
            return res.redirect('/login');
        }

        // Jika ada session, lanjutkan
        req.pengguna = req.session.user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.redirect('/login');
    }
};