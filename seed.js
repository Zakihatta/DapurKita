// Buat file seed.js di root project
const mongoose = require('mongoose');
const Resep = require('./models/Resep');
const Pengguna = require('./models/Pengguna');

mongoose.connect('mongodb://localhost:27017/dapurkita')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

const seedData = async () => {
    try {
        // Create dummy user
        const user = new Pengguna({
            nama: 'Test User',
            email: 'test@test.com',
            password: 'password123'
        });
        await user.save();

        // Create dummy recipe
        const resep = new Resep({
            pembuat: user._id,
            judul: 'Nasi Goreng Spesial',
            deskripsi: 'Nasi goreng sederhana dan lezat',
            waktuMemasak: 30,
            porsi: 2,
            bahan: [
                {nama: 'Nasi', jumlah: 2, satuan: 'piring'},
                {nama: 'Telur', jumlah: 2, satuan: 'butir'}
            ],
            langkah: [
                {urutan: 1, deskripsi: 'Panaskan minyak'},
                {urutan: 2, deskripsi: 'Masak nasi hingga matang'}
            ]
        });
        await resep.save();

        console.log('Seed data created successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();