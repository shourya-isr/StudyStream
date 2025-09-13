// Migration: Add 'paused' to status enum in tasks table

export async function up(queryInterface, Sequelize) {
  await queryInterface.sequelize.query(`ALTER TYPE enum_tasks_status ADD VALUE IF NOT EXISTS 'paused';`);
}

export async function down(queryInterface, Sequelize) {
  // No safe way to remove enum value in Postgres, so document as irreversible
  // Optionally, you could recreate the enum type, but this is risky for production data
}
