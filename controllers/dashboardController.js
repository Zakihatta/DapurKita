const Resep = require('../models/Resep');
const Komentar = require('../models/Komentar');
const Favorit = require('../models/Favorit');

exports.getDashboard = async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) {
            return res.redirect('/login');
        }

        const recipes = await Resep.find({ pembuat: user.id })
            .sort({ tanggalDibuat: -1 })
            .limit(6);

        const resepIds = recipes.map(recipe => recipe._id);
        const commentCount = await Komentar.countDocuments({
            resep: { $in: resepIds }
        });

        // Hitung jumlah favorit untuk resep-resep user
        const favoritCount = await Favorit.countDocuments({
            resep: { $in: resepIds }
        });

        res.render('pages/dashboard', {
            title: 'Dashboard',
            user: user,
            recipes: recipes,
            resepCount: await Resep.countDocuments({ pembuat: user.id }),
            favoritCount: favoritCount,
            commentCount: commentCount
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).render('error', {
            message: 'Terjadi kesalahan saat memuat dashboard',
            user: req.session.user
        });
    }
};