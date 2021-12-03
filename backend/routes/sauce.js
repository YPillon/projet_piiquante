const express = require('express');
const router = express.Router();

const sauceCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.get('/api/sauces', auth, sauceCtrl.getAllSauces);
router.post('/api/sauces', auth, multer, sauceCtrl.createSauce);
router.get('/api/sauces/:id', auth, sauceCtrl.getOneSauce);
router.put('/api/sauces/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/api/sauces/:id', auth, sauceCtrl.deleteSauce);
router.post('/api/sauces/:id/like', auth, sauceCtrl.likeAndDislike);

module.exports = router;