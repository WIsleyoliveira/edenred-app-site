// Este arquivo define o modelo User (Usuário) para o Sequelize.
// O modelo representa a tabela 'users' no PostgreSQL e define a estrutura dos dados de usuário.

import { DataTypes } from 'sequelize'; // Tipos de dados do Sequelize
import bcryptjs from 'bcryptjs'; // Para hash de senhas

// Função que cria e retorna o modelo User
const UserModel = (sequelize) => {
  // Define o modelo User com suas colunas e configurações
  const User = sequelize.define('User', {
    // Chave primária auto-incrementada
    id: {
      type: DataTypes.INTEGER, // Tipo inteiro
      primaryKey: true, // É chave primária
      autoIncrement: true // Auto-incrementa (1, 2, 3...)
    },
    // Nome do usuário (obrigatório)
    name: {
      type: DataTypes.STRING(100), // String com máximo 100 caracteres
      allowNull: false, // Não pode ser null
      validate: {
        notEmpty: { msg: 'Nome é obrigatório' }, // Validação: não pode ser vazio
        len: [1, 100] // Comprimento entre 1 e 100
      }
    },
    // Email único do usuário (usado para login)
    email: {
      type: DataTypes.STRING(255), // String com máximo 255 caracteres
      allowNull: false, // Obrigatório
      unique: true, // Deve ser único na tabela
      validate: {
        isEmail: { msg: 'Email inválido' }, // Validação de formato de email
        notEmpty: { msg: 'Email é obrigatório' }
      }
    },
    // Senha criptografada (nunca armazenada em texto plano)
    password: {
      type: DataTypes.STRING(255), // Hash da senha
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Senha é obrigatória' },
        len: [6, 255] // Mínimo 6 caracteres
      }
    },
    // Papel do usuário (user ou admin)
    role: {
      type: DataTypes.ENUM('user', 'admin'), // Apenas valores permitidos
      defaultValue: 'user' // Valor padrão
    },
    // URL do avatar (foto de perfil)
    avatar: {
      type: DataTypes.STRING(500), // URL da imagem
      allowNull: true // Opcional
    },
    // Flag para soft delete (usuário ativo/inativo)
    isActive: {
      type: DataTypes.BOOLEAN, // Verdadeiro/falso
      defaultValue: true // Padrão: ativo
    },
    // Último login do usuário
    lastLogin: {
      type: DataTypes.DATE, // Data e hora
      allowNull: true // Pode ser null se nunca logou
    },
    // Preferências do usuário em JSON (tema, notificações, etc.)
    preferences: {
      type: DataTypes.JSON, // Armazena objeto JSON
      defaultValue: { theme: 'light', notifications: true } // Valores padrão
    }
  }, {
    // Configurações da tabela
    tableName: 'users', // Nome da tabela no banco
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
    indexes: [ // Índices para otimizar consultas
      { unique: true, fields: ['email'] }, // Índice único no email
      { fields: ['createdAt'] } // Índice na data de criação
    ],
    // Hooks: funções executadas automaticamente em certos momentos
    hooks: {
      // Antes de criar usuário: criptografa a senha
      beforeCreate: async (user) => {
        if (user.password) {
          const saltRounds = parseInt(process.env.ROUNDS_CRIPTOGRAFIA_SENHA) || 12; // Rounds de salt (padrão 12)
          user.password = await bcryptjs.hash(user.password, saltRounds); // Hash da senha
        }
      },
      // Antes de atualizar: criptografa se senha foi alterada
      beforeUpdate: async (user) => {
        if (user.changed('password')) { // Só criptografa se senha mudou
          const saltRounds = parseInt(process.env.ROUNDS_CRIPTOGRAFIA_SENHA) || 12;
          user.password = await bcryptjs.hash(user.password, saltRounds);
        }
      }
    }
  });

  // =================== MÉTODOS DE INSTÂNCIA ===================

  // Método para comparar senha fornecida com hash armazenado
  User.prototype.comparePassword = async function(candidatePassword) {
    return bcryptjs.compare(candidatePassword, this.password); // Retorna true se senha correta
  };

  // Método personalizado para serializar usuário (remove senha da resposta JSON)
  User.prototype.toJSON = function() {
    const values = { ...this.get() }; // Copia todos os valores da instância
    delete values.password; // Remove senha por segurança
    return values; // Retorna objeto sem senha
  };

  // Retorna o modelo User configurado
  return User;
};

export default UserModel;
