'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('consultations', 'produto', {
      type: Sequelize.ENUM('FLEET', 'TICKET_RESTAURANT', 'PAY', 'ALIMENTA', 'ABASTECIMENTO', 'OUTRAS'),
      allowNull: false,
      defaultValue: 'OUTRAS'
    });

    // Adicionar índices para otimização
    await queryInterface.addIndex('consultations', ['produto']);
    await queryInterface.addIndex('consultations', ['cnpj', 'produto']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('consultations', ['produto']);
    await queryInterface.removeIndex('consultations', ['cnpj', 'produto']);
    await queryInterface.removeColumn('consultations', 'produto');
  }
};
