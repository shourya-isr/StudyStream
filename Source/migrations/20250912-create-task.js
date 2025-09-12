'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tasks', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      assignment_id: { type: Sequelize.INTEGER, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      planned_start: { type: Sequelize.DATE },
      planned_end: { type: Sequelize.DATE },
      actual_start: { type: Sequelize.DATE },
      actual_end: { type: Sequelize.DATE },
      priority: { type: Sequelize.INTEGER },
      status: { type: Sequelize.STRING, defaultValue: 'pending' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tasks');
  }
};
