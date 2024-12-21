const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const auth = require('../middleware/auth');

router.post('/resep/:id/rating', auth, ratingController.addRating);
router.get('/resep/:id/rating', ratingController.getRating);

module.exports = router;