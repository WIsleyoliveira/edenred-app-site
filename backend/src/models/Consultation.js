// Este arquivo define o modelo Consultation (Consulta) para o Sequelize.
// Representa consultas de CNPJ realizadas pelos usuários, armazenando resultados, status e metadados.

import { DataTypes } from 'sequelize'; // Tipos de dados do Sequelize

// Função que cria e retorna o modelo Consultation
const ConsultationModel = (sequelize) => {
  // Define o modelo Consultation com todas as colunas da tabela
  const Consultation = sequelize.define('Consultation', {
    // Chave primária auto-incrementada
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // CNPJ consultado (pode ser formatado ou numérico)
    cnpj: {
      type: DataTypes.STRING(18), // Até 18 caracteres
      allowNull: false, // Obrigatório
      validate: {
        notEmpty: { msg: 'CNPJ é obrigatório' },
        len: [14, 18] // Aceita tanto formato numérico (14) quanto formatado (18)
      }
    },
    // Produto para o qual a consulta foi realizada
    produto: {
      type: DataTypes.ENUM('FLEET', 'TICKET_RESTAURANT', 'PAY', 'ALIMENTA', 'ABASTECIMENTO', 'OUTRAS'),
      allowNull: false, // Obrigatório
      validate: {
        notEmpty: { msg: 'Produto é obrigatório' },
        isIn: {
          args: [['FLEET', 'TICKET_RESTAURANT', 'PAY', 'ALIMENTA', 'ABASTECIMENTO', 'OUTRAS']],
          msg: 'Produto deve ser um dos valores permitidos'
        }
      }
    },
    // ID do usuário que fez a consulta (chave estrangeira)
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false, // Obrigatório
      references: { // Referência para tabela users
        model: 'users',
        key: 'id'
      }
    },
    // ID da empresa encontrada (chave estrangeira, pode ser null se não encontrada)
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Opcional (pode não haver empresa correspondente)
      references: { // Referência para tabela companies
        model: 'companies',
        key: 'id'
      }
    },
    // Status da consulta (PENDING, SUCCESS, ERROR, NOT_FOUND)
    status: {
      type: DataTypes.ENUM('PENDING', 'SUCCESS', 'ERROR', 'NOT_FOUND'),
      defaultValue: 'PENDING' // Padrão: pendente
    },
    // Fonte dos dados (RECEITA_FEDERAL, CACHE, API_EXTERNA)
    source: {
      type: DataTypes.ENUM('RECEITA_FEDERAL', 'CACHE', 'API_EXTERNA'),
      defaultValue: 'RECEITA_FEDERAL' // Padrão: Receita Federal
    },
    // Tempo de resposta da consulta em milissegundos
    responseTime: {
      type: DataTypes.INTEGER, // Número inteiro
      allowNull: true, // Pode ser null se não foi medida
      validate: {
        min: 0 // Não pode ser negativo
      }
    },
    // Resultado da consulta em JSON (dados da empresa encontrada)
    result: {
      type: DataTypes.JSON, // Armazena objeto JSON
      allowNull: true // Null se consulta falhou
    },
    // Dados de erro em JSON (se consulta falhou)
    error: {
      type: DataTypes.JSON, // Armazena objeto JSON com detalhes do erro
      allowNull: true // Null se consulta foi bem-sucedida
    },
    // Flag para consulta favorita do usuário
    isFavorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false // Padrão: não favorita
    },
    // Tags para categorização (array em JSON)
    tags: {
      type: DataTypes.JSON, // Array de strings
      defaultValue: [] // Padrão: array vazio
    },
    // Notas/anotações sobre a consulta
    notes: {
      type: DataTypes.STRING(500), // Até 500 caracteres
      allowNull: true // Opcional
    },
    // Metadados adicionais em JSON (informações extras sobre a consulta)
    metadata: {
      type: DataTypes.JSON, // Armazena objeto JSON
      defaultValue: {} // Padrão: objeto vazio
    }
  }, {
    // Configurações da tabela
    tableName: 'consultations', // Nome da tabela no banco
    timestamps: true, // Adiciona createdAt e updatedAt
    indexes: [ // Índices para otimizar consultas
      { fields: ['userId', 'createdAt'] }, // Índice composto para consultas por usuário e data
      { fields: ['cnpj'] }, // Índice no CNPJ consultado
      { fields: ['produto'] }, // Índice no produto
      { fields: ['cnpj', 'produto'] }, // Índice composto para CNPJ + produto
      { fields: ['status'] }, // Índice no status
      { fields: ['createdAt'] }, // Índice na data de criação
      { fields: ['isFavorite'] } // Índice nas favoritas
    ]
  });

  // =================== MÉTODOS DE CLASSE ===================

  // Método estático para obter estatísticas de consultas de um usuário
  Consultation.getUserStats = async function(userId) {
    // Executa query SQL raw para calcular estatísticas
    const stats = await this.sequelize.query(`
      SELECT
        COUNT(*) as total, -- Total de consultas
        SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as successful, -- Consultas bem-sucedidas
        SUM(CASE WHEN status = 'ERROR' THEN 1 ELSE 0 END) as failed, -- Consultas com erro
        AVG(responseTime) as avgResponseTime, -- Tempo médio de resposta
        SUM(CASE WHEN isFavorite = true THEN 1 ELSE 0 END) as favorites -- Consultas favoritas
      FROM consultations
      WHERE "userId" = :userId -- Filtra pelo usuário
    `, {
      replacements: { userId }, // Substitui :userId pelo valor passado
      type: this.sequelize.QueryTypes.SELECT // Tipo de query: SELECT
    });

    // Retorna as estatísticas ou valores padrão se não houver dados
    return stats[0] || {
      total: 0,
      successful: 0,
      failed: 0,
      avgResponseTime: 0,
      favorites: 0
    };
  };

  // Retorna o modelo Consultation configurado
  return Consultation;
};

export default ConsultationModel;
