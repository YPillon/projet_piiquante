const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const realName = name.split('.')[0];
        const extension = MIME_TYPES[file.mimetype];
        callback(null, realName + Date.now() + '.' + extension);
    }
});

module.exports = multer({ storage }).single('image');