const express = require('express');
const router = express.Router();
const Komentar = require('../models/Komentar');

// Mendapatkan jumlah komentar berdasarkan resep
router.get('/jumlah/:resepId', async (req, res) => {
    try {
        const resepId = req.params.resepId;
        const komentarCount = await Komentar.countDocuments({ resep: resepId });
        res.json({ komentarCount });
    } catch (error) {
        console.error('Error counting comments:', error);
        res.status(500).json({ message: 'Gagal mendapatkan jumlah komentar' });
    }
});

module.exports = router;
