'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('assignments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      student_id: { type: Sequelize.INTEGER, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      course: { type: Sequelize.STRING },
      due_date: { type: Sequelize.DATE, allowNull: false },
      priority: { type: Sequelize.ENUM('low', 'medium', 'high'), defaultValue: 'medium' },
      media: { type: Sequelize.STRING },
      estimatedhours: { type: Sequelize.INTEGER },
  complexity: { type: Sequelize.ENUM('low', 'medium', 'high'), defaultValue: 'medium' },
      status: { type: Sequelize.ENUM('active', 'cancelled', 'deleted'), defaultValue: 'active' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('assignments');
  }
};
