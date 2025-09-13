// Migration: Update status column in tasks table to ENUM('active', 'completed', 'deleted')

export async function up(queryInterface, Sequelize) {
  // Update all 'pending' statuses to 'active' before changing type
  await queryInterface.sequelize.query(`UPDATE tasks SET status = 'active' WHERE status = 'pending';`);
  await queryInterface.sequelize.query(`ALTER TABLE tasks ALTER COLUMN status DROP DEFAULT;`);
  // Create enum type if it does not exist
  await queryInterface.sequelize.query(`DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_tasks_status') THEN
      CREATE TYPE enum_tasks_status AS ENUM ('active', 'completed', 'deleted');
    END IF;
  END $$;`);
  await queryInterface.sequelize.query(`ALTER TABLE tasks ALTER COLUMN status TYPE enum_tasks_status USING status::text::enum_tasks_status;`);
  await queryInterface.sequelize.query(`ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'active';`);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.sequelize.query(`ALTER TABLE tasks ALTER COLUMN status DROP DEFAULT;`);
  await queryInterface.sequelize.query(`CREATE TYPE enum_tasks_status_old AS ENUM ('pending', 'completed', 'active', 'deleted');`);
  await queryInterface.sequelize.query(`ALTER TABLE tasks ALTER COLUMN status TYPE enum_tasks_status_old USING status::text::enum_tasks_status_old;`);
  await queryInterface.sequelize.query(`ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'pending';`);
  await queryInterface.sequelize.query(`DROP TYPE enum_tasks_status;`);
  await queryInterface.sequelize.query(`ALTER TYPE enum_tasks_status_old RENAME TO enum_tasks_status;`);
}
