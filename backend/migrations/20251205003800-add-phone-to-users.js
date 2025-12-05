'use strict';

/**
 * Migration: Adiciona coluna 'phone' à tabela 'users'
 * 
 * IMPORTANTE: Esta coluna é compartilhada com outro projeto que usa Prisma
 * NÃO REMOVER esta coluna mesmo que não seja usada neste projeto
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Verifica se a coluna já existe antes de adicionar
      const tableInfo = await queryInterface.describeTable('users');
      
      if (!tableInfo.phone) {
        await queryInterface.addColumn('users', 'phone', {
          type: Sequelize.STRING(20),
          allowNull: true,
          comment: 'Telefone do usuário - Compartilhado com projeto Prisma'
        });
        console.log('✅ Coluna phone adicionada à tabela users');
      } else {
        console.log('ℹ️  Coluna phone já existe na tabela users');
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar coluna phone:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // NÃO REMOVER a coluna no rollback
    // Esta coluna é usada por outro projeto que compartilha o mesmo banco de dados
    console.log('⚠️  ATENÇÃO: Coluna phone NÃO foi removida (usada por outro projeto Prisma)');
    console.log('⚠️  Se precisar remover, faça manualmente no banco de dados');
    
    // Código comentado para evitar remoção acidental:
    // await queryInterface.removeColumn('users', 'phone');
  }
};
