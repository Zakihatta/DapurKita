const Resep = require('../models/Resep');
const Komentar = require('../models/Komentar');
const multer = require('multer');
const path = require('path');
const Favorit = require('../models/Favorit');

// Konfigurasi multer untuk upload gambar
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/resep')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, 'resep-' + uniqueSuffix + path.extname(file.originalname))
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
        }
        cb(null, true);
    }
}).single('foto');

exports.getCreateForm = (req, res) => {
    res.render('pages/resep/create', {
        title: 'Buat Resep Baru',
        user: req.session.user
    });
};

exports.createResep = async (req, res) => {
    upload(req, res, async function(err) {
        if (err) {
            console.error('Error upload:', err);
            return res.render('pages/resep/create', {
                error: err.message,
                title: 'Buat Resep Baru',
                user: req.session.user
            });
        }

        try {
            const { judul, deskripsi, waktuMemasak, porsi } = req.body;
            
            // Tangani bahan-bahan
            let bahan = [];
            if (typeof req.body['bahan'] === 'object') {
                for (let key in req.body['bahan']) {
                    bahan.push({
                        nama: req.body['bahan'][key]['nama'],
                        jumlah: req.body['bahan'][key]['jumlah'],
                        satuan: req.body['bahan'][key]['satuan']
                    });
                }
            }

            // Tangani langkah-langkah
            let langkah = [];
            if (Array.isArray(req.body['langkah'])) {
                langkah = req.body['langkah'].map((step, index) => ({
                    urutan: index + 1,
                    deskripsi: step
                }));
            }

            // Buat resep baru
            const resepBaru = new Resep({
                pembuat: req.session.user.id,
                judul,
                deskripsi,
                waktuMemasak: parseInt(waktuMemasak),
                porsi: parseInt(porsi),
                bahan: bahan,
                langkah: langkah,
                fotoUtama: req.file ? `/uploads/resep/${req.file.filename}` : null
            });

            await resepBaru.save();
            res.redirect(`/resep/${resepBaru._id}`);
        } catch (error) {
            console.error('Error membuat resep:', error);
            res.render('pages/resep/create', {
                error: 'Terjadi kesalahan saat membuat resep',
                title: 'Buat Resep Baru',
                user: req.session.user
            });
        }
    });
};

exports.getResepById = async (req, res) => {
    try {
        const resep = await Resep.findById(req.params.id)
            .populate('pembuat', 'nama');
        
        // Ambil komentar untuk resep ini
        const komentar = await Komentar.find({ resep: req.params.id })
            .populate('pengguna', 'nama')
            .sort({ tanggal: -1 });
        
        let isFavorit = false;
        if (req.session.user) {
            const favorit = await Favorit.findOne({
                resep: req.params.id,
                pengguna: req.session.user.id
            });
            isFavorit = !!favorit;
        }

        if (!resep) {
            return res.status(404).render('error', {
                message: 'Resep tidak ditemukan',
                user: req.session.user
            });
        }

        res.render('pages/resep/detail', {
            title: resep.judul,
            resep: resep,
            user: req.session.user,
            isFavorit: isFavorit,
            komentar: komentar // Pastikan komentar dikirim ke view
        });
    } catch (error) {
        console.error('Get resep error:', error);
        res.status(500).render('error', {
            message: 'Terjadi kesalahan saat memuat resep',
            user: req.session.user
        });
    }
};

exports.tambahKomentar = async (req, res) => {
    try {
        const resepId = req.params.id;
        const userId = req.session.user.id;
        const { isi } = req.body;

        // Buat komentar baru
        await Komentar.create({
            resep: resepId,
            pengguna: userId,
            isi: isi
        });

        // Redirect kembali ke halaman resep
        res.redirect(`/resep/${resepId}`);
    } catch (error) {
        console.error('Tambah komentar error:', error);
        res.status(500).render('error', {
            message: 'Terjadi kesalahan saat menambah komentar',
            user: req.session.user
        });
    }
};

