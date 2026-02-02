const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const controller = require('../controllers/productController');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
	destination: uploadDir,
	filename: (_req, file, cb) => {
		const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
		cb(null, unique);
	},
});

const upload = multer({ storage });

router.get('/', controller.list);
router.get('/new', controller.showNew);
router.post('/', upload.single('imageFile'), controller.create);
router.get('/:id/edit', controller.showEdit);
router.post('/:id', upload.single('imageFile'), controller.update);
router.post('/:id/delete', controller.remove);

module.exports = router;
