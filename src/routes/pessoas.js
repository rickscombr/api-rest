const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth');
const PessoasController = require('../controllers/pessoasController');

router.get('/', PessoasController.getPessoas);
router.get('/:id', PessoasController.getPessoasId);
router.post('/', auth, PessoasController.postPessoas);
router.patch('/', auth, PessoasController.patchPessoas);
router.delete('/', auth, PessoasController.deletePessoas);

module.exports = router;