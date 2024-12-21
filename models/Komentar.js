const mongoose = require('mongoose');

const komentarSchema = new mongoose.Schema({
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
    isi: {
        type: String,
        required: true
    },
    tanggal: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Komentar', komentarSchema);