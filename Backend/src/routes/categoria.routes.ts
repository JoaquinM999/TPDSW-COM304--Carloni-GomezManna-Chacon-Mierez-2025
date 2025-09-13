import { Router } from 'express';
import { getCategorias, getCategoriaById, createCategoria, updateCategoria, deleteCategoria } from '../controllers/categoria.controller';
import { validateCategoria } from '../middleware/categoriaValidation.middleware';

const router = Router();

router.get('/', getCategorias);
router.get('/:id', getCategoriaById);
router.post('/', validateCategoria, createCategoria);
router.put('/:id', validateCategoria, updateCategoria);
router.delete('/:id', deleteCategoria);

export { router as categoriaRoutes };
