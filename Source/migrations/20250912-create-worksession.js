'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('work_sessions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      task_id: { type: Sequelize.INTEGER, allowNull: false },
      student_id: { type: Sequelize.INTEGER, allowNull: false },
      start_time: { type: Sequelize.DATE, allowNull: false },
      end_time: { type: Sequelize.DATE },
      duration: { type: Sequelize.INTEGER },
      notes: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('work_sessions');
  }
};
