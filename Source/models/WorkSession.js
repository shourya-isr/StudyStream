// Sequelize model for WorkSession
export default (sequelize, DataTypes) => {
  const WorkSession = sequelize.define('WorkSession', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    task_id: { type: DataTypes.INTEGER, allowNull: false },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    start_time: { type: DataTypes.DATE, allowNull: false },
    end_time: { type: DataTypes.DATE },
    duration: { type: DataTypes.INTEGER },
    notes: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'work_sessions',
    timestamps: false,
  });
  return WorkSession;
};
