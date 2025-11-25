// Componente de Chatbot com IA

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chatbot.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface QuickReply {
  id: string;
  text: string;
  question: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Carregar respostas rápidas
  useEffect(() => {
    if (isOpen && quickReplies.length === 0) {
      loadQuickReplies();
      // Mensagem de boas-vindas
      if (messages.length === 0) {
        const welcomeMessage: Message = {
          id: `bot_${Date.now()}`,
          text: '👋 Olá! Sou o assistente virtual da Edenred. Como posso ajudá-lo hoje?',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    }
  }, [isOpen]);

  const loadQuickReplies = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/chatbot/quick-replies`);
      if (response.data.success) {
        setQuickReplies(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar respostas rápidas:', error);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await axios.post(`${API_URL}/api/chatbot/message`, {
        userId,
        message: text
      });

      if (response.data.success) {
        const botMessage: Message = {
          id: `bot_${Date.now()}`,
          text: response.data.data.response,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: Message = {
        id: `bot_${Date.now()}`,
        text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (question: string) => {
    sendMessage(question);
  };

  const clearChat = async () => {
    try {
      await axios.delete(`${API_URL}/api/chatbot/conversation/${userId}`);
      setMessages([]);
      const welcomeMessage: Message = {
        id: `bot_${Date.now()}`,
        text: '👋 Conversa limpa! Como posso ajudá-lo?',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Erro ao limpar conversa:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chatbot-button"
        aria-label="Abrir chat"
      >
        {isOpen ? (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Janela do chat */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <span>🤖</span>
              </div>
              <div className="chatbot-title">
                <h3>Assistente Edenred</h3>
                <p>Online • Responde em segundos</p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="chatbot-close"
              title="Limpar conversa"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Mensagens */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chatbot-message ${message.sender === 'user' ? 'user' : 'bot'}`}
              >
                <div className="chatbot-message-content">
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{message.text}</p>
                  <div className="chatbot-message-time">
                    {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {/* Indicador de digitação */}
            {isTyping && (
              <div className="chatbot-message bot">
                <div className="chatbot-message-content">
                  <div className="chatbot-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Respostas rápidas */}
          {quickReplies.length > 0 && messages.length <= 1 && (
            <div className="chatbot-quick-questions" style={{ padding: '16px', background: 'white', borderTop: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Perguntas frequentes:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {quickReplies.slice(0, 3).map((reply) => (
                  <button
                    key={reply.id}
                    onClick={() => handleQuickReply(reply.question)}
                    className="chatbot-quick-question"
                  >
                    {reply.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="chatbot-input-area">
            <form onSubmit={handleSubmit} className="chatbot-input-form">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="chatbot-input"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="chatbot-send-button"
                aria-label="Enviar mensagem"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
