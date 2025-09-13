// Sequelize model for ScheduleVersion
export default (sequelize, DataTypes) => {
  const ScheduleVersion = sequelize.define('ScheduleVersion', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    assignment_id: { type: DataTypes.INTEGER, allowNull: false },
    version_number: { type: DataTypes.INTEGER, allowNull: false },
    cause: { type: DataTypes.STRING },
    diff: { type: DataTypes.JSON },
    feedback: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'schedule_versions',
    timestamps: false,
  });
  return ScheduleVersion;
};
