const mongoose = require('mongoose');

const resepSchema = new mongoose.Schema({
    pembuat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pengguna',
        required: true
    },
    judul: {
        type: String,
        required: true
    },
    deskripsi: {
        type: String,
        required: true
    },
    waktuMemasak: {
        type: Number,
        required: true
    },
    porsi: {
        type: Number,
        required: true
    },
    bahan: [{
        nama: String,
        jumlah: Number,
        satuan: String
    }],
    langkah: [{
        urutan: Number,
        deskripsi: String
    }],
    fotoUtama: {
        type: String,
        default: '/images/default-recipe.jpg'
    },
    tanggalDibuat: {
        type: Date,
        default: Date.now
    },
    komentar: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Komentar'
    }],
    ratingRataRata: {
        type: Number,
        default: 0
    },
    jumlahRating: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Resep', resepSchema);