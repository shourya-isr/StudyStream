// PostgreSQL connection config for StudyStream backend
module.exports = {
  username: process.env.DB_USER || 'shourya-isr',
  password: process.env.DB_PASS || null,
  database: process.env.DB_NAME || 'studystream',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  port: process.env.DB_PORT || 5432,
};
