import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import process from 'process';
import Assignment from './Assignment.js';
import Task from './Task.js';
import ScheduleVersion from './ScheduleVersion.js';
import WorkSession from './WorkSession.js';

const basename = path.basename(new URL('', import.meta.url).pathname);
const env = process.env.NODE_ENV || 'development';
// Use dynamic fs read for config.json to avoid ESM import issues in Jest
import { readFileSync } from 'fs';
const configPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../config/config.json');
const configJson = JSON.parse(readFileSync(configPath, 'utf-8'));
const config = configJson[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

db.Assignment = Assignment(sequelize, Sequelize.DataTypes);
db.Task = Task(sequelize, Sequelize.DataTypes);
db.ScheduleVersion = ScheduleVersion(sequelize, Sequelize.DataTypes);
db.WorkSession = WorkSession(sequelize, Sequelize.DataTypes);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
