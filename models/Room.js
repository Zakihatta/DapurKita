const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: true
    },
    deskripsi: {
        type: String,
        required: true
    },
    tipe: {
        type: String,
        enum: ['umum', 'resep', 'diskusi'],
        default: 'umum'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Room', roomSchema);