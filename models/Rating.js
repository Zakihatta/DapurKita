const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
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
    nilai: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    tanggal: {
        type: Date,
        default: Date.now
    }
});

// Memastikan satu user hanya bisa memberikan satu rating per resep
ratingSchema.index({ resep: 1, pengguna: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);