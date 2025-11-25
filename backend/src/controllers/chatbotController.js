// Controller para gerenciar requisições do chatbot

import {
  sendMessageToAI,
  clearConversation,
  checkOllamaHealth,
  QUICK_REPLIES
} from '../services/chatbotService.js';

/**
 * Envia mensagem para o chatbot
 * POST /api/chatbot/message
 */
export const sendMessage = async (req, res) => {
  try {
    const { message, userId } = req.body;

    // Validações
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Mensagem não pode estar vazia'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário é obrigatório'
      });
    }

    // Envia para IA
    const response = await sendMessageToAI(userId, message.trim());

    res.status(200).json({
      success: true,
      data: {
        response: response.message
      }
    });

  } catch (error) {
    console.error('Erro no chatbot controller:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar mensagem',
      error: error.message
    });
  }
};

/**
 * Limpa histórico de conversa
 * DELETE /api/chatbot/conversation/:userId
 */
export const clearChat = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário é obrigatório'
      });
    }

    const response = clearConversation(userId);
    res.status(200).json(response);

  } catch (error) {
    console.error('Erro ao limpar conversa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao limpar conversa',
      error: error.message
    });
  }
};

/**
 * Verifica status do Ollama
 * GET /api/chatbot/health
 */
export const healthCheck = async (req, res) => {
  try {
    const health = await checkOllamaHealth();
    res.status(200).json(health);
  } catch (error) {
    res.status(500).json({
      available: false,
      error: error.message
    });
  }
};

/**
 * Retorna respostas rápidas sugeridas
 * GET /api/chatbot/quick-replies
 */
export const getQuickReplies = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: QUICK_REPLIES.map(reply => ({
        id: reply.id.toString(),
        text: reply.text,
        question: reply.text // O texto é a própria pergunta
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter respostas rápidas',
      error: error.message
    });
  }
};

export default {
  sendMessage,
  clearChat,
  healthCheck,
  getQuickReplies
};