exports.getAllResep = async (req, res) => {
    try {
        const resep = await Resep.find()
            .populate('pembuat', 'nama')
            .sort({ tanggalDibuat: -1 });

        res.render('pages/resep/index', {
            title: 'Jelajahi Resep',  // Tambahkan title
            resep,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error mengambil resep:', error);
        res.status(500).render('error', {
            title: 'Error',  // Tambahkan title
            message: 'Terjadi kesalahan saat memuat resep',
            user: req.session.user
        });
    }
};

exports.getCreateForm = (req, res) => {
    res.render('pages/resep/create', {
        title: 'Buat Resep Baru',  // Tambahkan title
        user: req.session.user
    });
};

exports.getEditForm = async (req, res) => {
    try {
        const resep = await Resep.findById(req.params.id);
        
        if (!resep) {
            return res.status(404).render('error', {
                title: 'Error',
                message: 'Resep tidak ditemukan',
                user: req.session.user
            });
        }

        if (resep.pembuat.toString() !== req.session.user.id) {
            return res.status(403).render('error', {
                title: 'Error',
                message: 'Anda tidak memiliki akses untuk mengedit resep ini',
                user: req.session.user
            });
        }

        res.render('pages/resep/edit', {
            title: 'Edit Resep',
            resep: resep,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Terjadi kesalahan saat memuat form edit',
            user: req.session.user
        });
    }
};

exports.updateResep = async (req, res) => {
    try {
        upload(req, res, async function(err) {
            if (err) {
                console.error('Error upload:', err);
                return res.render('pages/resep/edit', {
                    title: 'Edit Resep',
                    error: err.message,
                    resep: await Resep.findById(req.params.id),
                    user: req.session.user
                });
            }

            try {
                const resepId = req.params.id;
                const resep = await Resep.findById(resepId);
                
                if (!resep) {
                    return res.status(404).render('error', {
                        title: 'Error',
                        message: 'Resep tidak ditemukan',
                        user: req.session.user
                    });
                }

                // Validasi kepemilikan
                if (resep.pembuat.toString() !== req.session.user.id) {
                    return res.status(403).render('error', {
                        title: 'Error',
                        message: 'Anda tidak memiliki akses untuk mengedit resep ini',
                        user: req.session.user
                    });
                }

                // Proses bahan
                let bahanArray = [];
                if (req.body.bahan) {
                    // Konversi ke array jika single object
                    const bahanData = Array.isArray(req.body.bahan) ? req.body.bahan : [req.body.bahan];
                    bahanArray = bahanData.map(b => ({
                        nama: b.nama,
                        jumlah: parseInt(b.jumlah),
                        satuan: b.satuan
                    }));
                }

                // Proses langkah
                let langkahArray = [];
                if (req.body.langkah) {
                    // Konversi ke array jika single string
                    const langkahData = Array.isArray(req.body.langkah) ? req.body.langkah : [req.body.langkah];
                    langkahArray = langkahData.map((deskripsi, index) => ({
                        urutan: index + 1,
                        deskripsi
                    }));
                }

                // Update data resep
                const updateData = {
                    judul: req.body.judul,
                    deskripsi: req.body.deskripsi,
                    waktuMemasak: parseInt(req.body.waktuMemasak),
                    porsi: parseInt(req.body.porsi),
                    bahan: bahanArray,
                    langkah: langkahArray
                };

                // Update foto jika ada
                if (req.file) {
                    updateData.fotoUtama = `/uploads/resep/${req.file.filename}`;
                }

                await Resep.findByIdAndUpdate(resepId, updateData);
                res.redirect(`/resep/${resepId}`);
            } catch (error) {
                console.error('Error update resep:', error);
                res.render('pages/resep/edit', {
                    title: 'Edit Resep',
                    error: 'Terjadi kesalahan saat mengupdate resep',
                    resep: await Resep.findById(req.params.id),
                    user: req.session.user
                });
            }
        });
    } catch (error) {
        console.error('Error luar:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Terjadi kesalahan server',
            user: req.session.user
        });
    }
};

exports.deleteResep = async (req, res) => {
    try {
        const resep = await Resep.findById(req.params.id);
        
        // Cek kepemilikan
        if (resep.pembuat.toString() !== req.session.user.id) {
            return res.status(403).render('error', {
                message: 'Anda tidak memiliki akses untuk menghapus resep ini',
                user: req.session.user
            });
        }

        await Resep.findByIdAndDelete(req.params.id);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error hapus resep:', error);
        res.status(500).render('error', {
            message: 'Terjadi kesalahan saat menghapus resep',
            user: req.session.user
        });
    }
};

exports.getDashboard = async (req, res) => {
    try {
        const user = req.session.user;
        const recipes = await Resep.find({ pembuat: user.id })
            .sort({ tanggalDibuat: -1 })
            .limit(6);

        // Hitung jumlah komentar
        const commentCount = await Komentar.countDocuments({
            resep: { $in: recipes.map(r => r._id) }
        });

        res.render('pages/dashboard', {
            title: 'Dashboard',
            user,
            recipes,
            resepCount: recipes.length,
            commentCount
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', {
            message: 'Terjadi kesalahan',
            user: req.session.user
        });
    }
};

exports.toggleFavorit = async (req, res) => {
    try {
        const resepId = req.params.id;
        const userId = req.session.user.id;

        // Cek apakah resep sudah di-favorit
        const existingFavorit = await Favorit.findOne({
            resep: resepId,
            pengguna: userId
        });

        if (existingFavorit) {
            // Jika sudah favorit, hapus dari favorit
            await Favorit.deleteOne({ _id: existingFavorit._id });
            res.json({ isFavorit: false, message: 'Resep dihapus dari favorit' });
        } else {
            // Jika belum favorit, tambahkan ke favorit
            await Favorit.create({
                resep: resepId,
                pengguna: userId
            });
            res.json({ isFavorit: true, message: 'Resep ditambahkan ke favorit' });
        }
    } catch (error) {
        console.error('Toggle favorit error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memproses favorit' });
    }
};