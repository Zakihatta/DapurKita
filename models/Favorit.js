const mongoose = require('mongoose');

const favoritSchema = new mongoose.Schema({
    resep: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resep',
        required: true
    },
    pengguna: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pengguna',
        required: true
    },
    tanggal: {
        type: Date,
        default: Date.now
    }
});

// Indeks gabungan untuk mencegah duplikasi favorit
favoritSchema.index({ resep: 1, pengguna: 1 }, { unique: true });

module.exports = mongoose.model('Favorit', favoritSchema);