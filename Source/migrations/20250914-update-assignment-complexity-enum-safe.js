
// Migration: Update complexity enum in assignments table to 'low', 'medium', 'high'

export async function up(queryInterface, Sequelize) {
  // Drop old enum and create new one
  await queryInterface.sequelize.query(`ALTER TABLE assignments ALTER COLUMN complexity DROP DEFAULT;`);
  await queryInterface.sequelize.query(`ALTER TYPE enum_assignments_complexity RENAME TO enum_assignments_complexity_old;`);
  await queryInterface.sequelize.query(`CREATE TYPE enum_assignments_complexity AS ENUM ('low', 'medium', 'high');`);
  await queryInterface.sequelize.query(`ALTER TABLE assignments ALTER COLUMN complexity TYPE enum_assignments_complexity USING complexity::text::enum_assignments_complexity;`);
  await queryInterface.sequelize.query(`ALTER TABLE assignments ALTER COLUMN complexity SET DEFAULT 'medium';`);
  await queryInterface.sequelize.query(`DROP TYPE enum_assignments_complexity_old;`);
}

export async function down(queryInterface, Sequelize) {
  // Revert to old enum
  await queryInterface.sequelize.query(`ALTER TABLE assignments ALTER COLUMN complexity DROP DEFAULT;`);
  await queryInterface.sequelize.query(`CREATE TYPE enum_assignments_complexity_old AS ENUM ('low', 'medium', 'high');`);
  await queryInterface.sequelize.query(`ALTER TABLE assignments ALTER COLUMN complexity TYPE enum_assignments_complexity_old USING complexity::text::enum_assignments_complexity_old;`);
  await queryInterface.sequelize.query(`ALTER TABLE assignments ALTER COLUMN complexity SET DEFAULT 'medium';`);
  await queryInterface.sequelize.query(`DROP TYPE enum_assignments_complexity;`);
  await queryInterface.sequelize.query(`ALTER TYPE enum_assignments_complexity_old RENAME TO enum_assignments_complexity;`);
}
