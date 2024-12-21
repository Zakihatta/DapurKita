// seedRooms.js
const mongoose = require('mongoose');
const Room = require('./models/Room');
require('dotenv').config();

const rooms = [
    {
        nama: 'Ruang Umum',
        deskripsi: 'Diskusi umum seputar masakan dan kuliner',
        tipe: 'umum'
    },
    {
        nama: 'Tips & Trik Memasak',
        deskripsi: 'Berbagi tips dan trik dalam memasak',
        tipe: 'diskusi'
    },
    {
        nama: 'Resep Tradisional',
        deskripsi: 'Diskusi khusus resep masakan tradisional',
        tipe: 'resep'
    }
];

mongoose.connect('mongodb://127.0.0.1:27017/dapurkita')
    .then(async () => {
        try {
            await Room.deleteMany({});
            await Room.insertMany(rooms);
            console.log('Rooms berhasil ditambahkan!');
            process.exit(0);
        } catch (error) {
            console.error('Error seeding rooms:', error);
            process.exit(1);
        }
    })
    .catch((err) => {
        console.error('Error koneksi MongoDB:', err);
        process.exit(1);
    });