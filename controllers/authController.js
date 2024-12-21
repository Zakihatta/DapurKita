const Pengguna = require('../models/Pengguna');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const sendEmail = require('../config/nodemailer');
const { text } = require('stream/consumers');


exports.lupaPassword = async (req, res) => {
    res.render('pages/forgot-password', { 
        title: 'Lupa Password',
        error: null 
    });
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        // Cari pengguna berdasarkan token reset password
        const pengguna = await Pengguna.findOne({ 
            resetPasswordToken: token, 
            resetPasswordExpire: { $gt: Date.now() } 
        });

        // Verifikasi password sama
        if (password !== confirmPassword) {
            return res.render('pages/reset-password', {
                title: 'Reset Password',
                error: 'Password tidak cocok',
                token
            });
        }

        if (!pengguna) {
            return res.render('pages/forgot-password', { 
                error: 'Token tidak valid atau sudah kadaluarsa',
                title: 'Lupa Password'
            });
        }

        // Hash password baru
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Update password pengguna dan kosongkan token
        pengguna.password = hashPassword;
        pengguna.resetPasswordToken = undefined;
        pengguna.resetPasswordExpire = undefined;
        await pengguna.save();

        return res.render('pages/login', { 
            success: 'Password Anda berhasil direset, silakan login dengan password baru.',
            title: 'Masuk',
        });

    } catch (error) {
        console.error(error);
        return res.render('pages/reset-password', {
            title: 'Reset Password',
            error: 'Terjadi kesalahan pada server.',
            token: req.params.token
        });
    }
};

// Kirim email untuk reset password
exports.kirimResetEmail = async (req, res) => {
    try {
        const { email } = req.body;

        // Cari pengguna berdasarkan email
        const pengguna = await Pengguna.findOne({ email });
        if (!pengguna) {
            return res.render('pages/forgot-password', {
                error: 'Email tidak ditemukan.',
                title: 'Lupa Password'
            });
        }

        // Buat token reset
        const resetToken = crypto.randomBytes(32).toString('hex');
        pengguna.resetPasswordToken = resetToken;
        pengguna.resetPasswordExpire = Date.now() + 3600000; // Token berlaku 1 jam
        await pengguna.save();

        const resetURL = `http://${req.headers.host}/auth/reset-password/${resetToken}`;

        // Kirim email dengan link reset password
        await sendEmail(
            pengguna.email,
            'Reset Password - DapurKita',
            undefined,
             `
                <h2>Permintaan Reset Password</h2>
                <p>Untuk mereset password Anda, klik link di bawah ini:</p>
                <a href="${resetURL}">${resetURL}</a>
                <p>Jika Anda tidak merasa membuat permintaan ini, abaikan saja email ini.</p>
            `
        )

        res.render('pages/forgot-password', {
            success: 'Kami telah mengirimkan email untuk reset password.',
            title: 'Lupa Password'
        });
    } catch (error) {
        console.error('Error dalam mengirimkan email reset password:', error);
        res.render('pages/forgot-password', {
            error: 'Terjadi kesalahan, coba lagi nanti.',
            title: 'Lupa Password'
        });
    }
};

exports.masuk = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Cek user
        const pengguna = await Pengguna.findOne({ email });
        if (!pengguna) {
            return res.render('pages/login', { 
                error: 'Email atau password salah',
                title: 'Masuk',
                user: null 
            });
        }

        // Verifikasi password
        const validPassword = await bcrypt.compare(password, pengguna.password);
        if (!validPassword) {
            return res.render('pages/login', { 
                error: 'Email atau password salah',
                title: 'Masuk',
                user: null 
            });
        }

        // Set session dengan lengkap
        req.session.user = {
            id: pengguna._id.toString(), // Pastikan ID tersimpan
            nama: pengguna.nama,
            email: pengguna.email
        };
        
        // Generate Token
        const token = jwt.sign(
            { id: pengguna._id },
            process.env.JWT_SECRET || 'rahasiajwt'
        );
        res.cookie('token', token);
        
        return res.redirect('/dashboard');
    } catch (error) {
        console.error('Error dalam login:', error);
        res.render('pages/login', { 
            error: 'Terjadi kesalahan server',
            title: 'Masuk',
            user: null 
        });
    }
};

// Update register untuk redirect ke login
exports.daftar = async (req, res) => {
    try {
        const { nama, email, password } = req.body;
        
        const penggunaSudahAda = await Pengguna.findOne({ email });
        if (penggunaSudahAda) {
            return res.render('pages/register', { 
                error: 'Email sudah terdaftar',
                title: 'Daftar',
                user: null 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const penggunaBaru = new Pengguna({
            nama,
            email,
            password: hashPassword
        });

        await penggunaBaru.save();

        // Redirect ke login setelah daftar berhasil
        res.redirect('/login');

    } catch (error) {
        console.error('Error dalam pendaftaran:', error);
        res.render('pages/register', {
            error: 'Terjadi kesalahan server',
            title: 'Daftar',
            user: null
        });
    }
};


exports.logout = (req, res) => {
    req.session.destroy();
    res.clearCookie('token');
    res.redirect('/login');
};