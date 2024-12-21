const Rating = require('../models/Rating');
const Resep = require('../models/Resep');

exports.addRating = async (req, res) => {
    try {
        const { rating } = req.body;
        const resepId = req.params.id;
        const userId = req.session.user.id;

        // Cek apakah user sudah memberikan rating
        let existingRating = await Rating.findOne({ 
            resep: resepId, 
            pengguna: userId 
        });

        if (existingRating) {
            // Update rating yang sudah ada
            existingRating.nilai = rating;
            await existingRating.save();
        } else {
            // Buat rating baru
            await Rating.create({
                resep: resepId,
                pengguna: userId,
                nilai: rating
            });
        }

        // Hitung ulang rating rata-rata
        const ratings = await Rating.find({ resep: resepId });
        const totalRating = ratings.reduce((acc, curr) => acc + curr.nilai, 0);
        const averageRating = totalRating / ratings.length;

        // Update resep dengan rating baru
        await Resep.findByIdAndUpdate(resepId, {
            ratingRataRata: averageRating.toFixed(1),
            jumlahRating: ratings.length
        });

        res.json({ 
            success: true, 
            averageRating: averageRating.toFixed(1),
            totalRatings: ratings.length 
        });
    } catch (error) {
        console.error('Rating error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memberikan rating' });
    }
};

exports.getRating = async (req, res) => {
    try {
        const resepId = req.params.id;
        const userId = req.session.user ? req.session.user.id : null;

        const rating = userId ? await Rating.findOne({ 
            resep: resepId, 
            pengguna: userId 
        }) : null;

        res.json({ 
            rating: rating ? rating.nilai : 0 
        });
    } catch (error) {
        console.error('Get rating error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil rating' });
    }
};