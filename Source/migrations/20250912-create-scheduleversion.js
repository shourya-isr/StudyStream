'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('schedule_versions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      assignment_id: { type: Sequelize.INTEGER, allowNull: false },
      version_number: { type: Sequelize.INTEGER, allowNull: false },
      cause: { type: Sequelize.STRING },
      diff: { type: Sequelize.JSON },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('schedule_versions');
  }
};
