// ESM-compatible Sequelize DB initialization
import db from '../models/index.js';

const { sequelize, Assignment, Task, WorkSession, ScheduleVersion } = db;

export default {
  sequelize,
  Assignment,
  Task,
  WorkSession,
  ScheduleVersion,
};
