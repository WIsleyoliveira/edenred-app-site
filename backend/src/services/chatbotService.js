// Serviço de Chatbot com IA (Ollama + Llama 3.2)
// Este serviço gerencia conversas com IA para responder perguntas sobre Edenred

import axios from 'axios';

// URL do Ollama rodando localmente
const OLLAMA_API_URL = 'http://localhost:11434/api/generate';
const MODEL_NAME = 'llama3.2:3b';

// Base de conhecimento sobre Edenred
const KNOWLEDGE_BASE = `
# Informações sobre Edenred

## O que é Edenred?
A Edenred é uma empresa líder mundial em benefícios para funcionários, oferecendo soluções de vale-refeição, vale-alimentação, vale-combustível e outros benefícios corporativos.

## Produtos Edenred:

### 1. Ticket Restaurant (Vale-Refeição)
- Usado para refeições prontas em restaurantes, lanchonetes e bares
- Aceito em mais de 240 mil estabelecimentos
- Não pode ser usado para comprar alimentos em mercados
- Validade: conforme contrato com a empresa

### 2. Ticket Alimentação (Vale-Alimentação)
- Usado para comprar alimentos em supermercados e mercearias
- Aceito em mais de 45 mil estabelecimentos
- Não pode ser usado em restaurantes
- Ideal para compras de casa

### 3. Ticket Car (Vale-Combustível)
- Usado para abastecer veículos em postos de combustível
- Aceito em mais de 28 mil postos
- Também pode ser usado para manutenção veicular em algumas redes

### 4. Ticket Fleet (Gestão de Frotas)
- Solução completa para gestão de frotas empresariais
- Controle de abastecimento e manutenção
- Relatórios detalhados de gastos

## Diferenças Principais:
- **Ticket Restaurant**: Somente refeições prontas (restaurantes)
- **Ticket Alimentação**: Compras de mercado (supermercados)
- **Ticket Car/Fleet**: Combustível e manutenção veicular

## Como Usar:
1. Receba o cartão da sua empresa
2. Ative o cartão no app ou site Edenred
3. Use nos estabelecimentos credenciados
4. Consulte saldo pelo app ou site

## Contato Edenred:
- **Telefone**: 0800 777 8200 (24h, todos os dias)
- **WhatsApp**: (11) 4003-1923
- **Site**: www.edenred.com.br
- **App**: Disponível na App Store e Google Play
- **Email**: atendimento@edenred.com.br

## Central de Atendimento:
- Atendimento 24 horas
- Cancelamento em caso de perda/roubo
- Segunda via de cartão
- Consulta de saldo e extrato
- Dúvidas sobre estabelecimentos credenciados

## Como Solicitar:
Empresas interessadas devem entrar em contato através do site www.edenred.com.br/empresas ou ligar para 0800 777 8200.

## Perguntas Frequentes:

**Posso usar meu Ticket Restaurant em supermercado?**
Não, o Ticket Restaurant é exclusivo para refeições prontas em restaurantes.

**Posso sacar dinheiro do cartão?**
Não, os benefícios Edenred não permitem saque em dinheiro.

**O que fazer se perder o cartão?**
Ligue imediatamente para 0800 777 8200 para bloquear e solicitar segunda via.

**Tem taxa de manutenção?**
Não, não há cobrança de taxa de manutenção para o usuário final.
`;

// Sistema de contexto para a IA
const SYSTEM_PROMPT = `Você é um assistente virtual da Edenred, especializado em responder perguntas sobre os produtos e serviços da empresa.

Suas responsabilidades:
1. Responder perguntas sobre Ticket Restaurant, Ticket Alimentação, Ticket Car e Ticket Fleet
2. Explicar diferenças entre os produtos
3. Fornecer informações de contato
4. Ser simpático, claro e objetivo
5. Se não souber algo, recomendar entrar em contato com o 0800 777 8200

IMPORTANTE:
- Use informações da base de conhecimento fornecida
- Seja breve e direto (máximo 3 parágrafos)
- Use formatação em markdown quando apropriado
- Se a pergunta não for sobre Edenred, diga educadamente que você só pode ajudar com dúvidas sobre Edenred

Base de conhecimento:
${KNOWLEDGE_BASE}
`;

// Histórico de conversas (em memória - em produção, usar banco de dados)
const conversationHistory = new Map();

/**
 * Envia mensagem para a IA e obtém resposta
 */
export const sendMessageToAI = async (userId, userMessage) => {
  try {
    // Recupera histórico do usuário
    let history = conversationHistory.get(userId) || [];
    
    // Adiciona mensagem do usuário ao histórico
    history.push({
      role: 'user',
      content: userMessage
    });

    // Monta o prompt completo com contexto
    const fullPrompt = `${SYSTEM_PROMPT}

Histórico da conversa:
${history.map(msg => `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`).join('\n')}

Responda de forma clara e objetiva (máximo 3 parágrafos):`;

    // Envia para Ollama
    const response = await axios.post(OLLAMA_API_URL, {
      model: MODEL_NAME,
      prompt: fullPrompt,
      stream: false,
      options: {
        temperature: 0.7, // Criatividade moderada
        top_p: 0.9,
        max_tokens: 500 // Resposta curta
      }
    });

    const aiResponse = response.data.response.trim();

    // Adiciona resposta da IA ao histórico
    history.push({
      role: 'assistant',
      content: aiResponse
    });

    // Mantém apenas últimas 10 mensagens (5 pares pergunta/resposta)
    if (history.length > 10) {
      history = history.slice(-10);
    }

    // Atualiza histórico
    conversationHistory.set(userId, history);

    return {
      success: true,
      message: aiResponse,
      conversationId: userId
    };

  } catch (error) {
    console.error('Erro ao comunicar com Ollama:', error.message);
    
    // Fallback para resposta padrão se Ollama não estiver disponível
    return {
      success: false,
      message: 'Desculpe, estou com problemas técnicos no momento. Por favor, entre em contato com nossa central de atendimento: 0800 777 8200 (disponível 24h).',
      error: error.message
    };
  }
};

/**
 * Limpa histórico de conversa de um usuário
 */
export const clearConversation = (userId) => {
  conversationHistory.delete(userId);
  return { success: true, message: 'Conversa limpa com sucesso' };
};

/**
 * Verifica se Ollama está disponível
 */
export const checkOllamaHealth = async () => {
  try {
    const response = await axios.get('http://localhost:11434/api/tags', {
      timeout: 3000
    });
    return {
      available: true,
      models: response.data.models || []
    };
  } catch (error) {
    return {
      available: false,
      error: 'Ollama não está rodando. Execute: brew services start ollama'
    };
  }
};

// Respostas rápidas pré-definidas
export const QUICK_REPLIES = [
  { id: 1, text: 'Qual a diferença entre Ticket Restaurant e Alimentação?' },
  { id: 2, text: 'Como entrar em contato?' },
  { id: 3, text: 'Como usar o Ticket Fleet?' },
  { id: 4, text: 'Perdi meu cartão, o que fazer?' },
  { id: 5, text: 'Onde posso usar o Ticket Restaurant?' }
];

export default {
  sendMessageToAI,
  clearConversation,
  checkOllamaHealth,
  QUICK_REPLIES
};
