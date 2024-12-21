const express = require('express');
const router = express.Router();
const resepController = require('../controllers/resepController');
const auth = require('../middleware/auth');

// View routes
router.get('/', resepController.getAllResep);
router.get('/buat', auth, resepController.getCreateForm);
router.get('/:id', resepController.getResepById);
router.get('/edit/:id', auth, resepController.getEditForm);

// Action routes
router.post('/buat', auth, resepController.createResep);
router.post('/edit/:id', auth, resepController.updateResep);
router.get('/hapus/:id', auth, resepController.deleteResep);
router.post('/:id/komentar', auth, resepController.tambahKomentar);
router.post('/:id/favorit', auth, resepController.toggleFavorit);

module.exports = router;