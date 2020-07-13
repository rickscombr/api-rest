const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const CategoriasController = require('../controllers/categoriasController');

router.get('/', CategoriasController.getCategorias);
router.get('/:id', CategoriasController.getCategoriasId);
router.post('/', auth, CategoriasController.postCategorias);
router.patch('/', auth, CategoriasController.patchCategorias);
router.delete('/', auth, CategoriasController.deleteCategorias);

module.exports = router;
