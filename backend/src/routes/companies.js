import express from 'express';
import { obterAdaptadorBanco } from '../config/dbAdapter.js';
import { authenticate } from '../middleware/auth.js';
import { validatePagination, validateSearch } from '../middleware/validation.js';

const router = express.Router();
router.use(authenticate);

// Listar empresas
router.get('/', validatePagination, validateSearch, async (req, res) => {
  try {
    const { page = 1, limit = 10, q, situacao } = req.query;

    const filters = { page: parseInt(page), limit: parseInt(limit) };
    if (q) filters.search = q;
    if (situacao) filters.situacao = situacao;

    let result;
    
    // Admin vê todas as empresas, usuário comum vê apenas as suas
    if (req.user.role === 'admin') {
      result = await obterAdaptadorBanco().buscarTodasEmpresas(filters);
    } else {
      result = await obterAdaptadorBanco().buscarEmpresasPorUsuario(req.user.id, filters);
    }

    res.json({
      success: true,
      data: {
        companies: result.data,
        pagination: result.pagination
      }
    });

  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router;
