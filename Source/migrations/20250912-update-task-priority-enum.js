'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove old integer column
    await queryInterface.removeColumn('tasks', 'priority');
    // Add new ENUM column
    await queryInterface.addColumn('tasks', 'priority', {
      type: Sequelize.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'medium',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove ENUM column
    await queryInterface.removeColumn('tasks', 'priority');
    // Add back integer column
    await queryInterface.addColumn('tasks', 'priority', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  }
};
