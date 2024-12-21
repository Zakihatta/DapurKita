const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    pengirim: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pengguna',
        required: true
    },
    pesan: {
        type: String,
        required: true
    },
    ruangan: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Chat', chatSchema);