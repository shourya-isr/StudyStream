// Migration: Add feedback field to schedule_versions table

export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('schedule_versions', 'feedback', {
    type: Sequelize.STRING,
    allowNull: true
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('schedule_versions', 'feedback');
}
