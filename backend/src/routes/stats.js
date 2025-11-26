// Rotas para estatísticas da plataforma

import express from 'express';
import {
  getPlatformStats,
  getUserStats,
  getRecentConsultations
} from '../controllers/statsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/stats/platform - Estatísticas gerais da plataforma
router.get('/platform', authenticate, getPlatformStats);

// GET /api/stats/user/:userId - Estatísticas de um usuário específico
router.get('/user/:userId', authenticate, getUserStats);

// GET /api/stats/recent-consultations - Consultas recentes
router.get('/recent-consultations', authenticate, getRecentConsultations);

export default router;
