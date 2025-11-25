// Rotas do Chatbot com IA

import express from 'express';
import {
  sendMessage,
  clearChat,
  healthCheck,
  getQuickReplies
} from '../controllers/chatbotController.js';

const router = express.Router();

// POST /api/chatbot/message - Enviar mensagem para IA
router.post('/message', sendMessage);

// DELETE /api/chatbot/conversation/:userId - Limpar histórico
router.delete('/conversation/:userId', clearChat);

// GET /api/chatbot/health - Verificar status do Ollama
router.get('/health', healthCheck);

// GET /api/chatbot/quick-replies - Obter respostas rápidas
router.get('/quick-replies', getQuickReplies);

export default router;
